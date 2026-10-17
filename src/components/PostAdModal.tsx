import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Check, ChevronDown, ChevronLeft, ChevronRight, ImagePlus, Trash2, X } from "lucide-react";
import {
  AGE_OPTIONS,
  CATEGORIES,
  DELIVERY_OPTIONS,
  HEALTH_OPTIONS,
  SEX_OPTIONS,
  type Listing,
} from "../data";
import { PROVINCES, PROVINCE_NAMES } from "../iran";
import { faDigits, faNum } from "../fa";
import imgKashani from "../assets/pigeon-kashani.webp";
import imgRingneck from "../assets/parrot-ringneck.webp";
import imgCanary from "../assets/canary.webp";
import imgCatPersian from "../assets/cat-persian.webp";
import imgDog from "../assets/dog-pomeranian.webp";
import imgAquarium from "../assets/aquarium.webp";
import imgFantail from "../assets/pigeon-fantail.webp";

const FALLBACK: Record<string, string> = {
  pigeon: imgKashani,
  parrot: imgRingneck,
  songbird: imgCanary,
  cat: imgCatPersian,
  dog: imgDog,
  fish: imgAquarium,
  small:
    "https://images.pexels.com/photos/37144808/pexels-photo-37144808.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  gear: imgFantail,
};

const BREEDS: Record<string, string[]> = {
  pigeon: ["کاشانی", "ناقلی", "تهرانی", "پاکستانی", "گردن‌فر عربی", "فن‌تیل", "نمایشی", "مسابقه‌ای", "سایر"],
  parrot: ["برزیلی (ریh‌نک)", "عروس هلندی", "مرغ عشق", "کاسکو", "آرا/ماکاو", "کوتوله", "سایر"],
  songbird: ["قناری لاک", "قناری رسمی", "فنچ زبرا", "فنچ گورخری", "سهره", "بلبل", "سایر"],
  dog: ["پامرانین", "شیتزو", "پیت‌بول", "ژرمن شپرد", "هاسکی", "پاگ", "سگ نگهبان", "سایر"],
  cat: ["پرشین", "اسکاتیش فولد", "بریتیش", "پرشین چین‌چیلا", "بنگال", "رگدال", "سایر"],
  fish: ["گلدفیش", "گوپی", "اسکار", "دیسکس", "فلاور", "لاک‌پشت آبی", "سایر"],
  small: ["خرگوش لوپ", "خرگوش مینیاتوری", "همستر سوری", "همستر کوتوله", "خوکچه هندی", "سایر"],
  gear: ["قفس", "لانه", "دان و غذا", "آکواریوم", "دارو و مکمل", "لوازم جانبی", "سایر"],
};

const normDigits = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

type Props = {
  open: boolean;
  onClose: () => void;
  onPublish: (l: Listing) => void;
  phone: string | null;
};

