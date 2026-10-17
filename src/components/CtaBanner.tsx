import { Bird, Plus, Sparkles } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

export default function CtaBanner({ onPost, onSoon }: { onPost: () => void; onSoon: () => void }) {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-4 pb-20 sm:pb-24">
      <div className="reveal relative overflow-hidden rounded-[2.5rem] border border-gold/25 bg-gradient-to-l from-[#1b2413] via-[#12190d] to-ink px-6 py-16 text-center sm:px-12 sm:py-20">
        {/* decorative rings */}
        <span className="pointer-events-none absolute -start-24 -top-24 h-72 w-72 rounded-full border border-gold/10" />
        <span className="pointer-events-none absolute -start-14 -top-14 h-44 w-44 rounded-full border border-gold/20" />
        <span className="pointer-events-none absolute -bottom-28 -end-20 h-80 w-80 rounded-full border border-gold/10" />
        <span className="pointer-events-none absolute -bottom-16 -end-10 h-48 w-48 rounded-full border border-gold/20" />
        <Bird className="pointer-events-none absolute end-10 top-10 h-20 w-20 text-gold/[0.08]" strokeWidth={1} />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[11px] font-extrabold text-gold sm:text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            جشنواره افتتاحیه
          </div>
          <h2 className="mt-5 font-display text-4xl leading-[1.4] sm:text-6xl sm:leading-[1.35]">
            آگهی‌ات را بگذار؛ <span className="gold-text">رایگان</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-8 text-mute sm:text-base">
            آگهی تو در کمتر از ۲ دقیقه منتشر می‌شود و توسط هزاران خریدار واقعی در سراسر ایران دیده
            خواهد شد.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onPost}
              className="btn-shine flex items-center gap-2 rounded-full bg-gradient-to-b from-[#e9cf8e] to-[#b8873b] px-8 py-3.5 text-sm font-extrabold text-deep shadow-[0_16px_40px_-14px_rgba(217,179,106,0.6)] transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              ثبت آگهی رایگان
            </button>
            <button
              onClick={onSoon}
              className="rounded-full border border-cream/20 px-8 py-3.5 text-sm font-bold text-cream/80 transition hover:border-gold/50 hover:text-gold"
            >
              راهنمای ثبت آگهی
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
