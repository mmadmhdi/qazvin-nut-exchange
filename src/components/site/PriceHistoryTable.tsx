import type { PricePoint } from "@/lib/store";
import { formatPrice, formatJalali } from "@/lib/format";

export function PriceHistoryTable({ history }: { history: PricePoint[] }) {
  const rows = [...history].slice(-20).reverse();
  if (rows.length === 0) {
    return (
      <div className="card-paper rounded-sm p-8 text-center text-sm text-muted-foreground">
        هنوز قیمت ثبت نشده است.
      </div>
    );
  }
  return (
    <div className="card-paper rounded-sm overflow-hidden">
      <div className="px-5 py-3 hairline-b text-[10px] tracking-[0.3em] uppercase text-brass-dark">
        تاریخچه قیمت
      </div>
      <div className="divide-y divide-border/60">
        <div className="grid grid-cols-3 px-5 py-2 text-xs text-muted-foreground bg-cream/50">
          <div>تاریخ</div>
          <div className="text-center">قیمت</div>
          <div className="text-left">تغییر</div>
        </div>
        {rows.map((row, i) => {
          const prev = rows[i + 1];
          const diff = prev ? row.price - prev.price : 0;
          return (
            <div key={row.date} className="grid grid-cols-3 px-5 py-2 text-sm">
              <div className="text-cocoa">{formatJalali(new Date(row.date))}</div>
              <div className="text-center num-fa text-olive-deep">{formatPrice(row.price)}</div>
              <div
                className={`text-left num-fa ${
                  diff > 0 ? "text-bull" : diff < 0 ? "text-bear" : "text-muted-foreground"
                }`}
              >
                {diff > 0 ? "+" : diff < 0 ? "−" : ""}
                {formatPrice(Math.abs(diff))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
