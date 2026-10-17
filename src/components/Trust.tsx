import { BadgeCheck, Feather, Headphones, Plane, ShieldCheck } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

const ITEMS = [
  {
    icon: ShieldCheck,
    t: "پرداخت امن طوقی",
    d: "مبلغ معامله تا دریافت سالم حیوان، نزد طوقی امانت می‌ماند.",
  },
  {
    icon: BadgeCheck,
    t: "فروشنده احرازشده",
    d: "اعتبارسنجی هویت و سابقه معاملات، پیش از انتشار هر آگهی.",
  },
  {
    icon: Plane,
    t: "حمل‌ونقل سراسری",
    d: "ارسال تخصصی و ایمن پرنده و حیوان به ۸۱ شهر کشور.",
  },
  {
    icon: Headphones,
    t: "پشتیبانی همیشگی",
    d: "تیم پشتیبانی طوقی، شبانه‌روزی پاسخگوی شماست.",
  },
];

export default function Trust() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      <div className="reveal relative overflow-hidden rounded-[2.5rem] border border-line bg-gradient-to-br from-moss via-night to-ink p-8 sm:p-14">
        <Feather
          className="pointer-events-none absolute -end-8 -top-8 h-56 w-56 rotate-12 text-gold/[0.06]"
          strokeWidth={0.8}
        />
        <div className="pointer-events-none absolute -bottom-24 start-1/4 h-64 w-64 rounded-full bg-gold/[0.07] blur-3xl" />

        <div className="relative mx-auto mb-12 max-w-xl text-center">
          <p className="text-[11px] font-extrabold text-gold sm:text-xs">چرا طوقی؟</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">اعتماد، بالِ طلایی ماست</h2>
          <p className="mt-3 text-sm leading-8 text-mute">
            معامله حیوانات خانگی به حساسیت و آرامش خیال نیاز دارد؛ ما آن را برایتان فراهم کرده‌ایم.
          </p>
        </div>

        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((it) => (
            <div key={it.t} className="reveal flex flex-col items-start gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-gold/25 bg-gold/10 text-gold shadow-[inset_0_1px_0_rgba(217,179,106,0.25)]">
                <it.icon className="h-6 w-6" />
              </span>
              <h3 className="text-[15px] font-extrabold">{it.t}</h3>
              <p className="-mt-2 text-[13px] leading-7 text-mute">{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
