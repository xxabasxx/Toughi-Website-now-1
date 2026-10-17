import { AtSign, Award, Bird, Globe, Send } from "lucide-react";
import { faNum } from "../fa";

export default function Footer({ onTerm }: { onTerm: (t: string) => void }) {
  const quick = ["خانه", "دسته‌بندی‌ها", "آگهی‌های ویژه", "مجله طوقی", "درباره ما"];
  const popular = ["کبوتر کاشانی", "طوطی برزیلی", "مرغ عشق فشر", "قناری لاک", "گربه پرشین", "پامرانین"];

  return (
    <footer className="border-t border-line bg-night">
      <div className="mx-auto max-w-7xl px-4 pt-14">
        <div className="grid gap-12 pb-12 md:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
          {/* brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/25 to-gold/5 text-gold">
                <Bird className="h-5 w-5" />
              </span>
              <span className="flex flex-col items-start">
                <span className="gold-text font-nasta text-2xl leading-[1.6]">طوقی</span>
                <span className="-mt-2 text-[10px] font-medium text-mute">بازار پرندگان ایران</span>
              </span>
            </div>
            <p className="mt-5 max-w-xs text-[13px] leading-7 text-mute">
              طوقی، بازار آنلاین تخصصی پرندگان و حیوانات خانگی ایران است؛ با تمرکز بر اعتماد، اصالت
              و تجربه‌ای لوکس از خرید و فروش.
            </p>
            <div className="mt-6 flex gap-2">
              {[AtSign, Send, Globe].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label="شبکه اجتماعی طوقی"
                  className="grid h-10 w-10 place-items-center rounded-full border border-line text-mute transition hover:border-gold/50 hover:text-gold"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* quick links */}
          <div>
            <h4 className="mb-5 text-sm font-extrabold text-cream">دسترسی سریع</h4>
            <ul className="space-y-3.5">
              {quick.map((q) => (
                <li key={q}>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-[13px] text-mute transition hover:text-gold"
                  >
                    {q}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* popular searches */}
          <div>
            <h4 className="mb-5 text-sm font-extrabold text-cream">پرجستجوها</h4>
            <ul className="space-y-3.5">
              {popular.map((p) => (
                <li key={p}>
                  <button
                    onClick={() => onTerm(p)}
                    className="text-[13px] text-mute transition hover:text-gold"
                  >
                    {p}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* newsletter + trust */}
          <div>
            <h4 className="mb-3 text-sm font-extrabold text-cream">از جشنواره‌های پرندگان جا نمانید</h4>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2 rounded-2xl border border-line bg-card p-1.5"
            >
              <input
                placeholder="نشانی ایمیل شما"
                type="email"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[13px] outline-none"
              />
              <button className="btn-shine shrink-0 rounded-xl bg-gradient-to-b from-[#e9cf8e] to-[#b8873b] px-4 py-2.5 text-xs font-extrabold text-deep transition hover:brightness-110">
                عضویت
              </button>
            </form>
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-line p-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold">
                <Award className="h-5 w-5" />
              </span>
              <span className="flex flex-col">
                <span className="text-xs font-extrabold">نماد اعتماد الکترونیکی</span>
                <span className="mt-0.5 text-[10px] text-mute">در حال صدور — مرکز توسعه تجارت الکترونیکی</span>
              </span>
            </div>
          </div>
        </div>

        {/* watermark */}
        <div className="pointer-events-none -mb-2 select-none overflow-hidden text-center" aria-hidden>
          <span className="gold-text block font-nasta text-[22vw] leading-[1.1] opacity-[0.07] md:-mb-10 lg:text-[13rem]">
            طوقی
          </span>
        </div>

        {/* bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-line py-6 text-[11px] text-mute sm:flex-row">
          <p>© {faNum(1405)} طوقی — تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-5">
            <a href="#" onClick={(e) => e.preventDefault()} className="transition hover:text-gold">
              قوانین انتشار آگهی
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="transition hover:text-gold">
              حریم خصوصی
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="transition hover:text-gold">
              پشتیبانی
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
