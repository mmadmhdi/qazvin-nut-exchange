import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askCurator } from "@/lib/curator.functions";
import { Leaf, Send, X, MessageCircle } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };
type Intent = "taste" | "gift" | "trade";

const INTENTS: { key: Intent; label: string; hint: string }[] = [
  { key: "taste", label: "چشیدن", hint: "برای عصرانه با قهوه چه ترکیبی پیشنهاد می‌کنید؟" },
  { key: "gift", label: "هدیه", hint: "یک هدیه رسمی برای مشتری عمانی می‌خواهم." },
  { key: "trade", label: "تجارت", hint: "برای صادرات خلال پسته به ترکیه چه سایز و بسته‌بندی؟" },
];

/** «سرآشناس سبز» — a quiet assistant docked in the corner, never intrusive. */
export function GreenCurator() {
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const ask = useServerFn(askCurator);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [msgs, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy || !intent) return;
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await ask({ data: { intent, messages: next } });
      const err = "error" in res ? res.error : undefined;
      const reply =
        err === "rate_limit"
          ? "درخواست‌ها زیاد شد؛ چند لحظه بعد دوباره بپرسید."
          : err === "credits"
            ? "اعتبار سرویس هوشمند تمام شده است. لطفاً با ما تماس بگیرید."
            : err
              ? "خطایی رخ داد. دوباره تلاش کنید."
              : res.text;
      setMsgs((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "assistant", content: "ارتباط برقرار نشد. دوباره تلاش کنید." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 left-4 z-50 inline-flex items-center gap-2 rounded-full border border-brass/50 bg-olive-deep px-4 py-2.5 text-xs tracking-widest text-paper shadow-lg hover:bg-olive"
        >
          <MessageCircle className="h-4 w-4" />
          سرآشناس سبز
        </button>
      )}

      {open && (
        <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:left-4 sm:w-[380px]">
          <div className="card-paper flex max-h-[78vh] flex-col overflow-hidden rounded-sm shadow-2xl">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 bg-olive-deep px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-paper">
                  <Leaf className="h-4 w-4 shrink-0 text-brass" />
                  <span className="truncate font-display text-base">سرآشناس سبز</span>
                </div>
                <div className="text-[10px] tracking-[0.25em] text-paper/60">THE GREEN CURATOR</div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="بستن" className="text-paper/80 hover:text-paper">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 text-sm">
              {!intent ? (
                <div>
                  <p className="text-cocoa leading-7">
                    برای چه کاری اینجا هستید؟ <span className="text-muted-foreground">چشیدن، هدیه یا تجارت؟</span>
                  </p>
                  <div className="mt-4 grid gap-2">
                    {INTENTS.map((i) => (
                      <button
                        key={i.key}
                        onClick={() => setIntent(i.key)}
                        className="rounded-sm border border-olive-deep/25 px-3 py-2 text-right text-sm text-olive-deep hover:bg-cream"
                      >
                        {i.label}
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">{i.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {msgs.length === 0 && (
                    <button
                      onClick={() => send(INTENTS.find((i) => i.key === intent)!.hint)}
                      className="w-full rounded-sm bg-cream px-3 py-2 text-right text-xs text-cocoa hover:bg-bone"
                    >
                      نمونه پرسش: {INTENTS.find((i) => i.key === intent)!.hint}
                    </button>
                  )}
                  {msgs.map((m, i) => (
                    <div
                      key={i}
                      className={
                        m.role === "user"
                          ? "ms-8 rounded-sm bg-olive-deep px-3 py-2 text-paper"
                          : "me-4 rounded-sm border border-border bg-background px-3 py-2 text-cocoa"
                      }
                    >
                      <p className="whitespace-pre-wrap leading-7">{m.content}</p>
                    </div>
                  ))}
                  {busy && <div className="text-xs text-muted-foreground">در حال اندیشیدن…</div>}
                  <div ref={endRef} />
                </div>
              )}
            </div>

            {intent && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-border px-3 py-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="پرسش خود را بنویسید…"
                  className="min-w-0 rounded-sm border border-input bg-background px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="shrink-0 rounded-sm bg-olive-deep p-2 text-paper hover:bg-olive disabled:opacity-50"
                  aria-label="ارسال"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
