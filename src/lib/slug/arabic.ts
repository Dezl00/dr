/**
 * Arabic-to-English slug generation for clinic names.
 *
 * Pipeline:
 * 1. Translate known Arabic words to English equivalents
 * 2. Transliterate remaining Arabic characters
 * 3. Slugify (lowercase, hyphens, no special chars)
 * 4. Validate format
 */

// Common Arabic dental/medical terms → English translation
const ARABIC_TRANSLATIONS: Record<string, string> = {
  // Clinic types
  'عيادة': 'clinic',
  'عيادات': 'clinics',
  'مركز': 'center',
  'مستشفى': 'hospital',
  'مجمع': 'complex',

  // Medical specialties
  'لطب': '',
  'طب': '',
  'الأسنان': 'dental',
  'اسنان': 'dental',
  'الجلدية': 'derma',
  'العيون': 'eye',
  'الأطفال': 'kids',
  'التجميل': 'cosmetic',
  'العلاج الطبيعي': 'physio',

  // Common names
  'النور': 'alnoor',
  'الابتسامة': 'smile',
  'سمايل': 'smile',
  'الرحمة': 'alrahma',
  'الشفاء': 'alshifa',
  'الأمل': 'alamal',
  'الحياة': 'alhayat',
  'السلام': 'alsalam',
  'الصحة': 'alseha',
  'النخبة': 'elite',
  'المتميز': 'premium',
  'المتقدم': 'advanced',

  // Adjectives
  'الحديثة': 'modern',
  'الحديث': 'modern',
  'المتطور': 'advanced',
  'المتطورة': 'advanced',
  'التخصصي': 'specialized',
  'التخصصية': 'specialized',

  // Titles
  'دكتور': 'dr',
  'دكتورة': 'dr',
  'البروفيسور': 'prof',
}

// Arabic letter → Latin transliteration
const ARABIC_TRANSLITERATION: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'a',
  'ب': 'b', 'ت': 't', 'ث': 'th',
  'ج': 'g', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'th', 'ر': 'r', 'ز': 'z',
  'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd',
  'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l',
  'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w',
  'ي': 'y', 'ى': 'a', 'ة': 'a',
  'ء': '', 'ئ': 'e', 'ؤ': 'o',
}

// Reserved slugs that cannot be used
const RESERVED_SLUGS = new Set([
  'www', 'admin', 'app', 'api', 'dashboard',
  'login', 'signup', 'register', 'support',
  'help', 'status', 'mail', 'cdn', 'assets',
  'static', 'platform', 'billing', 'settings',
  'auth', 'oauth', 'callback', 'webhook',
  'blog', 'docs', 'pricing', 'about',
  'contact', 'terms', 'privacy', 'legal',
])

const MAX_SLUG_LENGTH = 63
const MIN_SLUG_LENGTH = 3

/**
 * Translate known Arabic words to English.
 */
function translateArabicWords(text: string): string {
  let result = text

  // Sort by length (longest first) to prevent partial matches
  const sortedEntries = Object.entries(ARABIC_TRANSLATIONS)
    .sort(([a], [b]) => b.length - a.length)

  for (const [arabic, english] of sortedEntries) {
    result = result.replace(new RegExp(arabic, 'g'), english ? ` ${english} ` : ' ')
  }

  return result
}

/**
 * Transliterate remaining Arabic characters to Latin.
 */
function transliterateArabic(text: string): string {
  let result = ''
  // Remove diacritics (tashkeel)
  const cleaned = text.replace(/[\u064B-\u065F\u0670]/g, '').replace(/\u0640/g, '')

  for (const char of cleaned) {
    if (ARABIC_TRANSLITERATION[char] !== undefined) {
      result += ARABIC_TRANSLITERATION[char]
    } else {
      result += char
    }
  }

  return result
}

/**
 * Generate an English-friendly slug from an Arabic clinic name.
 */
export function generateClinicSlug(arabicName: string): string {
  if (!arabicName || !arabicName.trim()) {
    return ''
  }

  // Step 1: Translate known words
  let slug = translateArabicWords(arabicName.trim())

  // Step 2: Transliterate remaining Arabic
  slug = transliterateArabic(slug)

  // Step 3: Normalize
  slug = slug
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '') // Keep only a-z, 0-9, spaces, hyphens
    .trim()
    .replace(/[\s_]+/g, '-')       // Spaces → hyphens
    .replace(/-+/g, '-')           // Collapse multiple hyphens
    .replace(/^-|-$/g, '')         // No leading/trailing hyphens

  // Step 4: Truncate to max length
  if (slug.length > MAX_SLUG_LENGTH) {
    slug = slug.substring(0, MAX_SLUG_LENGTH).replace(/-$/, '')
  }

  // Step 5: Remove empty/tiny results
  if (slug.length < MIN_SLUG_LENGTH) {
    slug = 'clinic'
  }

  return slug
}

/**
 * Validate a slug format.
 */
export function validateSlug(slug: string): {
  valid: boolean
  error?: string
} {
  if (!slug) {
    return { valid: false, error: 'العنوان مطلوب.' }
  }

  if (slug.length < MIN_SLUG_LENGTH) {
    return { valid: false, error: `العنوان يجب أن يكون ${MIN_SLUG_LENGTH} أحرف على الأقل.` }
  }

  if (slug.length > MAX_SLUG_LENGTH) {
    return { valid: false, error: `العنوان يجب ألا يتجاوز ${MAX_SLUG_LENGTH} حرفًا.` }
  }

  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug)) {
    return {
      valid: false,
      error: 'العنوان يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط.',
    }
  }

  if (/--/.test(slug)) {
    return { valid: false, error: 'العنوان لا يجب أن يحتوي على شرطات متتالية.' }
  }

  if (RESERVED_SLUGS.has(slug)) {
    return { valid: false, error: 'هذا العنوان محجوز. يرجى اختيار عنوان آخر.' }
  }

  return { valid: true }
}

/**
 * Check if a slug is reserved.
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase())
}
