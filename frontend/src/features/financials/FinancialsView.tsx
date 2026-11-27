import { useTranslation } from 'react-i18next';
import type { BookingItem, CurrencyCode, LangCode, PropertyItem } from '../../types/domain';
import { formatMoney } from '../../utils/formatters';

interface Props {
  properties: PropertyItem[];
  bookings: BookingItem[];
  currency: CurrencyCode;
  lang: LangCode;
}

export function FinancialsView({ properties, bookings, currency, lang }: Props) {
  const { t } = useTranslation();
  const eligible = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
  const totalUsd = eligible.reduce((sum, b) => sum + b.totalUsd, 0);

  return (
    <div className="space-y-6">
      <header data-reveal>
        <h1 className="font-editorial text-ink" style={{ fontSize: 'var(--text-hero)' }}>
          {t('financials.title')}
        </h1>
      </header>

      <section data-reveal className="arch-panel rounded-xl p-6">
        <h2 className="font-editorial border-b border-hairline pb-4 text-xl text-ink">
          {t('financials.breakdownTitle')}
        </h2>
        <ul className="mt-4 space-y-4">
          {properties.map((p) => {
            const pBookings = eligible.filter((b) => b.propertyId === p.id);
            const rev = pBookings.reduce((sum, b) => sum + b.totalUsd, 0);
            const pct = totalUsd > 0 ? Math.round((rev / totalUsd) * 100) : 0;
            return (
              <li key={p.id} className="space-y-2">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <div>
                    <span className="font-medium text-ink">
                      {lang === 'ar' ? p.nameAr : p.nameFr}
                    </span>
                    <span className="text-xs text-ink-muted" style={{ marginInlineStart: '0.5rem' }}>
                      ({t('financials.bookingsCount', { count: pBookings.length })})
                    </span>
                  </div>
                  <div className="font-semibold text-ink tabular-nums">
                    <bdi>{formatMoney(rev, currency, lang)}</bdi>{' '}
                    <span className="text-xs font-normal text-ink-muted">({pct}%)</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-sunken">
                  <div
                    className="h-full rounded-full bg-emeraldArch transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
