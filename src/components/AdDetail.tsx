import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Calendar,
  Clock,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  PhoneCall,
  Share2,
  ShieldCheck,
  Truck,
  Venus,
  X,
} from "lucide-react";
import type { Listing } from "../data";
import { faDigits, faPrice } from "../fa";

type Props = {
  ad: Listing | null;
  onClose: () => void;
  onChat: (ad: Listing) => void;
  fav: boolean;
  onFav: () => void;
  onToast: (m: string) => void;
};

export default function AdDetail({ ad, onClose, onChat, fav, onFav, onToast }: Props) {
  const [shot, setShot] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [confirmCall, setConfirmCall] = useState(false);

  useEffect(() => {
    setShot(0);
    setShowPhone(false);
    setConfirmCall(false);
  }, [ad?.id]);

  if (!ad) return null;

  const gallery = ad.images?.length ? ad.images : [ad.img];
  const specs = ad.specs ?? {};
  const phone = ad.phone ?? "09120000000";

  const rows = [
    { icon: Venus, k: "جنسیت", v: specs.sex },
    { icon: Calendar, k: "سن", v: specs.age },
    { icon: BadgeCheck, k: "نژاد / گونه", v: specs.breed },
    { icon: ShieldCheck, k: "سلامت", v: specs.health },
    { icon: Truck, k: "نحوه تحویل", v: specs.delivery },
  ].filter((r) => r.v);

  return (
    <div className="fixed inset-0 z-[92] flex items-end justify-center p-3 sm:items-center sm:p-4">
      <button aria-hidden onClick={onClose} className="absolute inset-0 cursor-default bg-ink/85 backdrop-blur-sm" />

      <div className="modal-pop no-scrollbar relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-line bg-card shadow-2xl shadow-black/70">
        <button
          onClick={onClose}
          aria-label="بستن"
          className="absolute end-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-line bg-ink/70 text-cream backdrop-blur transition hover:text-gold"
        >
          <X className="h-4 w-4" />
        </button>

        {/* gallery */}
        <div className="relative">
          <img src={gallery[shot]} alt={ad.title} className="h-64 w-full object-cover sm:h-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          {gallery.length > 1 && (
            <div className="absolute bottom-3 start-1/2 flex -translate-x-1/2 gap-2">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setShot(i)}
                  className={`h-12 w-12 overflow-hidden rounded-xl border-2 transition ${
                    shot === i ? "border-gold" : "border-white/30 opacity-70"
                  }`}
                >
                  <img src={g} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {ad.badge && (
            <span className="absolute start-4 top-4 rounded-full border border-gold/40 bg-ink/75 px-3 py-1 text-[10px] font-extrabold text-gold backdrop-blur">
              {ad.badge}
            </span>
          )}
        </div>

        <div className="px-6 pb-8 pt-5 sm:px-8">
          <h2 className="text-lg font-extrabold leading-8 sm:text-xl">{ad.title}</h2>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-mute">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-gold" />
              {ad.province ? `${ad.province}، ` : ""}
              {ad.district}، {ad.city}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {ad.time}
            </span>
          </div>

          <p className={`mt-4 text-2xl font-extrabold ${ad.price ? "text-gold" : "text-leaf"}`}>
            {faPrice(ad.price)}
          </p>

          {rows.length > 0 && (
            <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
              {rows.map((r) => (
                <div key={r.k} className="flex items-center gap-3 bg-card px-4 py-3">
                  <r.icon className="h-4 w-4 shrink-0 text-gold" />
                  <span className="text-[11px] text-mute">{r.k}</span>
                  <span className="ms-auto text-[12px] font-bold">{r.v}</span>
                </div>
              ))}
            </div>
          )}

          {ad.desc && (
            <>
              <h3 className="mb-2 mt-6 text-sm font-extrabold">توضیحات</h3>
              <p className="whitespace-pre-line text-[13px] leading-8 text-mute">{ad.desc}</p>
            </>
          )}

          {/* seller */}
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-line bg-night/60 p-4">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gold/15 text-sm font-extrabold text-gold">
              {(ad.seller ?? "ط")[0]}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-extrabold">{ad.seller ?? "فروشنده طوقی"}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-leaf">
                <BadgeCheck className="h-3 w-3" />
                هویت تاییدشده
              </p>
            </div>
            {ad.mine && (
              <span className="ms-auto rounded-full bg-gold/15 px-3 py-1 text-[10px] font-extrabold text-gold">
                آگهی شما
              </span>
            )}
          </div>

          {/* contact actions: message + call */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => onChat(ad)}
              className="btn-shine flex items-center justify-center gap-2 rounded-2xl bg-[conic-gradient(from_210deg,#ffd97a,#f4a52e,#ee5c48,#f4a52e,#ffd97a)] py-3.5 text-sm font-extrabold text-deep shadow-[0_12px_28px_-10px_rgba(238,92,72,0.55)] transition hover:brightness-110"
            >
              <MessageCircle className="h-4 w-4" />
              چت با فروشنده
            </button>
            <button
              onClick={() => setShowPhone(true)}
              className="btn-shine flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#2fbf71] to-[#17854a] py-3.5 text-sm font-extrabold text-white shadow-[0_12px_28px_-8px_rgba(47,191,113,0.7)] transition hover:brightness-110"
            >
              <PhoneCall className="h-4 w-4" />
              تماس با فروشنده
            </button>
          </div>

          {/* phone reveal + confirm-to-dial */}
          {showPhone && (
            <div className="modal-pop mt-3 rounded-2xl border border-gold/30 bg-night/60 p-4 text-center">
              <p className="text-[10px] font-bold text-mute">شماره‌ی فروشنده</p>
              {!confirmCall ? (
                <>
                  <button
                    onClick={() => setConfirmCall(true)}
                    dir="ltr"
                    className="mt-1 text-2xl font-extrabold tracking-widest text-gold transition hover:brightness-125"
                    title="برای تماس کلیک کن"
                  >
                    {faDigits(phone)}
                  </button>
                  <p className="mt-1.5 text-[10px] text-mute">برای تماس گرفتن، روی شماره بزن</p>
                </>
              ) : (
                <>
                  <p dir="ltr" className="mt-1 text-2xl font-extrabold tracking-widest text-cream">
                    {faDigits(phone)}
                  </p>
                  <p className="mt-1.5 text-[11px] font-bold text-cream">
                    می‌خواهی با «{ad.seller ?? "فروشنده طوقی"}» تماس بگیری؟
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <a
                      href={`tel:+98${phone.replace(/^0/, "")}`}
                      className="btn-shine flex items-center gap-2 rounded-full bg-gradient-to-b from-[#2fbf71] to-[#17854a] px-6 py-2.5 text-xs font-extrabold text-white shadow-[0_10px_24px_-8px_rgba(47,191,113,0.7)] transition hover:brightness-110"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      بله، تماس بگیر
                    </a>
                    <button
                      onClick={() => setConfirmCall(false)}
                      className="rounded-full border border-line px-6 py-2.5 text-xs font-bold text-mute transition hover:text-cream"
                    >
                      انصراف
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mt-3 flex gap-3">
            <button
              onClick={onFav}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border py-3 text-xs font-bold transition ${
                fav ? "border-gold bg-gold/10 text-gold" : "border-line text-mute hover:text-cream"
              }`}
            >
              <Heart className={`h-4 w-4 ${fav ? "fill-current" : ""}`} />
              {fav ? "ذخیره شد" : "ذخیره"}
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(`${ad.title} — طوقی`);
                onToast("لینک آگهی کپی شد");
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-line py-3 text-xs font-bold text-mute transition hover:text-cream"
            >
              <Share2 className="h-4 w-4" />
              اشتراک
            </button>
            <button
              onClick={() => onToast("گزارش شما ثبت شد؛ کارشناسان بررسی می‌کنند")}
              className="flex items-center justify-center gap-2 rounded-2xl border border-line px-4 py-3 text-xs font-bold text-mute transition hover:text-rose-300"
              aria-label="گزارش تخلف"
            >
              <Flag className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-dashed border-line p-3.5 text-[10px] leading-6 text-mute">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            پیش از پرداخت، حیوان را از نزدیک ببین. طوقی هیچ‌گاه درخواست واریز بیعانه نمی‌کند.
          </div>
        </div>
      </div>
    </div>
  );
}
