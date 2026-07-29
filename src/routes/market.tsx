import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PriceCard } from "@/components/site/PriceCard";
import { MarketChart } from "@/components/site/MarketChart";
import { formatJalali } from "@/lib/format";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "بازار پسته — قیمت روز خشکبار | خانه پسته قزوین" },
      { name: "description", content: "تابلوی قیمت روز خلال پسته و خشکبار با نمودار تعاملی و تاریخچه قیمت." },
      { property: "og:title", content: "بازار پسته امروز" },
      { property: "og:description", content: "قیمت لحظه‌ای خلال پسته قزوین و بویین، به سبک تابلوی معاملات کلاسیک." },
    ],
  }),
  component: Market,
});

function Market() {
  const { products } = useStore();
  const active = products.filter((p) => p.active).sort((a, b) => b.priority - a.priority);
  const [selectedId, setSelectedId] = useState<string>(active[0]?.id ?? "");
  const selected = active.find((p) => p.id === selectedId) ?? active[0];

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">تابلوی معاملات</div>
          <h1 className="font-display text-4xl text-olive-deep mt-2">بازار پسته امروز</h1>
        </div>
        <div className="text-xs text-muted-foreground">
          به‌روزرسانی: {formatJalali(new Date())}
        </div>
      </div>
      <div className="gold-rule mb-8" />

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-3">
          {active.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`w-full text-right ${selected?.id === p.id ? "ring-1 ring-brass rounded-sm" : ""}`}
            >
              <PriceCard product={p} featured={i === 0 && selected?.id !== p.id ? false : false} />
            </button>
          ))}
        </div>
        <div className="space-y-6">
          {selected && <MarketChart product={selected} />}
          {selected && (
            <div className="card-paper rounded-sm p-6">
              <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">مشخصات</div>
              <h3 className="font-display text-2xl text-olive-deep mt-1">{selected.name}</h3>
              <p className="mt-3 text-cocoa leading-8 text-sm">{selected.description}</p>
              <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">منشأ</div><div className="text-cocoa mt-1">{selected.origin}</div></div>
                <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">درجه</div><div className="text-cocoa mt-1">{selected.grade}</div></div>
                <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">دسته</div><div className="text-cocoa mt-1">{selected.category}</div></div>
                <div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">واحد</div><div className="text-cocoa mt-1">{selected.unit}</div></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
