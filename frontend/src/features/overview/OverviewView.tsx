import { Check, X, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { BookingItem, CurrencyCode, LangCode, MonthlyRevenuePoint, PropertyItem, ThemeMode } from '../../types/domain';
import { formatMoney, formatNights, formatShortDate } from '../../utils/formatters';
import { RevenueChart } from './RevenueChart';

interface Props {
  properties: PropertyItem[];
  bookings: BookingItem[];
  monthlyPoints: MonthlyRevenuePoint[];
  currency: CurrencyCode;
  lang: LangCode;
  theme: ThemeMode;
  onApprove: (booking: BookingItem) => void;
  onReject: (booking: BookingItem) => void;
  onNewBooking: () => void;
}

const GANTT_DAYS = ['2026-11-25', '2026-11-26', '2026-11-27', '2026-11-28', '2026-11-29', '2026-11-30', '2026-12-01'];

export function OverviewView({
  properties,
  bookings,
  monthlyPoints,
  currency,
  lang,
  theme,
  onApprove,
  onReject,
  onNewBooking,
}: Props) {
  const { t } = useTranslation();

  const apartments = properties.filter((p) => p.type === 'APARTMENT').length;
  const houses = properties.filter((p) => p.type === 'HOUSE').length;
  const availableNow = properties.filter((p) => p.status === 'AVAILABLE').length;
  const occupiedCount = properties.filter((p) => p.status === 'OCCUPIED').length;
  const occupancyPct = properties.length ? Math.round((occupiedCount / properties.length) * 100) : 0;
  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const realizedRevenueUsd = bookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalUsd, 0);

  return (
    <div className="space-y-6">
      <header data-reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-ink-muted">{t('overview.eyebrow')}</p>
          <h1 className="font-editorial mt-1 text-ink" style={{ fontSize: 'var(--text-hero)', lineHeight: 1.15 }}>
            {t('overview.title')}
          </h1>
        </div>
        <button
          type="button"
          onClick={onNewBooking}
          className="inline-flex items-center gap-2 rounded-lg bg-emeraldArch px-4 py-2.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
        >
          <span>{t('actions.newBooking')}</span>
          <ArrowUpRight className="directional-icon h-4 w-4" />
        </button>
      </header>

      {/* KPI Strip */}
      <section data-reveal className="kpi-strip">
        <article className="arch-panel rounded-xl p-4 sm:p-5">
          <p className="text-xs text-ink-muted">{t('kpi.totalUnits')}</p>
          <p className="mt-2 font-semibold text-ink tabular-nums" style={{ fontSize: 'var(--text-kpi)' }}>
            {properties.length}
          </p>
          <p className="mt-1 text-xs text-ink-muted">{t('kpi.unitsSplit', { apartments, houses })}</p>
        </article>
        <article className="arch-panel rounded-xl p-4 sm:p-5">
          <p className="text-xs text-ink-muted">{t('kpi.occupancy')}</p>
          <p className="mt-2 font-semibold text-emeraldArch tabular-nums" style={{ fontSize: 'var(--text-kpi)' }}>
            <bdi dir="ltr">{occupancyPct}%</bdi>
          </p>
          <p className="mt-1 text-xs text-ink-muted">{t('kpi.availableNow', { count: availableNow })}</p>
        </article>
        <article className="arch-panel rounded-xl p-4 sm:p-5">
          <p className="text-xs text-ink-muted">{t('kpi.activeBookings')}</p>
          <p className="mt-2 font-semibold text-ink tabular-nums" style={{ fontSize: 'var(--text-kpi)' }}>
            {activeBookings}
          </p>
          <p className="mt-1 text-xs text-brass">{t('kpi.pendingCount', { count: pendingBookings.length })}</p>
        </article>
        <article className="arch-panel rounded-xl p-4 sm:p-5">
          <p className="text-xs text-ink-muted">{t('kpi.revenue')}</p>
          <p className="mt-2 font-semibold text-ink tabular-nums" style={{ fontSize: 'var(--text-kpi)' }}>
            <bdi>{formatMoney(realizedRevenueUsd, currency, lang)}</bdi>
          </p>
          <p className="mt-1 text-xs text-emeraldArch">+12.4%</p>
        </article>
      </section>

      {/* Asymmetric Editorial Bento */}
      <div className="overview-bento">
        {/* Visual Hero: Unit Occupancy Timeline */}
        <section data-reveal className="area-hero arch-panel-hero rounded-xl p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline pb-4">
            <div>
              <h2 className="font-editorial text-xl text-ink">{t('overview.ganttTitle')}</h2>
              <p className="mt-0.5 text-sm text-ink-muted">{t('overview.ganttSubtitle')}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emeraldArch" />
                {t('calendar.legendConfirmed')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brass" />
                {t('calendar.legendPending')}
              </span>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[540px] space-y-3">
              <div className="grid grid-cols-8 gap-2 text-xs text-ink-muted">
                <div className="col-span-2" />
                {GANTT_DAYS.slice(0, 6).map((day) => (
                  <div key={day} className="text-center tabular-nums">
                    {formatShortDate(day, lang)}
                  </div>
                ))}
              </div>
              {properties.map((prop) => {
                const active = bookings.find(
                  (b) => b.propertyId === prop.id && (b.status === 'CONFIRMED' || b.status === 'PENDING'),
                );
                return (
                  <div key={prop.id} className="grid grid-cols-8 items-center gap-2 border-t border-hairline pt-3">
                    <div className="col-span-2 flex items-center gap-2.5">
                      <img
                        src={prop.imageUrl}
                        alt={lang === 'ar' ? prop.nameAr : prop.nameFr}
                        loading="lazy"
                        className="h-9 w-12 shrink-0 rounded-md object-cover aspect-[1200/896]"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {lang === 'ar' ? prop.nameAr : prop.nameFr}
                        </p>
                        <p className="truncate text-xs text-ink-muted">
                          {formatMoney(prop.pricePerNightUsd, currency, lang)}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-6 grid grid-cols-6 gap-1">
                      {GANTT_DAYS.slice(0, 6).map((day) => {
                        const covered = active && day >= active.checkIn && day < active.checkOut;
                        const barTone =
                          active?.status === 'CONFIRMED'
                            ? 'bg-emeraldArch text-canvas'
                            : 'bg-brass text-canvas';
                        return (
                          <div
                            key={day}
                            className={`h-8 rounded-md flex items-center justify-center text-[11px] font-medium ${
                              covered ? barTone : 'bg-sunken/70'
                            }`}
                          >
                            {covered && day === active.checkIn ? (
                              <span className="truncate px-1.5">{active.guestName.split(' ')[0]}</span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pending Decisions Queue */}
        <section data-reveal className="area-queue arch-panel rounded-xl p-5 sm:p-6">
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <h2 className="font-editorial text-xl text-ink">{t('overview.pendingTitle')}</h2>
            <span className="rounded-full bg-brass-soft px-2.5 py-0.5 text-xs font-semibold text-brass tabular-nums">
              {pendingBookings.length}
            </span>
          </div>

          {pendingBookings.length === 0 ? (
            <p className="mt-6 text-sm leading-relaxed text-ink-muted">{t('overview.pendingEmpty')}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pendingBookings.map((b) => (
                <li key={b.id} className="rounded-lg border border-hairline bg-canvas/60 p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-ink">{b.guestName}</p>
                      <p className="text-xs text-ink-muted">
                        {lang === 'ar' ? b.propertyNameAr : b.propertyNameFr}
                      </p>
                    </div>
                    <bdi dir="ltr" className="text-xs font-medium text-ink-muted tabular-nums">
                      {b.bookingCode}
                    </bdi>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
                    <span>
                      {formatShortDate(b.checkIn, lang)} – {formatShortDate(b.checkOut, lang)} ·{' '}
                      {formatNights(b.nights, lang)}
                    </span>
                    <bdi className="font-semibold text-ink tabular-nums">
                      {formatMoney(b.totalUsd, currency, lang)}
                    </bdi>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onApprove(b)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-emeraldArch px-3 py-1.5 text-xs font-medium text-canvas hover:opacity-90"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {t('actions.approve')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(b)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-terracotta hover:bg-terracotta-soft"
                    >
                      <X className="h-3.5 w-3.5" />
                      {t('actions.reject')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Revenue Analytics Chart */}
        <RevenueChart points={monthlyPoints} currency={currency} lang={lang} theme={theme} />

        {/* Portfolio Snapshot */}
        <section data-reveal className="area-units arch-panel rounded-xl p-5 sm:p-6">
          <h2 className="font-editorial border-b border-hairline pb-4 text-xl text-ink">
            {t('overview.unitsTitle')}
          </h2>
          <ul className="mt-4 divide-y divide-hairline">
            {properties.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {lang === 'ar' ? p.nameAr : p.nameFr}
                  </p>
                  <p className="truncate text-xs text-ink-muted">
                    {lang === 'ar' ? p.districtAr : p.districtFr} · {p.areaSqm} {t('properties.areaUnit')}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    p.status === 'AVAILABLE'
                      ? 'bg-emeraldArch-soft text-emeraldArch'
                      : 'bg-brass-soft text-brass'
                  }`}
                >
                  {t(`status.${p.status}`)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
