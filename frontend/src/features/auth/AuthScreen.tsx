import { useEffect, useState } from 'react';
import { ArrowUpRight, Languages, Mail, Moon, ShieldCheck, Smartphone, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LangCode, OtpChannel, ThemeMode, UserProfile } from '../../types/domain';
import { authService } from '../../services/apiClient';
import { COUNTRIES, buildE164 } from './countries';
import { OtpCodeInput } from './OtpCodeInput';

interface Props {
  lang: LangCode;
  theme: ThemeMode;
  onToggleLang: () => void;
  onToggleTheme: () => void;
  onAuthenticated: (user: UserProfile) => void;
}

type AuthTab = 'login' | 'register';
type LoginMethod = 'password' | 'otp';

export function AuthScreen({ lang, theme, onToggleLang, onToggleTheme, onAuthenticated }: Props) {
  const { t } = useTranslation();

  const [tab, setTab] = useState<AuthTab>('register');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [channel, setChannel] = useState<OtpChannel>('SMS');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryIso, setCountryIso] = useState('MR');
  const [localPhone, setLocalPhone] = useState('');
  const [password, setPassword] = useState('');

  // OTP state
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [maskedDest, setMaskedDest] = useState('');
  const [devPreviewCode, setDevPreviewCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedCountry = COUNTRIES.find((c) => c.iso === countryIso) ?? COUNTRIES[0];

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const resetFlow = (nextTab: AuthTab) => {
    setTab(nextTab);
    setOtpStep(false);
    setOtpCode('');
    setDevPreviewCode(null);
    setErrorMsg(null);
  };

  const getOtpDestination = () =>
    channel === 'SMS' ? buildE164(selectedCountry.dial, localPhone) : email.trim().toLowerCase();

  const handleRequestOtp = async () => {
    setErrorMsg(null);
    if (tab === 'register') {
      if (!fullName.trim() || !email.trim() || !localPhone.trim()) {
        setErrorMsg(t('auth.errorRequired'));
        return;
      }
      if (password.length < 8) {
        setErrorMsg(t('auth.errorPasswordShort'));
        return;
      }
    } else if (channel === 'SMS' ? !localPhone.trim() : !email.trim()) {
      setErrorMsg(t('auth.errorRequired'));
      return;
    }

    setLoading(true);
    try {
      const res = await authService.requestOtp({
        channel,
        destination: getOtpDestination(),
        countryCode: selectedCountry.iso,
        purpose: tab === 'register' ? 'REGISTER' : 'LOGIN',
      });
      setMaskedDest(res.maskedDestination);
      setDevPreviewCode(res.devPreviewCode ?? null);
      setCooldown(res.resendCooldownSeconds);
      setOtpStep(true);
      setOtpCode('');
    } catch {
      setErrorMsg(t('auth.errorRequired'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (tab === 'login' && loginMethod === 'password') {
      setLoading(true);
      try {
        const res = await authService.login(email, password);
        onAuthenticated(res.user);
      } catch {
        setErrorMsg(t('auth.errorCredentials'));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!otpStep) {
      await handleRequestOtp();
      return;
    }

    if (otpCode.length !== 6) {
      setErrorMsg(t('auth.errorOtpInvalid'));
      return;
    }

    setLoading(true);
    try {
      const res =
        tab === 'register'
          ? await authService.register({
              fullName,
              email: email.trim().toLowerCase(),
              phoneE164: buildE164(selectedCountry.dial, localPhone),
              countryCode: selectedCountry.iso,
              password,
              verificationChannel: channel,
              otpCode,
            })
          : await authService.loginWithOtp(channel, getOtpDestination(), otpCode);
      onAuthenticated(res.user);
    } catch {
      setErrorMsg(t('auth.errorOtpInvalid'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    try {
      const res = await authService.login('admin@maskan.mr', 'Maskan2026!');
      onAuthenticated(res.user);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-canvas text-ink lg:grid-cols-12">
      {/* Editorial Architectural Showcase Column */}
      <aside className="relative hidden overflow-hidden lg:col-span-5 lg:flex lg:flex-col lg:justify-between p-10">
        <img
          src="/assets/property-02.webp"
          alt="Maskan Architecture"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(17,20,19,0.52) 0%, rgba(19,78,65,0.72) 55%, rgba(17,20,19,0.92) 100%)',
          }}
        />
        <div className="relative z-10 flex items-center justify-between text-[#F0ECE3]">
          <div>
            <p className="font-editorial text-3xl">{t('brand.name')}</p>
            <p className="mt-0.5 text-xs opacity-80">{t('brand.city')}</p>
          </div>
          <span className="rounded-full border border-white/25 px-3 py-1 text-xs backdrop-blur-sm">
            {t('auth.heroTag')}
          </span>
        </div>

        <div className="relative z-10 max-w-md space-y-4 text-[#F0ECE3]">
          <h2 className="font-editorial text-3xl leading-snug">{t('auth.heroTitle')}</h2>
          <p className="text-sm leading-relaxed opacity-85">{t('auth.heroDesc')}</p>
        </div>
      </aside>

      {/* Form Column */}
      <main className="flex flex-col justify-between px-5 py-6 sm:px-10 lg:col-span-7 lg:px-16 lg:py-10">
        <header className="flex items-center justify-between">
          <span className="font-editorial text-2xl text-emeraldArch lg:invisible">{t('brand.name')}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleLang}
              className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-sunken"
            >
              <Languages className="h-3.5 w-3.5" />
              {t('actions.switchLang')}
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={t('actions.toggleTheme')}
              className="rounded-lg border border-hairline bg-surface p-2 text-ink hover:bg-sunken"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <div className="mx-auto my-8 w-full max-w-md">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 rounded-xl bg-sunken p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => resetFlow('register')}
              className={`rounded-lg py-2.5 transition-colors ${
                tab === 'register' ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t('auth.tabRegister')}
            </button>
            <button
              type="button"
              onClick={() => resetFlow('login')}
              className={`rounded-lg py-2.5 transition-colors ${
                tab === 'login' ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t('auth.tabLogin')}
            </button>
          </div>

          <div className="mt-6">
            <h1 className="font-editorial text-2xl sm:text-3xl text-ink">
              {tab === 'register' ? t('auth.tabRegister') : t('auth.tabLogin')}
            </h1>
            <p className="mt-1.5 text-sm text-ink-muted">
              {tab === 'register' ? t('auth.registerSubtitle') : t('auth.loginSubtitle')}
            </p>
          </div>

          {tab === 'login' && !otpStep && (
            <div className="mt-4 flex gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password');
                  setErrorMsg(null);
                }}
                className={`rounded-full px-3.5 py-1.5 border transition-colors ${
                  loginMethod === 'password'
                    ? 'border-emeraldArch bg-emeraldArch-soft text-emeraldArch'
                    : 'border-hairline text-ink-muted hover:text-ink'
                }`}
              >
                {t('auth.methodPassword')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('otp');
                  setErrorMsg(null);
                }}
                className={`rounded-full px-3.5 py-1.5 border transition-colors ${
                  loginMethod === 'otp'
                    ? 'border-emeraldArch bg-emeraldArch-soft text-emeraldArch'
                    : 'border-hairline text-ink-muted hover:text-ink'
                }`}
              >
                {t('auth.methodOtp')}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!otpStep ? (
              <>
                {tab === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-ink-muted">{t('auth.fullName')}</label>
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t('auth.fullNamePlaceholder')}
                      className="mt-1.5 w-full rounded-xl border border-hairline bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-emeraldArch focus:outline-none"
                    />
                  </div>
                )}

                {/* Email input (shown on Register, Password Login, or Email OTP Login) */}
                {(tab === 'register' || loginMethod === 'password' || channel === 'EMAIL') && (
                  <div>
                    <label className="block text-xs font-medium text-ink-muted">{t('auth.email')}</label>
                    <input
                      type="email"
                      required
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.emailPlaceholder')}
                      className="mt-1.5 w-full rounded-xl border border-hairline bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-emeraldArch focus:outline-none"
                    />
                  </div>
                )}

                {/* Country + Phone input (shown on Register or SMS OTP Login) */}
                {(tab === 'register' || (loginMethod === 'otp' && channel === 'SMS')) && (
                  <div>
                    <label className="block text-xs font-medium text-ink-muted">{t('auth.phone')}</label>
                    <div className="mt-1.5 flex gap-2">
                      <select
                        aria-label={t('auth.country')}
                        value={countryIso}
                        onChange={(e) => setCountryIso(e.target.value)}
                        className="w-36 shrink-0 rounded-xl border border-hairline bg-surface px-2.5 py-2.5 text-sm text-ink focus:border-emeraldArch focus:outline-none"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.iso} value={c.iso}>
                            {c.flag} {c.dial} ({lang === 'ar' ? c.nameAr : c.nameFr})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        dir="ltr"
                        value={localPhone}
                        onChange={(e) => setLocalPhone(e.target.value)}
                        placeholder={selectedCountry.placeholder}
                        className="flex-1 rounded-xl border border-hairline bg-surface px-3.5 py-2.5 text-sm text-ink tabular-nums focus:border-emeraldArch focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Password input */}
                {(tab === 'register' || loginMethod === 'password') && (
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-ink-muted">{t('auth.password')}</label>
                      {tab === 'register' && (
                        <span className="text-[11px] text-ink-muted">{t('auth.passwordHint')}</span>
                      )}
                    </div>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-hairline bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-emeraldArch focus:outline-none"
                    />
                  </div>
                )}

                {/* OTP Channel Selector */}
                {(tab === 'register' || loginMethod === 'otp') && (
                  <div className="pt-1">
                    <p className="text-xs font-medium text-ink-muted">{t('auth.verifyVia')}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setChannel('SMS')}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors ${
                          channel === 'SMS'
                            ? 'border-emeraldArch bg-emeraldArch-soft text-emeraldArch'
                            : 'border-hairline bg-surface text-ink-muted hover:text-ink'
                        }`}
                      >
                        <Smartphone className="h-4 w-4" />
                        <span>{t('auth.channelSms')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setChannel('EMAIL')}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors ${
                          channel === 'EMAIL'
                            ? 'border-emeraldArch bg-emeraldArch-soft text-emeraldArch'
                            : 'border-hairline bg-surface text-ink-muted hover:text-ink'
                        }`}
                      >
                        <Mail className="h-4 w-4" />
                        <span>{t('auth.channelEmail')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* OTP 6-Digit Verification Step */
              <div className="space-y-4 rounded-2xl border border-hairline bg-surface p-5">
                <div className="flex items-start gap-3">
                  <span className="rounded-xl bg-emeraldArch-soft p-2.5 text-emeraldArch">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div className="text-sm">
                    <p className="text-ink-muted">{t('auth.otpSentTo')}</p>
                    <bdi dir="ltr" className="mt-0.5 block font-semibold text-ink tabular-nums">
                      {maskedDest}
                    </bdi>
                  </div>
                </div>

                <OtpCodeInput value={otpCode} onChange={setOtpCode} disabled={loading} />

                {devPreviewCode && (
                  <div className="rounded-lg bg-brass-soft px-3 py-2 text-xs text-brass flex items-center justify-between">
                    <span>{t('auth.demoPreviewCode')}</span>
                    <bdi dir="ltr" className="font-bold tracking-widest tabular-nums">
                      {devPreviewCode}
                    </bdi>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setOtpStep(false)}
                    className="text-ink-muted underline hover:text-ink"
                  >
                    {t('auth.changeDetails')}
                  </button>
                  {cooldown > 0 ? (
                    <span className="text-ink-muted tabular-nums">
                      {t('auth.resendIn', { seconds: cooldown })}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      className="font-medium text-emeraldArch hover:underline"
                    >
                      {t('auth.resendNow')}
                    </button>
                  )}
                </div>
              </div>
            )}

            {errorMsg && (
              <p role="alert" className="rounded-xl bg-terracotta-soft px-3.5 py-2.5 text-xs font-medium text-terracotta">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emeraldArch px-5 py-3 text-sm font-semibold text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <span>
                {tab === 'login' && loginMethod === 'password'
                  ? t('auth.loginSubmit')
                  : !otpStep
                    ? t('auth.sendOtp')
                    : tab === 'register'
                      ? t('auth.verifyAndCreate')
                      : t('auth.verifyAndLogin')}
              </span>
              <ArrowUpRight className="directional-icon h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-hairline pt-5 text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-xs font-medium text-ink-muted hover:text-emeraldArch underline-offset-4 hover:underline"
            >
              {t('auth.quickDemo')}
            </button>
          </div>
        </div>

        <footer className="text-center text-xs text-ink-muted">
          © 2026 {t('brand.name')} — {t('brand.city')}
        </footer>
      </main>
    </div>
  );
}
