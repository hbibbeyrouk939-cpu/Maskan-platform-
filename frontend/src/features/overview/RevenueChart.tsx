import { useEffect, useRef, useState } from 'react';
import {
  Chart,
  LineController,
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
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
);

interface Props {
  points: MonthlyRevenuePoint[];
  currency: CurrencyCode;
  lang: LangCode;
  theme: ThemeMode;
}

function readToken(name: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function makeVerticalGradient(ctx: CanvasRenderingContext2D, color: string, alphaHexTop: string) {
  const grad = ctx.createLinearGradient(0, 0, 0, 240);
  grad.addColorStop(0, color.startsWith('#') ? `${color}${alphaHexTop}` : 'rgba(56,163,137,0.22)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  return grad;
}

export function RevenueChart({ points, currency, lang, theme }: Props) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const prevThemeRef = useRef<ThemeMode>(theme);
  const [showApt, setShowApt] = useState(true);
  const [showHouse, setShowHouse] = useState(true);

  const rate = DEFAULT_RATES[currency]?.rateToUsd ?? 1;
  const filteredTotals = points.map(
    (p) => (showApt ? p.apartmentUsd : 0) + (showHouse ? p.houseUsd : 0),
  );
  const periodTotalUsd = filteredTotals.reduce((acc, v) => acc + v, 0);
  const bestIdx = filteredTotals.reduce((best, v, idx) => (v > filteredTotals[best] ? idx : best), 0);
  const bestPoint = points[bestIdx];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const emerald = readToken('--accent-emerald', '#134E41');
    const brass = readToken('--accent-brass', '#9A6B2F');
    const mutedInk = readToken('--text-secondary', '#525750');
    const gridColor = readToken('--border-hairline', 'rgba(27,29,27,0.10)');
    const surfaceBg = readToken('--bg-surface', '#FAF8F4');
    const primaryInk = readToken('--text-primary', '#1B1D1B');

    const labels = points.map((p) => formatMonthLabel(p.monthKey, lang));
    const aptData = points.map((p) => Math.round(p.apartmentUsd * rate));
    const houseData = points.map((p) => Math.round(p.houseUsd * rate));
    const themeChangedOnly = prevThemeRef.current !== theme && chartRef.current !== null;
    prevThemeRef.current = theme;

    const emeraldFill = makeVerticalGradient(ctx2d, emerald, '38');
    const brassFill = makeVerticalGradient(ctx2d, brass, '30');

    if (chartRef.current && themeChangedOnly) {
      const ch = chartRef.current;
      ch.data.datasets[0].backgroundColor = emeraldFill;
      ch.data.datasets[0].borderColor = emerald;
      ch.data.datasets[1].backgroundColor = brassFill;
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
      ch.update('none');
      return;
    }

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: t('properties.apartment'),
            data: aptData,
            hidden: !showApt,
            backgroundColor: emeraldFill,
            borderColor: emerald,
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: emerald,
            fill: true,
            tension: 0.42,
          },
          {
            label: t('properties.house'),
            data: houseData,
            hidden: !showHouse,
            backgroundColor: brassFill,
            borderColor: brass,
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: brass,
            fill: true,
            tension: 0.42,
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
            cornerRadius: 10,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: mutedInk, font: { size: 12 } },
          },
          y: {
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
  }, [points, currency, lang, theme, rate, showApt, showHouse, t]);

  return (
    <section data-reveal className="area-chart min-w-0 arch-panel rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <h2 className="font-editorial text-xl text-ink">{t('overview.revenueTitle')}</h2>
          <p className="mt-0.5 text-sm text-ink-muted">{t('overview.revenueSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => setShowApt((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 transition-opacity ${
              showApt ? 'border-emeraldArch/40 bg-emeraldArch-soft text-emeraldArch' : 'border-hairline text-ink-muted opacity-50'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emeraldArch" />
            {t('properties.apartment')}
          </button>
          <button
            type="button"
            onClick={() => setShowHouse((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 transition-opacity ${
              showHouse ? 'border-brass/40 bg-brass-soft text-brass' : 'border-hairline text-ink-muted opacity-50'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-brass" />
            {t('properties.house')}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm">
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
              <bdi className="tabular-nums">{formatMoney(filteredTotals[bestIdx], currency, lang)}</bdi>)
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 h-60 w-full">
        <canvas ref={canvasRef} />
      </div>
    </section>
  );
}
