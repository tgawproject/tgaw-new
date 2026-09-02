"use client"

import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useConsent } from "./ConsentProvider"

export function CookieManageButton() {
  const { openCustomize, openBanner, hasConsented } = useConsent()
  return (
    <Button onClick={hasConsented ? openCustomize : openBanner} className="cursor-pointer gap-2">
      <Settings2 aria-hidden="true" className="size-4" />
      Manage cookie preferences
    </Button>
  )
}
