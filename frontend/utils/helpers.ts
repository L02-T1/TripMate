import { TripStatus } from '../types';

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Parse a DD/MM/YYYY string to a Date object.
 * Returns Invalid Date if the format is wrong.
 */
export function parseDMY(dateStr: string): Date {
  if (!dateStr || dateStr.length < 10) return new Date(NaN);
  const parts = dateStr.split('/');
  if (parts.length !== 3) return new Date(NaN);
  const [d, m, y] = parts.map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Format a Date object to DD/MM/YYYY string.
 */
export function formatDMY(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Returns days until a DD/MM/YYYY date from today.
 * Negative = past, 0 = today, positive = future.
 */
export function daysUntil(dateStr: string): number {
  const target = parseDMY(dateStr);
  if (isNaN(target.getTime())) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/**
 * Compute the trip status based on start and end dates.
 */
export function computeTripStatus(startDate: string, endDate: string): TripStatus {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = parseDMY(startDate);
  const end = parseDMY(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'UPCOMING';

  if (now < start) return 'UPCOMING';
  if (now > end) return 'DONE';
  return 'ONGOING';
}

/**
 * Format a Vietnamese date label, e.g. "Thứ 2, 28/06/2025"
 */
export function fmtDateLabel(dateStr: string): string {
  const d = parseDMY(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return `${days[d.getDay()]}, ${dateStr}`;
}

// ─── Money helpers ────────────────────────────────────────────────────────────

/**
 * Format a number as Vietnamese Dong, e.g. 1,200,000 đ
 */
export function fmtVND(amount: number): string {
  return Math.abs(amount).toLocaleString('vi-VN') + ' đ';
}

/**
 * Compact format for large numbers, e.g. 1.2M đ
 */
export function fmtVNDCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) return `${(abs / 1_000_000_000).toFixed(1)}B đ`;
  if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(1)}M đ`;
  if (abs >= 1_000) return `${(abs / 1_000).toFixed(0)}K đ`;
  return `${abs} đ`;
}

// ─── String helpers ───────────────────────────────────────────────────────────

export function getInitials(name: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(w => w[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Normalize a Vietnamese phone number to +84 format.
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('84')) return `+${digits}`;
  if (digits.startsWith('0')) return `+84${digits.slice(1)}`;
  return `+84${digits}`;
}

// ─── Image helpers ────────────────────────────────────────────────────────────

const DESTINATION_IMAGES: Record<string, string> = {
  'đà lạt':   'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80',
  'phú quốc': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80',
  'hội an':   'https://images.unsplash.com/photo-1553984840-b8cbc34f5215?w=600&q=80',
  'huế':      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  'sa pa':    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  'hà nội':   'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=600&q=80',
  'nha trang':'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  'đà nẵng':  'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=80',
  'hạ long':  'https://images.unsplash.com/photo-1573537561839-c779b13d7cfa?w=600&q=80',
  'mũi né':   'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
  'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600&q=80',
];

export function getTripImage(destinations: string[]): string {
  for (const dest of destinations) {
    const key = dest.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    // Simple matching
    for (const [k, url] of Object.entries(DESTINATION_IMAGES)) {
      if (dest.toLowerCase().includes(k.split(' ')[0]) || k.includes(dest.toLowerCase().split(' ')[0])) {
        return url;
      }
    }
  }
  const seed = destinations.join('').length % FALLBACK_IMAGES.length;
  return FALLBACK_IMAGES[seed];
}

// ─── Validation helpers ───────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 12;
}

export function isValidPassword(pwd: string): boolean {
  return pwd.length >= 6;
}

export function isStrongPassword(pwd: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd);
}

export function isValidDateDMY(str: string): boolean {
  if (!str || str.length !== 10) return false;
  const d = parseDMY(str);
  return !isNaN(d.getTime());
}

// ─── Expense helpers ──────────────────────────────────────────────────────────

/**
 * Convert Vietnamese category to backend enum value.
 */
export function categoryToBackend(cat: string): string {
  const map: Record<string, string> = {
    'Ăn uống': 'food',
    'Di chuyển': 'transport',
    'Chỗ ở': 'accommodation',
    'Vui chơi': 'entertainment',
    'Mua sắm': 'other',
    'Khác': 'other',
  };
  return map[cat] || 'other';
}

/**
 * Convert backend enum to Vietnamese display name.
 */
export function categoryFromBackend(cat: string): string {
  const map: Record<string, string> = {
    food: 'Ăn uống',
    transport: 'Di chuyển',
    accommodation: 'Chỗ ở',
    entertainment: 'Vui chơi',
    other: 'Khác',
  };
  return map[cat] || cat;
}
