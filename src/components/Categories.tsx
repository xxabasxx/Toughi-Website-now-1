import { ArrowLeft } from "lucide-react";
import { GRID_CATEGORIES } from "../data";
import { faNum } from "../fa";
import { useReveal } from "../hooks/useReveal";

type Props = { active: string; onSelect: (id: string) => void };

export default function Categories({ active, onSelect }: Props) {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="cats" ref={ref} className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:py-20">
      <div className="reveal mb-8 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-extrabold tracking-wide text-gold sm:text-xs">
            هرچه پر و بال دارد، اینجاست
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">دسته‌بندی‌ها</h2>
        </div>
        <button
          onClick={() => onSelect("all")}
          className="hidden items-center gap-2 text-sm text-mute transition hover:text-gold sm:flex"
        >
          مشاهده همه آگهی‌ها
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {GRID_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`reveal group flex items-center gap-4 rounded-3xl border p-5 text-start transition-all duration-300 hover:-translate-y-1.5 ${
              active === c.id
                ? "border-gold/60 bg-gold/10 shadow-[0_20px_50px_-30px_rgba(217,179,106,0.5)]"
                : "border-line bg-card hover:border-gold/40 hover:bg-card2"
            }`}
          >
            <span
              className={`grid h-13 w-13 shrink-0 place-items-center rounded-2xl border transition ${
                active === c.id
                  ? "border-gold/50 bg-gold/20 text-gold"
                  : "border-line bg-night text-gold group-hover:border-gold/40"
              }`}
            >
              <c.icon className="h-6 w-6" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-extrabold sm:text-[15px]">{c.label}</span>
              <span className="mt-1 text-[11px] text-mute">{faNum(c.count)} آگهی</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