export default function PostAdModal({ open, onClose, onPublish, phone }: Props) {
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState("");
  const [breed, setBreed] = useState("");
  const [title, setTitle] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [price, setPrice] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [health, setHealth] = useState<string[]>([]);
  const [delivery, setDelivery] = useState("");
  const [desc, setDesc] = useState("");
  const [seller, setSeller] = useState("");
  const [contact, setContact] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setCat("");
    setBreed("");
    setTitle("");
    setProvince("");
    setCity("");
    setDistrict("");
    setPrice("");
    setAgreed(false);
    setSex("");
    setAge("");
    setHealth([]);
    setDelivery("");
    setDesc("");
    setSeller("");
    setContact(phone ?? "");
    setPhotos([]);
    setError("");
  }, [open, phone]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const cats = useMemo(() => CATEGORIES.filter((c) => c.id !== "all"), []);
  const cities = province ? PROVINCES[province] : [];

  if (!open) return null;

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .slice(0, 4 - photos.length)
      .forEach((f) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const scale = Math.min(1, 900 / img.width);
            const c = document.createElement("canvas");
            c.width = Math.round(img.width * scale);
            c.height = Math.round(img.height * scale);
            const ctx = c.getContext("2d");
            if (!ctx) return setPhotos((p) => [...p, String(reader.result)].slice(0, 4));
            ctx.drawImage(img, 0, 0, c.width, c.height);
            try {
              setPhotos((p) => [...p, c.toDataURL("image/jpeg", 0.75)].slice(0, 4));
            } catch {
              setPhotos((p) => [...p, String(reader.result)].slice(0, 4));
            }
          };
          img.src = String(reader.result);
        };
        reader.readAsDataURL(f);
      });
  };

  const next = () => {
    if (step === 0) {
      if (!cat) return setError("دسته‌بندی آگهی را انتخاب کن");
      if (title.trim().length < 4) return setError("عنوان آگهی باید حداقل ۴ حرف باشد");
    }
    if (step === 1) {
      if (!province) return setError("استان را انتخاب کن");
      if (!city) return setError("شهر را انتخاب کن");
      if (!agreed && !price.replace(/\D/g, "")) return setError("قیمت را وارد کن یا «توافقی» را بزن");
    }
    setError("");
    setStep((s) => Math.min(2, s + 1));
  };

  const publish = () => {
    const finalContact = contact.replace(/\D/g, "") || (phone ?? "");
    if (!/^09\d{9}$/.test(finalContact)) {
      return setError("شماره تماس معتبر نیست؛ عدد را درست بنویس یا خالی رها کن تا همان شماره پنلت بشیند");
    }
    setError("");
    const clean = price.replace(/\D/g, "");
    onPublish({
      id: Date.now(),
      title: title.trim(),
      img: photos[0] ?? FALLBACK[cat] ?? imgKashani,
      images: photos.length ? photos : undefined,
      price: agreed ? null : Number(clean),
      city,
      province,
      district: district.trim() || city,
      time: "همین حالا",
      cat,
      badge: "جدید",
      desc: desc.trim() || undefined,
      seller: seller.trim() || "فروشنده طوقی",
      phone: finalContact,
      mine: true,
      specs: {
        breed: breed || undefined,
        sex: sex || undefined,
        age: age || undefined,
        health: health.join("، ") || undefined,
        delivery: delivery || undefined,
      },
    });
  };

  const inputCls =
    "w-full rounded-2xl border border-line bg-night px-4 py-3 text-sm outline-none transition focus:border-gold/60 focus:ring-4 focus:ring-gold/10";
  const labelCls = "mb-2 mt-4 block text-[11px] font-extrabold text-mute";

  const Chip = ({
    active,
    children,
    onClick,
  }: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition ${
        active
          ? "border-gold bg-gold/15 text-gold"
          : "border-line bg-night text-mute hover:border-gold/40 hover:text-cream"
      }`}
    >
      {children}
    </button>
  );

  const STEPS = ["نوع آگهی", "قیمت و مکان", "جزئیات و تماس"];

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center p-3 sm:items-center sm:p-4">
      <button aria-hidden onClick={onClose} className="absolute inset-0 cursor-default bg-ink/80 backdrop-blur-sm" />

      <div className="modal-pop relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-[2rem] border border-line bg-card shadow-2xl shadow-black/70">
        <span className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-l from-[#e9cf8e] to-[#b8873b]" />

        {/* header */}
        <div className="relative shrink-0 border-b border-line px-6 pb-4 pt-7 sm:px-8">
          <button
            onClick={onClose}
            aria-label="بستن"
            className="absolute end-5 top-6 grid h-9 w-9 place-items-center rounded-full border border-line text-mute transition hover:text-cream"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
              <ImagePlus className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-xl sm:text-2xl">ثبت آگهی جدید</h3>
              <p className="mt-0.5 text-[11px] text-mute">
                گام {faNum(step + 1)} از {faNum(3)} — {STEPS[step]}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-gold" : "bg-line"}`}
              />
            ))}
          </div>
        </div>

        {/* body */}
        <div ref={bodyRef} className="no-scrollbar flex-1 overflow-y-auto px-6 py-5 sm:px-8">
          {step === 0 && (
            <>
              <p className="text-[11px] font-extrabold text-mute">دسته‌بندی</p>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {cats.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCat(c.id);
                      setBreed("");
                    }}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-[11px] font-bold transition ${
                      cat === c.id
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-line bg-night text-mute hover:border-gold/40 hover:text-cream"
                    }`}
                  >
                    <c.icon className="h-4.5 w-4.5" />
                    {c.label}
                  </button>
                ))}
              </div>

              {cat && (
                <>
                  <p className={labelCls}>نژاد / گونه</p>
                  <div className="flex flex-wrap gap-2">
                    {(BREEDS[cat] ?? []).map((b) => (
                      <Chip key={b} active={breed === b} onClick={() => setBreed(b)}>
                        {b}
                      </Chip>
                    ))}
                  </div>
                </>
              )}

              <p className={labelCls}>عنوان آگهی</p>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={70}
                placeholder="مثلاً: جفت کبوتر کاشانی رینگ‌دار آماده جوجه‌گیری"
                className={inputCls}
              />
              <p className="mt-1.5 text-end text-[10px] text-mute">{faNum(title.length)} / {faNum(70)}</p>

              <p className={labelCls}>عکس‌های آگهی (حداکثر ۴ عکس)</p>
              <div className="grid grid-cols-4 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative overflow-hidden rounded-2xl border border-line">
                    <img src={p} alt={`عکس ${i + 1}`} className="h-20 w-full object-cover" />
                    <button
                      onClick={() => setPhotos((ps) => ps.filter((_, j) => j !== i))}
                      className="absolute end-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/80 text-rose-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-gold/90 py-0.5 text-center text-[9px] font-extrabold text-deep">
                        کاور
                      </span>
                    )}
                  </div>
                ))}
                {photos.length < 4 && (
                  <label className="flex h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line bg-night/60 text-mute transition hover:border-gold/50 hover:text-gold">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => addPhotos(e.target.files)}
                    />
                    <Camera className="h-5 w-5" />
                    <span className="text-[10px] font-bold">افزودن</span>
                  </label>
                )}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-[11px] font-extrabold text-mute">استان</p>
                  <div className="relative">
                    <select
                      value={province}
                      onChange={(e) => {
                        setProvince(e.target.value);
                        setCity("");
                      }}
                      className={`${inputCls} appearance-none ${province ? "" : "text-mute"}`}
                    >
                      <option value="" disabled>
                        انتخاب استان
                      </option>
                      {PROVINCE_NAMES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-extrabold text-mute">شهر</p>
                  <div className="relative">
                    <select
                      value={city}
                      disabled={!province}
                      onChange={(e) => setCity(e.target.value)}
                      className={`${inputCls} appearance-none ${city ? "" : "text-mute"} ${
                        province ? "" : "opacity-50"
                      }`}
                    >
                      <option value="" disabled>
                        {province ? "انتخاب شهر" : "ابتدا استان"}
                      </option>
                      {cities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
                  </div>
                </div>
              </div>

              <p className={labelCls}>محله (اختیاری)</p>
              <input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="مثلاً: شهرک غرب"
                className={inputCls}
              />

              <div className="mt-4 flex items-center justify-between">
                <p className="text-[11px] font-extrabold text-mute">قیمت (تومان)</p>
                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-bold text-gold">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="h-3.5 w-3.5 accent-[#d9b36a]"
                  />
                  قیمت توافقی
                </label>
              </div>
              <input
                dir="ltr"
                inputMode="numeric"
                disabled={agreed}
                value={price ? faDigits(Number(price.replace(/\D/g, "")).toLocaleString("en-US")) : ""}
                onChange={(e) => setPrice(normDigits(e.target.value).replace(/\D/g, "").slice(0, 12))}
                placeholder={agreed ? "توافقی" : "۴,۵۰۰,۰۰۰"}
                className={`${inputCls} mt-2 text-left text-lg font-extrabold ${agreed ? "opacity-40" : ""}`}
              />

              <p className={labelCls}>جنسیت</p>
              <div className="flex flex-wrap gap-2">
                {SEX_OPTIONS.map((s) => (
                  <Chip key={s} active={sex === s} onClick={() => setSex(s)}>
                    {s}
                  </Chip>
                ))}
              </div>

              <p className={labelCls}>سن</p>
              <div className="flex flex-wrap gap-2">
                {AGE_OPTIONS.map((a) => (
                  <Chip key={a} active={age === a} onClick={() => setAge(a)}>
                    {a}
                  </Chip>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-[11px] font-extrabold text-mute">وضعیت سلامت (چندتایی)</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {HEALTH_OPTIONS.map((h) => (
                  <Chip
                    key={h}
                    active={health.includes(h)}
                    onClick={() =>
                      setHealth((p) => (p.includes(h) ? p.filter((x) => x !== h) : [...p, h]))
                    }
                  >
                    {health.includes(h) && <Check className="me-1 inline h-3 w-3" />}
                    {h}
                  </Chip>
                ))}
              </div>

              <p className={labelCls}>نحوه تحویل</p>
              <div className="flex flex-wrap gap-2">
                {DELIVERY_OPTIONS.map((d) => (
                  <Chip key={d} active={delivery === d} onClick={() => setDelivery(d)}>
                    {d}
                  </Chip>
                ))}
              </div>

              <p className={labelCls}>توضیحات</p>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
                maxLength={600}
                placeholder="هرچه درباره حیوان، سابقه، غذا، رینگ و شرایط معامله می‌دانی اینجا بنویس..."
                className={`${inputCls} resize-none leading-7`}
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-[11px] font-extrabold text-mute">نام فروشنده (اختیاری)</p>
                  <input
                    value={seller}
                    onChange={(e) => setSeller(e.target.value)}
                    placeholder="مثلاً: لانه کبوتر رضا"
                    className={inputCls}
                  />
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-extrabold text-mute">شماره تماس (اختیاری)</p>
                  <input
                    dir="ltr"
                    inputMode="numeric"
                    value={faDigits(contact.replace(/\D/g, ""))}
                    onChange={(e) => setContact(normDigits(e.target.value).replace(/\D/g, "").slice(0, 11))}
                    placeholder="خالی: همان شماره پنل"
                    className={`${inputCls} text-left font-extrabold tracking-widest`}
                  />
                  <p className="mt-1.5 text-[10px] leading-5 text-mute">
                    خالی رها کنی، شماره‌ی پنلت
                    {phone ? <span className="font-bold text-gold" dir="ltr"> ({faDigits(phone)}) </span> : " "}
                    روی آگهی ثبت و نمایش داده می‌شود
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-line bg-night/50 p-3.5 text-[10px] leading-6 text-mute">
                با انتشار آگهی، <span className="font-bold text-gold">قوانین طوقی</span> را می‌پذیری: فروش
                حیوانات وحشی و حمایت‌شده ممنوع است و سلامت حیوان بر عهده فروشنده است.
              </div>
            </>
          )}

          {error && <p className="mt-4 text-center text-[11px] font-bold text-rose-400">{error}</p>}
        </div>

        {/* footer */}
        <div className="shrink-0 border-t border-line px-6 py-4 sm:px-8">
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1 rounded-2xl border border-line px-5 py-3.5 text-sm font-bold text-mute transition hover:text-cream"
              >
                <ChevronRight className="h-4 w-4" />
                قبلی
              </button>
            )}
            <button
              onClick={step === 2 ? publish : next}
              className="btn-shine flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[conic-gradient(from_210deg,#ffd97a,#f4a52e,#ee5c48,#f4a52e,#ffd97a)] py-3.5 text-sm font-extrabold text-deep shadow-[0_14px_34px_-8px_rgba(238,92,72,0.55)] transition hover:brightness-110"
            >
              {step === 2 ? "انتشار آگهی" : "ادامه"}
              {step < 2 && <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
