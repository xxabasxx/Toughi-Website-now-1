import { Search, ShieldCheck, Sparkles } from "lucide-react";
import imgFantail from "../assets/pigeon-fantail.webp";
import imgKashaniMini from "../assets/pigeon-kashani.webp";
import { faNum, faPrice } from "../fa";
import { SEARCH_SUGGEST } from "../data";
import { useReveal } from "../hooks/useReveal";

type Props = {
  query: string;
  setQuery: (v: string) => void;
  goAds: () => void;
  onSuggest: (t: string) => void;
};

export default function Hero({ query, setQuery, goAds, onSuggest }: Props) {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* ambient decor */}
      <div className="pointer-events-none absolute -top-32 start-[8%] h-96 w-96 rounded-full bg-gold/10 blur-[120px]" />
      <div className="pointer-events-none absolute -end-24 top-40 h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-[130px]" />
      <span className="pointer-events-none absolute -start-10 -top-14 select-none font-nasta text-[19rem] leading-none text-cream/[0.045]">
        ط
      </span>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-24 lg:pt-20">
        {/* copy */}
        <div>
          <div className="reveal inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-1.5 text-[11px] font-extrabold text-gold sm:text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            بازار تخصصی پرندگان و حیوانات خانگی
          </div>

          <h1 className="reveal mt-6 font-display text-[42px] leading-[1.35] sm:text-6xl sm:leading-[1.3] xl:text-[68px]">
            از <span className="whitespace-nowrap">کبوترِ مسابقه‌ای</span>
            <br />
            <span className="gold-text">تا مرغ‌عشقِ دستی</span>
          </h1>

          <p className="reveal mt-5 max-w-xl text-sm leading-8 text-mute sm:text-base sm:leading-9">
            طوقی، تالارِ برگزیده‌ی خرید و فروش حیوانات خانگی است؛ از لانه‌ی کبوترِ قهرمان تا آکواریومِ
            لوکس. مستقیم، امن و بدون واسطه در {faNum(81)} شهر ایران.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              goAds();
            }}
            className="reveal mt-8 flex items-center gap-2 rounded-[1.4rem] border border-line bg-card/80 p-2 shadow-2xl shadow-black/20 backdrop-blur"
          >
            <Search className="ms-3 h-4 w-4 shrink-0 text-mute" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="مثلاً: کبوتر کاشانی، طوطی برزیلی..."
              className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
            />
            <button
              type="submit"
              className="btn-shine flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-b from-[#e9cf8e] to-[#b8873b] px-6 py-3 text-sm font-extrabold text-deep transition hover:brightness-110"
            >
              جستجو
            </button>
          </form>

          <div className="reveal mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-mute">محبوب‌ها:</span>
            {SEARCH_SUGGEST.map((s) => (
              <button
                key={s}
                onClick={() => onSuggest(s)}
                className="rounded-full border border-line px-3.5 py-1.5 text-xs text-mute transition hover:border-gold/50 hover:text-gold"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="reveal mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-8">
            {[
              { n: `${faNum(24600)}+`, l: "آگهی فعال" },
              { n: `${faNum(12400)}+`, l: "فروشنده احرازشده" },
              { n: faNum(81), l: "شهر تحت پوشش" },
            ].map((s) => (
              <div key={s.l}>
                <span className="gold-text font-display text-3xl sm:text-4xl">{s.n}</span>
                <span className="mt-1 block text-[11px] text-mute sm:text-xs">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* visual — floating transparent fantail, NO background at all */}
        <div className="reveal relative mx-auto flex w-full max-w-lg items-center justify-center self-stretch bg-transparent lg:max-w-none">
          {/* glow behind bird */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(217,179,106,0.18),transparent_65%)] sm:h-[32rem] sm:w-[32rem]" />
          {/* orbit rings */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10 sm:h-[28rem] sm:w-[28rem]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[17rem] w-[17rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/20 sm:h-[22rem] sm:w-[22rem]" />

          {/* day-mode dark disc behind white bird */}
          <div className="bird-disc pointer-events-none absolute left-1/2 top-1/2 h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-[20rem] sm:w-[20rem]" />

          {/* ground shadow */}
          <div className="absolute bottom-6 left-1/2 h-6 w-52 -translate-x-1/2 rounded-full bg-black/30 blur-2xl sm:w-64" />

          {/* THE BIRD */}
          <img
            src={imgFantail}
            alt="کبوتر فن‌تیل دم‌چتری سفید — نماد طوقی"
            className="hero-bird animate-float relative z-10 mx-auto w-full max-w-[20rem] object-contain drop-shadow-[0_24px_40px_rgba(217,179,106,0.25)] sm:max-w-[26rem] lg:max-w-[30rem]"
          />

          {/* floating listing card */}
          <div className="animate-float-slow absolute -start-4 top-64 z-20 flex items-center gap-3 rounded-2xl border border-line bg-ink/85 p-3 shadow-2xl shadow-black/30 backdrop-blur-md sm:-start-10">
            <img
              src={imgKashaniMini}
              alt="کبوتر کاشانی"
              className="h-11 w-11 rounded-xl object-cover"
            />
            <div>
              <p className="text-xs font-bold text-cream">کبوتر کاشانی ابلق</p>
              <p className="mt-0.5 text-[11px] font-bold text-gold">{faPrice(4500000)}</p>
            </div>
            <span className="ms-1 rounded-lg bg-gold/15 px-2 py-1 text-[10px] font-extrabold text-gold">
              ویژه
            </span>
          </div>

          {/* safety card */}
          <div className="animate-float absolute -end-3 bottom-24 z-20 flex items-center gap-3 rounded-2xl border border-line bg-ink/85 p-3.5 shadow-2xl shadow-black/30 backdrop-blur-md sm:-end-8">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/15 text-gold">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-cream">معامله‌ی امن طوقی</p>
              <p className="mt-0.5 text-[10px] text-mute">تضمین تحویل سالم</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
