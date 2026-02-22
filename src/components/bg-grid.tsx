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

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    const easeSpeed = 0.08;
    if (isHoveringRef.current) {
      smoothMouseRef.current.x = lerp(
        smoothMouseRef.current.x,
        rawMouseRef.current.x,
        easeSpeed,
      );
      smoothMouseRef.current.y = lerp(
        smoothMouseRef.current.y,
        rawMouseRef.current.y,
        easeSpeed,
      );
    } else {
      smoothMouseRef.current.x = lerp(smoothMouseRef.current.x, -1000, 0.03);
      smoothMouseRef.current.y = lerp(smoothMouseRef.current.y, -1000, 0.03);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    const spacing = 60;
    const cols = Math.ceil(w / spacing) + 1;
    const rows = Math.ceil(h / spacing) + 1;
    const mx = smoothMouseRef.current.x;
    const my = smoothMouseRef.current.y;
    const hoverRadius = 220;
    timeRef.current += 0.008;

    for (let i = 0; i <= cols; i++) {
      const x = i * spacing;
      for (let seg = 0; seg < rows; seg++) {
        const y1 = seg * spacing;
        const y2 = (seg + 1) * spacing;
        const midY = (y1 + y2) / 2;
        const dist = Math.sqrt((x - mx) ** 2 + (midY - my) ** 2);
        const proximity = Math.max(0, 1 - dist / hoverRadius);
        const pulse = 0.1 + Math.sin(timeRef.current + i * 0.3) * 0.04;
        const alpha = pulse + proximity * 0.6;

        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.strokeStyle = `rgba(205, 45, 45, ${alpha})`;
        ctx.lineWidth = proximity > 0.1 ? 1 + proximity * 2 : 1;
        ctx.stroke();
      }
    }

    for (let j = 0; j <= rows; j++) {
      const y = j * spacing;
      for (let seg = 0; seg < cols; seg++) {
        const x1 = seg * spacing;
        const x2 = (seg + 1) * spacing;
        const midX = (x1 + x2) / 2;
        const dist = Math.sqrt((midX - mx) ** 2 + (y - my) ** 2);
        const proximity = Math.max(0, 1 - dist / hoverRadius);
        const pulse = 0.1 + Math.sin(timeRef.current + j * 0.3) * 0.04;
        const alpha = pulse + proximity * 0.6;

        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = `rgba(205, 45, 45, ${alpha})`;
        ctx.lineWidth = proximity > 0.1 ? 1 + proximity * 2 : 1;
        ctx.stroke();
      }
    }

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const x = i * spacing;
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

    // Static top-right corner illumination
    const cornerRadius = Math.max(w, h) * 0.75;
    const cornerGradient = ctx.createRadialGradient(w, 0, 0, w, 0, cornerRadius);
    cornerGradient.addColorStop(0, "rgba(205, 45, 45, 0.12)");
    cornerGradient.addColorStop(0.35, "rgba(205, 45, 45, 0.05)");
    cornerGradient.addColorStop(0.65, "rgba(205, 45, 45, 0.015)");
    cornerGradient.addColorStop(1, "rgba(205, 45, 45, 0)");
    ctx.fillStyle = cornerGradient;
    ctx.fillRect(0, 0, w, h);

    // Static bottom-left corner illumination
    const blGradient = ctx.createRadialGradient(0, h, 0, 0, h, cornerRadius);
    blGradient.addColorStop(0, "rgba(205, 45, 45, 0.12)");
    blGradient.addColorStop(0.35, "rgba(205, 45, 45, 0.05)");
    blGradient.addColorStop(0.65, "rgba(205, 45, 45, 0.015)");
    blGradient.addColorStop(1, "rgba(205, 45, 45, 0)");
    ctx.fillStyle = blGradient;
    ctx.fillRect(0, 0, w, h);

    if (mx > -500 && my > -500) {
      const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, hoverRadius);
      gradient.addColorStop(0, "rgba(205, 45, 45, 0.15)");
      gradient.addColorStop(0.4, "rgba(205, 45, 45, 0.06)");
      gradient.addColorStop(1, "rgba(205, 45, 45, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // eslint-disable-next-line react-hooks/immutability
    animationRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
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
  }, [draw, sectionRef]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
