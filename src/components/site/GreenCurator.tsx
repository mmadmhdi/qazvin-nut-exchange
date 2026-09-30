import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askCurator } from "@/lib/curator.functions";
import { Leaf, Send, X, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "@/lib/i18n-provider";

type Msg = { role: "user" | "assistant"; content: string };
type Intent = "taste" | "gift" | "trade";

const COPY = {
  fa: { name: "سرآشناس سبز", close: "بستن", intro: "برای چه کاری اینجا هستید؟", choices: "چشیدن، هدیه یا تجارت؟", sample: "نمونه پرسش:", thinking: "در حال اندیشیدن…", placeholder: "پرسش خود را بنویسید…", send: "ارسال", errors: ["درخواست‌ها زیاد شد؛ چند لحظه بعد دوباره بپرسید.", "اعتبار سرویس هوشمند تمام شده است. لطفاً با ما تماس بگیرید.", "خطایی رخ داد. دوباره تلاش کنید.", "ارتباط برقرار نشد. دوباره تلاش کنید."], intents: [{ key: "taste", label: "چشیدن", hint: "برای عصرانه با قهوه چه ترکیبی پیشنهاد می‌کنید؟" }, { key: "gift", label: "هدیه", hint: "یک هدیه رسمی برای مشتری عمانی می‌خواهم." }, { key: "trade", label: "تجارت", hint: "برای صادرات خلال پسته چه سایز و بسته‌بندی مناسب است؟" }] },
  en: { name: "Green Curator", close: "Close", intro: "What brings you here?", choices: "Tasting, gifting or trade?", sample: "Example:", thinking: "Thinking…", placeholder: "Write your question…", send: "Send", errors: ["Too many requests. Please try again shortly.", "The smart service is currently unavailable. Please contact us.", "Something went wrong. Please try again.", "Could not connect. Please try again."], intents: [{ key: "taste", label: "Tasting", hint: "What would you pair with afternoon coffee?" }, { key: "gift", label: "Gifting", hint: "I need a formal gift for an Omani client." }, { key: "trade", label: "Trade", hint: "Which pistachio sliver size and packaging suit export?" }] },
  ar: { name: "خبير درج سبز", close: "إغلاق", intro: "ما الذي تبحث عنه؟", choices: "التذوق أم الهدايا أم التجارة؟", sample: "سؤال مقترح:", thinking: "جارٍ التفكير…", placeholder: "اكتب سؤالك…", send: "إرسال", errors: ["الطلبات كثيرة. حاول بعد قليل.", "الخدمة الذكية غير متاحة حالياً. يرجى الاتصال بنا.", "حدث خطأ. حاول مرة أخرى.", "تعذر الاتصال. حاول مرة أخرى."], intents: [{ key: "taste", label: "التذوق", hint: "ماذا تقترح مع قهوة العصر؟" }, { key: "gift", label: "الهدايا", hint: "أريد هدية رسمية لعميل عُماني." }, { key: "trade", label: "التجارة", hint: "ما حجم شرائح الفستق وتعبئتها المناسبة للتصدير؟" }] },
} as const;

/** «سرآشناس سبز» — a quiet assistant docked in the corner, never intrusive. */
export function GreenCurator() {
  const { locale, dir } = useTranslation();
  const copy = COPY[locale];
  const intents = copy.intents;
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
           ? copy.errors[0]
          : err === "credits"
             ? copy.errors[1]
            : err
               ? copy.errors[2]
              : res.text;
      setMsgs((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMsgs((m) => [
        ...m,
         { role: "assistant", content: copy.errors[3] },
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
          aria-label={copy.name}
          className="fixed bottom-[4.75rem] start-3 z-50 inline-flex h-12 w-12 items-center justify-center gap-2 rounded-full border border-brass/50 bg-olive-deep text-xs tracking-widest text-paper shadow-lg hover:bg-olive lg:bottom-4 lg:h-auto lg:w-auto lg:px-4 lg:py-2.5"
        >
          <MessageCircle className="h-4 w-4" />
           <span className="hidden lg:inline">{copy.name}</span>
        </button>
      )}

      {open && (
         <div dir={dir} className="fixed inset-x-3 bottom-[4.5rem] z-50 lg:inset-x-auto lg:bottom-3 lg:start-4 lg:w-[380px]">
          <div className="card-paper flex max-h-[78vh] flex-col overflow-hidden rounded-sm shadow-2xl">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 bg-olive-deep px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-paper">
                  <Leaf className="h-4 w-4 shrink-0 text-brass" />
                   <span className="truncate font-display text-base">{copy.name}</span>
                </div>
                <div className="text-[10px] tracking-[0.25em] text-paper/60">THE GREEN CURATOR</div>
              </div>
               <button onClick={() => setOpen(false)} aria-label={copy.close} className="text-paper/80 hover:text-paper">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 text-sm">
              {!intent ? (
                <div>
                  <p className="text-cocoa leading-7">
                     {copy.intro} <span className="text-muted-foreground">{copy.choices}</span>
                  </p>
                  <div className="mt-4 grid gap-2">
                     {intents.map((i) => (
                      <button
                        key={i.key}
                       onClick={() => setIntent(i.key as Intent)}
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
                       onClick={() => send(intents.find((i) => i.key === intent)?.hint ?? "")}
                      className="w-full rounded-sm bg-cream px-3 py-2 text-right text-xs text-cocoa hover:bg-bone"
                    >
                       {copy.sample} {intents.find((i) => i.key === intent)?.hint}
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
                      {m.role === "assistant" ? (
                        <div className="curator-md leading-7">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap leading-7">{m.content}</p>
                      )}
                    </div>
                  ))}
                   {busy && <div className="text-xs text-muted-foreground">{copy.thinking}</div>}
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
                   placeholder={copy.placeholder}
                  className="min-w-0 rounded-sm border border-input bg-background px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="shrink-0 rounded-sm bg-olive-deep p-2 text-paper hover:bg-olive disabled:opacity-50"
                   aria-label={copy.send}
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
