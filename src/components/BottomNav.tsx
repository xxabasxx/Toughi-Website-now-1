import { useState } from "react";
import { Heart, Home, MessageCircle, Plus, User } from "lucide-react";
import { faNum } from "../fa";

type Props = {
  favCount: number;
  chatCount: number;
  authed: boolean;
  onHome: () => void;
  onChat: () => void;
  onFavs: () => void;
  onPost: () => void;
  onAuth: () => void;
};

export default function BottomNav({
  favCount,
  chatCount,
  authed,
  onHome,
  onChat,
  onFavs,
  onPost,
  onAuth,
}: Props) {
  const [active, setActive] = useState("home");

  const Item = ({
    id,
    label,
    Icon,
    action,
    badge,
  }: {
    id: string;
    label: string;
    Icon: typeof Home;
    action: () => void;
    badge?: number;
  }) => (
    <button
      onClick={() => {
        setActive(id);
        action();
      }}
      className={`relative flex min-w-16 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-extrabold transition ${
        active === id ? "text-gold" : "text-mute hover:text-cream"
      }`}
    >
      <span className="relative">
        <Icon className="h-5 w-5" />
        {badge != null && badge > 0 && (
          <span className="absolute -end-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-extrabold text-deep">
            {faNum(badge)}
          </span>
        )}
      </span>
      <span className="whitespace-nowrap">{label}</span>
      {active === id && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-gold" />}
    </button>
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[85] flex justify-center px-3">
      <nav className="pointer-events-auto flex items-end gap-0.5 rounded-full border border-line bg-ink/85 p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <Item id="home" label="خانه" Icon={Home} action={onHome} />
        <Item id="chat" label="چت" Icon={MessageCircle} action={onChat} badge={chatCount} />

        {/* colorful post button */}
        <div className="relative mx-1 flex flex-col items-center">
          <span
            aria-hidden
            className="absolute -top-5 h-14 w-14 animate-pulse rounded-full bg-[#f4a52e]/40 blur-lg"
          />
          <button
            onClick={onPost}
            aria-label="ثبت آگهی"
            className="btn-shine relative -mt-9 grid h-15 w-15 shrink-0 place-items-center rounded-full bg-[conic-gradient(from_210deg,#ffd97a,#f4a52e,#ee5c48,#f4a52e,#ffd97a)] text-deep shadow-[0_16px_36px_-6px_rgba(238,92,72,0.6)] ring-[6px] ring-ink transition duration-300 hover:brightness-110 active:scale-90"
          >
            <Plus className="h-7 w-7" strokeWidth={2.75} />
          </button>
          <span className="mt-1 whitespace-nowrap text-[9px] font-extrabold text-[#e8944a]">
            ثبت آگهی
          </span>
        </div>

        <Item id="favs" label="علاقه‌مندی" Icon={Heart} action={onFavs} badge={favCount} />
        <Item id="me" label={authed ? "پروفایل" : "طوقی من"} Icon={User} action={onAuth} />
      </nav>
    </div>
  );
}
