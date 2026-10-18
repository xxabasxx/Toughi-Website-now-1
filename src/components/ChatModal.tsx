import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BadgeCheck, MessageCircle, Send, ShieldCheck, X } from "lucide-react";
import { listMessages, sendMessageApi, type ChatMessage, type ChatSummary } from "../api";

export type DemoThread = {
  id: number;
  adId: string | number;
  peer: string;
  adTitle: string;
  adImage: string | null;
  unread: number;
  lastMsg: string | null;
  lastAt: number | null;
  messages: ChatMessage[];
};

const REPLIES = [
  "سلام، بله موجوده. کِی می‌تونید تشریف بیارید؟",
  "قیمت کمی قابل مذاکره هست برای خریدار واقعی.",
  "حیوون کاملاً سالم و سرحاله، از نزدیک ببینید مطمئن می‌شید.",
  "امکان ارسال به شهرستان هم هست، هزینه‌اش با خریداره.",
  "عکس‌های بیشتری هم دارم، براتون بفرستم؟",
];

const fmt = (ms: number) =>
  new Date(ms).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });

type Props = {
  open: boolean;
  onClose: () => void;
  threads: ChatSummary[];
  activeId: number | null;
  setActiveId: (id: number | null) => void;
  token: string | null;
  myName: string;
  demoMode: boolean;
  demoThreads: DemoThread[];
  setDemoThreads: React.Dispatch<React.SetStateAction<DemoThread[]>>;
};

