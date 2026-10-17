import { Clock, Heart, MapPin, SearchX } from "lucide-react";
import { CATEGORIES, type Listing } from "../data";
import { faNum, faPrice } from "../fa";
import { useReveal } from "../hooks/useReveal";

type Props = {
  items: Listing[];
  activeCat: string;
  setActiveCat: (id: string) => void;
  favs: Set<number>;
  toggleFav: (id: number) => void;
  onClear: () => void;
  onOpen: (l: Listing) => void;
};

export default function Listings({
  items,
  activeCat,
  setActiveCat,
  favs,
  toggleFav,
  onClear,
  onOpen,
}: Props) {
  const ref = useReveal<HTMLElement>([items.length, activeCat]);

  return (
    <section id="ads" ref={ref} className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:py-20">
      <div className="reveal mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold text-gold sm:text-xs">تازه‌ترین‌ها از سراسر کشور</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">جدیدترین آگهی‌ها</h2>
        </div>
        <span className="rounded-full border border-line bg-card px-4 py-1.5 text-xs font-bold text-mute">
          {faNum(items.length)} آگهی
        </span>
      </div>

      {/* filter tabs */}
      <div className="reveal no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[13px] transition ${
              activeCat === c.id
                ? "border-gold bg-gold font-extrabold text-deep shadow-[0_10px_26px_-12px_rgba(217,179,106,0.7)]"
                : "border-line bg-card text-mute hover:border-gold/40 hover:text-cream"
            }`}
          >
            <c.icon className="h-3.5 w-3.5" />
            {c.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-dashed border-line py-20 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-gold/10 text-gold">
            <SearchX className="h-7 w-7" />
          </span>
          <p className="text-lg font-extrabold">آگهی‌ای با این مشخصات پیدا نشد</p>
          <p className="text-sm text-mute">فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید.</p>
          <button
            onClick={onClear}
            className="mt-2 rounded-full border border-gold/40 px-6 py-2.5 text-sm font-extrabold text-gold transition hover:bg-gold/10"
          >
            حذف فیلترها
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((l) => {
            const active = favs.has(l.id);
            return (
              <article
                key={l.id}
                onClick={() => onOpen(l)}
                className="reveal group cursor-pointer overflow-hidden rounded-3xl border border-line bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[0_24px_60px_-28px_rgba(217,179,106,0.4)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={l.img}
                    alt={l.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                  {l.badge && (
                    <span className="absolute start-3 top-3 rounded-full border border-gold/30 bg-ink/70 px-2.5 py-1 text-[10px] font-extrabold text-gold backdrop-blur">
                      {l.badge}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFav(l.id); }}
                    aria-label="افزودن به علاقه‌مندی‌ها"
                    className={`absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition ${
                      active ? "bg-gold text-deep" : "bg-ink/60 text-cream/85 hover:text-gold"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="truncate text-sm font-extrabold leading-6">{l.title}</h3>
                  <p
                    className={`mt-2 text-[17px] font-extrabold ${l.price ? "text-gold" : "text-leaf"}`}
                  >
                    {faPrice(l.price)}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-line/70 pt-3 text-[11px] text-mute">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gold/70" />
                      {l.district}، {l.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {l.time}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
