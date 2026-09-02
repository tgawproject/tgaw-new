/**
 * Geo detection: edge header → browser fallback → ?geo=XX override.
 * Used client-side and via server-injected initial country.
 */
import { regionForCountry, type RegionBucket } from "./config"

export function getCountryFromHeaders(headers: Headers | Record<string, string | null | undefined>): string | null {
  const h = headers instanceof Headers
    ? (k: string) => headers.get(k)
    : (k: string) => (headers as Record<string, string | null | undefined>)[k] ?? null

  // Vercel
  const vercel = h("x-vercel-ip-country")
  if (vercel) return vercel.toUpperCase()
  // Cloudflare
  const cf = h("cf-ipcountry") || h("CF-IPCountry")
  if (cf) return cf.toUpperCase()
  // Generic fallback (e.g. custom proxy sets x-country)
  const xc = h("x-country") || h("x-geo-country")
  if (xc) return xc.toUpperCase()
  return null
}

export function getGeoOverrideFromUrl(search?: string): string | null {
  try {
    const qs = search ?? (typeof window !== "undefined" ? window.location.search : "")
    const p = new URLSearchParams(qs)
    const g = p.get("geo") || p.get("country")
    if (g && /^[a-z]{2}$/i.test(g.trim())) return g.trim().toUpperCase()
    return null
  } catch { return null }
}

export function detectCountryClient(initialCountry?: string | null): string | null {
  // 1) QA override ?geo=XX
  const override = getGeoOverrideFromUrl()
  if (override) return override
  // 2) server-injected initial
  if (initialCountry) return initialCountry.toUpperCase()
  // 3) Intl timezone heuristic not reliable for country — fallback to locale
  try {
    const locale = navigator.language || (Intl.DateTimeFormat().resolvedOptions().locale ?? "")
    // e.g. "en-US" → "US", "fr-FR" → "FR"
    const m = locale.match(/[-_]([A-Z]{2})\b/i)
    if (m) return m[1].toUpperCase()
  } catch { /* noop */ }
  return null
}

export function detectRegionClient(initialCountry?: string | null): RegionBucket {
  const cc = detectCountryClient(initialCountry)
  return regionForCountry(cc)
}

// GPC detection — client & server
export function isGpcEnabled(): boolean {
  if (typeof navigator === "undefined") return false
  // Sec-GPC is a header; JS surface is navigator.globalPrivacyControl
  const nav = navigator as unknown as { globalPrivacyControl?: boolean }
  if (nav.globalPrivacyControl === true) return true
  // Some browsers expose via vendor prefix
  try {
    // GPC spec also allows `globalPrivacyControl` on window
    const w = window as unknown as { globalPrivacyControl?: boolean }
    if (w.globalPrivacyControl === true) return true
  } catch { /* noop */ }
  return false
}

export function isGpcHeader(headers: Headers | Record<string, string | null | undefined>): boolean {
  const h = headers instanceof Headers
    ? (k: string) => headers.get(k)
    : (k: string) => (headers as Record<string, string | null | undefined>)[k] ?? null
  const v = h("sec-gpc") || h("Sec-GPC")
  return v === "1"
}
