import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BookingItem, CurrencyCode, LangCode, PropertyItem } from '../../types/domain';
import { formatMoney, formatShortDate } from '../../utils/formatters';

interface Props {
  properties: PropertyItem[];
  bookings: BookingItem[];
  currency: CurrencyCode;
  lang: LangCode;
}

const NOV_2026_DAYS = Array.from({ length: 30 }, (_, idx) => {
  const day = String(idx + 1).padStart(2, '0');
  return `2026-11-${day}`;
});

export function CalendarView({ properties, bookings, currency, lang }: Props) {
  const { t } = useTranslation();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-26');

  const scopedBookings = bookings.filter(
    (b) =>
      b.status !== 'CANCELLED' &&
      (selectedPropertyId === 'ALL' || b.propertyId === selectedPropertyId),
  );

  const dayBookings = (iso: string) =>
    scopedBookings.filter((b) => iso >= b.checkIn && iso < b.checkOut);

  const activeDayList = dayBookings(selectedDate);

  return (
    <div className="space-y-6">
      <header data-reveal className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-editorial text-ink" style={{ fontSize: 'var(--text-hero)' }}>
          {t('calendar.title')}
        </h1>
        <select
          value={selectedPropertyId}
          onChange={(e) => setSelectedPropertyId(e.target.value)}
          className="rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink focus:border-emeraldArch focus:outline-none"
        >
          <option value="ALL">{t('calendar.allProperties')}</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {lang === 'ar' ? p.nameAr : p.nameFr}
            </option>
          ))}
        </select>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <section data-reveal className="arch-panel rounded-xl p-4 sm:p-6 lg:col-span-8">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {NOV_2026_DAYS.map((iso, i) => {
              const items = dayBookings(iso);
              const isSelected = selectedDate === iso;
              const hasConfirmed = items.some((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
              const hasPending = items.some((b) => b.status === 'PENDING');
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelectedDate(iso)}
                  className={`flex min-h-[60px] sm:min-h-[82px] flex-col items-center justify-between rounded-lg border p-2 text-center transition-colors ${
                    isSelected
                      ? 'border-emeraldArch bg-emeraldArch-soft'
                      : 'border-hairline bg-canvas/50 hover:border-strong'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-medium text-ink tabular-nums">{i + 1}</span>

                  {/* Mobile Semantic Status Dots (no clipped text) */}
                  <div className="flex items-center gap-1 md:hidden">
                    {hasConfirmed && <span className="h-2 w-2 rounded-full bg-emeraldArch" />}
                    {hasPending && <span className="h-2 w-2 rounded-full bg-brass" />}
                    {!hasConfirmed && !hasPending && <span className="h-1.5 w-1.5 rounded-full bg-hairline" />}
                  </div>

                  {/* Desktop Compact Status Pill */}
                  <div className="hidden md:flex w-full flex-col gap-1">
                    {items.slice(0, 2).map((item) => (
                      <span
                        key={item.id}
                        className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          item.status === 'PENDING'
                            ? 'bg-brass-soft text-brass'
                            : 'bg-emeraldArch-soft text-emeraldArch'
                        }`}
                      >
                        {item.guestName.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Interactive Day Details Panel */}
        <aside data-reveal className="arch-panel rounded-xl p-5 lg:col-span-4">
          <h2 className="font-editorial border-b border-hairline pb-3 text-lg text-ink">
            {t('calendar.selectedDay', { date: formatShortDate(selectedDate, lang) })}
          </h2>
          {activeDayList.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">{t('calendar.noBookingsDay')}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {activeDayList.map((b) => (
                <li key={b.id} className="rounded-lg border border-hairline bg-canvas/60 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink">{b.guestName}</span>
                    <bdi dir="ltr" className="text-xs text-ink-muted tabular-nums">{b.bookingCode}</bdi>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {lang === 'ar' ? b.propertyNameAr : b.propertyNameFr}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-emeraldArch">{t(`status.${b.status}`)}</span>
                    <bdi className="font-semibold text-ink tabular-nums">
                      {formatMoney(b.totalUsd, currency, lang)}
                    </bdi>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
