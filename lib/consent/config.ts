/**
 * Global cookie consent — central config & constants.
 * Geo-adaptive: EU/EEA/UK/Brazil = strict opt-in, US = opt-out + Do Not Sell/Share + GPC, ROW = notice.
 */

// Bump this when categories or legal text change — forces re-consent.
export const CONSENT_VERSION = 1

export const CONSENT_COOKIE_NAME = "tgaw_consent"
export const CONSENT_COOKIE_MAX_AGE_DAYS = 365 // 12 months (CNIL allows 6, we use 12 and re-prompt on version bump)
export const CONSENT_COOKIE_MAX_AGE_SECONDS = CONSENT_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60
export const CONSENT_LS_KEY = "tgaw_consent"

export type ConsentCategory = "necessary" | "functional" | "analytics" | "marketing"

export const CONSENT_CATEGORIES: readonly ConsentCategory[] = [
  "necessary",
  "functional",
  "analytics",
  "marketing",
] as const

export interface ConsentPrefs {
  necessary: boolean // always true
  functional: boolean
  analytics: boolean
  marketing: boolean
  /** ISO timestamp when consent was given */
  t: string
  /** schema version */
  v: number
}

export interface ConsentMeta {
  /** region bucket used to decide banner behaviour at time of consent */
  region: RegionBucket
  /** whether GPC was honored at time of consenting */
  gpc: boolean
}

export type RegionBucket = "strict" | "us_opt_out" | "notice"

// ISO 3166-1 alpha-2 buckets — keep in sync with cross-jurisdiction-cookies
// strict = opt-in required (GDPR/ePrivacy)
// us_opt_out = opt-out + Do Not Sell/Share + GPC (CCPA/CPRA etc.)
// notice = implied consent is sufficient

const STRICT_COUNTRIES = new Set([
  // EEA (27 + 3)
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE",
  "IS","NO","LI",
  // UK, CH, TR covered via extra strict list
  "GB","CH","TR",
  // Brazil LGPD, Japan APPI, Korea PIPA, South Africa POPIA, Nigeria, etc. — treat as strict
  "BR","JP","KR","ZA","NG","TH","SG","CA","AU","NZ","IN","MY","PH","ID","AE","SA","QA","BH","KW","OM","EG","KE","GH","MA","TN","PK","BD","VN","CL","CO","PE","AR","MX","IL","UA",
])

const US_COUNTRIES = new Set(["US"])

// Helpers

export function defaultPrefs(overrides?: Partial<ConsentPrefs>): ConsentPrefs {
  return {
    necessary: true,
    functional: overrides?.functional ?? false,
    analytics: overrides?.analytics ?? false,
    marketing: overrides?.marketing ?? false,
    t: overrides?.t ?? new Date().toISOString(),
    v: overrides?.v ?? CONSENT_VERSION,
  }
}

export const allAccepted = (): ConsentPrefs => ({
  necessary: true, functional: true, analytics: true, marketing: true,
  t: new Date().toISOString(), v: CONSENT_VERSION,
})

export const allRejected = (): ConsentPrefs => ({
  necessary: true, functional: false, analytics: false, marketing: false,
  t: new Date().toISOString(), v: CONSENT_VERSION,
})

export function isExpired(prefs: ConsentPrefs | null): boolean {
  if (!prefs?.t) return true
  if (prefs.v !== CONSENT_VERSION) return true
  const then = new Date(prefs.t).getTime()
  if (Number.isNaN(then)) return true
  return Date.now() - then > CONSENT_COOKIE_MAX_AGE_SECONDS * 1000
}

export function regionForCountry(countryCode: string | null | undefined): RegionBucket {
  const cc = (countryCode || "").toUpperCase().trim()
  if (!cc) return "strict" // safest default
  if (STRICT_COUNTRIES.has(cc)) return "strict"
  if (US_COUNTRIES.has(cc)) return "us_opt_out"
  return "notice"
}

export const CATEGORY_META: Record<ConsentCategory, { label: string; description: string; required?: boolean }> = {
  necessary: {
    label: "Strictly Necessary",
    description: "Required for login, security, and core site function. Cannot be disabled.",
    required: true,
  },
  functional: {
    label: "Functional / Preferences",
    description: "Remembers language, theme, and region preferences for a smoother experience.",
  },
  analytics: {
    label: "Analytics",
    description: "Helps us understand how the site is used via aggregated, pseudonymized metrics.",
  },
  marketing: {
    label: "Marketing / Tracking",
    description: "Used for personalized content and measuring campaign effectiveness across sites.",
  },
}
