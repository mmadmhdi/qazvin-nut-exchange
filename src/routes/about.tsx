import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "درباره ما — خانه پسته قزوین" },
      { name: "description", content: "روایتی از چهار نسل تجارت خانوادگی پسته در قزوین." },
      { property: "og:title", content: "درباره ما" },
      { property: "og:description", content: "میراث خانوادگی خانه پسته قزوین، بر پایه اعتماد و اصالت." },
    ],
  }),
  component: About,
});

function About() {
  const { settings } = useStore();
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="text-[10px] tracking-[0.3em] uppercase text-brass-dark text-center">درباره ما</div>
      <h1 className="font-display text-5xl text-olive-deep text-center mt-3">{settings.brandName}</h1>
      <div className="gold-rule my-8" />
      <div className="prose prose-neutral max-w-none text-cocoa leading-9 whitespace-pre-line text-lg">
        {settings.aboutText}
      </div>
      <div className="mt-14 grid grid-cols-3 text-center gap-6 hairline-t pt-10">
        <div>
          <div className="font-display num-fa text-4xl text-olive-deep">۴</div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">نسل تجربه</div>
        </div>
        <div>
          <div className="font-display num-fa text-4xl text-olive-deep">۱۳۴۸</div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">سال تأسیس</div>
        </div>
        <div>
          <div className="font-display num-fa text-4xl text-olive-deep">۱۰۰٪</div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">اصالت باغی</div>
        </div>
      </div>
    </div>
  );
}
