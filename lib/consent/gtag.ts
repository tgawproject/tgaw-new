/**
 * Google Consent Mode v2 defaults + helpers.
 * This file sets default 'denied' before any gtag loads, then updates on consent.
 * It is safe to import even when no gtag is present (no-ops).
 */

export function initConsentModeDefaults() {
  if (typeof window === "undefined") return
  const w = window as unknown as {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
  w.dataLayer = w.dataLayer || []
  if (!w.gtag) {
    w.gtag = function gtag(...args: unknown[]) {
      w.dataLayer!.push(args)
    }
  }
  try {
    // Must run before any analytics script — default to denied
    w.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
      wait_for_update: 500,
    })
  } catch { /* noop */ }
}
