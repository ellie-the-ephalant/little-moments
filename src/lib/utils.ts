import { DEFAULT_TITLE } from "./constants";

export function slugify(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return slug || "strip";
}

export function toLocalISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalISO(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function todayISO() {
  return toLocalISO(new Date());
}

export function formatDateLabel(dateISO: string) {
  const date = parseLocalISO(dateISO) ?? new Date();
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .toUpperCase();
}

export function effectiveTitle(title: string) {
  return title.trim() || DEFAULT_TITLE;
}

export function filenameForStrip(
  title: string,
  dateISO: string,
  extension: "png" | "jpg" = "png",
) {
  const date = dateISO || todayISO();
  return `little-moments-${slugify(title.trim() || "strip")}-${date}.${extension}`;
}

let fallbackCounter = 0;

export function uid() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  fallbackCounter += 1;
  return `lm-${Date.now().toString(36)}-${fallbackCounter.toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
