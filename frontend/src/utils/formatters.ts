import type { CurrencyCode, ExchangeRateItem, LangCode } from '../types/domain';

export const DEFAULT_RATES: Record<CurrencyCode, ExchangeRateItem> = {
  USD: { code: 'USD', nameAr: 'دولار أمريكي', nameFr: 'Dollar américain', symbolAr: '$', symbolFr: '$', rateToUsd: 1, prefix: true },
  EUR: { code: 'EUR', nameAr: 'يورو أوروبي', nameFr: 'Euro', symbolAr: '€', symbolFr: '€', rateToUsd: 0.92, prefix: false },
  MRU: { code: 'MRU', nameAr: 'أوقية موريتانية', nameFr: 'Ouguiya mauritanienne', symbolAr: 'أ.م', symbolFr: 'MRU', rateToUsd: 39.8, prefix: false },
};

export function formatMoney(amountUsd: number, currency: CurrencyCode, lang: LangCode, rates = DEFAULT_RATES): string {
  const cfg = rates[currency] ?? DEFAULT_RATES.USD;
  const converted = Math.round(amountUsd * cfg.rateToUsd);
  const locale = lang === 'ar' ? 'ar-MR' : 'fr-FR';
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
    numberingSystem: 'latn',
  }).format(converted);
  const symbol = lang === 'ar' ? cfg.symbolAr : cfg.symbolFr;
  return cfg.prefix ? `${symbol}${formatted}` : `${formatted} ${symbol}`;
}

export function formatShortDate(isoDate: string, lang: LangCode): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const locale = lang === 'ar' ? 'ar-EG' : 'fr-FR';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date);
}

export function formatMonthLabel(monthKey: string, lang: LangCode): string {
  const date = new Date(`${monthKey}-01T00:00:00`);
  const locale = lang === 'ar' ? 'ar-EG' : 'fr-FR';
  return new Intl.DateTimeFormat(locale, { month: 'short' }).format(date);
}

export function formatNights(count: number, lang: LangCode): string {
  if (lang === 'fr') {
    return count === 1 ? '1 nuit' : `${count} nuits`;
  }
  if (count === 1) return 'ليلة واحدة';
  if (count === 2) return 'ليلتان';
  if (count >= 3 && count <= 10) return `${count} ليالٍ`;
  return `${count} ليلة`;
}

export function diffNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(`${checkIn}T00:00:00`).getTime();
  const d2 = new Date(`${checkOut}T00:00:00`).getTime();
  return Math.max(0, Math.round((d2 - d1) / 86400000));
}
