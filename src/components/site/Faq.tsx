export type FaqItem = { q: string; a: string };

/**
 * Accessible FAQ block with FAQPage structured data.
 * Uses native <details> so it works without JS and stays SSR-safe.
 */
export function Faq({ items, title = "پرسش‌های متداول" }: { items: FaqItem[]; title?: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };

  return (
    <section className="mt-12 sm:mt-14">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark">FAQ</div>
      <h2 className="font-display text-2xl sm:text-3xl text-olive-deep mt-2">{title}</h2>
      <div className="gold-rule my-4" />
      <div className="divide-y divide-border/60 card-paper rounded-sm">
        {items.map((i) => (
          <details key={i.q} className="group px-4 sm:px-6 py-4">
            <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-olive-deep text-sm sm:text-base font-medium">
              <span>{i.q}</span>
              <span className="text-brass shrink-0 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-8 text-cocoa">{i.a}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
