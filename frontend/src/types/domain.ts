export type LangCode = 'ar' | 'fr';
export type ThemeMode = 'light' | 'dark';
export type CurrencyCode = 'USD' | 'EUR' | 'MRU';
export type ViewKey = 'overview' | 'properties' | 'bookings' | 'calendar' | 'financials';
export type OtpChannel = 'SMS' | 'EMAIL';
export type OtpPurpose = 'REGISTER' | 'LOGIN';

export type PropertyType = 'APARTMENT' | 'HOUSE';
export type PropertyStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface UserProfile {
  id: string;
  email: string;
  phoneE164?: string;
  countryCode: string;
  fullName: string;
  role: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  preferredLang: LangCode;
  preferredTheme: ThemeMode;
  preferredCurrency: CurrencyCode;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresInMs: number;
  user: UserProfile;
}

export interface RequestOtpResponse {
  maskedDestination: string;
  channel: OtpChannel;
  expiresInSeconds: number;
  resendCooldownSeconds: number;
  devPreviewCode?: string | null;
}

export interface PropertyItem {
  id: string;
  code: string;
  nameAr: string;
  nameFr: string;
  type: PropertyType;
  districtAr: string;
  districtFr: string;
  rooms: number;
  areaSqm: number;
  pricePerNightUsd: number;
  status: PropertyStatus;
  imageKey: string;
  imageUrl: string;
}

export interface BookingItem {
  id: string;
  bookingCode: string;
  propertyId: string;
  propertyCode: string;
  propertyNameAr: string;
  propertyNameFr: string;
  guestName: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalUsd: number;
  status: BookingStatus;
  previousStatus?: BookingStatus | null;
  notes?: string;
}

export interface ExchangeRateItem {
  code: CurrencyCode;
  nameAr: string;
  nameFr: string;
  symbolAr: string;
  symbolFr: string;
  rateToUsd: number;
  prefix: boolean;
}

export interface MonthlyRevenuePoint {
  monthKey: string;
  apartmentUsd: number;
  houseUsd: number;
  totalUsd: number;
}

export interface ToastItem {
  id: string;
  message: string;
  tone: 'emerald' | 'terracotta' | 'brass';
  onUndo?: () => void;
}
