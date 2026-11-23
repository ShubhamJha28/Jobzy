import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ArrowUp } from 'lucide-react';

interface Bubble {
  x0: number;
  y0: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  alpha: number;
}

export const JobzyFooter: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number | null>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const pointerRef = useRef({
    x: -2000,
    y: -2000,
    prevX: -2000,
    prevY: -2000,
    vx: 0,
    vy: 0,
    active: false,
  });
  const [isIntersecting, setIsIntersecting] = useState(true);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Generate Halftone Dotted Matrix of "Jobzy"
  const initBubbles = useCallback((width: number, height: number) => {
    if (width <= 0 || height <= 0) return;

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    // Determine font size so "Jobzy" fills ~88-92% of canvas width
    let fontSize = Math.min(width * 0.25, height * 0.88);
    offCtx.font = `900 ${fontSize}px "Inter", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    
    // Fit check
    let textWidth = offCtx.measureText('Jobzy').width;
    if (textWidth > width * 0.90) {
      fontSize *= (width * 0.90) / textWidth;
      offCtx.font = `900 ${fontSize}px "Inter", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    }

    offCtx.clearRect(0, 0, width, height);
    offCtx.fillStyle = '#ffffff';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';

    // Perfectly centered Y for "Jobzy" with capital J
    const textY = height * 0.50;
    offCtx.fillText('Jobzy', width / 2, textY);

    const imgData = offCtx.getImageData(0, 0, width, height).data;

    // Grid spacing for the halftone dots (adaptive to screen width)
    const gap = Math.max(6, Math.min(10, Math.round(width / 140)));
    const newBubbles: Bubble[] = [];

    for (let y = gap / 2; y < height; y += gap) {
      for (let x = gap / 2; x < width; x += gap) {
        const px = Math.floor(x);
        const py = Math.floor(y);
        const idx = (py * width + px) * 4;
        const alphaVal = imgData[idx + 3];

        if (alphaVal > 25) {
          const normAlpha = alphaVal / 255;
          // Halftone effect: edges have smaller dots, core has full rounded bubbles
          const r = (gap * 0.42) * Math.min(1, 0.35 + 0.65 * normAlpha);
          newBubbles.push({
            x0: x,
            y0: y,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            baseRadius: r,
            radius: r,
            alpha: Math.max(0.65, normAlpha),
          });
        }
      }
    }

    bubblesRef.current = newBubbles;
  }, []);

  // Responsive canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(rect.width);
      // Height scales dynamically with width for large hero typography
      const h = Math.max(180, Math.min(340, Math.floor(w * 0.26)));

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      initBubbles(w, h);
    };

    handleResize();

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    const io = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    });
    io.observe(container);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [initBubbles]);

  // Physics animation loop (Disturbance & spring return)
  useEffect(() => {
    if (!isIntersecting) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const pointer = pointerRef.current;
      const bubbles = bubblesRef.current;
      const distRadius = Math.max(85, Math.min(145, w * 0.11));
      const spring = 0.08;
      const friction = 0.83;

      // Color themes: off-white resting dots, electric lime on disturbance
      const restColor = isDark ? '#E2E8DC' : '#1E293B';
      const limeAccent = isDark ? '#C4F167' : '#65A30D';

      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];

        // 1. Mouse Disturbance interaction
        if (pointer.active) {
          const dx = b.x - pointer.x;
          const dy = b.y - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < distRadius && dist > 0.001) {
            const force = (1 - dist / distRadius);
            const angle = Math.atan2(dy, dx);
            // Strong radial repulsion
            const push = force * force * 16;
            b.vx += Math.cos(angle) * push;
            b.vy += Math.sin(angle) * push;

            // Momentum transfer from pointer speed
            b.vx += pointer.vx * 0.18 * force;
            b.vy += pointer.vy * 0.18 * force;

            // Swell bubble on disturbance
            b.radius = b.baseRadius * (1 + force * 0.75);
          }
        }

        // 2. Spring force returning to resting matrix coordinate (x0, y0)
        const homeDx = b.x0 - b.x;
        const homeDy = b.y0 - b.y;
        b.vx = (b.vx + homeDx * spring) * friction;
        b.vy = (b.vy + homeDy * spring) * friction;
        b.x += b.vx;
        b.y += b.vy;

        // Smooth radius recovery
        b.radius += (b.baseRadius - b.radius) * 0.14;

        // 3. Render bubble
        const displacement = Math.sqrt((b.x - b.x0) * (b.x - b.x0) + (b.y - b.y0) * (b.y - b.y0));
        const disturbanceRatio = Math.min(1, displacement / 20);

        ctx.beginPath();
        ctx.arc(b.x, b.y, Math.max(0.6, b.radius), 0, Math.PI * 2);

        if (disturbanceRatio > 0.12) {
          // Disturbed bubbles shift into luminous electric lime
          ctx.fillStyle = limeAccent;
          ctx.globalAlpha = Math.min(1, b.alpha * (0.85 + 0.15 * disturbanceRatio));
        } else {
          ctx.fillStyle = restColor;
          ctx.globalAlpha = b.alpha * 0.9;
        }

        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      ctx.restore();

      // Dampen pointer velocity
      pointer.vx *= 0.6;
      pointer.vy *= 0.6;

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isIntersecting, isDark]);

  // Pointer move handler with velocity tracking
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const currX = e.clientX - rect.left;
    const currY = e.clientY - rect.top;

    const p = pointerRef.current;
    if (p.prevX !== -2000) {
      p.vx = currX - p.prevX;
      p.vy = currY - p.prevY;
    }
    p.prevX = currX;
    p.prevY = currY;
    p.x = currX;
    p.y = currY;
    p.active = true;
  };

  const handlePointerLeave = () => {
    const p = pointerRef.current;
    p.active = false;
    p.x = -2000;
    p.y = -2000;
    p.prevX = -2000;
    p.prevY = -2000;
    p.vx = 0;
    p.vy = 0;
  };

  return (
    <footer
      className={`relative z-20 w-full mt-auto border-t transition-colors duration-250 select-none overflow-hidden ${
        isDark
          ? 'bg-[#000000] border-[#181818] text-[#A3A3A3]'
          : 'bg-[#F9FAF8] border-[#E2E8F0] text-[#475569]'
      }`}
    >
      {/* 1. TOP HEADER & NAVIGATION COLUMNS */}
      <div className="max-w-7xl mx-auto pt-14 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-xs">
          {/* Brand Identity */}
          <div className="col-span-2 sm:col-span-1 space-y-3">
            <h3 className={`font-mono text-xs font-bold tracking-widest uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              JOBZY TALENT INTELLIGENCE
            </h3>
            <p className="font-mono text-[11px] text-[#737373] leading-relaxed">
              ©{new Date().getFullYear()} · AI CAREER PLATFORM
              <br />
              GLOBAL / ENTERPRISE
            </p>
          </div>

          {/* Solutions Column */}
          <div className="space-y-3">
            <h4 className={`font-mono text-xs font-bold tracking-widest uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              SOLUTIONS
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link to="/candidate/analyze" className="hover:text-[#C4F167] transition-colors">
                  RESUME ANALYZER
                </Link>
              </li>
              <li>
                <Link to="/candidate/optimizer" className="hover:text-[#C4F167] transition-colors">
                  AI RESUME OPTIMIZER
                </Link>
              </li>
              <li>
                <Link to="/candidate/builder" className="hover:text-[#C4F167] transition-colors">
                  ATS RESUME BUILDER
                </Link>
              </li>
              <li>
                <Link to="/candidate/jobs" className="hover:text-[#C4F167] transition-colors">
                  JOB RECOMMENDATIONS
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Column */}
          <div className="space-y-3">
            <h4 className={`font-mono text-xs font-bold tracking-widest uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              PLATFORM
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link to="/recruiter/bulk-screening" className="hover:text-[#C4F167] transition-colors">
                  BULK SCREENING
                </Link>
              </li>
              <li>
                <Link to="/recruiter/ranking" className="hover:text-[#C4F167] transition-colors">
                  AI CANDIDATE RANKING
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-[#C4F167] transition-colors">
                  PRICING & TIERS
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="hover:text-[#C4F167] transition-colors">
                  SYSTEM ARCHITECTURE
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-3">
            <h4 className={`font-mono text-xs font-bold tracking-widest uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              CONTACT
            </h4>
            <div className="space-y-1.5 font-mono text-[11px]">
              <p className="text-[#C4F167] font-semibold">HELLO@JOBZY.AI</p>
              <p>+1 (800) 562-9989</p>
              <p className="text-[#737373] pt-1">
                SAN FRANCISCO / BENGALURU
              </p>
            </div>
          </div>
        </div>

        {/* 2. DIVIDER & BACK TO TOP BUTTON */}
        <div className={`mt-12 pt-4 border-t flex items-center justify-between text-[11px] font-mono tracking-wider ${
          isDark ? 'border-[#1b1b1b]' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-4 text-[#737373]">
            <span>Talent Intelligence Engine 2.0</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">All Systems Operational</span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer uppercase ${
              isDark ? 'text-[#A3A3A3] hover:text-[#C4F167]' : 'text-slate-600 hover:text-black'
            }`}
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* 3. MASSIVE DOTTED BUBBLES WORD: "jobzy" (HOVER DISTURBANCE EFFECT) */}
      <div
        ref={containerRef}
        className="w-full relative flex items-center justify-center overflow-hidden cursor-crosshair pb-2"
        title="Hover to disturb the bubbles"
      >
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="block w-full h-auto touch-none"
        />
      </div>

      {/* 4. SUBTLE LEGAL FOOTNOTE */}
      <div className={`py-4 px-4 sm:px-6 lg:px-8 border-t text-[11px] font-mono flex flex-col sm:flex-row items-center justify-between gap-2 ${
        isDark ? 'border-[#141414] text-[#525252]' : 'border-slate-100 text-slate-400'
      }`}>
        <span>© {new Date().getFullYear()} JOBZY Talent Intelligence Inc.</span>
        <div className="flex gap-4">
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
          <span className="hover:underline cursor-pointer">Terms of Service</span>
          <span className="hover:underline cursor-pointer">Security & Compliance</span>
        </div>
      </div>
    </footer>
  );
};

export default JobzyFooter;
