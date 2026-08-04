import { useStore } from "@/lib/store";
import { waHref } from "@/lib/contact";

/** Floating direct-to-WhatsApp action, hidden when no number is configured. */
export function WhatsAppFab() {
  const { settings } = useStore();
  const number = (settings.contactWhatsapp ?? "").trim();
  if (!number) return null;
  return (
    <a
      href={waHref(number, `سلام، از وب‌سایت ${settings.brandName} تماس می‌گیرم.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="گفتگو در واتساپ"
      className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full border border-brass/40 bg-olive-deep px-4 py-3 text-xs tracking-widest text-paper shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-olive"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.9.53 3.68 1.46 5.2L2 22l5.1-1.6a9.8 9.8 0 0 0 4.94 1.33c5.44 0 9.84-4.4 9.84-9.84C21.88 6.4 17.48 2 12.04 2Zm5.72 13.9c-.24.68-1.4 1.32-1.93 1.37-.53.05-1.02.08-1.76-.2a13.9 13.9 0 0 1-4.2-2.6 10.9 10.9 0 0 1-2.24-3.1c-.24-.5-.36-1.06-.14-1.6.2-.5.7-1.06.94-1.28.24-.22.44-.24.7-.24h.5c.2 0 .43.03.63.5.24.55.8 1.9.87 2.04.07.14.12.3.02.48-.1.2-.22.34-.4.53-.16.2-.28.3-.14.55.14.24.6 1 1.3 1.62.9.8 1.64 1.06 1.9 1.18.24.12.4.1.55-.06.14-.16.62-.72.78-.96.16-.24.33-.2.55-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.6-.18 1.28Z" />
      </svg>
      <span className="hidden sm:inline">واتساپ</span>
    </a>
  );
}
