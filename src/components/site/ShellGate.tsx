import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Leaf, LineChart, Sparkles } from "lucide-react";

/**
 * «Crack to Enter» — the brand signature, now an inline landing section
 * instead of a blocking loading overlay. Click/tap the shell to reveal the
 * three paths: Taste · Origin · Trade.
 */
export function ShellGate() {
  const [open, setOpen] = useState(false);
  const shift = open ? 30 : 0;
  const rot = open ? 11 : 0;

  return (
    <section className="relative overflow-hidden rounded-sm border border-brass/25 bg-cream/40">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--olive-deep) 5%, transparent) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[auto_minmax(0,1fr)]">
        <div className="mx-auto lg:mx-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="بازکردن پوسته پسته و دیدن سه مسیر"
            className="group relative block h-40 w-40 select-none sm:h-52 sm:w-52"
          >
            <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-lg">
              <defs>
                <radialGradient id="sg-kernel" cx="45%" cy="35%">
                  <stop offset="0%" stopColor="oklch(0.72 0.13 135)" />
                  <stop offset="100%" stopColor="oklch(0.44 0.09 138)" />
                </radialGradient>
                <linearGradient id="sg-shell" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.94 0.03 88)" />
                  <stop offset="100%" stopColor="oklch(0.80 0.05 82)" />
                </linearGradient>
              </defs>
              <ellipse cx="100" cy="100" rx="46" ry="60" fill="url(#sg-kernel)" />
              <ellipse cx="86" cy="82" rx="14" ry="20" fill="oklch(0.86 0.08 132)" opacity="0.45" />
              <g
                style={{
                  transform: `translateX(${-shift}px) rotate(${-rot}deg)`,
                  transformOrigin: "100px 170px",
                  transition: "transform 600ms cubic-bezier(.2,.8,.2,1)",
                }}
              >
                <path d="M100 26 A 50 62 0 0 0 100 178 Z" fill="url(#sg-shell)" stroke="oklch(0.62 0.06 80)" strokeWidth="1.5" />
              </g>
              <g
                style={{
                  transform: `translateX(${shift}px) rotate(${rot}deg)`,
                  transformOrigin: "100px 170px",
                  transition: "transform 600ms cubic-bezier(.2,.8,.2,1)",
                }}
              >
                <path d="M100 26 A 50 62 0 0 1 100 178 Z" fill="url(#sg-shell)" stroke="oklch(0.62 0.06 80)" strokeWidth="1.5" />
              </g>
            </svg>
            <span className="mt-2 block text-center text-[10px] tracking-[0.3em] uppercase text-brass-dark">
              {open ? "Cracked" : "Crack to enter"}
            </span>
          </button>
        </div>

        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">Taste · Origin · Trade</div>
          <h2 className="mt-2 font-display text-3xl text-olive-deep sm:text-4xl">سه مسیر خانه‌ی سبز</h2>
          <div className="gold-rule my-5 max-w-xs" />
          <p className="max-w-xl text-sm leading-8 text-cocoa">
            پوسته را باز کنید و مسیر خود را انتخاب کنید: چشیدن، اصالت باغ یا تجارت.
          </p>
          <div
            className="mt-6 grid gap-3 transition-all duration-500 sm:grid-cols-3"
            style={{ opacity: open ? 1 : 0.55 }}
          >
            <PathCard to="/taste" icon={<Sparkles className="h-4 w-4" />} latin="Taste" title="آیین چشیدن" desc="آیین مصرف و ترکیب‌های پیشنهادی" />
            <PathCard to="/origin" icon={<Leaf className="h-4 w-4" />} latin="Origin" title="اصالت باغ" desc="از باغ تا بسته و شناسنامه محصول" />
            <PathCard to="/wholesale" icon={<LineChart className="h-4 w-4" />} latin="Trade" title="تجارت" desc="عمده، صادرات و تابلوی قیمت" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PathCard({
  to,
  icon,
  latin,
  title,
  desc,
}: {
  to: string;
  icon: React.ReactNode;
  latin: string;
  title: string;
  desc: string;
}) {
  return (
    <Link to={to} className="card-paper rounded-sm p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-brass-dark">
        {icon}
        {latin}
      </div>
      <div className="mt-2 font-display text-xl text-olive-deep">{title}</div>
      <p className="mt-1 text-xs leading-6 text-cocoa">{desc}</p>
    </Link>
  );
}
