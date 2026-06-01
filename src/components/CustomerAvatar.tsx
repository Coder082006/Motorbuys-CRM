import { UserRound } from "lucide-react";
import { useState } from "react";
import { BASE_URL } from "@/lib/api/client";

type CustomerAvatarProps = {
  profilePicture?: string | null;
  hasPhoto?: boolean;
  initials: string;
  avatarColor?: string | null;
  preferIcon?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-11 w-11",
  lg: "h-16 w-16",
  xl: "h-28 w-28",
} as const;

const iconClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
} as const;

function imageSrc(profilePicture?: string | null) {
  if (!profilePicture) return null;
  if (/^https?:\/\//i.test(profilePicture)) return profilePicture;
  const origin = BASE_URL.replace(/\/api$/, "");
  return `${origin}${profilePicture.startsWith("/") ? profilePicture : `/${profilePicture}`}`;
}

export default function CustomerAvatar({
  profilePicture,
  hasPhoto,
  initials,
  avatarColor: _avatarColor,
  preferIcon = false,
  size = "md",
}: CustomerAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const src = imageFailed || hasPhoto === false || preferIcon ? null : imageSrc(profilePicture);
  const classes = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 font-semibold shadow-sm ${sizeClasses[size]}`;

  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        className={`${classes} border-orange-200 bg-orange-50 object-cover`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div
      className={`${classes} border-orange-300 bg-orange-50 text-brand-orange ring-2 ring-white`}
      title={initials}
      aria-label={`Customer profile ${initials}`}
    >
      <UserRound className={`${iconClasses[size]} stroke-[2.8]`} />
    </div>
  );
}
