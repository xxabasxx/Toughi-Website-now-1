import { Images, MousePointerClick } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

type Tile = {
  img: string;
  label: string;
  sub: string;
  cat: string;
  span?: string;
};

const TILES: Tile[] = [
  {
    img: "https://images.pexels.com/photos/31114625/pexels-photo-31114625.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    label: "طاووس",
    sub: "پرندگان نمایشی",
    cat: "pigeon",
    span: "col-span-2 row-span-2",
  },
  {
    img: "https://images.pexels.com/photos/38592436/pexels-photo-38592436.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    label: "جغد و بوم",
    sub: "شکارچیان شب",
    cat: "pigeon",
  },
  {
    img: "https://images.pexels.com/photos/38840708/pexels-photo-38840708.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    label: "مرغ مگس‌خوار",
    sub: "پرندگان زینتی",
    cat: "songbird",
  },
  {
    img: "https://images.pexels.com/photos/17502287/pexels-photo-17502287.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    label: "آرا و ماکاو",
    sub: "طوطی‌سانان رنگی",
    cat: "parrot",
  },
  {
    img: "https://images.pexels.com/photos/35105486/pexels-photo-35105486.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    label: "فنچ زبرا",
    sub: "قناری و فنچ",
    cat: "songbird",
  },
  {
    img: "https://images.pexels.com/photos/37144808/pexels-photo-37144808.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    label: "خرگوش لوپ",
    sub: "خانگی و دستی",
    cat: "small",
  },
  {
    img: "https://images.pexels.com/photos/29054922/pexels-photo-29054922.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    label: "لاک‌پشت",
    sub: "آبزیان و خزندگان",
    cat: "fish",
    span: "col-span-2",
  },
  {
    img: "https://images.pexels.com/photos/4520482/pexels-photo-4520482.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    label: "همستر",
    sub: "جوندگان کوچک",
    cat: "small",
  },
];

export default function Gallery({ onSelectCat }: { onSelectCat: (cat: string) => void }) {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      <div className="reveal mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-gold sm:text-xs">
            <Images className="h-3.5 w-3.5" />
            نگارخانه طوقی
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">همه‌ی دنیای پر، بال و مو</h2>
        </div>
        <p className="flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-[11px] text-mute sm:text-xs">
          <MousePointerClick className="h-3.5 w-3.5 text-gold" />
          برای دیدن آگهی‌های هر گروه، روی تصویرش بزن
        </p>
      </div>

      <div className="grid auto-rows-[130px] grid-cols-2 gap-3 sm:auto-rows-[165px] sm:gap-4 md:grid-cols-4 lg:auto-rows-[190px]">
        {TILES.map((t) => (
          <button
            key={t.label}
            onClick={() => onSelectCat(t.cat)}
            className={`reveal group relative overflow-hidden rounded-3xl border border-line ${t.span ?? ""}`}
          >
            <img
              src={t.img}
              alt={t.label}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/15 to-transparent transition group-hover:from-ink/70" />
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-gold/0 transition duration-500 group-hover:ring-gold/40" />
            <div className="relative flex h-full flex-col justify-end p-4 text-start sm:p-5">
              <span className="-translate-y-1 text-[10px] font-bold text-gold/90 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                {t.sub}
              </span>
              <span className="mt-0.5 text-base font-extrabold sm:text-lg">{t.label}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
