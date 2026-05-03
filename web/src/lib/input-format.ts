/**
 * TR para girişi: binlik `.`, ondalık `,` — parse ve maskeleme.
 */

export function parseMoneyTR(raw: string): number {
  const s = String(raw ?? "")
    .trim()
    .replace(/\s/g, "");
  if (!s) return NaN;
  if (s.includes(",")) {
    const i = s.lastIndexOf(",");
    const intRaw = s.slice(0, i).replace(/\./g, "");
    const fracRaw = s.slice(i + 1).replace(/\D/g, "").slice(0, 2);
    const intPart = intRaw.replace(/[^\d]/g, "");
    if (!intPart && !fracRaw) return NaN;
    const n = fracRaw ? Number(`${intPart || "0"}.${fracRaw}`) : Number(intPart || "0");
    return Number.isFinite(n) ? n : NaN;
  }
  const dotCount = (s.match(/\./g) ?? []).length;
  if (dotCount === 1 && /^\d+\.\d{1,2}$/.test(s)) {
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  }
  const digits = s.replace(/\./g, "").replace(/[^\d]/g, "");
  if (!digits) return NaN;
  const n = Number(digits);
  return Number.isFinite(n) ? n : NaN;
}

/** Yazarken TR biçiminde göster (binlik nokta, ondalık virgül). */
export function formatMoneyInputTR(raw: string): string {
  const s = String(raw ?? "")
    .trim()
    .replace(/\s/g, "");
  if (!s) return "";
  let intPart = "";
  let fracPart = "";
  if (s.includes(",")) {
    const i = s.lastIndexOf(",");
    intPart = s
      .slice(0, i)
      .replace(/\./g, "")
      .replace(/[^\d]/g, "");
    fracPart = s.slice(i + 1).replace(/\D/g, "").slice(0, 2);
  } else {
    const dotCount = (s.match(/\./g) ?? []).length;
    if (dotCount === 1 && /^\d+\.\d{1,2}$/.test(s)) {
      const [a, b] = s.split(".");
      intPart = (a ?? "").replace(/[^\d]/g, "");
      fracPart = (b ?? "").replace(/\D/g, "").slice(0, 2);
    } else {
      intPart = s.replace(/\./g, "").replace(/[^\d]/g, "");
    }
  }
  if (!intPart && !fracPart) {
    return s.endsWith(",") ? "," : "";
  }
  const intNum = BigInt(intPart || "0");
  const intFormatted = intNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (fracPart.length > 0) return `${intFormatted},${fracPart}`;
  if (s.includes(",") && s.lastIndexOf(",") === s.length - 1)
    return `${intFormatted},`;
  return intFormatted;
}

/** 11 hane: 4 + 3 + 2 + 2 boşluklarla (örn. 0532 123 45 67). */
export function formatPhoneInputTR(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 4) return d;
  if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
  if (d.length <= 9) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9)}`;
}
