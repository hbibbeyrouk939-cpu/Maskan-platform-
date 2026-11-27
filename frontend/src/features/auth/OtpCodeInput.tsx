import { useRef } from 'react';

interface Props {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}

export function OtpCodeInput({ value, onChange, disabled }: Props) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '');

  const updateAt = (index: number, char: string) => {
    const clean = char.replace(/[^\d]/g, '');
    if (!clean) {
      const next = digits.map((d, i) => (i === index ? '' : d)).join('');
      onChange(next);
      return;
    }
    if (clean.length > 1) {
      const sliced = clean.slice(0, 6);
      onChange(sliced);
      inputsRef.current[Math.min(sliced.length - 1, 5)]?.focus();
      return;
    }
    const next = digits.map((d, i) => (i === index ? clean : d)).join('');
    onChange(next);
    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  return (
    <div dir="ltr" className="grid grid-cols-6 gap-2 sm:gap-2.5">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputsRef.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={idx === 0 ? 'one-time-code' : 'off'}
          maxLength={6}
          disabled={disabled}
          value={digit}
          onChange={(e) => updateAt(idx, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digit && idx > 0) {
              inputsRef.current[idx - 1]?.focus();
            }
          }}
          aria-label={`OTP digit ${idx + 1}`}
          className="h-12 sm:h-14 w-full rounded-xl border border-hairline bg-canvas text-center text-lg sm:text-xl font-semibold text-ink tabular-nums transition-colors focus:border-emeraldArch focus:outline-none focus:ring-2 focus:ring-emeraldArch/20"
        />
      ))}
    </div>
  );
}
