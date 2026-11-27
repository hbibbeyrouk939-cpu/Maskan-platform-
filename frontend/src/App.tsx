import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CalendarDays,
  ClipboardList,
  Languages,
  LayoutGrid,
  LogOut,
  Moon,
  Sun,
  Wallet,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type {
  BookingItem,
  BookingStatus,
  CurrencyCode,
  LangCode,
  PropertyItem,
  ThemeMode,
  ToastItem,
  UserProfile,
  ViewKey,
} from './types/domain';
import { HISTORICAL_MONTHLY_BASE, SEED_BOOKINGS, SEED_PROPERTIES } from './services/demoFallback';
import { authService, maskanService } from './services/apiClient';
import { diffNights } from './utils/formatters';
import { runWithViewTransition, useLenisSmoothScroll, useOrchestratedEntrance } from './hooks/useMotion';
import { AuthScreen } from './features/auth/AuthScreen';
import { OverviewView } from './features/overview/OverviewView';
import { PropertiesView } from './features/properties/PropertiesView';
import { BookingsView } from './features/bookings/BookingsView';
import { CalendarView } from './features/calendar/CalendarView';
import { FinancialsView } from './features/financials/FinancialsView';
import { BookingModal } from './features/bookings/BookingModal';
import { ToastUndoBar } from './components/layout/ToastUndoBar';

