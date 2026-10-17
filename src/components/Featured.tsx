import { useRef } from "react";
import { ChevronLeft, ChevronRight, Clock, Crown, Heart, MapPin } from "lucide-react";
import { LISTINGS, type Listing } from "../data";
import { faPrice } from "../fa";
import { useReveal } from "../hooks/useReveal";

type Props = { favs: Set<number>; toggleFav: (id: number) => void; onOpen: (l: Listing) => void };

export default function Featured({ favs, toggleFav, onOpen }: Props) {
  const ref = useReveal<HTMLElement>();
  const rail = useRef<HTMLDivElement>(null);
  const featured = LISTINGS.filter((l) => l.featured);
  const scroll = (dir: number) => rail.current?.scrollBy({ left: dir, behavior: "smooth" });

  return (
    <section ref={ref} className="border-y border-line bg-night/60 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="reveal mb-8 flex items-end justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-gold sm:text-xs">
              <Crown className="h-3.5 w-3.5" />
              گلچین طوقی
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">آگهی‌های ویژه</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(420)}
              aria-label="آگهی‌های قبلی"
              className="grid h-11 w-11 place-items-center rounded-full border border-line text-mute transition hover:border-gold/50 hover:text-gold"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => scroll(-420)}
              aria-label="آگهی‌های بعدی"
              className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold transition hover:bg-gold hover:text-deep"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl">
        <div
          ref={rail}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-3"
        >
          {featured.map((l) => {
            const active = favs.has(l.id);
            return (
              <div
                key={l.id}
                className="reveal w-[290px] shrink-0 snap-start rounded-[1.7rem] bg-gradient-to-b from-gold/50 via-gold/15 to-transparent p-px transition-transform duration-300 hover:-translate-y-1.5 sm:w-[320px]"
              >
                <article onClick={() => onOpen(l)} className="cursor-pointer overflow-hidden rounded-[calc(1.7rem-1px)] bg-card">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={l.img}
                      alt={l.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                    <span className="absolute start-3 top-3 flex items-center gap-1 rounded-full border border-gold/40 bg-ink/75 px-2.5 py-1 text-[10px] font-extrabold text-gold backdrop-blur">
                      <Crown className="h-3 w-3" />
                      ویژه
                    </span>
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
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-sm font-extrabold">{l.title}</h3>
                      {l.badge && (
                        <span className="shrink-0 rounded-lg bg-gold/10 px-2 py-1 text-[10px] font-bold text-gold">
                          {l.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-[17px] font-extrabold text-gold">{faPrice(l.price)}</p>
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
