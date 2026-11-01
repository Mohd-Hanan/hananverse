import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  depth: number;
  color: string;
}

interface StarfieldCanvasProps {
  heroRef: React.RefObject<HTMLElement | null>;
}

export const StarfieldCanvas: React.FC<StarfieldCanvasProps> = ({
  heroRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars: Star[] = [];
    const STAR_COUNT = 65;

    let targetOffsetX = 0;
    let targetOffsetY = 0;
    let currentOffsetX = 0;
    let currentOffsetY = 0;
    let animId: number | null = null;
    let isVisible = true;

    function createStars() {
      stars = [];
      const colors = ["#F3E9D8", "#FFB36B", "#F8EEDF", "#FFA64D"];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.4 + 0.6,
          baseAlpha: Math.random() * 0.5 + 0.35,
          twinkleSpeed: Math.random() * 0.03 + 0.015,
          phase: Math.random() * Math.PI * 2,
          depth: Math.random() * 0.8 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    function resize() {
      if (!hero || !canvas || !ctx) return;
      const rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);

      if (stars.length === 0) {
        createStars();
      }
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      currentOffsetX += (targetOffsetX - currentOffsetX) * 0.06;
      currentOffsetY += (targetOffsetY - currentOffsetY) * 0.06;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.phase += star.twinkleSpeed;
        const alpha = Math.max(
          0.15,
          Math.min(1, star.baseAlpha + Math.sin(star.phase) * 0.22),
        );

        let px = star.x + currentOffsetX * star.depth;
        let py = star.y + currentOffsetY * star.depth;

        if (px < 0) px += width;
        if (px > width) px -= width;
        if (py < 0) py += height;
        if (py > height) py -= height;

        ctx.beginPath();
        ctx.arc(px, py, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      if (isVisible && !prefersReducedMotion) {
        animId = requestAnimationFrame(draw);
      }
    }

    const handleResize = () => {
      resize();
      if (prefersReducedMotion) draw();
    };

    window.addEventListener("resize", handleResize);
    resize();

    let heroObserver: IntersectionObserver | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      targetOffsetX = (e.clientX - rect.left - cx) * 0.035;
      targetOffsetY = (e.clientY - rect.top - cy) * 0.035;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0] && hero) {
        const rect = hero.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        targetOffsetX = (e.touches[0].clientX - rect.left - cx) * 0.025;
        targetOffsetY = (e.touches[0].clientY - rect.top - cy) * 0.025;
      }
    };

    const handleMouseLeave = () => {
      targetOffsetX = 0;
      targetOffsetY = 0;
    };

    if (!prefersReducedMotion) {
      hero.addEventListener("mousemove", handleMouseMove, { passive: true });
      hero.addEventListener("touchmove", handleTouchMove, { passive: true });
      hero.addEventListener("mouseleave", handleMouseLeave);

      heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisible = entry.isIntersecting;
            if (isVisible) {
              if (animId !== null) cancelAnimationFrame(animId);
              animId = requestAnimationFrame(draw);
            } else {
              if (animId !== null) cancelAnimationFrame(animId);
            }
          });
        },
        { threshold: 0.05 },
      );

      heroObserver.observe(hero);
      animId = requestAnimationFrame(draw);
    } else {
      draw();
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (hero) {
        hero.removeEventListener("mousemove", handleMouseMove);
        hero.removeEventListener("touchmove", handleTouchMove);
        hero.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (heroObserver) {
        heroObserver.disconnect();
      }
      if (animId !== null) {
        cancelAnimationFrame(animId);
      }
    };
  }, [heroRef]);

  return (
    <canvas
      ref={canvasRef}
      id="starfield"
      className="starfield-canvas"
      aria-hidden="true"
    />
  );
};