export default function ChatModal({
  open,
  onClose,
  threads,
  activeId,
  setActiveId,
  token,
  myName,
  demoMode,
  demoThreads,
  setDemoThreads,
}: Props) {
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const activeLive = useMemo(() => threads.find((t) => t.id === activeId) ?? null, [threads, activeId]);
  const activeDemo = useMemo(() => demoThreads.find((t) => t.id === activeId) ?? null, [demoThreads, activeId]);
  const active = demoMode ? activeDemo : activeLive;
  const list = demoMode ? demoThreads : threads;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length, open]);

  useEffect(() => {
    if (!open || !activeId) {
      setMsgs([]);
      return;
    }
    if (demoMode) {
      setMsgs(activeDemo?.messages ?? []);
      return;
    }
    if (!token) return;
    let alive = true;
    let last = 0;
    let timer: number | null = null;

    const load = async (first = false) => {
      try {
        if (first) setLoading(true);
        const res = await listMessages(token, activeId, first ? 0 : last);
        if (!alive) return;
        if (first) setMsgs(res.items);
        else if (res.items.length) setMsgs((p) => [...p, ...res.items]);
        if (res.items.length) last = res.items.at(-1)?.at ?? last;
      } catch {
        /* silent in polling */
      } finally {
        if (first) setLoading(false);
        if (alive) timer = window.setTimeout(() => void load(false), 2500);
      }
    };

    void load(true);
    return () => {
      alive = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [open, token, activeId, demoMode, activeDemo]);

  if (!open) return null;

  const send = async () => {
    const t = text.trim();
    if (!t || !active) return;
    setText("");

    if (demoMode) {
      const mine: ChatMessage = { id: Date.now(), fromMe: true, body: t, at: Date.now() };
      setDemoThreads((prev) =>
        prev.map((th) =>
          th.id === active.id
            ? { ...th, lastMsg: t, lastAt: mine.at, messages: [...th.messages, mine] }
            : th
        )
      );
      window.setTimeout(() => {
        const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
        const msg: ChatMessage = { id: Date.now() + 1, fromMe: false, body: reply, at: Date.now() };
        setDemoThreads((prev) =>
          prev.map((th) =>
            th.id === active.id
              ? { ...th, unread: 0, lastMsg: reply, lastAt: msg.at, messages: [...th.messages, msg] }
              : th
          )
        );
      }, 1200);
      return;
    }

    if (!token) return;
    const optimistic: ChatMessage = { id: Date.now(), fromMe: true, body: t, at: Date.now() };
    setMsgs((p) => [...p, optimistic]);
    try {
      setSending(true);
      await sendMessageApi(token, active.id, t);
    } catch {
      setMsgs((p) => p.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[94] flex items-end justify-center p-3 sm:items-center sm:p-4">
      <button aria-hidden onClick={onClose} className="absolute inset-0 cursor-default bg-ink/85 backdrop-blur-sm" />

      <div className="modal-pop relative flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-line bg-card shadow-2xl shadow-black/70">
        <span className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-l from-[#e9cf8e] to-[#b8873b]" />

        <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
          {active && (
            <button
              onClick={() => setActiveId(null)}
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-mute transition hover:text-cream sm:hidden"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          <span className="grid h-10 w-10 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-lg">{active ? active.peer : "پیام‌های من"}</h3>
            <p className="truncate text-[10px] text-mute">
              {active ? active.adTitle : `${list.length ? "گفتگوهای فعال" : "هنوز گفتگویی نداری"}`}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-mute transition hover:text-cream"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <aside className={`no-scrollbar w-full shrink-0 overflow-y-auto border-e border-line bg-night/40 sm:block sm:w-64 ${active ? "hidden" : "block"}`}>
            {list.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                <MessageCircle className="h-8 w-8 text-mute" />
                <p className="text-xs font-bold">هنوز پیامی نداری</p>
                <p className="text-[10px] leading-5 text-mute">از صفحه هر آگهی، دکمه «چت با فروشنده» را بزن</p>
              </div>
            )}
            {list.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`relative flex w-full items-center gap-3 border-b border-line/60 px-3 py-3 text-start transition hover:bg-white/5 ${activeId === t.id ? "bg-gold/10" : ""}`}
              >
                <img src={t.adImage || ""} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-extrabold">{t.peer}</span>
                  <span className="mt-0.5 block truncate text-[10px] text-mute">{t.lastMsg || t.adTitle}</span>
                </span>
                {!!t.unread && <span className="absolute end-2 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-extrabold text-deep">{t.unread}</span>}
              </button>
            ))}
          </aside>

          <section className={`flex min-w-0 flex-1 flex-col ${active ? "flex" : "hidden sm:flex"}`}>
            {!active ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold/10 text-gold">
                  <MessageCircle className="h-6 w-6" />
                </span>
                <p className="text-sm font-extrabold">یک گفتگو را انتخاب کن</p>
                <p className="text-[11px] leading-6 text-mute">پیام‌هایت با فروشنده‌ها اینجا نگهداری می‌شود.</p>
              </div>
            ) : (
              <>
                <div className="flex shrink-0 items-center gap-3 border-b border-line bg-night/50 px-4 py-2.5">
                  <img src={active.adImage || ""} alt="" className="h-9 w-9 rounded-lg object-cover" />
                  <p className="min-w-0 flex-1 truncate text-[11px] font-bold">{active.adTitle}</p>
                </div>

                <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  <p className="mx-auto w-fit rounded-full border border-dashed border-line px-3 py-1 text-[9px] text-mute">
                    <ShieldCheck className="me-1 inline h-3 w-3 text-gold" />
                    پرداخت بیعانه بدون دیدن حیوان ممنوع
                  </p>

                  {loading ? (
                    <p className="py-8 text-center text-xs text-mute">در حال بارگذاری گفتگو...</p>
                  ) : (
                    msgs.map((m) => (
                      <div key={m.id} className={`flex ${m.fromMe ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-6 ${m.fromMe ? "rounded-ss-md bg-gradient-to-b from-[#e9cf8e] to-[#c99a46] text-deep" : "rounded-se-md border border-line bg-night text-cream"}`}>
                          {m.body}
                          <span className={`mt-1 block text-[9px] ${m.fromMe ? "text-deep/60" : "text-mute"}`}>{fmt(m.at)}</span>
                        </div>
                      </div>
                    ))
                  )}
                  {sending && (
                    <div className="flex justify-start">
                      <div className="flex gap-1 rounded-2xl rounded-ss-md bg-gradient-to-b from-[#e9cf8e] to-[#c99a46] px-4 py-3">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-deep/60" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>

                <div className="shrink-0 border-t border-line p-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-line bg-night p-1.5">
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send()}
                      placeholder={`به عنوان ${myName} بنویس...`}
                      className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[13px] outline-none"
                    />
                    <button
                      onClick={send}
                      disabled={!text.trim() || sending}
                      aria-label="ارسال"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-[#e9cf8e] to-[#b8873b] text-deep transition hover:brightness-110 disabled:opacity-40"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1.5 flex items-center justify-center gap-1 text-[9px] text-mute">
                    <BadgeCheck className="h-3 w-3 text-leaf" />
                    گفتگوی امن طوقی — شماره‌ات تا زمانی که خودت نخواهی دیده نمی‌شود
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
