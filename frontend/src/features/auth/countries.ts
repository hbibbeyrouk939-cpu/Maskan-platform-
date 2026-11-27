export interface CountryOption {
  iso: string;
  dial: string;
  flag: string;
  nameAr: string;
  nameFr: string;
  placeholder: string;
}

export const COUNTRIES: CountryOption[] = [
  { iso: 'MR', dial: '+222', flag: '🇲🇷', nameAr: 'موريتانيا', nameFr: 'Mauritanie', placeholder: '36 44 12 09' },
  { iso: 'MA', dial: '+212', flag: '🇲🇦', nameAr: 'المغرب', nameFr: 'Maroc', placeholder: '661 30 92 14' },
  { iso: 'DZ', dial: '+213', flag: '🇩🇿', nameAr: 'الجزائر', nameFr: 'Algérie', placeholder: '550 12 34 56' },
  { iso: 'TN', dial: '+216', flag: '🇹🇳', nameAr: 'تونس', nameFr: 'Tunisie', placeholder: '22 345 678' },
  { iso: 'SA', dial: '+966', flag: '🇸🇦', nameAr: 'السعودية', nameFr: 'Arabie saoudite', placeholder: '55 210 8841' },
  { iso: 'AE', dial: '+971', flag: '🇦🇪', nameAr: 'الإمارات', nameFr: 'Émirats arabes unis', placeholder: '50 123 4567' },
  { iso: 'QA', dial: '+974', flag: '🇶🇦', nameAr: 'قطر', nameFr: 'Qatar', placeholder: '5512 3456' },
  { iso: 'KW', dial: '+965', flag: '🇰🇼', nameAr: 'الكويت', nameFr: 'Koweït', placeholder: '5123 4567' },
  { iso: 'EG', dial: '+20', flag: '🇪🇬', nameAr: 'مصر', nameFr: 'Égypte', placeholder: '10 1234 5678' },
  { iso: 'JO', dial: '+962', flag: '🇯🇴', nameAr: 'الأردن', nameFr: 'Jordanie', placeholder: '79 123 4567' },
  { iso: 'SN', dial: '+221', flag: '🇸🇳', nameAr: 'السنغال', nameFr: 'Sénégal', placeholder: '77 123 45 67' },
  { iso: 'FR', dial: '+33', flag: '🇫🇷', nameAr: 'فرنسا', nameFr: 'France', placeholder: '6 12 34 56 78' },
  { iso: 'ES', dial: '+34', flag: '🇪🇸', nameAr: 'إسبانيا', nameFr: 'Espagne', placeholder: '612 345 678' },
  { iso: 'GB', dial: '+44', flag: '🇬🇧', nameAr: 'المملكة المتحدة', nameFr: 'Royaume-Uni', placeholder: '7700 900123' },
  { iso: 'US', dial: '+1', flag: '🇺🇸', nameAr: 'الولايات المتحدة', nameFr: 'États-Unis', placeholder: '415 555 0199' },
];

export function buildE164(dial: string, localNumber: string): string {
  const cleaned = localNumber.replace(/[^\d]/g, '').replace(/^0+/, '');
  return `${dial}${cleaned}`;
}
