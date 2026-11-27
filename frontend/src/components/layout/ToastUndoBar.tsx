import { useTranslation } from 'react-i18next';
import type { ToastItem } from '../../types/domain';

interface Props {
  toasts: ToastItem[];
}

export function ToastUndoBar({ toasts }: Props) {
  const { t } = useTranslation();
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 lg:bottom-6 z-50 flex flex-col gap-2"
      style={{ insetInlineEnd: '1.25rem' }}
      role="status"
      aria-live="polite"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          className="arch-glass flex items-center gap-4 rounded-xl px-4 py-3 text-sm shadow-lg"
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              item.tone === 'terracotta'
                ? 'bg-terracotta'
                : item.tone === 'brass'
                  ? 'bg-brass'
                  : 'bg-emeraldArch'
            }`}
          />
          <span className="text-ink">{item.message}</span>
          {item.onUndo && (
            <button
              type="button"
              onClick={item.onUndo}
              className="rounded-md bg-emeraldArch-soft px-2.5 py-1 text-xs font-semibold text-emeraldArch hover:opacity-85"
            >
              {t('actions.undo')}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
