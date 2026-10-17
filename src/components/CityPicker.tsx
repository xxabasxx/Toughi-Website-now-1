import { useEffect, useMemo, useRef, useState } from "react";
import { Check, MapPin, Search, X } from "lucide-react";
import { ALL_CITIES, faNormalize, PROVINCES, TOP_CITIES } from "../iran";
import { faNum } from "../fa";

type Props = {
  open: boolean;
  onClose: () => void;
  city: string;
  onPick: (city: string) => void;
};

export default function CityPicker({ open, onClose, city, onPick }: Props) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      window.setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  const results = useMemo(() => {
    const nq = faNormalize(q);
    if (!nq) return [];
    return ALL_CITIES.filter(
      (c) => faNormalize(c.city).includes(nq) || faNormalize(c.province).includes(nq)
    ).slice(0, 60);
  }, [q]);

  if (!open) return null;

  const pick = (c: string) => {
    onPick(c);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[96] flex items-start justify-center p-3 pt-[8vh] sm:p-4 sm:pt-[10vh]">
      <button aria-hidden onClick={onClose} className="absolute inset-0 cursor-default bg-ink/85 backdrop-blur-sm" />

      <div className="modal-pop relative flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-line bg-card shadow-2xl shadow-black/70">
        <span className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-l from-[#e9cf8e] to-[#b8873b]" />

        {/* header + search */}
        <div className="shrink-0 border-b border-line px-5 pb-4 pt-6">
          <div className="mb-3 flex items-center gap-2">
            <MapPin className="h-4.5 w-4.5 text-gold" />
            <h3 className="flex-1 font-display text-lg">انتخاب شهر</h3>
            <button
              onClick={onClose}
              aria-label="بستن"
              className="grid h-8 w-8 place-items-center rounded-full border border-line text-mute transition hover:text-cream"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) pick(results[0].city);
              }}
              placeholder={`جستجو بین ${faNum(ALL_CITIES.length)} شهر ایران...`}
              className="w-full rounded-2xl border border-line bg-night py-3 pe-9 ps-10 text-sm outline-none transition focus:border-gold/60 focus:ring-4 focus:ring-gold/10"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                aria-label="پاک کردن"
                className="absolute end-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-line text-mute"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* body */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-3 py-3">
          {/* all-cities option */}
          <button
            onClick={() => pick("همه شهرها")}
            className={`mb-2 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
              city === "همه شهرها" ? "bg-gold/15 font-extrabold text-gold" : "text-cream hover:bg-white/5"
            }`}
          >
            سراسر ایران (همه شهرها)
            {city === "همه شهرها" && <Check className="h-4 w-4" />}
          </button>

          {q ? (
            results.length ? (
              results.map((r) => (
                <button
                  key={`${r.province}-${r.city}`}
                  onClick={() => pick(r.city)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-start transition hover:bg-white/5 ${
                    city === r.city ? "bg-gold/10" : ""
                  }`}
                >
                  <span className="flex flex-col">
                    <span className={`text-[13px] ${city === r.city ? "font-extrabold text-gold" : "font-bold"}`}>
                      {r.city}
                    </span>
                    <span className="mt-0.5 text-[10px] text-mute">استان {r.province}</span>
                  </span>
                  {city === r.city && <Check className="h-4 w-4 text-gold" />}
                </button>
              ))
            ) : (
              <p className="py-10 text-center text-xs text-mute">
                شهری با نام «{q}» پیدا نشد
              </p>
            )
          ) : (
            <>
              <p className="mb-2 mt-1 px-3 text-[10px] font-extrabold text-mute">شهرهای پرجستجو</p>
              <div className="mb-3 flex flex-wrap gap-2 px-2">
                {TOP_CITIES.filter((c) => c !== "همه شهرها").map((c) => (
                  <button
                    key={c}
                    onClick={() => pick(c)}
                    className={`rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition ${
                      city === c
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-line text-mute hover:border-gold/40 hover:text-cream"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <p className="mb-1 mt-3 px-3 text-[10px] font-extrabold text-mute">
                همه استان‌ها و شهرها
              </p>
              {Object.entries(PROVINCES).map(([prov, cities]) => (
                <details key={prov} className="group border-b border-line/50 last:border-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-[12px] font-bold text-cream/90 transition hover:text-gold">
                    استان {prov}
                    <span className="text-[10px] text-mute">{faNum(cities.length)} شهر</span>
                  </summary>
                  <div className="flex flex-wrap gap-1.5 px-4 pb-3 pt-1">
                    {cities.map((c) => (
                      <button
                        key={c}
                        onClick={() => pick(c)}
                        className={`rounded-full border px-3 py-1 text-[11px] transition ${
                          city === c
                            ? "border-gold bg-gold/15 font-bold text-gold"
                            : "border-line text-mute hover:border-gold/40 hover:text-cream"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </details>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
