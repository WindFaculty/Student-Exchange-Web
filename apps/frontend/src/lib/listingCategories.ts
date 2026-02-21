export const LISTING_CATEGORIES = [
  'Do dung hoc tap',
  'Do dien tu & cong nghe',
  'Quan ao, giay dep, phu kien thoi trang',
  'Do dung ca nhan & sinh hoat',
  'Thue - cho thue',
  'Dich vu',
  'Khac',
] as const

export type ListingCategory = (typeof LISTING_CATEGORIES)[number]

export const IOT_CANONICAL_CATEGORIES = [
  'COMPONENT',
  'SAMPLE_KIT',
  'IOT_SERVICE',
] as const

export const IOT_LEGACY_ALIAS_CATEGORIES = [
  'ELECTRONICS',
  'KIT',
  'MENTORING',
  'CONSULTATION',
  'SERVICE',
] as const

export const LISTING_FORM_CATEGORIES = [
  ...LISTING_CATEGORIES,
  ...IOT_CANONICAL_CATEGORIES,
] as const

export const ADMIN_LISTING_CATEGORIES = Array.from(new Set<string>([
  ...LISTING_CATEGORIES,
  ...IOT_CANONICAL_CATEGORIES,
  ...IOT_LEGACY_ALIAS_CATEGORIES,
]))
