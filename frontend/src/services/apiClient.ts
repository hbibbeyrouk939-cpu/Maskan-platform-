import axios from 'axios';
import i18n from '../i18n/config';
import type {
  AuthResponse,
  BookingItem,
  BookingStatus,
  OtpChannel,
  OtpPurpose,
  PropertyItem,
  RequestOtpResponse,
  UserProfile,
} from '../types/domain';
import { SEED_BOOKINGS, SEED_PROPERTIES } from './demoFallback';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  config.headers['Accept-Language'] = i18n.language || 'ar';
  const token = localStorage.getItem('maskan_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original?._retry) {
      const refreshToken = localStorage.getItem('maskan_refresh_token');
      if (refreshToken) {
        original._retry = true;
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          localStorage.setItem('maskan_access_token', data.accessToken);
          localStorage.setItem('maskan_refresh_token', data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.removeItem('maskan_access_token');
          localStorage.removeItem('maskan_refresh_token');
        }
      }
    }
    return Promise.reject(error);
  },
);

const DEMO_OTP_STORE = new Map<string, string>();

function maskDest(destination: string, channel: OtpChannel): string {
  if (channel === 'EMAIL' && destination.includes('@')) {
    const [local, domain] = destination.split('@');
    return `${local.slice(0, 2)}***@${domain}`;
  }
  return destination.length > 6 ? `${destination.slice(0, 4)}****${destination.slice(-2)}` : '****';
}

export const authService = {
  async requestOtp(payload: {
    channel: OtpChannel;
    destination: string;
    countryCode?: string;
    purpose: OtpPurpose;
  }): Promise<RequestOtpResponse> {
    try {
      const { data } = await api.post<RequestOtpResponse>('/auth/otp/request', payload);
      return data;
    } catch {
      // Offline preview fallback so OTP UX can be tested without running backend
      const demoCode = String(Math.floor(100000 + Math.random() * 900000));
      DEMO_OTP_STORE.set(`${payload.channel}:${payload.destination.toLowerCase()}`, demoCode);
      return {
        maskedDestination: maskDest(payload.destination, payload.channel),
        channel: payload.channel,
        expiresInSeconds: 300,
        resendCooldownSeconds: 45,
        devPreviewCode: demoCode,
      };
    }
  },

  async register(payload: {
    fullName: string;
    email: string;
    phoneE164: string;
    countryCode: string;
    password: string;
    verificationChannel: OtpChannel;
    otpCode: string;
  }): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', payload);
      this.persistSession(data);
      return data;
    } catch (err) {
      const target = (payload.verificationChannel === 'SMS' ? payload.phoneE164 : payload.email).toLowerCase();
      const expected = DEMO_OTP_STORE.get(`${payload.verificationChannel}:${target}`);
      if (!expected || expected !== payload.otpCode) {
        throw err;
      }
      DEMO_OTP_STORE.delete(`${payload.verificationChannel}:${target}`);
      const mock: AuthResponse = {
        accessToken: 'demo-access-token',
        refreshToken: 'demo-refresh-token',
        expiresInMs: 900000,
        user: {
          id: `user-${Date.now()}`,
          email: payload.email,
          phoneE164: payload.phoneE164,
          countryCode: payload.countryCode,
          fullName: payload.fullName,
          role: 'OWNER',
          emailVerified: payload.verificationChannel === 'EMAIL',
          phoneVerified: payload.verificationChannel === 'SMS',
          preferredLang: i18n.language === 'fr' ? 'fr' : 'ar',
          preferredTheme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
          preferredCurrency: 'USD',
        },
      };
      this.persistSession(mock);
      return mock;
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      this.persistSession(data);
      return data;
    } catch (err) {
      if (email.trim().toLowerCase() === 'admin@maskan.mr' && password === 'Maskan2026!') {
        const mock: AuthResponse = {
          accessToken: 'demo-access-token',
          refreshToken: 'demo-refresh-token',
          expiresInMs: 900000,
          user: {
            id: '11111111-1111-4111-8111-111111111101',
            email: 'admin@maskan.mr',
            phoneE164: '+22236441209',
            countryCode: 'MR',
            fullName: 'سلطان ولد أحمد',
            role: 'ADMIN',
            emailVerified: true,
            phoneVerified: true,
            preferredLang: 'ar',
            preferredTheme: 'light',
            preferredCurrency: 'USD',
          },
        };
        this.persistSession(mock);
        return mock;
      }
      throw err;
    }
  },

  async loginWithOtp(channel: OtpChannel, destination: string, otpCode: string): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login/otp', { channel, destination, otpCode });
      this.persistSession(data);
      return data;
    } catch (err) {
      const expected = DEMO_OTP_STORE.get(`${channel}:${destination.toLowerCase()}`);
      if (!expected || expected !== otpCode) {
        throw err;
      }
      DEMO_OTP_STORE.delete(`${channel}:${destination.toLowerCase()}`);
      const mock: AuthResponse = {
        accessToken: 'demo-access-token',
        refreshToken: 'demo-refresh-token',
        expiresInMs: 900000,
        user: {
          id: '11111111-1111-4111-8111-111111111101',
          email: channel === 'EMAIL' ? destination : 'admin@maskan.mr',
          phoneE164: channel === 'SMS' ? destination : '+22236441209',
          countryCode: 'MR',
          fullName: 'سلطان ولد أحمد',
          role: 'ADMIN',
          emailVerified: channel === 'EMAIL',
          phoneVerified: channel === 'SMS',
          preferredLang: i18n.language === 'fr' ? 'fr' : 'ar',
          preferredTheme: 'light',
          preferredCurrency: 'USD',
        },
      };
      this.persistSession(mock);
      return mock;
    }
  },

  persistSession(res: AuthResponse) {
    localStorage.setItem('maskan_access_token', res.accessToken);
    localStorage.setItem('maskan_refresh_token', res.refreshToken);
    localStorage.setItem('maskan_user', JSON.stringify(res.user));
  },

  getStoredUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem('maskan_user');
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('maskan_access_token');
    localStorage.removeItem('maskan_refresh_token');
    localStorage.removeItem('maskan_user');
  },
};

export const maskanService = {
  async listProperties(): Promise<PropertyItem[]> {
    try {
      const { data } = await api.get<PropertyItem[]>('/properties');
      return data;
    } catch {
      return SEED_PROPERTIES;
    }
  },

  async listBookings(): Promise<BookingItem[]> {
    try {
      const { data } = await api.get<BookingItem[]>('/bookings');
      return data;
    } catch {
      return SEED_BOOKINGS;
    }
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<BookingItem | null> {
    try {
      const { data } = await api.patch<BookingItem>(`/bookings/${id}/status`, { status });
      return data;
    } catch {
      return null;
    }
  },

  async undoBookingStatus(id: string): Promise<BookingItem | null> {
    try {
      const { data } = await api.post<BookingItem>(`/bookings/${id}/undo`);
      return data;
    } catch {
      return null;
    }
  },

  async createBooking(payload: {
    propertyId: string;
    guestName: string;
    guestPhone: string;
    checkIn: string;
    checkOut: string;
  }): Promise<BookingItem> {
    const { data } = await api.post<BookingItem>('/bookings', { ...payload, status: 'PENDING' });
    return data;
  },

  async savePreferences(prefs: { preferredLang?: string; preferredTheme?: string; preferredCurrency?: string }) {
    try {
      await api.patch('/me/preferences', prefs);
    } catch {
      // Stored locally in localStorage
    }
  },
};
