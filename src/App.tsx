import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Bird, X } from "lucide-react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import MarketTicker from "./components/MarketTicker";
import Categories from "./components/Categories";
import Gallery from "./components/Gallery";
import Featured from "./components/Featured";
import Listings from "./components/Listings";
import Trust from "./components/Trust";
import CtaBanner from "./components/CtaBanner";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";
import AuthModal from "./components/AuthModal";
import PostAdModal from "./components/PostAdModal";
import AdDetail from "./components/AdDetail";
import ChatModal, { type Thread } from "./components/ChatModal";
import { LISTINGS, type Listing } from "./data";

export default function App() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("همه شهرها");
  const [cat, setCat] = useState("all");
  const [favs, setFavs] = useState<Set<number>>(new Set());
  const [showTop, setShowTop] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);

  const [authedPhone, setAuthedPhone] = useState<string | null>(() => {
    try {
      return localStorage.getItem("toofi_phone");
    } catch {
      return null;
    }
  });

  const [userAds, setUserAds] = useState<Listing[]>(() => {
    try {
      const raw = localStorage.getItem("toofi_my_ads");
      return raw ? (JSON.parse(raw) as Listing[]) : [];
    } catch {
      return [];
    }
  });

  const [detail, setDetail] = useState<Listing | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeThread, setActiveThread] = useState<number | null>(null);
  const [threads, setThreads] = useState<Thread[]>(() => {
    try {
      const raw = localStorage.getItem("toofi_threads");
      return raw ? (JSON.parse(raw) as Thread[]) : [];
    } catch {
      return [];
    }
  });

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      return localStorage.getItem("toofi_theme") === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  const barRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | null>(null);

  const authed = !!authedPhone;

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  };

  const goAds = () =>
    document.getElementById("ads")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const onSoon = () => showToast("این بخش به‌زودی فعال می‌شود — نسخه نمایشی");

  const requestPost = () => {
    if (authed) setPostOpen(true);
    else setAuthOpen(true);
  };

  const openAuth = () => setAuthOpen(true);

  const logout = () => {
    setAuthedPhone(null);
    setAuthOpen(false);
    try {
      localStorage.removeItem("toofi_phone");
      localStorage.removeItem("toofi_auth");
    } catch {
      /* ignore */
    }
    showToast("از حساب خارج شدی؛ دوباره منتظرت می‌مانیم");
  };

  const publish = (ad: Listing) => {
    setUserAds((p) => [ad, ...p]);
    setPostOpen(false);
    setCat("all");
    setCity("همه شهرها");
    setQuery("");
    showToast("آگهی‌ات با موفقیت منتشر شد!");
    window.setTimeout(goAds, 250);
  };

  const openChat = (ad: Listing) => {
    if (!authed) {
      setDetail(null);
      setAuthOpen(true);
      showToast("برای گفتگو با فروشنده ابتدا وارد شو");
      return;
    }
    setThreads((prev) =>
      prev.some((t) => t.adId === ad.id)
        ? prev
        : [
            {
              adId: ad.id,
              title: ad.title,
              img: ad.img,
              price: ad.price,
              seller: ad.seller ?? "فروشنده طوقی",
              msgs: [
                {
                  id: Date.now(),
                  from: "them" as const,
                  text: `سلام 👋 درباره «${ad.title}» در خدمتم، بفرمایید.`,
                  at: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            },
            ...prev,
          ]
    );
    setActiveThread(ad.id);
    setDetail(null);
    setChatOpen(true);
  };

  const toggleFav = (id: number) =>
    setFavs((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const allListings = useMemo(() => [...userAds, ...LISTINGS], [userAds]);

  const filtered = useMemo(
    () =>
      allListings.filter(
        (l) =>
          (cat === "all" || l.cat === cat) &&
          (city === "همه شهرها" || l.city === city) &&
          (query.trim() === "" || l.title.includes(query.trim()))
      ),
    [allListings, cat, city, query]
  );

  const clearFilters = () => {
    setCat("all");
    setCity("همه شهرها");
    setQuery("");
  };

  const searchTerm = (t: string) => {
    setQuery(t);
    setCat("all");
    setCity("همه شهرها");
    goAds();
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("toofi_theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("toofi_threads", JSON.stringify(threads));
    } catch {
      /* ignore */
    }
  }, [threads]);

  useEffect(() => {
    try {
      localStorage.setItem("toofi_my_ads", JSON.stringify(userAds));
    } catch {
      /* storage full — keep in memory */
    }
  }, [userAds]);

  useEffect(() => {
    const fn = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      if (barRef.current) barRef.current.style.width = `${p * 100}%`;
      setShowTop(h.scrollTop > 600);
    };
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen bg-ink text-cream">
      <div className="noise" aria-hidden />
      <div
        ref={barRef}
        className="fixed end-0 start-0 top-0 z-[60] h-0.5 bg-gradient-to-l from-[#e9cf8e] to-[#b8873b]"
        style={{ width: 0 }}
      />

      <Header
        query={query}
        onQuery={setQuery}
        city={city}
        onCity={setCity}
        favCount={favs.size}
        goAds={goAds}
        onPost={requestPost}
        onAuth={openAuth}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />

      <main>
        <Hero query={query} setQuery={setQuery} goAds={goAds} onSuggest={searchTerm} />
        <MarketTicker />
        <Categories
          active={cat}
          onSelect={(id) => {
            setCat(id);
            goAds();
          }}
        />
        <Gallery
          onSelectCat={(id) => {
            setCat(id);
            goAds();
          }}
        />
        <Featured favs={favs} toggleFav={toggleFav} onOpen={setDetail} />
        <Listings
          items={filtered}
          activeCat={cat}
          setActiveCat={setCat}
          favs={favs}
          toggleFav={toggleFav}
          onClear={clearFilters}
          onOpen={setDetail}
        />
        <Trust />
        <CtaBanner onPost={requestPost} onSoon={onSoon} />
      </main>

      <Footer onTerm={searchTerm} />
      <div aria-hidden className="h-24 bg-night sm:h-20" />

      {/* bottom tab bar */}
      <BottomNav
        favCount={favs.size}
        authed={authed}
        onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        chatCount={threads.length}
        onChat={() => {
          if (!authed) {
            setAuthOpen(true);
            showToast("برای دیدن پیام‌ها وارد شو");
          } else setChatOpen(true);
        }}
        onFavs={() => {
          goAds();
          if (favs.size === 0) showToast("هنوز آگهی‌ای را به علاقه‌مندی‌ها اضافه نکرده‌ای");
        }}
        onPost={requestPost}
        onAuth={openAuth}
      />

      {/* auth modal */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        authedPhone={authedPhone}
        onVerified={(p) => {
          setAuthedPhone(p);
          try {
            localStorage.setItem("toofi_phone", p);
          } catch {
            /* ignore */
          }
        }}
        onDone={() => {
          setAuthOpen(false);
          setPostOpen(true);
        }}
        onLogout={logout}
      />

      {/* post ad modal */}
      <PostAdModal
        open={postOpen}
        onClose={() => setPostOpen(false)}
        onPublish={publish}
        phone={authedPhone}
      />

      {/* ad detail */}
      <AdDetail
        ad={detail}
        onClose={() => setDetail(null)}
        onChat={openChat}
        fav={detail ? favs.has(detail.id) : false}
        onFav={() => detail && toggleFav(detail.id)}
        onToast={showToast}
      />

      {/* chat */}
      <ChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        threads={threads}
        setThreads={setThreads}
        activeId={activeThread}
        setActiveId={setActiveThread}
        myName={authedPhone ? "شما" : "مهمان"}
      />

      {/* back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="بازگشت به بالای صفحه"
        className={`fixed bottom-28 end-5 z-40 grid h-12 w-12 place-items-center rounded-full border border-gold/40 bg-ink/85 text-gold shadow-2xl shadow-black/50 backdrop-blur transition-all duration-500 hover:bg-gold hover:text-deep ${
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      {/* toast */}
      <div
        className={`fixed bottom-28 left-1/2 z-[80] -translate-x-1/2 transition-all duration-500 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-card/95 px-5 py-3.5 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
            <Bird className="h-4 w-4" />
          </span>
          <p className="whitespace-nowrap text-xs font-bold sm:text-sm">{toast}</p>
          <button onClick={() => setToast(null)} aria-label="بستن پیام">
            <X className="h-4 w-4 text-mute transition hover:text-cream" />
          </button>
        </div>
      </div>
    </div>
  );
}
