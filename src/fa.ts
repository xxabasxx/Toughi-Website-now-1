export const faNum = (n: number): string => n.toLocaleString("fa-IR");

export const faDigits = (s: string | number): string =>
  String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

export const faPrice = (n: number | null | undefined): string =>
  n == null ? "توافقی" : `${faNum(n)} تومان`;

export const faShort = (n: number): string =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} میلیون`
    : faNum(n);
