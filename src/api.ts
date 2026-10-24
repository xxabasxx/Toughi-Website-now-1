import { api } from "./config";
import type { Listing } from "./data";

export type SessionUser = { phone: string; name?: string | null; avatar?: string | null };
export type VerifyResult = { token: string; user: SessionUser };
export type ChatSummary = {
  id: number;
  adId: string;
  adTitle: string;
  adImage: string | null;
  role: "buyer" | "seller";
  peer: string;
  unread: number;
  lastMsg: string | null;
  lastAt: number | null;
};
export type ChatMessage = { id: number; fromMe: boolean; body: string; at: number };

/**
 * حالت آفلاین/تست — وقتی API در دسترس نیست (دیپلوی استاتیک Pages)،
 * قرارداد SANDBOX_MODE ورکر را سمت مرورگر شبیه‌سازی می‌کند تا
 * ورود با کد ۱۲۳۴۵ و حالت دموی اپ (demo_ token) کار کند.
 */
function offline<T>(path: string, init?: RequestInit, token?: string): T | null {
  if (path === "/api/auth/send") {
    return { ok: true, message: "کد تأیید پیامک شد (حالت تست)", devCode: "12345" } as T;
  }
  if (path === "/api/auth/verify" && init?.body) {
    try {
      const body = JSON.parse(init.body as string);
      if (String(body.code) === "12345") {
        return { ok: true, token: `demo_${body.phone}`, user: { phone: body.phone } } as T;
      }
    } catch {
      /* ignore */
    }
  }
  if (path === "/api/auth/me" && token?.startsWith("demo_")) {
    return { ok: true, user: { phone: token.slice(5) } } as T;
  }
  return null;
}

async function req<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    ...(token ? { authorization: `Bearer ${token}` } : {}),
    ...((init?.headers as Record<string, string> | undefined) ?? {}),
  };
  if (init?.body && !(init.body instanceof FormData)) headers["content-type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(api(path), {
      ...init,
      headers,
    });
  } catch (e) {
    const fb = offline<T>(path, init, token);
    if (fb) return fb;
    throw e;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) {
    const fb = offline<T>(path, init, token);
    if (fb) return fb;
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return data as T;
}

export const sendOtp = (phone: string) =>
  req<{ ok: true; message: string; devCode?: string }>("/api/auth/send", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });

export const verifyOtp = (phone: string, code: string) =>
  req<{ ok: true } & VerifyResult>("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });

export const getMe = (token: string) => req<{ ok: true; user: SessionUser }>("/api/auth/me", {}, token);

export const patchMe = (token: string, name: string) =>
  req<{ ok: true }>("/api/auth/me", { method: "PATCH", body: JSON.stringify({ name }) }, token);

export const fetchAds = (params: {
  city?: string;
  cat?: string;
  q?: string;
  mine?: boolean;
  limit?: number;
  offset?: number;
}) => {
  const sp = new URLSearchParams();
  if (params.city) sp.set("city", params.city);
  if (params.cat) sp.set("cat", params.cat);
  if (params.q) sp.set("q", params.q);
  if (params.mine) sp.set("mine", "1");
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.offset) sp.set("offset", String(params.offset));
  return req<{ ok: true; items: Listing[]; hasMore: boolean }>(`/api/ads?${sp.toString()}`);
};

export const fetchAd = (id: string | number) => req<{ ok: true; ad: Listing }>(`/api/ads/${id}`);

export const createAd = (token: string, payload: Partial<Listing> & Record<string, unknown>) =>
  req<{ ok: true; ad: Listing }>("/api/ads", { method: "POST", body: JSON.stringify(payload) }, token);

export const deleteAd = (token: string, id: string | number) =>
  req<{ ok: true }>(`/api/ads/${id}`, { method: "DELETE" }, token);

export const listChats = (token: string) => req<{ ok: true; items: ChatSummary[] }>("/api/chats", {}, token);

export const openChatApi = (token: string, adId: string | number) =>
  req<{ ok: true; chatId: number }>("/api/chats", { method: "POST", body: JSON.stringify({ adId }) }, token);

export const listMessages = (token: string, chatId: number, after = 0) =>
  req<{ ok: true; items: ChatMessage[] }>(`/api/chats/${chatId}/messages?after=${after}`, {}, token);

export const sendMessageApi = (token: string, chatId: number, body: string) =>
  req<{ ok: true }>(`/api/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  }, token);
