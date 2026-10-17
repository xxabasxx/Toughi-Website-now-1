import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Bird,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Timer,
  X,
} from "lucide-react";
import { faDigits } from "../fa";
import { sendOtp, verifyOtp, type SessionUser } from "../api";

type Props = {
  open: boolean;
  onClose: () => void;
  onVerified: (payload: { token: string; user: SessionUser }) => void;
  onDone: () => void;
  onLogout: () => void;
  authedPhone: string | null;
};

const norm = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/\D/g, "");

export default function AuthModal({ open, onClose, onVerified, onDone, onLogout, authedPhone }: Props) {
  const [step, setStep] = useState<"phone" | "code" | "ok" | "profile">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState<string[]>(["", "", "", "", ""]);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(90);
  const [pending, setPending] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setStep(authedPhone ? "profile" : "phone");
      setPhone("");
      setCode(["", "", "", "", ""]);
      setError("");
      setSeconds(90);
      setPending(false);
      setDevCode(null);
    }
  }, [open, authedPhone]);

  useEffect(() => {
    if (step !== "code" || seconds <= 0) return;
    const t = window.setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [step, seconds]);

  if (!open) return null;

  const validPhone = /^09\d{9}$/.test(phone);

  const submitPhone = async () => {
    if (!validPhone) {
      setError("شماره موبایل معتبر نیست؛ مثال: ۰۹۱۲۳۴۵۶۷۸۹");
      return;
    }
    try {
      setPending(true);
      setError("");
      const res = await sendOtp(phone);
      setDevCode(res.devCode ?? null);
      setStep("code");
      setSeconds(90);
      window.setTimeout(() => inputs.current[0]?.focus(), 80);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در ارسال کد");
    } finally {
      setPending(false);
    }
  };

  const verify = async (joined?: string) => {
    const j = joined ?? code.join("");
    if (j.length < 5) {
      setError("کد ۵ رقمی را کامل وارد کن");
      return;
    }
    try {
      setPending(true);
      const res = await verifyOtp(phone, j);
      onVerified({ token: res.token, user: res.user });
      setError("");
      setStep("ok");
    } catch (e) {
      setError(e instanceof Error ? e.message : "کد صحیح نیست");
      setCode(["", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setPending(false);
    }
  };

  const setDigit = (i: number, v: string) => {
    const d = norm(v).slice(-1);
    setError("");
    setCode((c) => {
      const n = [...c];
      n[i] = d;
      if (d && i === 4) window.setTimeout(() => verify(n.join("")), 180);
      return n;
    });
    if (d && i < 4) inputs.current[i + 1]?.focus();
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center p-4 sm:items-center">
      <button
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/80 backdrop-blur-sm"
      />

      <div className="modal-pop relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-line bg-card shadow-2xl shadow-black/70">
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-[#e9cf8e] to-[#b8873b]" />
        <button
          onClick={onClose}
          aria-label="بستن"
          className="absolute end-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-line text-mute transition hover:text-cream"
        >
          <X className="h-4 w-4" />
        </button>

        {step === "phone" && (
          <div className="px-7 pb-8 pt-10">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold shadow-[inset_0_1px_0_rgba(217,179,106,0.3)]">
              <Smartphone className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-center font-display text-2xl">ورود | ثبت‌نام در طوقی</h3>
            <p className="mt-2 text-center text-xs leading-6 text-mute">
              برای ثبت آگهی، ابتدا با شماره موبایلت وارد شو؛ کد تایید برایت پیامک می‌شود.
            </p>

            <label className="mt-6 block text-[11px] font-extrabold text-mute">شماره موبایل</label>
            <input
              dir="ltr"
              inputMode="numeric"
              autoFocus
              value={faDigits(phone)}
              onChange={(e) => {
                setPhone(norm(e.target.value).slice(0, 11));
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && submitPhone()}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              className={`mt-2 w-full rounded-2xl border bg-night px-4 py-3.5 text-left text-lg font-extrabold tracking-[0.18em] outline-none transition focus:border-gold/60 focus:ring-4 focus:ring-gold/10 ${
                error ? "border-rose-400/60" : "border-line"
              }`}
            />
            {error && <p className="mt-2 text-[11px] font-bold text-rose-400">{error}</p>}

            <button
              onClick={submitPhone}
              disabled={phone.length < 11 || pending}
              className="btn-shine mt-5 flex w-full items-center justify-center rounded-2xl bg-[conic-gradient(from_210deg,#ffd97a,#f4a52e,#ee5c48,#f4a52e,#ffd97a)] py-3.5 shadow-[0_14px_32px_-10px_rgba(238,92,72,0.6)] text-sm font-extrabold text-deep transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? "در حال ارسال..." : "دریافت کد تایید"}
            </button>
            <p className="mt-4 text-center text-[10px] leading-5 text-mute">
              ورود یا ثبت‌نام، به معنای پذیرش <span className="font-bold text-gold">قوانین انتشار آگهی</span> و
              حریم خصوصی طوقی است.
            </p>
          </div>
        )}

        {step === "code" && (
          <div className="px-7 pb-8 pt-10">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold shadow-[inset_0_1px_0_rgba(217,179,106,0.3)]">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-center font-display text-2xl">کد تایید را وارد کن</h3>
            <p className="mt-2 text-center text-xs leading-6 text-mute">
              کد ۵ رقمی برای <span dir="ltr" className="font-extrabold text-cream">{faDigits(phone)}</span> پیامک شد. <button
                onClick={() => {
                  setStep("phone");
                  setCode(["", "", "", "", ""]);
                  setError("");
                }}
                className="font-extrabold text-gold"
              >
                تغییر شماره
              </button>
            </p>

            <div dir="ltr" className="mt-6 flex justify-center gap-2">
              {code.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  inputMode="numeric"
                  value={faDigits(d)}
                  maxLength={2}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !code[i] && i > 0) inputs.current[i - 1]?.focus();
                    if (e.key === "Enter") verify();
                  }}
                  className={`h-13 w-11 rounded-2xl border bg-night text-center text-xl font-extrabold outline-none transition focus:border-gold/60 focus:ring-4 focus:ring-gold/10 ${
                    error ? "border-rose-400/60" : "border-line"
                  }`}
                />
              ))}
            </div>

            {error ? (
              <p className="mt-3 text-center text-[11px] font-bold text-rose-400">{error}</p>
            ) : devCode ? (
              <p className="mt-3 text-center text-[10px] text-mute">
                حالت تست — کد تایید: <span className="font-extrabold text-gold">{faDigits(devCode)}</span>
              </p>
            ) : null}

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-mute">
              <Timer className="h-3.5 w-3.5" />
              {seconds > 0 ? (
                <span>
                  ارسال مجدد تا <span className="font-extrabold text-cream">{faDigits(seconds)}</span> ثانیه دیگر
                </span>
              ) : (
                <button onClick={submitPhone} className="font-extrabold text-gold">
                  ارسال مجدد کد
                </button>
              )}
            </div>

            <button
              onClick={() => verify()}
              disabled={pending}
              className="btn-shine mt-5 flex w-full items-center justify-center rounded-2xl bg-[conic-gradient(from_210deg,#ffd97a,#f4a52e,#ee5c48,#f4a52e,#ffd97a)] py-3.5 shadow-[0_14px_32px_-10px_rgba(238,92,72,0.6)] text-sm font-extrabold text-deep transition hover:brightness-110 disabled:opacity-40"
            >
              {pending ? "در حال بررسی..." : "تایید و ورود"}
            </button>
          </div>
        )}

        {step === "ok" && (
          <div className="px-7 pb-8 pt-12 text-center">
            <span className="relative mx-auto grid h-16 w-16 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-gold/25" />
              <span className="relative grid h-16 w-16 place-items-center rounded-full border border-gold/40 bg-gold/15 text-gold">
                <CheckCircle2 className="h-8 w-8" />
              </span>
            </span>
            <h3 className="mt-6 font-display text-2xl">احراز هویت انجام شد!</h3>
            <p className="mt-2 text-xs leading-7 text-mute">
              به خانواده‌ی طوقی خوش آمدی؛ حساب تو با شماره‌ی <span dir="ltr" className="font-extrabold text-cream">{faDigits(phone)}</span> تایید شد.
            </p>
            <button
              onClick={onDone}
              className="btn-shine mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[conic-gradient(from_210deg,#ffd97a,#f4a52e,#ee5c48,#f4a52e,#ffd97a)] py-3.5 shadow-[0_14px_32px_-10px_rgba(238,92,72,0.6)] text-sm font-extrabold text-deep transition hover:brightness-110"
            >
              شروع ثبت آگهی
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="mt-3 w-full rounded-2xl border border-line py-3 text-xs font-bold text-mute transition hover:text-cream">
              فعلاً نه
            </button>
          </div>
        )}

        {step === "profile" && authedPhone && (
          <div className="px-7 pb-8 pt-12 text-center">
            <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-gold/40 bg-gold/15 text-gold">
              <Bird className="h-7 w-7" />
              <span className="absolute -bottom-1.5 -end-1.5 grid h-6 w-6 place-items-center rounded-full bg-gold text-deep">
                <BadgeCheck className="h-4 w-4" />
              </span>
            </span>
            <h3 className="mt-5 font-display text-2xl">حساب تو فعال است</h3>
            <p className="mt-1.5 text-[11px] text-mute">فروشنده تاییدشده‌ی طوقی</p>
            <div dir="ltr" className="mx-auto mt-4 w-fit rounded-full border border-line bg-night px-5 py-2 text-sm font-extrabold tracking-widest">
              {faDigits(authedPhone)}
            </div>
            <button
              onClick={onDone}
              className="btn-shine mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[conic-gradient(from_210deg,#ffd97a,#f4a52e,#ee5c48,#f4a52e,#ffd97a)] py-3.5 shadow-[0_14px_32px_-10px_rgba(238,92,72,0.6)] text-sm font-extrabold text-deep transition hover:brightness-110"
            >
              ثبت آگهی جدید
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={onLogout}
              className="mt-3 w-full rounded-2xl border border-rose-400/30 py-3 text-xs font-bold text-rose-400 transition hover:bg-rose-400/10"
            >
              خروج از حساب
            </button>
            <button onClick={onClose} className="mt-3 w-full py-1 text-[11px] font-bold text-mute transition hover:text-cream">
              بستن
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
