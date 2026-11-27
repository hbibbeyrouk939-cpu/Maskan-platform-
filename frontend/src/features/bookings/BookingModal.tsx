import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CurrencyCode, LangCode, PropertyItem } from '../../types/domain';
import { diffNights, formatMoney, formatNights } from '../../utils/formatters';

interface Props {
  open: boolean;
  properties: PropertyItem[];
  currency: CurrencyCode;
  lang: LangCode;
  onClose: () => void;
  onSubmit: (data: {
    propertyId: string;
    guestName: string;
    guestPhone: string;
    checkIn: string;
    checkOut: string;
  }) => void;
}

export function BookingModal({ open, properties, currency, lang, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? '');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('+222 ');
  const [checkIn, setCheckIn] = useState('2026-12-03');
  const [checkOut, setCheckOut] = useState('2026-12-06');

  if (!open) return null;

  const selectedProp = properties.find((p) => p.id === propertyId) ?? properties[0];
  const nights = diffNights(checkIn, checkOut);
  const estTotalUsd = selectedProp ? nights * selectedProp.pricePerNightUsd : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <div className="sheet-max-h w-full overflow-y-auto rounded-t-2xl border border-hairline bg-surface p-6 sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <h2 className="font-editorial text-xl text-ink">{t('modal.newBookingTitle')}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-ink-muted hover:bg-sunken">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedProp || nights <= 0 || !guestName.trim()) return;
            onSubmit({ propertyId: selectedProp.id, guestName, guestPhone, checkIn, checkOut });
          }}
        >
          <div>
            <label className="block text-xs font-medium text-ink-muted">{t('modal.property')}</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-hairline bg-canvas px-3 py-2.5 text-sm text-ink"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {lang === 'ar' ? p.nameAr : p.nameFr}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-ink-muted">{t('modal.guestName')}</label>
              <input
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-hairline bg-canvas px-3 py-2.5 text-sm text-ink"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted">{t('modal.guestPhone')}</label>
              <input
                required
                dir="ltr"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-hairline bg-canvas px-3 py-2.5 text-sm text-ink tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-muted">{t('modal.checkIn')}</label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-hairline bg-canvas px-3 py-2.5 text-sm text-ink tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted">{t('modal.checkOut')}</label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-hairline bg-canvas px-3 py-2.5 text-sm text-ink tabular-nums"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-sunken/70 px-4 py-3 text-sm">
            <span className="text-ink-muted">
              {t('modal.estimatedTotal')} ({formatNights(nights, lang)})
            </span>
            <bdi className="font-semibold text-emeraldArch tabular-nums">
              {formatMoney(estTotalUsd, currency, lang)}
            </bdi>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-hairline px-4 py-2.5 text-sm text-ink-muted hover:bg-sunken"
            >
              {t('actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={nights <= 0}
              className="rounded-lg bg-emeraldArch px-5 py-2.5 text-sm font-medium text-canvas hover:opacity-90 disabled:opacity-40"
            >
              {t('modal.submitBooking')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
