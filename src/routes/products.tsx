import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "محصولات — خانه پسته قزوین" },
      { name: "description", content: "فهرست کامل محصولات خشکبار: خلال پسته، بادام درختی و بادام زمینی." },
      { property: "og:title", content: "محصولات خانه پسته قزوین" },
      { property: "og:description", content: "همه محصولات اصیل، از خلال پسته قزوین تا پرک بادام." },
    ],
  }),
  component: Products,
});

function Products() {
  const { products } = useStore();
  const active = products.filter((p) => p.active).sort((a, b) => b.priority - a.priority);
  const groups = ["پسته", "بادام درختی", "بادام زمینی", "سایر"] as const;
  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">کاتالوگ</div>
      <h1 className="font-display text-4xl text-olive-deep mt-2">محصولات ما</h1>
      <div className="gold-rule my-8" />
      {groups.map((g) => {
        const list = active.filter((p) => p.category === g);
        if (!list.length) return null;
        return (
          <section key={g} className="mb-14">
            <h2 className="font-display text-2xl text-olive-deep mb-6">{g}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
