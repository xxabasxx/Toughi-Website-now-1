/**
 * آدرس پایه API.
 * تولید: خالی بگذار تا درخواست‌ها به همان دامنه بروند (/api/...) و با Pages Function پاسخ داده شوند،
 *      یا آدرس کامل Worker را بگذار (مثلاً https://tooghi-api.xxx.workers.dev).
 * توسعه محلی: "http://localhost:8787"
 */
export const API_BASE: string = "";
export const api = (path: string) => `${API_BASE}${path}`;
