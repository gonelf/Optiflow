/**
 * Internationalization Configuration
 * Manages supported locales and language settings
 */

export const defaultLocale = 'en' as const;

export const locales = [
  'en', // English
  'es', // Spanish
  'fr', // French
  'de', // German
  'it', // Italian
  'pt', // Portuguese
  'ja', // Japanese
  'zh', // Chinese
  'ko', // Korean
  'ar', // Arabic
] as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
  ar: 'العربية',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
  pt: '🇵🇹',
  ja: '🇯🇵',
  zh: '🇨🇳',
  ko: '🇰🇷',
  ar: '🇸🇦',
};

/**
 * Get locale from URL or browser
 */
export function getLocaleFromUrl(pathname: string): Locale | undefined {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];

  if (locales.includes(potentialLocale as Locale)) {
    return potentialLocale as Locale;
  }

  return undefined;
}

/**
 * Get browser's preferred locale
 */
export function getBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') {
    return defaultLocale;
  }

  const browserLang = navigator.language.split('-')[0];

  if (locales.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }

  return defaultLocale;
}

/**
 * Validate if a locale is supported
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
