"use client"

import { CookieBanner } from "./CookieBanner"
import { CookieCustomizeDialog } from "./CookieCustomizeDialog"

export function CookieConsent() {
  return (
    <>
      <CookieBanner />
      <CookieCustomizeDialog />
    </>
  )
}

export { ConsentProvider, useConsent } from "./ConsentProvider"
