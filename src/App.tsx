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
import ChatModal from "./components/ChatModal";
import { LISTINGS, type Listing } from "./data";
import {
  createAd,
  fetchAd,
  fetchAds,
  getMe,
  listChats,
  openChatApi,
  type ChatSummary,
  type SessionUser,
} from "./api";

type SessionState = { token: string; user: SessionUser } | null;

export default function App() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("همه شهرها");
  const [cat, setCat] = useState("all");
  const [favs, setFavs] = useState<Set<string | number>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("tooghi_favs") || "[]"));
    } catch {
      return new Set();
    }
  });
  const [showTop, setShowTop] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [detail, setDetail] = useState<Listing | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [remoteAds, setRemoteAds] = useState<Listing[]>([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [session, setSession] = useState<SessionState>(() => {
    try {
      const raw = localStorage.getItem("tooghi_session");
      return raw ? (JSON.parse(raw) as SessionState) : null;
    } catch {
      return null;
    }
  });
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      return localStorage.getItem("tooghi_theme") === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  const barRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | null>(null);
  const token = session?.token ?? null;
  const authedPhone = session?.user.phone ?? null;
  const authed = !!token;

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
    setSession(null);
    setAuthOpen(false);
    setChats([]);
    try {
      localStorage.removeItem("tooghi_session");
    } catch {
      /* ignore */
    }
    showToast("از حساب خارج شدی؛ دوباره منتظرت می‌مانیم");
  };

  const toggleFav = (id: string | number) =>
    setFavs((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const refreshChats = async () => {
    if (!token) return;
    try {
      const res = await listChats(token);
      setChats(res.items);
      if (!activeChatId && res.items[0]) setActiveChatId(res.items[0].id);
    } catch {
      /* silent */
    }
  };

  const openChat = async (ad: Listing) => {
    if (!token) {
      setDetail(null);
      setAuthOpen(true);
      showToast("برای گفتگو با فروشنده ابتدا وارد شو");
      return;
    }
    try {
      const res = await openChatApi(token, ad.id);
      await refreshChats();
      setActiveChatId(res.chatId);
      setDetail(null);
      setChatOpen(true);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "خطا در شروع گفتگو");
    }
  };

  const openAd = async (l: Listing) => {
    if (typeof l.id === "string") {
      try {
        const res = await fetchAd(l.id);
        setDetail(res.ad);
      } catch {
        setDetail(l);
      }
    } else {
      setDetail(l);
    }
  };

  const publish = async (draft: Listing) => {
    if (!token) throw new Error("برای ثبت آگهی باید وارد شوی");
    const res = await createAd(token, {
      title: draft.title,
      cat: draft.cat,
      city: draft.city,
      province: draft.province,
      district: draft.district,
      price: draft.price ?? undefined,
      agreed: draft.price == null,
      seller: draft.seller,
      phone: draft.phone,
      description: draft.desc,
      images: draft.images ?? (draft.img ? [draft.img] : []),
      breed: draft.specs?.breed,
      sex: draft.specs?.sex,
      age: draft.specs?.age,
      health: draft.specs?.health,
      delivery: draft.specs?.delivery,
    });
    setRemoteAds((p) => [res.ad, ...p.filter((x) => x.id !== res.ad.id)]);
    setPostOpen(false);
    setCat("all");
    setCity("همه شهرها");
    setQuery("");
    showToast("آگهی‌ات با موفقیت منتشر شد!");
    window.setTimeout(goAds, 250);
  };

  const filteredStatic = useMemo(
    () =>
      LISTINGS.filter(
        (l) =>
          (cat === "all" || l.cat === cat) &&
          (city === "همه شهرها" || l.city === city) &&
          (query.trim() === "" || l.title.includes(query.trim()))
      ),
    [cat, city, query]
  );

  const mergedListings = useMemo(() => {
    const ids = new Set(remoteAds.map((a) => String(a.id)));
    return [...remoteAds, ...filteredStatic.filter((a) => !ids.has(String(a.id)))];
  }, [remoteAds, filteredStatic]);

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
      localStorage.setItem("tooghi_theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("tooghi_favs", JSON.stringify([...favs]));
    } catch {
      /* ignore */
    }
  }, [favs]);

  useEffect(() => {
    try {
      if (session) localStorage.setItem("tooghi_session", JSON.stringify(session));
      else localStorage.removeItem("tooghi_session");
    } catch {
      /* ignore */
    }
  }, [session]);

  useEffect(() => {
    if (!token) return;
    let dead = false;
    getMe(token)
      .then((r) => {
        if (!dead) setSession((s) => (s ? { ...s, user: r.user } : s));
      })
      .catch(() => {
        if (!dead) setSession(null);
      });
    return () => {
      dead = true;
    };
  }, [token]);

  useEffect(() => {
    let dead = false;
    const t = window.setTimeout(async () => {
      try {
        setAdsLoading(true);
        const res = await fetchAds({
          city: city !== "همه شهرها" ? city : undefined,
          cat: cat !== "all" ? cat : undefined,
          q: query.trim() || undefined,
          limit: 60,
        });
        if (!dead) setRemoteAds(res.items);
      } catch {
        if (!dead) setRemoteAds([]);
      } finally {
        if (!dead) setAdsLoading(false);
      }
    }, 180);
    return () => {
      dead = true;
      window.clearTimeout(t);
    };
  }, [city, cat, query]);

  useEffect(() => {
    if (!token) return;
    void refreshChats();
    const i = window.setInterval(() => void refreshChats(), 9000);
    return () => window.clearInterval(i);
  }, [token]);

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
      <div ref={barRef} className="fixed end-0 start-0 top-0 z-[60] h-0.5 bg-gradient-to-l from-[#e9cf8e] to-[#b8873b]" style={{ width: 0 }} />

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
        <Categories active={cat} onSelect={(id) => { setCat(id); goAds(); }} />
        <Gallery onSelectCat={(id) => { setCat(id); goAds(); }} />
        <Featured favs={favs} toggleFav={toggleFav} onOpen={openAd} />
        <Listings
          items={mergedListings}
          activeCat={cat}
          setActiveCat={setCat}
          favs={favs}
          toggleFav={toggleFav}
          onClear={clearFilters}
          onOpen={openAd}
        />
        {adsLoading && <p className="-mt-10 pb-10 text-center text-xs text-mute">در حال همگام‌سازی آگهی‌های جدید...</p>}
        <Trust />
        <CtaBanner onPost={requestPost} onSoon={onSoon} />
      </main>

      <Footer onTerm={searchTerm} />
      <div aria-hidden className="h-24 bg-night sm:h-20" />

      <BottomNav
        favCount={favs.size}
        chatCount={chats.length}
        authed={authed}
        onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onChat={() => {
          if (!authed) {
            setAuthOpen(true);
            showToast("برای دیدن پیام‌ها وارد شو");
          } else {
            setChatOpen(true);
            if (!activeChatId && chats[0]) setActiveChatId(chats[0].id);
          }
        }}
        onFavs={() => {
          goAds();
          if (favs.size === 0) showToast("هنوز آگهی‌ای را به علاقه‌مندی‌ها اضافه نکرده‌ای");
        }}
        onPost={requestPost}
        onAuth={openAuth}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        authedPhone={authedPhone}
        onVerified={({ token: t, user }) => setSession({ token: t, user })}
        onDone={() => {
          setAuthOpen(false);
          setPostOpen(true);
        }}
        onLogout={logout}
      />

      <PostAdModal open={postOpen} onClose={() => setPostOpen(false)} onPublish={publish} phone={authedPhone} />

      <AdDetail
        ad={detail}
        onClose={() => setDetail(null)}
        onChat={openChat}
        fav={detail ? favs.has(detail.id) : false}
        onFav={() => detail && toggleFav(detail.id)}
        onToast={showToast}
      />

      <ChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        threads={chats}
        activeId={activeChatId}
        setActiveId={setActiveChatId}
        token={token}
        myName={authedPhone ? "شما" : "مهمان"}
      />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="بازگشت به بالای صفحه"
        className={`fixed bottom-28 end-5 z-40 grid h-12 w-12 place-items-center rounded-full border border-gold/40 bg-ink/85 text-gold shadow-2xl shadow-black/50 backdrop-blur transition-all duration-500 hover:bg-gold hover:text-deep ${showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      <div className={`fixed bottom-28 left-1/2 z-[80] -translate-x-1/2 transition-all duration-500 ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}>
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
