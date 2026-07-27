export type SelectOption = {
  value: string;
  label: string;
};

/** ISO 3166-1 alpha-2 codes, including territories. */
export const ISO_COUNTRY_CODES = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ',
  'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ',
  'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR',
  'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY',
  'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT',
  'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ',
  'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ',
  'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY',
  'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ',
  'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ',
  'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW',
] as const;

export const TEAM_SIZE_OPTIONS: SelectOption[] = [
  { value: '1', label: 'Solo' },
  { value: '2-5', label: '2–5 people' },
  { value: '6-10', label: '6–10 people' },
  { value: '11-25', label: '11–25 people' },
  { value: '26-50', label: '26–50 people' },
  { value: '51-100', label: '51–100 people' },
  { value: '101-250', label: '101–250 people' },
  { value: '251-500', label: '251–500 people' },
  { value: '501-1000', label: '501–1,000 people' },
  { value: '1001-5000', label: '1,001–5,000 people' },
  { value: '5001+', label: '5,001+ people' },
];

export const PRIMARY_SERVICE_OPTIONS: SelectOption[] = [
  { value: 'Brand Strategy & Identity', label: 'Brand Strategy & Identity' },
  { value: 'Web Design & Development', label: 'Web Design & Development' },
  { value: 'SEO', label: 'Search Engine Optimization (SEO)' },
  { value: 'Paid Media / PPC', label: 'Paid Media / PPC' },
  { value: 'Content Marketing', label: 'Content Marketing' },
  { value: 'Social Media Marketing', label: 'Social Media Marketing' },
  { value: 'Email & Lifecycle Marketing', label: 'Email & Lifecycle Marketing' },
  { value: 'Conversion Rate Optimization (CRO)', label: 'Conversion Rate Optimization (CRO)' },
  { value: 'Marketing Automation & CRM', label: 'Marketing Automation & CRM' },
  { value: 'Data, Analytics & Attribution', label: 'Data, Analytics & Attribution' },
  { value: 'E-commerce & Marketplace', label: 'E-commerce & Marketplace' },
  { value: 'Product Design & UX', label: 'Product Design & UX' },
  { value: 'Mobile App Development', label: 'Mobile App Development' },
  { value: 'Software & SaaS Development', label: 'Software & SaaS Development' },
  { value: 'Public Relations & Communications', label: 'Public Relations & Communications' },
  { value: 'Video & Creative Production', label: 'Video & Creative Production' },
  { value: 'Influencer & Affiliate Marketing', label: 'Influencer & Affiliate Marketing' },
  { value: 'Local & Reputation Marketing', label: 'Local & Reputation Marketing' },
  { value: 'AI & Automation Consulting', label: 'AI & Automation Consulting' },
  { value: 'IT & Cloud Consulting', label: 'IT & Cloud Consulting' },
  { value: 'Full-Service Digital Agency', label: 'Full-Service Digital Agency' },
  { value: 'Other / Specialized Service', label: 'Other / Specialized Service' },
];

const FALLBACK_TIME_ZONES = [
  'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi',
  'America/Anchorage', 'America/Argentina/Buenos_Aires', 'America/Bogota', 'America/Chicago',
  'America/Denver', 'America/Halifax', 'America/Los_Angeles', 'America/Mexico_City',
  'America/New_York', 'America/Phoenix', 'America/Sao_Paulo', 'America/Toronto', 'America/Vancouver',
  'Asia/Bangkok', 'Asia/Dhaka', 'Asia/Dubai', 'Asia/Hong_Kong', 'Asia/Jakarta', 'Asia/Jerusalem',
  'Asia/Karachi', 'Asia/Kathmandu', 'Asia/Kolkata', 'Asia/Manila', 'Asia/Riyadh', 'Asia/Seoul',
  'Asia/Shanghai', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Adelaide', 'Australia/Brisbane',
  'Australia/Melbourne', 'Australia/Perth', 'Australia/Sydney', 'Europe/Amsterdam', 'Europe/Athens',
  'Europe/Berlin', 'Europe/Lisbon', 'Europe/London', 'Europe/Madrid', 'Europe/Moscow', 'Europe/Paris',
  'Europe/Rome', 'Europe/Stockholm', 'Pacific/Auckland', 'Pacific/Honolulu',
];

export function getCountryOptions(locale = 'en'): SelectOption[] {
  const displayNames = new Intl.DisplayNames([locale], { type: 'region' });

  return ISO_COUNTRY_CODES.map((value) => ({
    value,
    label: displayNames.of(value) ?? value,
  })).sort((a, b) => a.label.localeCompare(b.label, locale));
}

export function getTimeZoneOptions(): SelectOption[] {
  const supportedValuesOf = Intl.supportedValuesOf?.bind(Intl);
  const zones = supportedValuesOf ? supportedValuesOf('timeZone') : FALLBACK_TIME_ZONES;

  return ['UTC', ...zones.filter((zone) => zone !== 'UTC')].map((value) => ({
    value,
    label: value === 'UTC' ? 'UTC (Coordinated Universal Time)' : value.replaceAll('_', ' '),
  }));
}

export function normalizeCountryCode(value?: string | null) {
  if (!value) return 'US';
  return value === 'UK' ? 'GB' : value.toUpperCase();
}

export function normalizeTimeZone(value?: string | null) {
  if (!value) return 'UTC';
  const legacyZones: Record<string, string> = {
    EST: 'America/New_York',
    PST: 'America/Los_Angeles',
    GMT: 'UTC',
  };
  return legacyZones[value] ?? value;
}

export function normalizePrimaryService(value?: string | null) {
  const legacyCategories: Record<string, string> = {
    PPC: 'Paid Media / PPC',
    WebDev: 'Web Design & Development',
    Content: 'Content Marketing',
    FullService: 'Full-Service Digital Agency',
  };
  return value ? (legacyCategories[value] ?? value) : 'SEO';
}

export function getTeamSizeLabel(value?: string | null) {
  if (!value) return 'Not specified';
  return TEAM_SIZE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function getPrimaryServiceLabel(value?: string | null) {
  const normalized = normalizePrimaryService(value);
  return PRIMARY_SERVICE_OPTIONS.find((option) => option.value === normalized)?.label ?? normalized;
}
