import { CONSENT_COOKIE_MAX_AGE_SECONDS, CONSENT_COOKIE_NAME, CONSENT_VERSION, type ConsentPrefs, isExpired } from "./config"

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try { return JSON.parse(raw) as T } catch { return null }
}

// ---- cookie helpers (client) ----

export function readConsentFromCookie(): ConsentPrefs | null {
  if (typeof document === "undefined") return null
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE_NAME}=([^;]*)`))
  if (!m) return null
  try {
    const decoded = decodeURIComponent(m[1])
    return JSON.parse(decoded) as ConsentPrefs
  } catch { return null }
}

export function writeConsentCookie(prefs: ConsentPrefs) {
  if (typeof document === "undefined") return
  const value = encodeURIComponent(JSON.stringify(prefs))
  // Secure only on https; localhost http still needs cookie
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; Path=/; Max-Age=${CONSENT_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`
}

export function readConsentFromLS(): ConsentPrefs | null {
  if (typeof window === "undefined" || !window.localStorage) return null
  try {
    const raw = window.localStorage.getItem("tgaw_consent")
    return safeJsonParse<ConsentPrefs>(raw)
  } catch { return null }
}

export function writeConsentLS(prefs: ConsentPrefs) {
  if (typeof window === "undefined" || !window.localStorage) return
  window.localStorage.setItem("tgaw_consent", JSON.stringify(prefs))
}

export function readConsent(): ConsentPrefs | null {
  // cookie is authority (server readable); LS as fallback
  const fromCookie = readConsentFromCookie()
  if (fromCookie && !isExpired(fromCookie) && fromCookie.v === CONSENT_VERSION) return fromCookie
  const fromLS = readConsentFromLS()
  if (fromLS && !isExpired(fromLS) && fromLS.v === CONSENT_VERSION) {
    // repair cookie if LS is newer
    writeConsentCookie(fromLS)
    return fromLS
  }
  return null
}

export function persistConsent(prefs: ConsentPrefs) {
  writeConsentCookie(prefs)
  writeConsentLS(prefs)
  // mirror to window for gtag Consent Mode readers
  if (typeof window !== "undefined") {
    ;(window as unknown as { tgawConsent?: ConsentPrefs }).tgawConsent = prefs
    // Google Consent Mode v2 bridge (no-op if gtag not present)
    try {
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
      if (typeof gtag === "function") {
        gtag("consent", "update", {
          ad_storage: prefs.marketing ? "granted" : "denied",
          ad_user_data: prefs.marketing ? "granted" : "denied",
          ad_personalization: prefs.marketing ? "granted" : "denied",
          analytics_storage: prefs.analytics ? "granted" : "denied",
          functionality_storage: prefs.functional ? "granted" : "denied",
          personalization_storage: prefs.functional ? "granted" : "denied",
          security_storage: "granted",
        })
      }
    } catch { /* noop */ }
    // dispatch event so any listener can gate scripts
    window.dispatchEvent(new CustomEvent("tgaw:consent", { detail: prefs }))
  }
}

// ---- server helpers ----

export function parseConsentCookieHeader(cookieHeader: string | null | undefined): ConsentPrefs | null {
  if (!cookieHeader) return null
  const m = cookieHeader.match(new RegExp(`${CONSENT_COOKIE_NAME}=([^;]+)`))
  if (!m) return null
  try {
    const decoded = decodeURIComponent(m[1])
    const prefs = JSON.parse(decoded) as ConsentPrefs
    if (isExpired(prefs)) return null
    return prefs
  } catch { return null }
}
