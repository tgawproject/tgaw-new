"use client"

import * as React from "react"
import { allAccepted, allRejected, type ConsentPrefs, CONSENT_VERSION, isExpired, regionForCountry } from "@/lib/consent/config"
import { persistConsent, readConsent } from "@/lib/consent/cookies"
import { detectCountryClient, detectRegionClient, isGpcEnabled } from "@/lib/consent/geo"
import { initConsentModeDefaults } from "@/lib/consent/gtag"

type RegionBucket = import("@/lib/consent/config").RegionBucket

interface ConsentContextValue {
  prefs: ConsentPrefs | null
  hasConsented: boolean
  region: RegionBucket
  country: string | null
  gpcDetected: boolean
  showBanner: boolean
  showCustomize: boolean
  openCustomize: () => void
  closeCustomize: () => void
  acceptAll: () => void
  rejectAll: () => void
  savePrefs: (next: Omit<ConsentPrefs, "t" | "v">) => void
  openBanner: () => void
  dismissBanner: () => void
}

const ConsentContext = React.createContext<ConsentContextValue | null>(null)

export function useConsent() {
  const ctx = React.useContext(ConsentContext)
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider")
  return ctx
}

export function ConsentProvider({
  children,
  initialCountry,
}: {
  children: React.ReactNode
  initialCountry?: string | null
}) {
  const [prefs, setPrefs] = React.useState<ConsentPrefs | null>(null)
  const [hasConsented, setHasConsented] = React.useState(false)
  const [showBanner, setShowBanner] = React.useState(false)
  const [showCustomize, setShowCustomize] = React.useState(false)
  const [country, setCountry] = React.useState<string | null>(initialCountry ?? null)
  const [region, setRegion] = React.useState<RegionBucket>(() => regionForCountry(initialCountry ?? null))
  const [gpcDetected, setGpcDetected] = React.useState(false)

  // Init: set Consent Mode defaults before any analytics
  React.useEffect(() => {
    initConsentModeDefaults()
  }, [])

  // Resolve geo + consent on mount
  React.useEffect(() => {
    const cc = detectCountryClient(initialCountry)
    const rb = detectRegionClient(initialCountry)
    setCountry(cc)
    setRegion(rb)
    const gpc = isGpcEnabled()
    setGpcDetected(gpc)

    const existing = readConsent()
    if (existing && !isExpired(existing) && existing.v === CONSENT_VERSION) {
      setPrefs(existing)
      setHasConsented(true)
      setShowBanner(false)
      // re-hydrate Consent Mode from stored prefs
      persistConsent(existing)
      return
    }

    // No valid consent — decide whether to show banner & apply GPC pre-set
    // Geo-adaptive: strict = must prompt; us_opt_out = prompt + GPC honor; notice = still prompt gently
    // For GPC=1 on first visit: auto-persist rejected prefs but still show banner with badge so user can override
    if (gpc) {
      const gpcPrefs: ConsentPrefs = { ...allRejected(), t: new Date().toISOString(), v: CONSENT_VERSION }
      // Persist as initial denied state but keep banner visible so user sees GPC honored
      persistConsent(gpcPrefs)
      setPrefs(gpcPrefs)
      setHasConsented(false)
      setShowBanner(true)
      return
    }

    setShowBanner(true)
  }, [initialCountry])

  const acceptAll = React.useCallback(() => {
    const next = allAccepted()
    setPrefs(next)
    setHasConsented(true)
    setShowBanner(false)
    setShowCustomize(false)
    persistConsent(next)
  }, [])

  const rejectAll = React.useCallback(() => {
    const next = allRejected()
    setPrefs(next)
    setHasConsented(true)
    setShowBanner(false)
    setShowCustomize(false)
    persistConsent(next)
  }, [])

  const savePrefs = React.useCallback((partial: Omit<ConsentPrefs, "t" | "v">) => {
    const next: ConsentPrefs = {
      necessary: true,
      functional: !!partial.functional,
      analytics: !!partial.analytics,
      marketing: !!partial.marketing,
      t: new Date().toISOString(),
      v: CONSENT_VERSION,
    }
    setPrefs(next)
    setHasConsented(true)
    setShowBanner(false)
    setShowCustomize(false)
    persistConsent(next)
  }, [])

  const openCustomize = React.useCallback(() => setShowCustomize(true), [])
  const closeCustomize = React.useCallback(() => setShowCustomize(false), [])
  const openBanner = React.useCallback(() => setShowBanner(true), [])
  const dismissBanner = React.useCallback(() => setShowBanner(false), [])

  const value = React.useMemo<ConsentContextValue>(() => ({
    prefs, hasConsented, region, country, gpcDetected,
    showBanner, showCustomize,
    openCustomize, closeCustomize,
    acceptAll, rejectAll, savePrefs,
    openBanner, dismissBanner,
  }), [prefs, hasConsented, region, country, gpcDetected, showBanner, showCustomize, openCustomize, closeCustomize, acceptAll, rejectAll, savePrefs, openBanner, dismissBanner])

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}