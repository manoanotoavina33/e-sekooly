import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY_LOCALE = "fr-FR";
const CURRENCY_CODE = "MGA";
const CURRENCY_SUFFIX = "Ar";

function formatNumberIntl(value: number): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE, { useGrouping: true }).format(value);
}

function formatNumberRaw(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatCurrency(value: number | string | null | undefined, withSuffix = true): string {
  const num = typeof value === "number" ? value : Number(value);
  if (!isFinite(num)) return withSuffix ? "0 Ar" : "0";
  const formatted = formatNumberRaw(num);
  return withSuffix ? `${formatted} ${CURRENCY_SUFFIX}` : formatted;
}
