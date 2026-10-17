import { Activity, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { TICKER } from "../data";
import { faShort } from "../fa";

export default function MarketTicker() {
  return (
    <section className="border-y border-line bg-night/80">
      <div className="mx-auto flex max-w-7xl items-stretch">
        <div className="relative z-10 flex shrink-0 items-center gap-2 border-e border-line bg-night px-4 py-3.5 sm:px-6">
          <Activity className="h-4 w-4 text-gold" />
          <span className="whitespace-nowrap text-xs font-extrabold text-gold sm:text-sm">
            نبض بازار
          </span>
        </div>

        <div className="marquee-wrap relative flex-1 overflow-hidden py-3.5" dir="ltr">
          <div className="marquee">
            {[0, 1].map((k) => (
              <div key={k} className="flex items-center" dir="rtl">
                {TICKER.map((t, i) => (
                  <span
                    key={i}
                    className="mx-6 flex shrink-0 items-center gap-2 whitespace-nowrap text-xs text-mute sm:text-[13px]"
                  >
                    <span className="h-1.5 w-1.5 rotate-45 rounded-[2px] bg-gold/50" />
                    <span className="font-bold text-cream/90">{t.label}</span>
                    <span className="tabular-nums">{faShort(t.price)}</span>
                    {t.trend === "up" ? (
                      <TrendingUp className="h-3.5 w-3.5 text-leaf" />
                    ) : t.trend === "down" ? (
                      <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
                    ) : (
                      <Minus className="h-3.5 w-3.5 text-mute" />
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-night to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-night to-transparent" />
        </div>
      </div>
    </section>
  );
}
