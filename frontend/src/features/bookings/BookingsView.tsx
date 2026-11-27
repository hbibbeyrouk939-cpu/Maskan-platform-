import { useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { BookingItem, BookingStatus, CurrencyCode, LangCode } from '../../types/domain';
import { formatMoney, formatNights, formatShortDate } from '../../utils/formatters';

interface Props {
  bookings: BookingItem[];
  currency: CurrencyCode;
  lang: LangCode;
  onApprove: (booking: BookingItem) => void;
  onReject: (booking: BookingItem) => void;
}

const STATUS_STYLE: Record<BookingStatus, string> = {
  CONFIRMED: 'bg-emeraldArch-soft text-emeraldArch',
  PENDING: 'bg-brass-soft text-brass',
  COMPLETED: 'bg-sunken text-ink-muted',
  CANCELLED: 'bg-terracotta-soft text-terracotta',
};

export function BookingsView({ bookings, currency, lang, onApprove, onReject }: Props) {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<'ALL' | BookingStatus>('ALL');
  const [query, setQuery] = useState('');

  const filtered = bookings.filter((b) => {
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const text = `${b.guestName} ${b.bookingCode} ${b.propertyNameAr} ${b.propertyNameFr}`.toLowerCase();
    return matchStatus && text.includes(query.trim().toLowerCase());
  });

  return (
    <div className="space-y-6">
      <header data-reveal className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-editorial text-ink" style={{ fontSize: 'var(--text-hero)' }}>
          {t('bookings.title')}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" style={{ insetInlineStart: '0.75rem' }} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('bookings.searchPlaceholder')}
              className="rounded-lg border border-hairline bg-surface py-2 text-sm text-ink placeholder:text-ink-muted focus:border-emeraldArch focus:outline-none"
              style={{ paddingInlineStart: '2.25rem', paddingInlineEnd: '0.875rem' }}
            />
          </div>
          <div className="inline-flex flex-wrap rounded-lg bg-sunken p-1 text-xs font-medium">
            {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-md px-2.5 py-1.5 transition-colors ${
                  statusFilter === st ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {st === 'ALL' ? t('bookings.allStatuses') : t(`status.${st}`)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="arch-panel rounded-xl p-10 text-center text-sm text-ink-muted">{t('bookings.empty')}</div>
      ) : (
        <>
          {/* Mobile Interactive Cards — Zero Horizontal Scroll */}
          <div className="space-y-3 md:hidden">
            {filtered.map((b) => (
              <article key={b.id} className="arch-panel rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">{b.guestName}</p>
                    <p className="text-xs text-ink-muted">
                      {lang === 'ar' ? b.propertyNameAr : b.propertyNameFr}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[b.status]}`}>
                    {t(`status.${b.status}`)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
                  <bdi dir="ltr" className="tabular-nums">{b.bookingCode} · {b.guestPhone}</bdi>
                  <bdi className="text-sm font-semibold text-ink tabular-nums">
                    {formatMoney(b.totalUsd, currency, lang)}
                  </bdi>
                </div>
                <p className="mt-1.5 text-xs text-ink-muted">
                  {formatShortDate(b.checkIn, lang)} – {formatShortDate(b.checkOut, lang)} ·{' '}
                  {formatNights(b.nights, lang)}
                </p>
                {b.status === 'PENDING' && (
                  <div className="mt-3 flex gap-2 border-t border-hairline pt-3">
                    <button
                      type="button"
                      onClick={() => onApprove(b)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emeraldArch py-2 text-xs font-medium text-canvas"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {t('actions.approve')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(b)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-hairline bg-canvas py-2 text-xs font-medium text-terracotta"
                    >
                      <X className="h-3.5 w-3.5" />
                      {t('actions.reject')}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* Desktop Rich Table */}
          <div className="hidden md:block arch-panel overflow-hidden rounded-xl">
            <table className="w-full text-start text-sm">
              <thead className="border-b border-hairline bg-sunken/50 text-xs text-ink-muted">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">#</th>
                  <th className="px-4 py-3 text-start font-medium">{t('bookings.guest')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('bookings.property')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('bookings.dates')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('bookings.amount')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('bookings.status')}</th>
                  <th className="px-4 py-3 text-end font-medium">{t('bookings.decision')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-sunken/30">
                    <td className="px-4 py-3.5 font-medium text-ink-muted tabular-nums">
                      <bdi dir="ltr">{b.bookingCode}</bdi>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-ink">{b.guestName}</p>
                      <bdi dir="ltr" className="text-xs text-ink-muted tabular-nums">{b.guestPhone}</bdi>
                    </td>
                    <td className="px-4 py-3.5 text-ink">
                      {lang === 'ar' ? b.propertyNameAr : b.propertyNameFr}
                    </td>
                    <td className="px-4 py-3.5 text-ink-muted">
                      {formatShortDate(b.checkIn, lang)} – {formatShortDate(b.checkOut, lang)}
                      <span className="block text-xs">{formatNights(b.nights, lang)}</span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-ink tabular-nums">
                      <bdi>{formatMoney(b.totalUsd, currency, lang)}</bdi>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[b.status]}`}>
                        {t(`status.${b.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-end">
                      {b.status === 'PENDING' ? (
                        <div className="inline-flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => onApprove(b)}
                            className="rounded-md bg-emeraldArch px-2.5 py-1 text-xs font-medium text-canvas hover:opacity-90"
                          >
                            {t('actions.approve')}
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(b)}
                            className="rounded-md border border-hairline px-2.5 py-1 text-xs font-medium text-terracotta hover:bg-terracotta-soft"
                          >
                            {t('actions.reject')}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-ink-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
