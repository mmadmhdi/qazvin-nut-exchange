import type { PricePoint } from "@/lib/store";

export function MiniSparkline({
  history,
  up,
  width = 96,
  height = 28,
}: {
  history: PricePoint[];
  up: boolean;
  width?: number;
  height?: number;
}) {
  const rows = history.slice(-40);
  if (rows.length < 2) return null;
  const closes = rows.map((r) => r.close ?? r.price);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const step = width / (closes.length - 1);
  const pts = closes
    .map((v, i) => `${(i * step).toFixed(2)},${(height - ((v - min) / range) * height).toFixed(2)}`)
    .join(" ");
  const color = up ? "var(--bull)" : "var(--bear)";
  const fill = up
    ? "color-mix(in oklab, var(--bull) 18%, transparent)"
    : "color-mix(in oklab, var(--bear) 18%, transparent)";
  const area = `0,${height} ${pts} ${width},${height}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polygon points={area} fill={fill} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.4} />
    </svg>
  );
}
