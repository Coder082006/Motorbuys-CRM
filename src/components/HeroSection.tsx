import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import {
  ChevronDown,
  Gauge,
  Fuel,
  Zap,
  Battery,
  Shield,
  Wrench,
  Weight,
  ArrowRight,
  Play,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import heroBike1 from "../../Hero bikes/bike 1.png";
import heroBike2 from "../../Hero bikes/bike 2.png";
import heroBike3 from "../../Hero bikes/bike 3.png";
import heroBike4 from "../../Hero bikes/bike 4.png";
import heroBike5 from "../../Hero bikes/bike 5.png";

type Language = "en" | "sw";

type SpecItem = {
  label: { en: string; sw: string };
  value: string;
  icon: typeof Gauge;
};

type BikeAccent = {
  name: string;
  label: string;
  image: string;
  accent: string;
  accentRgb: string;
  badge: { en: string; sw: string };
  specs: SpecItem[];
  headline: { en: string; sw: string };
  description: { en: string; sw: string };
};

const bikes: BikeAccent[] = [
  {
    name: "commuter",
    label: "Commuter",
    image: heroBike1,
    accent: "#D9D9D9",
    accentRgb: "217,217,217",
    badge: { en: "Everyday Ride", sw: "Usafiri wa Kila Siku" },
    headline: {
      en: "Reliable for Everyday Travel",
      sw: "Yenye Uaminifu kwa Usafiri wa Kila Siku",
    },
    description: {
      en: "Comfortable, fuel-efficient motorcycles designed for commuting to work, school, and everyday city transportation. Perfect for riders looking for reliability, low maintenance, and affordable daily mobility.",
      sw: "Pikipiki zenye faraja na ufanisi wa mafuta, zilizoundwa kwa usafiri kazini, shule, na usafiri wa kila siku wa jijini. Inafaa kwa wanaotafuta uaminifu, ukalisaji mdogo, na usafiri wa bei nafuu wa kila siku.",
    },
    specs: [
      { label: { en: "Engine", sw: "Injini" }, value: "125cc", icon: Gauge },
      { label: { en: "Fuel Economy", sw: "Ufanisi wa Mafuta" }, value: "58 km/L", icon: Fuel },
      { label: { en: "Maintenance", sw: "Ukalisaji" }, value: "Low Maintenance", icon: Wrench },
      { label: { en: "Transmission", sw: "Ubao" }, value: "Automatic", icon: Zap },
    ],
  },
  {
    name: "cargo",
    label: "Cargo",
    image: heroBike2,
    accent: "#E53935",
    accentRgb: "229,57,53",
    badge: { en: "Cargo Solution", sw: "Suluhisho la Mizigo" },
    headline: {
      en: "Move Goods with Confidence",
      sw: "Safirisha Bidhaa kwa Ujasiri",
    },
    description: {
      en: "Compact motorcycles designed for transporting packages, small business deliveries, courier services, and everyday commercial tasks. Built for efficiency, durability, and practical cargo transportation.",
      sw: "Pikipiki ndogo zilizoundwa kwa usafirishaji wa vifurushi, uwasilishaji wa biashara ndogo, huduma za barua pepe, na kazi za kila siku za biashara. Imejengwa kwa ufanisi, uthabiti, na usafirishaji wa mizigo wa vitendo.",
    },
    specs: [
      { label: { en: "Engine", sw: "Injini" }, value: "150cc", icon: Gauge },
      {
        label: { en: "Fuel Economy", sw: "Ufanisi wa Mafuta" },
        value: "High Fuel Efficiency",
        icon: Fuel,
      },
      { label: { en: "Cargo", sw: "Mizigo" }, value: "Cargo Ready", icon: Weight },
      { label: { en: "Transmission", sw: "Ubao" }, value: "Manual", icon: Zap },
    ],
  },
  {
    name: "ride-hailing",
    label: "Ride-Hailing",
    image: heroBike3,
    accent: "#f97316",
    accentRgb: "249,115,22",
    badge: { en: "Passenger Transport", sw: "Usafiri wa Abiria" },
    headline: {
      en: "Built for Professional Riders",
      sw: "Imeundwa kwa Wanaoendesha Kazi",
    },
    description: {
      en: "Reliable motorcycles trusted by Bolt, Uber Moto, and boda boda riders. Designed for long working hours with excellent fuel economy, rider comfort, and dependable performance for transporting passengers.",
      sw: "Pikipiki zenye uaminifu zinazotumika na wanaoendesha Bolt, Uber Moto, na boda boda. Zilizoundwa kwa masaa marefu ya kazi kwa ufanisi bora wa mafuta, faraja ya mwendeshaji, na utendaji wa kuaminika kwa usafirishaji wa abiria.",
    },
    specs: [
      { label: { en: "Engine", sw: "Injini" }, value: "150cc", icon: Gauge },
      { label: { en: "Comfort", sw: "Faraja" }, value: "Comfortable Seating", icon: Shield },
      {
        label: { en: "Fuel Economy", sw: "Ufanisi wa Mafuta" },
        value: "Excellent Fuel Economy",
        icon: Fuel,
      },
      { label: { en: "Transmission", sw: "Ubao" }, value: "Manual", icon: Zap },
    ],
  },
  {
    name: "classic",
    label: "Classic",
    image: heroBike4,
    accent: "#2F2F2F",
    accentRgb: "47,47,47",
    badge: { en: "Classic Ride", sw: "Usafiri wa Classic" },
    headline: {
      en: "Timeless Style Meets Reliability",
      sw: "Mtindo wa Kale Unganisha na Uaminifu",
    },
    description: {
      en: "Traditional motorcycles combining durability, comfort, and iconic styling. Perfect for riders who appreciate classic design while enjoying dependable everyday performance.",
      sw: "Pikipiki za jadi zinazochanganya uthabiti, faraja, na mtindo wa kihistoria. Inafaa kwa wanaopenda muundo wa classic h wanafurahia utendaji wa kila siku wa kuaminika.",
    },
    specs: [
      { label: { en: "Engine", sw: "Injini" }, value: "150cc", icon: Gauge },
      { label: { en: "Comfort", sw: "Faraja" }, value: "Comfortable Ride", icon: Shield },
      { label: { en: "Transmission", sw: "Ubao" }, value: "Manual", icon: Zap },
      { label: { en: "Build", sw: "Muundo" }, value: "Durable", icon: Wrench },
    ],
  },
  {
    name: "electric",
    label: "Electric",
    image: heroBike5,
    accent: "#2563EB",
    accentRgb: "37,99,235",
    badge: { en: "Electric Scooter", sw: "Skuta ya Umeme" },
    headline: {
      en: "Ride the Future",
      sw: "Endesha Mustakabali",
    },
    description: {
      en: "Modern electric scooters delivering zero-emission transportation, quiet operation, low running costs, and a smarter way to move through the city.",
      sw: "Skuta za umeme za kisasa zinazotoa usafiri wa utiririshaji sifuri, utendaji wa kimya, gharama ndogo za uendeshaji, na njia ya busara ya kusafiri jijini.",
    },
    specs: [
      { label: { en: "Motor", sw: "Motor" }, value: "Electric Motor", icon: Battery },
      { label: { en: "Range", sw: "Umbali" }, value: "80 km Range", icon: Gauge },
      { label: { en: "Charging", sw: "Kuchaji" }, value: "4 Hour Charging", icon: Zap },
      { label: { en: "Emissions", sw: "Utoaji" }, value: "Zero Emissions", icon: Shield },
    ],
  },
];

export default function HeroSection({
  language,
  onBrowse,
}: {
  language: Language;
  onBrowse: () => void;
}) {
  const isSwahili = language === "sw";
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const activeBike = bikes[activeIndex];

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);

  // Parallax: each layer moves at different speed for depth
  const layer1X = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);
  const layer1Y = useTransform(mouseY, [-0.5, 0.5], [-3, 3]);
  const layer2X = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);
  const layer2Y = useTransform(mouseY, [-0.5, 0.5], [-8, 8]);
  const layer3X = useTransform(mouseX, [-0.5, 0.5], [-20, 20]);
  const layer3Y = useTransform(mouseY, [-0.5, 0.5], [-14, 14]);
  const layer4X = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);
  const layer4Y = useTransform(mouseY, [-0.5, 0.5], [-5, 5]);

  const switchBike = useCallback(
    (index: number) => {
      if (index === activeIndex) return;
      setDirection(index > activeIndex ? 1 : -1);
      setActiveIndex(index);
    },
    [activeIndex],
  );

  useEffect(() => {
    if (isHovering) {
      if (autoRef.current) clearInterval(autoRef.current);
      return;
    }
    autoRef.current = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % bikes.length);
    }, 4000);
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, [isHovering]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const motorcycleVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.88,
      rotate: dir > 0 ? 6 : -6,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { type: "spring" as const, stiffness: 180, damping: 22, mass: 1 },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0,
      scale: 0.88,
      rotate: dir > 0 ? -6 : 6,
      transition: { duration: 0.4, ease: "easeIn" as const },
    }),
  };

  const contentVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        delay: 0.1,
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
      transition: { duration: 0.35 },
    }),
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="hero-premium-bg relative overflow-hidden"
      style={
        {
          "--glow-color": activeBike.accent,
          "--glow-rgb": activeBike.accentRgb,
        } as React.CSSProperties
      }
    >
      {/* === LAYER 1: Dark premium gradient (static) === */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#111118] to-[#0d0d14]" />

      {/* === LAYER 2: Radial glow — accent colored, changes with bike === */}
      <motion.div
        animate={{ backgroundColor: activeBike.accent, scale: [1, 1.05, 1] }}
        transition={{
          backgroundColor: { duration: 0.8 },
          scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute left-[55%] top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-[140px]"
      />

      {/* === LAYER 3: Technical patterns — move at 0.3x parallax === */}
      <motion.div style={{ x: layer1X, y: layer1Y }} className="absolute inset-0">
        <div className="hero-grid-pattern absolute inset-0 opacity-[0.07]" />
        <div className="hero-radial-rings absolute inset-0 opacity-[0.08]" />
        <div className="hero-frame-lines absolute inset-0 opacity-[0.06]" />
      </motion.div>

      {/* === LAYER 4: Speed lines + contour + airflow — move at 0.6x parallax === */}
      <motion.div style={{ x: layer2X, y: layer2Y }} className="absolute inset-0">
        <div className="hero-speed-lines absolute inset-0 opacity-[0.12]" />
        <div className="hero-contour-lines absolute inset-0 opacity-[0.10]" />
        <div className="hero-airflow absolute inset-0 opacity-[0.08]" />
      </motion.div>

      {/* === LAYER 5: Blurred abstract shapes — move at 0.4x parallax === */}
      <motion.div style={{ x: layer4X, y: layer4Y }} className="absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-blue-500/[0.08] blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-[350px] w-[350px] rounded-full bg-purple-500/[0.08] blur-[100px]" />
        <div className="absolute left-[70%] top-[10%] h-[250px] w-[250px] rounded-full bg-white/[0.04] blur-[80px]" />
      </motion.div>

      {/* === LAYER 6: Floating particles — move at 0.2x parallax === */}
      <motion.div style={{ x: layer3X, y: layer3Y }} className="absolute inset-0">
        <div
          className="hero-particle h-1.5 w-1.5 bg-white/20"
          style={{ left: "15%", top: "25%", animation: "particle-float-1 8s ease-in-out infinite" }}
        />
        <div
          className="hero-particle h-2 w-2 bg-white/15"
          style={{
            left: "72%",
            top: "18%",
            animation: "particle-float-2 10s ease-in-out infinite 1s",
          }}
        />
        <div
          className="hero-particle h-1.5 w-1.5 bg-white/15"
          style={{
            left: "85%",
            top: "65%",
            animation: "particle-float-3 9s ease-in-out infinite 2s",
          }}
        />
        <div
          className="hero-particle h-1 w-1 bg-white/20"
          style={{
            left: "30%",
            top: "75%",
            animation: "particle-float-1 11s ease-in-out infinite 3s",
          }}
        />
        <div
          className="hero-particle h-1.5 w-1.5 bg-white/15"
          style={{
            left: "55%",
            top: "85%",
            animation: "particle-float-2 7s ease-in-out infinite 0.5s",
          }}
        />
        <div
          className="hero-particle h-1 w-1 bg-white/20"
          style={{
            left: "10%",
            top: "55%",
            animation: "particle-float-3 12s ease-in-out infinite 4s",
          }}
        />
        <div
          className="hero-particle h-1.5 w-1.5 bg-white/10"
          style={{
            left: "92%",
            top: "35%",
            animation: "particle-float-1 9s ease-in-out infinite 1.5s",
          }}
        />
        <div
          className="hero-particle h-1 w-1 bg-white/15"
          style={{
            left: "45%",
            top: "10%",
            animation: "particle-float-2 10s ease-in-out infinite 2.5s",
          }}
        />
        <div
          className="hero-particle h-1.5 w-1.5 bg-white/15"
          style={{
            left: "65%",
            top: "45%",
            animation: "particle-float-3 8s ease-in-out infinite 3.5s",
          }}
        />
        <div
          className="hero-particle h-1 w-1 bg-white/20"
          style={{
            left: "25%",
            top: "40%",
            animation: "particle-float-1 11s ease-in-out infinite 0.8s",
          }}
        />
      </motion.div>

      {/* === LAYER 7: Dot grid (static, very subtle) === */}
      <div className="hero-dot-grid absolute inset-0 opacity-[0.06]" />

      {/* === LAYER 8: Small decorative accent lines === */}
      <div className="absolute left-[6%] top-[12%] h-px w-28 rotate-[32deg] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="absolute right-[8%] top-[22%] h-px w-20 rotate-[-18deg] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-[25%] left-[12%] h-px w-24 rotate-[-25deg] bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <div className="absolute bottom-[15%] right-[15%] h-px w-16 rotate-[40deg] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute left-[45%] top-[8%] h-px w-20 rotate-[10deg] bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Main content grid */}
      <div className="relative z-10 mx-auto grid min-h-[620px] max-w-[1440px] items-center gap-8 px-6 py-16 md:px-10 lg:grid-cols-[1fr_1.1fr] lg:px-16 xl:px-20">
        {/* LEFT SIDE — Content */}
        <div className="flex flex-col gap-8 lg:pr-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`content-${activeBike.name}`}
              custom={direction}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col gap-6"
            >
              {/* Category badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors duration-500"
                  style={{
                    borderColor: `rgba(var(--glow-rgb), 0.35)`,
                    color: activeBike.accent,
                    backgroundColor: `rgba(var(--glow-rgb), 0.08)`,
                  }}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: activeBike.accent }}
                  />
                  {activeBike.badge[language]}
                </span>
              </motion.div>

              {/* Headline */}
              <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white md:text-5xl xl:text-[3.5rem]">
                {activeBike.headline[language]}
              </h1>

              {/* Description */}
              <p className="max-w-md text-[0.95rem] leading-relaxed text-white/50 md:text-base">
                {activeBike.description[language]}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onBrowse}
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold shadow-lg transition-shadow duration-300"
                  style={{
                    backgroundColor: activeBike.accent,
                    color: activeBike.name === "commuter" ? "#1a1a1a" : "#ffffff",
                    boxShadow: `0 8px 32px rgba(var(--glow-rgb), 0.3)`,
                  }}
                >
                  <span className="relative z-10">{isSwahili ? "Nunua Sasa" : "Shop Now"}</span>
                  <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  <span
                    className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(135deg, rgba(255,255,255,0.12), transparent)`,
                    }}
                  />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onBrowse}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
                >
                  <Play className="h-3.5 w-3.5" />
                  {isSwahili ? "Chunguza Pikipiki" : "Explore Bikes"}
                </motion.button>
              </div>

              {/* Specifications row */}
              <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4 sm:gap-4">
                {activeBike.specs.map((spec, i) => {
                  const Icon = spec.icon;
                  return (
                    <motion.div
                      key={`${activeBike.name}-spec-${i}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + i * 0.06 }}
                      className="group flex flex-col gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 backdrop-blur-sm transition-all hover:border-white/[0.12] hover:bg-white/[0.06]"
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon
                          className="h-3.5 w-3.5 transition-colors duration-500"
                          style={{ color: activeBike.accent }}
                        />
                        <span className="text-[0.65rem] font-medium uppercase tracking-wider text-white/35">
                          {spec.label[language]}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-white/90">{spec.value}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT SIDE — Motorcycle display */}
        <div className="relative flex flex-col items-center justify-center">
          {/* Motorcycle display area */}
          <div className="relative flex h-[400px] w-full items-center justify-center lg:h-[480px]">
            {/* Radial glow behind motorcycle */}
            <motion.div
              animate={{
                backgroundColor: activeBike.accent,
                scale: [1, 1.05, 1],
              }}
              transition={{
                backgroundColor: { duration: 0.8 },
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              }}
              className="absolute left-1/2 top-[55%] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[80px] lg:h-[350px] lg:w-[350px]"
            />

            {/* Motorcycle with floating + mouse-reactive animation */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`bike-${activeBike.name}`}
                custom={direction}
                variants={motorcycleVariants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{
                  rotateX,
                  rotateY,
                  perspective: 800,
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.img
                  src={activeBike.image}
                  alt={`${activeBike.label} motorcycle`}
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                  }}
                  draggable={false}
                  className="h-[280px] w-auto object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)] select-none lg:h-[340px]"
                />
              </motion.div>
            </AnimatePresence>

            {/* Soft shadow beneath motorcycle */}
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.2, 0.3] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-4 left-1/2 h-6 w-[60%] -translate-x-1/2 rounded-[50%] bg-black/40 blur-md"
            />
          </div>

          {/* Thumbnail switcher */}
          <div
            className="flex items-center gap-2.5 pt-2"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {bikes.map((bike, index) => (
              <button
                key={bike.name}
                onClick={() => switchBike(index)}
                className="group relative flex flex-col items-center gap-1.5"
              >
                <div
                  className="relative flex h-14 w-14 items-center justify-center rounded-xl border-2 p-1.5 transition-all duration-300 lg:h-16 lg:w-16"
                  style={{
                    borderColor: index === activeIndex ? bike.accent : "rgba(255,255,255,0.08)",
                    backgroundColor:
                      index === activeIndex
                        ? `rgba(${bike.accentRgb}, 0.1)`
                        : "rgba(255,255,255,0.02)",
                    boxShadow:
                      index === activeIndex ? `0 0 16px rgba(${bike.accentRgb}, 0.25)` : "none",
                  }}
                >
                  <img
                    src={bike.image}
                    alt={bike.label}
                    draggable={false}
                    className="h-full w-full object-contain"
                  />
                </div>
                <span
                  className="text-[0.6rem] font-semibold uppercase tracking-wider transition-colors duration-300"
                  style={{
                    color: index === activeIndex ? bike.accent : "rgba(255,255,255,0.3)",
                  }}
                >
                  {bike.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5"
      >
        <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/25">
          {isSwahili ? "Sogeza chini" : "Scroll"}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4 text-white/25" />
        </motion.div>
      </motion.div>

      {/* Separator line below hero */}
      <div className="absolute inset-x-0 bottom-0 z-30 h-px bg-black/5" />
    </section>
  );
}
