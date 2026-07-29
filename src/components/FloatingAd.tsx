import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePublicSiteAds } from "../hooks/queries";
import {
  recordAdClick,
  recordAdImpression,
  resolveAdImage,
  type PublicSiteAd,
} from "../lib/api/siteAds";

type FloatingAdProps = {
  /** Storefront language, so the ad copy matches the rest of the page. */
  language?: "en" | "sw";
  /** How long to wait before sliding in. Immediate popups read as spam. */
  delayMs?: number;
};

/** Picks the ad's copy for the active language, falling back to English. */
function localised(ad: PublicSiteAd, language: "en" | "sw") {
  const swahili = language === "sw";
  return {
    headline: (swahili && ad.headline_sw) || ad.headline,
    body: (swahili && ad.body_sw) || ad.body,
    cta: (swahili && ad.cta_text_sw) || ad.cta_text,
  };
}

/**
 * Promotional banner pinned to the bottom-right of the storefront.
 *
 * Ads are created by staff in the CRM (Advertising -> Site Ads) and served
 * from `/api/shop/ads/`. Never render this on checkout - it must not
 * interrupt a purchase - or anywhere inside the CRM dashboard.
 *
 * Closing the advert hides it for the current page view only. It is held in
 * component state on purpose and never written to storage, so a refresh, a
 * move to another page, or a different user signing in all bring it back.
 */
export function FloatingAd({ language = "en", delayMs = 4000 }: FloatingAdProps) {
  const auth = useAuth();
  const { data } = usePublicSiteAds("bottom_right", auth.user?.id ?? null);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(() => new Set());
  const [isVisible, setIsVisible] = useState(false);
  // Guards against counting the same display twice on re-render. Being a ref,
  // it resets with the page, so a refresh is correctly a fresh impression.
  const countedIds = useRef<Set<number>>(new Set());

  // Staff browsing the shop are not the audience for their own adverts.
  const isStaff = auth.isAdmin;

  const ad = useMemo(() => {
    if (isStaff) return null;
    // The API already returns these best-first, so take the first live one
    // the shopper has not closed on this page view.
    return (data ?? []).find((item) => !dismissedIds.has(item.id)) ?? null;
  }, [data, dismissedIds, isStaff]);

  useEffect(() => {
    if (!ad) {
      setIsVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setIsVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [ad, delayMs]);

  useEffect(() => {
    if (!ad || !isVisible) return;
    if (countedIds.current.has(ad.id)) return;
    countedIds.current.add(ad.id);
    recordAdImpression(ad.id);
  }, [ad, isVisible]);

  if (!ad) return null;

  const imageUrl = resolveAdImage(ad.image);
  const copy = localised(ad, language);

  function dismiss() {
    if (!ad) return;
    const closedId = ad.id;
    setIsVisible(false);
    setDismissedIds((previous) => new Set(previous).add(closedId));
  }

  function openTarget() {
    if (!ad) return;
    recordAdClick(ad.id);

    const url = ad.target_url;
    if (!url) return;

    if (/^https?:\/\//i.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = url;
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          key={ad.id}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          aria-label={language === "sw" ? "Tangazo" : "Advertisement"}
          className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-[320px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl shadow-black/25 sm:bottom-6 sm:right-6"
        >
          {ad.dismissible && (
            <button
              type="button"
              onClick={dismiss}
              aria-label={language === "sw" ? "Funga tangazo" : "Close advertisement"}
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={openTarget}
            disabled={!ad.target_url}
            className="block w-full text-left disabled:cursor-default"
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt={ad.title}
                loading="lazy"
                className="h-40 w-full object-cover"
              />
            )}

            {(copy.headline || copy.body || copy.cta) && (
              <div className="space-y-1.5 p-4">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  {language === "sw" ? "Tangazo" : "Sponsored"}
                </span>

                {copy.headline && (
                  <p className="text-base font-black leading-snug text-[#101418]">
                    {copy.headline}
                  </p>
                )}

                {copy.body && <p className="text-sm leading-5 text-slate-600">{copy.body}</p>}

                {copy.cta && ad.target_url && (
                  <span className="mt-2 inline-flex items-center justify-center rounded-full bg-[#f97316] px-4 py-2 text-sm font-bold text-white transition group-hover:bg-[#ea6a0c]">
                    {copy.cta}
                  </span>
                )}
              </div>
            )}
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export default FloatingAd;
