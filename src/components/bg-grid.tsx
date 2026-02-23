"use client";

import { useEffect, useRef, useCallback } from "react";

export function InteractiveGrid({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rawMouseRef = useRef({ x: -1000, y: -1000 });
  const smoothMouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const isHoveringRef = useRef(false);

  // Cached corner gradients — recreated only on resize
  const gradientTRRef = useRef<CanvasGradient | null>(null);
  const gradientBLRef = useRef<CanvasGradient | null>(null);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const buildCornerGradients = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const r = Math.max(w, h) * 0.75;

      const tr = ctx.createRadialGradient(w, 0, 0, w, 0, r);
      tr.addColorStop(0, "rgba(205, 45, 45, 0.12)");
      tr.addColorStop(0.35, "rgba(205, 45, 45, 0.05)");
      tr.addColorStop(0.65, "rgba(205, 45, 45, 0.015)");
      tr.addColorStop(1, "rgba(205, 45, 45, 0)");
      gradientTRRef.current = tr;

      const bl = ctx.createRadialGradient(0, h, 0, 0, h, r);
      bl.addColorStop(0, "rgba(205, 45, 45, 0.12)");
      bl.addColorStop(0.35, "rgba(205, 45, 45, 0.05)");
      bl.addColorStop(0.65, "rgba(205, 45, 45, 0.015)");
      bl.addColorStop(1, "rgba(205, 45, 45, 0)");
      gradientBLRef.current = bl;
    },
    [],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    if (isHoveringRef.current) {
      smoothMouseRef.current.x = lerp(
        smoothMouseRef.current.x,
        rawMouseRef.current.x,
        0.08,
      );
      smoothMouseRef.current.y = lerp(
        smoothMouseRef.current.y,
        rawMouseRef.current.y,
        0.08,
      );
    } else {
      smoothMouseRef.current.x = lerp(smoothMouseRef.current.x, -1000, 0.03);
      smoothMouseRef.current.y = lerp(smoothMouseRef.current.y, -1000, 0.03);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    const spacing = 60;
    const cols = Math.ceil(w / spacing) + 1;
    const rows = Math.ceil(h / spacing) + 1;
    const mx = smoothMouseRef.current.x;
    const my = smoothMouseRef.current.y;
    const hoverRadius = 220;
    timeRef.current += 0.008;

    // Single global pulse — avoids per-segment alpha variation that forced
    // individual stroke calls in the original code.
    const baseAlpha = 0.1 + Math.sin(timeRef.current) * 0.04;

    // --- Batch pass: draw the entire base grid in two path calls ---
    ctx.beginPath();
    ctx.strokeStyle = `rgba(205, 45, 45, ${baseAlpha})`;
    ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) {
      ctx.moveTo(i * spacing, 0);
      ctx.lineTo(i * spacing, h);
    }
    ctx.stroke();

    ctx.beginPath();
    for (let j = 0; j <= rows; j++) {
      ctx.moveTo(0, j * spacing);
      ctx.lineTo(w, j * spacing);
    }
    ctx.stroke();

    // --- Proximity pass: only process cells within the hover radius ---
    const isNearCursor = mx > -500 && my > -500;
    if (isNearCursor) {
      // Enhanced vertical segments
      for (let i = 0; i <= cols; i++) {
        const x = i * spacing;
        if (Math.abs(x - mx) > hoverRadius) continue;
        for (let seg = 0; seg < rows; seg++) {
          const y1 = seg * spacing;
          const y2 = (seg + 1) * spacing;
          const midY = (y1 + y2) / 2;
          const dist = Math.sqrt((x - mx) ** 2 + (midY - my) ** 2);
          const proximity = Math.max(0, 1 - dist / hoverRadius);
          if (proximity <= 0) continue;
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y2);
          ctx.strokeStyle = `rgba(205, 45, 45, ${baseAlpha + proximity * 0.6})`;
          ctx.lineWidth = 1 + proximity * 2;
          ctx.stroke();
        }
      }

      // Enhanced horizontal segments
      for (let j = 0; j <= rows; j++) {
        const y = j * spacing;
        if (Math.abs(y - my) > hoverRadius) continue;
        for (let seg = 0; seg < cols; seg++) {
          const x1 = seg * spacing;
          const x2 = (seg + 1) * spacing;
          const midX = (x1 + x2) / 2;
          const dist = Math.sqrt((midX - mx) ** 2 + (y - my) ** 2);
          const proximity = Math.max(0, 1 - dist / hoverRadius);
          if (proximity <= 0) continue;
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = `rgba(205, 45, 45, ${baseAlpha + proximity * 0.6})`;
          ctx.lineWidth = 1 + proximity * 2;
          ctx.stroke();
        }
      }

      // Intersection dots
      for (let i = 0; i <= cols; i++) {
        const x = i * spacing;
        if (Math.abs(x - mx) > hoverRadius) continue;
        for (let j = 0; j <= rows; j++) {
          const y = j * spacing;
          const dist = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
          const proximity = Math.max(0, 1 - dist / hoverRadius);
          if (proximity > 0.05) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5 + proximity * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(205, 45, 45, ${proximity * 0.9})`;
            ctx.fill();
          }
        }
      }

      // Hover glow
      const hoverGrad = ctx.createRadialGradient(mx, my, 0, mx, my, hoverRadius);
      hoverGrad.addColorStop(0, "rgba(205, 45, 45, 0.15)");
      hoverGrad.addColorStop(0.4, "rgba(205, 45, 45, 0.06)");
      hoverGrad.addColorStop(1, "rgba(205, 45, 45, 0)");
      ctx.fillStyle = hoverGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // Corner illumination — cached gradients, no allocation per frame
    if (gradientTRRef.current) {
      ctx.fillStyle = gradientTRRef.current;
      ctx.fillRect(0, 0, w, h);
    }
    if (gradientBLRef.current) {
      ctx.fillStyle = gradientBLRef.current;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
    animationRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      if (ctx) {
        buildCornerGradients(ctx, canvas.offsetWidth, canvas.offsetHeight);
      }
    };

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      rawMouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      isHoveringRef.current = true;
    };

    const handleLeave = () => {
      isHoveringRef.current = false;
    };

    resize();
    window.addEventListener("resize", resize);
    section.addEventListener("mousemove", handleMouse);
    section.addEventListener("mouseleave", handleLeave);
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      section.removeEventListener("mousemove", handleMouse);
      section.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, [draw, sectionRef, buildCornerGradients]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
