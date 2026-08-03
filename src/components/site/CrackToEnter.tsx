import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Leaf, LineChart, Sparkles } from "lucide-react";

const KEY = "darj-sabz:gate-v1";

/**
 * «Crack to Enter» — the brand's single creative signature.
 * A pistachio shell the visitor pulls open to reveal Taste / Origin / Trade.
 * Appears once per browser session and is always skippable.
 */
export function CrackToEnter() {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [open, setOpen] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const audioDone = useRef(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  const dismiss = () => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  const crackSound = () => {
    if (audioDone.current) return;
    audioDone.current = true;
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.14, ctx.sampleRate);
      const ch = buffer.getChannelData(0);
      for (let i = 0; i < ch.length; i++) {
        const t = i / ch.length;
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 6) * 0.4;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2200;
      const gain = ctx.createGain();
      gain.gain.value = 0.22;
      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start();
      src.onended = () => ctx.close();
    } catch {
      /* silent */
    }
  };

  const setP = (v: number) => {
    const p = Math.min(1, Math.max(0, v));
    setProgress(p);
    if (p > 0.55 && !open) {
      crackSound();
      setOpen(true);
      setProgress(1);
    }
  };

  useEffect(() => {
    if (!show) return;
    const move = (clientX: number) => {
      if (!dragging.current) return;
      setP((clientX - startX.current) / 160);
    };
    const onMouseMove = (e: MouseEvent) => move(e.clientX);
    const onTouchMove = (e: TouchEvent) => move(e.touches[0]?.clientX ?? 0);
    const onUp = () => {
      dragging.current = false;
      if (!open) setProgress(0);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [show, open]);

  if (!show) return null;

  const shift = progress * 34;
  const rot = progress * 12;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-paper">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--olive-deep) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <button
        onClick={dismiss}
        className="absolute left-4 top-4 z-10 rounded-sm border border-olive-deep/25 px-3 py-1.5 text-[11px] tracking-widest text-cocoa hover:bg-cream"
      >
        رد کردن ✕
      </button>

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-5 py-14 text-center">
        <div className="font-display text-2xl text-olive-deep">درج سبز قزوین</div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.4em] text-brass-dark">
          Darj Sabz · Est. ۱۳۴۸
        </div>

        <div className="mt-10 select-none" style={{ perspective: "800px" }}>
          <div
            onMouseDown={(e) => {
              dragging.current = true;
              startX.current = e.clientX;
            }}
            onTouchStart={(e) => {
              dragging.current = true;
              startX.current = e.touches[0]?.clientX ?? 0;
            }}
            onClick={() => setP(1)}
            role="button"
            tabIndex={0}
            aria-label="بازکردن پسته و ورود به سایت"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setP(1);
            }}
            className="relative h-44 w-44 cursor-grab active:cursor-grabbing sm:h-56 sm:w-56"
          >
            <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-xl">
              <defs>
                <radialGradient id="kernel" cx="45%" cy="35%">
                  <stop offset="0%" stopColor="oklch(0.72 0.13 135)" />
                  <stop offset="100%" stopColor="oklch(0.44 0.09 138)" />
                </radialGradient>
                <linearGradient id="shellA" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.93 0.035 88)" />
                  <stop offset="100%" stopColor="oklch(0.79 0.05 82)" />
                </linearGradient>
              </defs>
              {/* kernel */}
              <ellipse cx="100" cy="100" rx="46" ry="60" fill="url(#kernel)" />
              <ellipse cx="86" cy="82" rx="14" ry="20" fill="oklch(0.86 0.08 132)" opacity="0.45" />
              {/* shell halves */}
              <g
                style={{
                  transform: `translateX(${-shift}px) rotate(${-rot}deg)`,
                  transformOrigin: "100px 170px",
                  transition: dragging.current ? "none" : "transform 500ms cubic-bezier(.2,.8,.2,1)",
                }}
              >
                <path
                  d="M100 24 C68 30 46 62 46 104 C46 146 70 176 100 182 Z"
                  fill="url(#shellA)"
                  stroke="oklch(0.62 0.06 80)"
                  strokeWidth="1.5"
                />
              </g>
              <g
                style={{
                  transform: `translateX(${shift}px) rotate(${rot}deg)`,
                  transformOrigin: "100px 170px",
                  transition: dragging.current ? "none" : "transform 500ms cubic-bezier(.2,.8,.2,1)",
                }}
              >
                <path
                  d="M100 24 C132 30 154 62 154 104 C154 146 130 176 100 182 Z"
                  fill="url(#shellA)"
                  stroke="oklch(0.62 0.06 80)"
                  strokeWidth="1.5"
                />
              </g>
            </svg>
          </div>
        </div>

        {!open ? (
          <>
            <div className="mt-8 font-display text-xl text-olive-deep sm:text-2xl">
              پوسته را باز کنید و وارد شوید
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              بکشید یا کلیک کنید — Crack to Enter
            </p>
          </>
        ) : (
          <div className="mt-8 w-full animate-fade-in">
            <div className="gold-rule mx-auto max-w-xs" />
            <p className="mt-4 text-xs tracking-[0.3em] text-brass-dark">مسیر خود را انتخاب کنید</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <GateCard
                to="/taste"
                icon={<Sparkles className="h-4 w-4" />}
                latin="Taste"
                title="چشیدن"
                desc="آیین مصرف و ترکیب‌های پیشنهادی"
                onGo={dismiss}
              />
              <GateCard
                to="/origin"
                icon={<Leaf className="h-4 w-4" />}
                latin="Origin"
                title="اصالت"
                desc="از باغ تا بسته و شناسنامه محصول"
                onGo={dismiss}
              />
              <GateCard
                to="/wholesale"
                icon={<LineChart className="h-4 w-4" />}
                latin="Trade"
                title="تجارت"
                desc="عمده، صادرات و تابلوی قیمت"
                onGo={dismiss}
              />
            </div>
            <button
              onClick={dismiss}
              className="mt-6 text-xs tracking-widest text-cocoa underline-offset-4 hover:underline"
            >
              ورود به صفحه اصلی ←
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GateCard({
  to,
  icon,
  latin,
  title,
  desc,
  onGo,
}: {
  to: string;
  icon: React.ReactNode;
  latin: string;
  title: string;
  desc: string;
  onGo: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onGo}
      className="card-paper rounded-sm p-5 text-right transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-brass-dark">
        {icon}
        {latin}
      </div>
      <div className="mt-2 font-display text-xl text-olive-deep">{title}</div>
      <p className="mt-1 text-xs leading-6 text-cocoa">{desc}</p>
    </Link>
  );
}
