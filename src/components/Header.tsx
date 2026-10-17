import { useEffect, useState } from "react";
import {
  Bird,
  ChevronDown,
  Heart,
  LayoutGrid,
  MapPin,
  Menu,
  Moon,
  Plus,
  Search,
  Sparkles,
  Sun,
  User,
  X,
} from "lucide-react";
import { CATEGORIES } from "../data";
import CityPicker from "./CityPicker";
import { faNum } from "../fa";

type Props = {
  query: string;
  onQuery: (v: string) => void;
  city: string;
  onCity: (v: string) => void;
  favCount: number;
  goAds: () => void;
  onPost: () => void;
  onAuth: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
};

export default function Header({
  query,
  onQuery,
  city,
  onCity,
  favCount,
  goAds,
  onPost,
  onAuth,
  theme,
  onToggleTheme,
}: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<null | "cats" | "city">(null);
  const [mobile, setMobile] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      {/* announcement */}
      <div className="relative z-50 bg-gradient-to-l from-[#c69c48] via-[#e4c075] to-[#c69c48] text-deep">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-[11px] font-extrabold sm:text-xs">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span>جشنواره افتتاحیه طوقی — ثبت آگهی تا پایان آذر، رایگان و بدون کمیسیون</span>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 border-b transition-all duration-500 ${
          scrolled
            ? "border-line bg-ink/90 shadow-[0_14px_50px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl"
            : "border-transparent bg-ink/70 backdrop-blur-md"
        }`}
      >
        {open && (
          <button
            aria-hidden
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-30 cursor-default bg-transparent"
          />
        )}

        <div className="relative mx-auto flex h-[74px] max-w-7xl items-center gap-3 px-4 lg:gap-5">
          {/* logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex shrink-0 items-center gap-2.5"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/25 to-gold/5 text-gold shadow-[inset_0_1px_0_rgba(217,179,106,0.35)]">
              <Bird className="h-5 w-5" />
            </span>
            <span className="flex flex-col items-start">
              <span className="gold-text font-nasta text-2xl leading-[1.6]">طوقی</span>
              <span className="-mt-2 text-[10px] font-medium text-mute">بازار پرندگان ایران</span>
            </span>
          </a>

          {/* categories dropdown */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setOpen(open === "cats" ? null : "cats")}
              className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-sm text-mute transition hover:border-gold/40 hover:text-cream"
            >
              <LayoutGrid className="h-4 w-4" />
              دسته‌ها
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-300 ${open === "cats" ? "rotate-180" : ""}`}
              />
            </button>
            {open === "cats" && (
              <div className="absolute start-0 top-[calc(100%+12px)] z-40 w-[23rem] rounded-3xl border border-line bg-card/95 p-3 shadow-2xl shadow-black/70 backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-1">
                  {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setOpen(null)}
                      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-start transition hover:bg-white/5"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold">
                        <c.icon className="h-4 w-4" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-[13px] font-bold">{c.label}</span>
                        <span className="text-[10px] text-mute">{faNum(c.count)} آگهی</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goAds();
            }}
            className="relative hidden min-w-0 max-w-xl flex-1 md:block"
          >
            <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              onFocus={() => setOpen(null)}
              placeholder={`جستجو در ${faNum(33405)} آگهی...`}
              className="w-full rounded-full border border-line bg-card py-2.5 pe-4 ps-11 text-sm text-cream outline-none transition focus:border-gold/50 focus:bg-card2 focus:ring-4 focus:ring-gold/10"
            />
          </form>

          <div className="flex-1 md:hidden" />

          {/* city */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setCityOpen(true)}
              className="flex items-center gap-1.5 rounded-full px-3 py-2.5 text-sm text-mute transition hover:text-cream"
            >
              <MapPin className="h-4 w-4 text-gold" />
              <span className="max-w-24 truncate">{city}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* day/night toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="تغییر حالت شب و روز"
            title={theme === "dark" ? "حالت روز" : "حالت شب"}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-gold transition hover:border-gold/40"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* favorites */}
          <button
            onClick={goAds}
            title="علاقه‌مندی‌ها"
            className="relative hidden h-10 w-10 place-items-center rounded-full border border-line text-mute transition hover:border-gold/40 hover:text-gold sm:grid"
          >
            <Heart className="h-4 w-4" />
            {favCount > 0 && (
              <span className="absolute -end-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold px-1 text-[10px] font-extrabold text-deep">
                {faNum(favCount)}
              </span>
            )}
          </button>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onAuth();
            }}
            className="hidden items-center gap-2 text-sm text-mute transition hover:text-cream xl:flex"
          >
            <User className="h-4 w-4" />
            طوقی من
          </a>

          <span className="hidden h-6 w-px bg-line xl:block" />

          {/* CTA */}
          <button
            onClick={onPost}
            className="btn-shine hidden shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-b from-[#e9cf8e] to-[#b8873b] px-5 py-2.5 text-sm font-extrabold text-deep shadow-[0_10px_30px_-10px_rgba(217,179,106,0.55)] transition hover:brightness-110 sm:flex"
          >
            <Plus className="h-4 w-4" />
            ثبت آگهی
          </button>

          {/* mobile toggle */}
          <button
            onClick={() => setMobile(!mobile)}
            className="grid h-10 w-10 place-items-center rounded-full border border-line text-cream lg:hidden"
          >
            {mobile ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* mobile panel */}
        {mobile && (
          <div className="border-t border-line bg-ink/95 px-4 pb-6 pt-4 backdrop-blur-xl lg:hidden">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setMobile(false);
                goAds();
              }}
              className="relative mb-4"
            >
              <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
              <input
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder="جستجو در آگهی‌ها..."
                className="w-full rounded-2xl border border-line bg-card py-3 pe-4 ps-11 text-sm outline-none focus:border-gold/50"
              />
            </form>

            <button
              onClick={() => {
                setMobile(false);
                setCityOpen(true);
              }}
              className="mb-4 flex w-full items-center gap-2 rounded-2xl border border-line bg-card px-4 py-3 text-sm"
            >
              <MapPin className="h-4 w-4 text-gold" />
              <span className="flex-1 text-start">{city}</span>
              <span className="text-[11px] font-bold text-gold">تغییر شهر</span>
            </button>

            <button
              onClick={onPost}
              className="btn-shine flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#e9cf8e] to-[#b8873b] py-3.5 text-sm font-extrabold text-deep"
            >
              <Plus className="h-4 w-4" />
              ثبت آگهی رایگان
            </button>
          </div>
        )}
      </header>

      <CityPicker
        open={cityOpen}
        onClose={() => setCityOpen(false)}
        city={city}
        onPick={(c) => {
          onCity(c);
          goAds();
        }}
      />
    </>
  );
}
