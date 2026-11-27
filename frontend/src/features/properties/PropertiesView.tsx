import { useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CurrencyCode, LangCode, PropertyItem, PropertyType } from '../../types/domain';
import { formatMoney } from '../../utils/formatters';

interface Props {
  properties: PropertyItem[];
  currency: CurrencyCode;
  lang: LangCode;
}

export function PropertiesView({ properties, currency, lang }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | PropertyType>('ALL');

  const filtered = properties.filter((p) => {
    const matchesType = typeFilter === 'ALL' || p.type === typeFilter;
    const text = `${p.nameAr} ${p.nameFr} ${p.districtAr} ${p.districtFr}`.toLowerCase();
    return matchesType && text.includes(query.trim().toLowerCase());
  });

  return (
    <div className="space-y-6">
      <header data-reveal className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-editorial text-ink" style={{ fontSize: 'var(--text-hero)' }}>
          {t('properties.title')}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" style={{ insetInlineStart: '0.75rem' }} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('properties.searchPlaceholder')}
              className="rounded-lg border border-hairline bg-surface py-2 text-sm text-ink placeholder:text-ink-muted focus:border-emeraldArch focus:outline-none"
              style={{ paddingInlineStart: '2.25rem', paddingInlineEnd: '0.875rem' }}
            />
          </div>
          <div className="inline-flex rounded-lg bg-sunken p-1 text-xs font-medium">
            {(['ALL', 'APARTMENT', 'HOUSE'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTypeFilter(key)}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  typeFilter === key ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {key === 'ALL' ? t('properties.allTypes') : t(`properties.${key.toLowerCase()}`)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="arch-panel rounded-xl p-10 text-center text-sm text-ink-muted">{t('properties.empty')}</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filtered.map((prop) => (
            <article key={prop.id} data-reveal className="arch-panel overflow-hidden rounded-xl">
              <div className="relative aspect-[1200/896] w-full overflow-hidden bg-sunken">
                <img
                  src={prop.imageUrl}
                  alt={lang === 'ar' ? prop.nameAr : prop.nameFr}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
                <span
                  className={`absolute top-3 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md ${
                    prop.status === 'AVAILABLE'
                      ? 'bg-emeraldArch/90 text-canvas'
                      : 'bg-surface/90 text-ink'
                  }`}
                  style={{ insetInlineEnd: '0.75rem' }}
                >
                  {t(`status.${prop.status}`)}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-editorial text-xl text-ink">
                      {lang === 'ar' ? prop.nameAr : prop.nameFr}
                    </h2>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {lang === 'ar' ? prop.districtAr : prop.districtFr}
                    </p>
                  </div>
                  <div className="text-end">
                    <bdi className="text-lg font-semibold text-emeraldArch tabular-nums">
                      {formatMoney(prop.pricePerNightUsd, currency, lang)}
                    </bdi>
                    <p className="text-xs text-ink-muted">{t('properties.perNight')}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 border-t border-hairline pt-3 text-xs text-ink-muted">
                  <span>{t(`properties.${prop.type.toLowerCase()}`)}</span>
                  <span>·</span>
                  <span>{t('properties.rooms', { count: prop.rooms })}</span>
                  <span>·</span>
                  <span className="tabular-nums">
                    {prop.areaSqm} {t('properties.areaUnit')}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
