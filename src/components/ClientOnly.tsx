"use client";

import { Bird } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

/**
 * اپلیکیشن طوقی کاملاً کلاینت‌محور است (مثل نسخه‌ی Vite اصلی)؛
 * این پوسته از تفاوت رندر سرور/کلاینت (hydration mismatch) جلوگیری می‌کند.
 */
export default function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink">
        <div className="flex flex-col items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-3xl border border-gold/30 bg-gold/10 text-gold">
            <Bird className="h-8 w-8 animate-pulse" />
          </span>
          <p className="font-display text-xl text-cream/80">طوقی</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
