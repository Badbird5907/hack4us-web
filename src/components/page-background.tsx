"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STAR_PATH = "M50 0 L56 44 L100 50 L56 56 L50 100 L44 56 L0 50 L44 44 Z";
const ELONGATED_STAR_PATH =
  "M25 0 L28 45 L50 50 L28 55 L25 100 L22 55 L0 50 L22 45 Z";

interface StarProps {
  className: string;
  duration: string;
  delay: string;
  minOpacity: string;
  minScale: string;
  variant?: "regular" | "elongated";
}

function Star({
  className,
  duration,
  delay,
  minOpacity,
  minScale,
  variant = "regular",
}: StarProps) {
  const isElongated = variant === "elongated";
  return (
    <svg
      className={className}
      style={
        {
          "--star-duration": duration,
          "--star-delay": delay,
          "--star-min-opacity": minOpacity,
          "--star-min-scale": minScale,
        } as React.CSSProperties
      }
      viewBox={isElongated ? "0 0 50 100" : "0 0 100 100"}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={isElongated ? ELONGATED_STAR_PATH : STAR_PATH} />
    </svg>
  );
}

/**
 * Full-page background layer: sparse stars + subtle gradient washes.
 * Rendered behind all page sections as a fixed/absolute underlay.
 */
export function PageBackground() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const layerSlowRef = useRef<HTMLDivElement>(null);
  const layerMedRef = useRef<HTMLDivElement>(null);
  const layerFastRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const scrub = { scrub: 0.6 };
    const shared = {
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      ...scrub,
    };

    if (layerSlowRef.current) {
      gsap.to(layerSlowRef.current, {
        y: -15,
        scrollTrigger: shared,
      });
    }
    if (layerMedRef.current) {
      gsap.to(layerMedRef.current, {
        y: -35,
        scrollTrigger: shared,
      });
    }
    if (layerFastRef.current) {
      gsap.to(layerFastRef.current, {
        y: -60,
        scrollTrigger: shared,
      });
    }
  }, { scope: wrapperRef });

  return (
    <div ref={wrapperRef} className="fixed inset-0 pointer-events-none" aria-hidden="true">
      {/* Layer 1 — slow parallax (large / distant stars) */}
      <div ref={layerSlowRef} className="absolute inset-0 will-change-transform">
        <Star
          className="star-glow absolute top-[15%] right-[12%] h-6 w-6 text-white/60"
          duration="9s" delay="1s" minOpacity="0.3" minScale="0.75"
        />
        <Star
          className="star-glow absolute top-[35%] right-[30%] h-5 w-5 text-white/55"
          duration="10s" delay="2s" minOpacity="0.25" minScale="0.7"
        />
        <Star
          className="star-glow absolute top-[58%] left-[42%] h-5 w-5 text-white/50 hidden md:block"
          duration="9.5s" delay="0.8s" minOpacity="0.25" minScale="0.7"
        />
        <Star
          className="star-glow absolute top-[88%] right-[15%] h-5 w-5 text-white/55"
          duration="9s" delay="0.3s" minOpacity="0.3" minScale="0.75"
        />
      </div>

      {/* Layer 2 — medium parallax */}
      <div ref={layerMedRef} className="absolute inset-0 will-change-transform">
        <Star
          className="star-glow absolute top-[22%] left-[8%] h-4 w-4 text-white/50"
          duration="8s" delay="3.2s" minOpacity="0.25" minScale="0.7"
        />
        <Star
          className="star-glow-primary absolute top-[40%] left-[20%] h-4 w-4 text-primary/70 hidden lg:block"
          duration="8s" delay="4s" minOpacity="0.35" minScale="0.7"
        />
        <Star
          className="star-glow absolute top-[63%] right-[18%] h-4 w-4 text-white/45"
          duration="8.5s" delay="3s" minOpacity="0.3" minScale="0.75"
        />
        <Star
          className="star-glow absolute top-[78%] right-[40%] h-4 w-4 text-white/50"
          duration="10s" delay="1.2s" minOpacity="0.2" minScale="0.7"
        />
      </div>

      {/* Layer 3 — fast parallax (small / nearby sparkles) */}
      <div ref={layerFastRef} className="absolute inset-0 will-change-transform">
        <Star
          className="star-glow absolute top-[18%] left-[55%] h-3 w-3 text-white/45 hidden md:block"
          duration="7s" delay="0.5s" minOpacity="0.3" minScale="0.65"
          variant="elongated"
        />
        <Star
          className="star-glow absolute top-[45%] right-[8%] h-3 w-3 text-white/40"
          duration="7.5s" delay="1.5s" minOpacity="0.2" minScale="0.65"
        />
        <Star
          className="star-glow-primary absolute top-[68%] left-[10%] h-3 w-3 text-primary/60 hidden lg:block"
          duration="7s" delay="2.5s" minOpacity="0.3" minScale="0.65"
        />
        <Star
          className="star-glow absolute top-[82%] left-[30%] h-3 w-3 text-white/40 hidden md:block"
          duration="8s" delay="4.5s" minOpacity="0.25" minScale="0.65"
        />
        <Star
          className="star-glow-primary absolute top-[92%] left-[60%] h-3 w-3 text-primary/55 hidden lg:block"
          duration="7.5s" delay="2s" minOpacity="0.3" minScale="0.7"
        />
      </div>
    </div>
  );
}
