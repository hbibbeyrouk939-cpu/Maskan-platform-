import { useEffect, useRef, useState } from 'react';
import {
  Chart,
  BarController,
  LineController,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
} from 'chart.js';
import { useTranslation } from 'react-i18next';
import type { CurrencyCode, LangCode, MonthlyRevenuePoint, ThemeMode } from '../../types/domain';
import { DEFAULT_RATES, formatMoney, formatMonthLabel } from '../../utils/formatters';

Chart.register(
  BarController,
  LineController,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
);

type ChartMode = 'grouped' | 'stacked' | 'area';

interface Props {
  points: MonthlyRevenuePoint[];
  currency: CurrencyCode;
  lang: LangCode;
  theme: ThemeMode;
}

function readToken(name: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function RevenueChart({ points, currency, lang, theme }: Props) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const prevThemeRef = useRef<ThemeMode>(theme);
  const [mode, setMode] = useState<ChartMode>('grouped');

  const rate = DEFAULT_RATES[currency]?.rateToUsd ?? 1;
  const periodTotalUsd = points.reduce((acc, p) => acc + p.totalUsd, 0);
  const bestPoint = points.reduce((best, cur) => (cur.totalUsd > best.totalUsd ? cur : best), points[0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const emerald = readToken('--accent-emerald', '#134E41');
    const brass = readToken('--accent-brass', '#9A6B2F');
    const mutedInk = readToken('--text-secondary', '#525750');
    const gridColor = readToken('--border-hairline', 'rgba(27,29,27,0.10)');
    const surfaceBg = readToken('--bg-surface', '#FAF8F4');
    const primaryInk = readToken('--text-primary', '#1B1D1B');

    const labels = points.map((p) => formatMonthLabel(p.monthKey, lang));
    const aptData = points.map((p) => Math.round(p.apartmentUsd * rate));
    const houseData = points.map((p) => Math.round(p.houseUsd * rate));
    const isArea = mode === 'area';
    const isStacked = mode === 'stacked';
    const themeChangedOnly = prevThemeRef.current !== theme && chartRef.current !== null;
    prevThemeRef.current = theme;

    if (chartRef.current && themeChangedOnly) {
      const ch = chartRef.current;
      ch.data.datasets[0].backgroundColor = isArea ? `${emerald}26` : emerald;
      ch.data.datasets[0].borderColor = emerald;
      ch.data.datasets[1].backgroundColor = isArea ? `${brass}26` : brass;
      ch.data.datasets[1].borderColor = brass;
      if (ch.options.scales?.x?.ticks) ch.options.scales.x.ticks.color = mutedInk;
      if (ch.options.scales?.y?.ticks) ch.options.scales.y.ticks.color = mutedInk;
      if (ch.options.scales?.y?.grid) ch.options.scales.y.grid.color = gridColor;
      if (ch.options.plugins?.tooltip) {
        ch.options.plugins.tooltip.backgroundColor = surfaceBg;
        ch.options.plugins.tooltip.titleColor = primaryInk;
        ch.options.plugins.tooltip.bodyColor = mutedInk;
        ch.options.plugins.tooltip.borderColor = gridColor;
      }
      // Zero-flash theme transition
      ch.update('none');
      return;
    }

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvas, {
      type: isArea ? 'line' : 'bar',
      data: {
        labels,
        datasets: [
          {
            label: t('properties.apartment'),
            data: aptData,
            backgroundColor: isArea ? `${emerald}26` : emerald,
            borderColor: emerald,
            borderWidth: isArea ? 2.5 : 0,
            borderRadius: isArea ? 0 : 4,
            fill: isArea,
            tension: 0.35,
          },
          {
            label: t('properties.house'),
            data: houseData,
            backgroundColor: isArea ? `${brass}26` : brass,
            borderColor: brass,
            borderWidth: isArea ? 2.5 : 0,
            borderRadius: isArea ? 0 : 4,
            fill: isArea,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            rtl: lang === 'ar',
            backgroundColor: surfaceBg,
            titleColor: primaryInk,
            bodyColor: mutedInk,
            borderColor: gridColor,
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            stacked: isStacked,
            grid: { display: false },
            ticks: { color: mutedInk, font: { size: 12 } },
          },
          y: {
            stacked: isStacked,
            position: lang === 'ar' ? 'right' : 'left',
            grid: { color: gridColor },
            border: { display: false },
            ticks: { color: mutedInk, font: { size: 11 } },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [points, currency, lang, theme, mode, rate, t]);

  return (
    <section data-reveal className="area-chart arch-panel rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <h2 className="font-editorial text-xl text-ink">{t('overview.revenueTitle')}</h2>
          <p className="mt-0.5 text-sm text-ink-muted">{t('overview.revenueSubtitle')}</p>
        </div>
        <div className="inline-flex rounded-lg bg-sunken p-1 text-xs font-medium">
          {(['grouped', 'stacked', 'area'] as ChartMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-md px-2.5 py-1.5 transition-colors ${
                mode === m ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t(`overview.mode${m.charAt(0).toUpperCase()}${m.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-8 gap-y-2 text-sm">
        <div>
          <span className="text-ink-muted">{t('overview.periodTotal')}: </span>
          <bdi className="font-semibold text-ink tabular-nums">
            {formatMoney(periodTotalUsd, currency, lang)}
          </bdi>
        </div>
        {bestPoint && (
          <div>
            <span className="text-ink-muted">{t('overview.bestMonth')}: </span>
            <span className="font-medium text-emeraldArch">
              {formatMonthLabel(bestPoint.monthKey, lang)} (
              <bdi className="tabular-nums">{formatMoney(bestPoint.totalUsd, currency, lang)}</bdi>)
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 h-64 w-full">
        <canvas ref={canvasRef} />
      </div>
    </section>
  );
}