export default function App() {
  const { t, i18n } = useTranslation();
  useLenisSmoothScroll();

  const [user, setUser] = useState<UserProfile | null>(() => authService.getStoredUser());
  const [view, setView] = useState<ViewKey>('overview');
  const [lang, setLang] = useState<LangCode>(() => (localStorage.getItem('maskan_lang') === 'fr' ? 'fr' : 'ar'));
  const [theme, setTheme] = useState<ThemeMode>(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'));
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('maskan_currency');
    return saved === 'EUR' || saved === 'MRU' ? saved : 'USD';
  });

  const [properties, setProperties] = useState<PropertyItem[]>(SEED_PROPERTIES);
  const [bookings, setBookings] = useState<BookingItem[]>(SEED_BOOKINGS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const revealRef = useOrchestratedEntrance(`${user?.id ?? 'anon'}-${view}`);

  useEffect(() => {
    if (!user) return;
    maskanService.listProperties().then(setProperties);
    maskanService.listBookings().then(setBookings);
  }, [user]);

  const pushToast = useCallback((message: string, tone: ToastItem['tone'], onUndo?: () => void) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, tone, onUndo }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, onUndo ? 5500 : 3200);
  }, []);

  const toggleLanguage = () => {
    const next: LangCode = lang === 'ar' ? 'fr' : 'ar';
    runWithViewTransition(() => {
      setLang(next);
      i18n.changeLanguage(next);
      document.documentElement.lang = next;
      document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
      localStorage.setItem('maskan_lang', next);
    });
    if (user) maskanService.savePreferences({ preferredLang: next });
  };

  const toggleTheme = () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('maskan_theme', next);
    if (user) maskanService.savePreferences({ preferredTheme: next });
  };

  const changeCurrency = (next: CurrencyCode) => {
    setCurrency(next);
    localStorage.setItem('maskan_currency', next);
    if (user) maskanService.savePreferences({ preferredCurrency: next });
  };

  const handleSignOut = () => {
    authService.logout();
    setUser(null);
  };

  const monthlyPoints = useMemo(() => {
    const eligible = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
    const novApt = eligible
      .filter((b) => properties.find((p) => p.id === b.propertyId)?.type === 'APARTMENT')
      .reduce((s, b) => s + b.totalUsd, 0);
    const novHouse = eligible
      .filter((b) => properties.find((p) => p.id === b.propertyId)?.type === 'HOUSE')
      .reduce((s, b) => s + b.totalUsd, 0);
    return [...HISTORICAL_MONTHLY_BASE, { monthKey: '2026-11', apartmentUsd: novApt, houseUsd: novHouse, totalUsd: novApt + novHouse }];
  }, [bookings, properties]);

  if (!user) {
    return (
      <AuthScreen
        lang={lang}
        theme={theme}
        onToggleLang={toggleLanguage}
        onToggleTheme={toggleTheme}
        onAuthenticated={setUser}
      />
    );
  }

  const transitionBookingStatus = (booking: BookingItem, nextStatus: BookingStatus) => {
    const previousStatus = booking.status;
    setBookings((prev) =>
      prev.map((item) => (item.id === booking.id ? { ...item, status: nextStatus, previousStatus } : item)),
    );
    maskanService.updateBookingStatus(booking.id, nextStatus);

    const msgKey = nextStatus === 'CONFIRMED' ? 'toast.approved' : 'toast.rejected';
    pushToast(t(msgKey, { code: booking.bookingCode }), nextStatus === 'CONFIRMED' ? 'emerald' : 'terracotta', () => {
      setBookings((prev) =>
        prev.map((item) => (item.id === booking.id ? { ...item, status: previousStatus, previousStatus: null } : item)),
      );
      maskanService.undoBookingStatus(booking.id);
      pushToast(t('toast.undone', { code: booking.bookingCode }), 'brass');
    });
  };

  const handleCreateBooking = (payload: {
    propertyId: string;
    guestName: string;
    guestPhone: string;
    checkIn: string;
    checkOut: string;
  }) => {
    const overlap = bookings.some(
      (b) =>
        b.propertyId === payload.propertyId &&
        (b.status === 'CONFIRMED' || b.status === 'PENDING') &&
        b.checkIn < payload.checkOut &&
        b.checkOut > payload.checkIn,
    );
    if (overlap) {
      pushToast(t('toast.conflictError'), 'terracotta');
      return;
    }

    const prop = properties.find((p) => p.id === payload.propertyId);
    if (!prop) return;
    const nights = diffNights(payload.checkIn, payload.checkOut);
    const code = `BK-${407 + bookings.length}`;
    const localBooking: BookingItem = {
      id: `local-${Date.now()}`,
      bookingCode: code,
      propertyId: prop.id,
      propertyCode: prop.code,
      propertyNameAr: prop.nameAr,
      propertyNameFr: prop.nameFr,
      guestName: payload.guestName,
      guestPhone: payload.guestPhone,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      nights,
      totalUsd: nights * prop.pricePerNightUsd,
      status: 'PENDING',
    };

    setBookings((prev) => [localBooking, ...prev]);
    setBookingModalOpen(false);
    pushToast(t('toast.bookingCreated', { code }), 'emerald');
    maskanService.createBooking(payload).catch(() => {});
  };

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;

  const navItems: Array<{ key: ViewKey; label: string; icon: typeof LayoutGrid; badge?: number }> = [
    { key: 'overview', label: t('nav.overview'), icon: LayoutGrid },
    { key: 'properties', label: t('nav.properties'), icon: Building2 },
    { key: 'bookings', label: t('nav.bookings'), icon: ClipboardList, badge: pendingCount },
    { key: 'calendar', label: t('nav.calendar'), icon: CalendarDays },
    { key: 'financials', label: t('nav.financials'), icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Desktop Sidebar */}
      <aside
        className="fixed top-0 bottom-0 hidden w-64 flex-col justify-between border-hairline bg-surface p-5 lg:flex"
        style={{ insetInlineStart: 0, borderInlineEndWidth: '1px' }}
      >
        <div>
          <div className="border-b border-hairline pb-5">
            <p className="font-editorial text-2xl text-emeraldArch">{t('brand.name')}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{t('brand.subtitle')}</p>
          </div>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => runWithViewTransition(() => setView(item.key))}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? 'bg-emeraldArch-soft text-emeraldArch' : 'text-ink-muted hover:bg-sunken hover:text-ink'
                  }`}
                >
                  <span className="inline-flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className="rounded-full bg-brass px-2 py-0.5 text-[11px] font-semibold text-canvas tabular-nums">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 border-t border-hairline pt-4">
          <div className="flex items-center justify-between gap-2 rounded-lg bg-canvas px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink">{user.fullName}</p>
              <p className="truncate text-[11px] text-ink-muted">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              title={t('actions.signOut')}
              className="rounded-md p-1.5 text-ink-muted hover:bg-sunken hover:text-terracotta"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-sunken p-1 text-xs font-medium">
            {(['USD', 'EUR', 'MRU'] as CurrencyCode[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => changeCurrency(c)}
                className={`flex-1 rounded-md py-1.5 transition-colors ${
                  currency === c ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-hairline bg-canvas px-3 py-2 text-xs font-medium text-ink hover:bg-sunken"
            >
              <Languages className="h-3.5 w-3.5" />
              {t('actions.switchLang')}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t('actions.toggleTheme')}
              className="inline-flex items-center justify-center rounded-lg border border-hairline bg-canvas p-2 text-ink hover:bg-sunken"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-hairline bg-surface/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <span className="font-editorial text-xl text-emeraldArch">{t('brand.name')}</span>
        <div className="flex items-center gap-1.5">
          <select
            value={currency}
            onChange={(e) => changeCurrency(e.target.value as CurrencyCode)}
            className="rounded-md border border-hairline bg-canvas px-2 py-1 text-xs font-medium text-ink"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="MRU">MRU</option>
          </select>
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-md border border-hairline bg-canvas px-2 py-1 text-xs font-medium text-ink"
          >
            {t('actions.switchLang')}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t('actions.toggleTheme')}
            className="rounded-md border border-hairline bg-canvas p-1.5 text-ink"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label={t('actions.signOut')}
            className="rounded-md border border-hairline bg-canvas p-1.5 text-terracotta"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main
        ref={revealRef}
        className="mx-auto max-w-6xl px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:py-8 lg:ms-64"
      >
        {view === 'overview' && (
          <OverviewView
            properties={properties}
            bookings={bookings}
            monthlyPoints={monthlyPoints}
            currency={currency}
            lang={lang}
            theme={theme}
            onApprove={(b) => transitionBookingStatus(b, 'CONFIRMED')}
            onReject={(b) => transitionBookingStatus(b, 'CANCELLED')}
            onNewBooking={() => setBookingModalOpen(true)}
          />
        )}
        {view === 'properties' && <PropertiesView properties={properties} currency={currency} lang={lang} />}
        {view === 'bookings' && (
          <BookingsView
            bookings={bookings}
            currency={currency}
            lang={lang}
            onApprove={(b) => transitionBookingStatus(b, 'CONFIRMED')}
            onReject={(b) => transitionBookingStatus(b, 'CANCELLED')}
          />
        )}
        {view === 'calendar' && (
          <CalendarView properties={properties} bookings={bookings} currency={currency} lang={lang} />
        )}
        {view === 'financials' && (
          <FinancialsView properties={properties} bookings={bookings} currency={currency} lang={lang} />
        )}
      </main>

      {/* Mobile Safe-Area Bottom Navigation */}
      <nav className="mobile-safe-nav fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-hairline bg-surface/95 px-2 pt-2 backdrop-blur-md lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = view === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => runWithViewTransition(() => setView(item.key))}
              className={`flex flex-col items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium ${
                active ? 'text-emeraldArch' : 'text-ink-muted'
              }`}
            >
              <span className="relative inline-flex">
                <Icon className="h-5 w-5" />
                {item.badge ? (
                  <span
                    className="absolute -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brass px-1 text-[10px] font-bold text-canvas tabular-nums"
                    style={{ insetInlineEnd: '-0.45rem' }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </span>
              <span className="truncate max-w-[64px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <BookingModal
        open={bookingModalOpen}
        properties={properties}
        currency={currency}
        lang={lang}
        onClose={() => setBookingModalOpen(false)}
        onSubmit={handleCreateBooking}
      />

      <ToastUndoBar toasts={toasts} />
    </div>
  );
}
