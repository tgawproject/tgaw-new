import Link from "next/link"
import { Cookie, ShieldCheck, Globe, Clock, Settings2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CookieManageButton } from "@/components/consent/CookieManageButton"

export const metadata = {
  title: "Cookie Policy — The Global Altar Watch",
  description: "How TGAW uses cookies across regions — GDPR, CCPA, LGPD compliant.",
}

const cookieTable = [
  { name: "better-auth.session_token", category: "Strictly Necessary", purpose: "Keeps you signed in; authenticates API and Socket.IO.", duration: "Session / 30 days", provider: "TGAW" },
  { name: "tgaw_consent", category: "Strictly Necessary", purpose: "Stores your cookie preferences (this banner).", duration: "12 months", provider: "TGAW" },
  { name: "sidebar_state", category: "Functional", purpose: "Remembers sidebar collapsed/expanded.", duration: "7 days", provider: "TGAW" },
  { name: "theme", category: "Functional", purpose: "Remembers light/dark/system preference (localStorage).", duration: "Persistent", provider: "TGAW" },
  { name: "_ga, _ga_* (future)", category: "Analytics", purpose: "Aggregated site usage — only set if you consent to Analytics.", duration: "14 months", provider: "Google (if enabled)" },
  { name: "_fbp, fr (future)", category: "Marketing", purpose: "Cross-site measurement — only set if you consent to Marketing.", duration: "3 months", provider: "Meta/Google (if enabled)" },
]

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex cursor-pointer items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck aria-hidden="true" className="size-4" />
            </span>
            <span className="text-sm font-bold tracking-tight">TGAW</span>
          </Link>
          <Link href="/" className="cursor-pointer text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">Back to home</Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1.5"><Cookie aria-hidden="true" className="size-3.5" /> Cookie Policy</Badge>
          <Badge variant="outline" className="gap-1"><Globe aria-hidden="true" className="size-3" /> Global</Badge>
          <Badge variant="outline" className="gap-1"><Clock aria-hidden="true" className="size-3" /> Updated Sep 2026</Badge>
        </div>

        <h1 className="mt-4 text-4xl tracking-tight sm:text-5xl">How we use cookies</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          TGAW is a global community. The same banner adapts to where you are — strict opt-in in the EU/UK/Brazil, opt-out + Global Privacy Control in the US, and a friendly notice elsewhere. This page explains every cookie we set and how to control them.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <CookieManageButton />
          <Link href="/privacy" className="inline-flex cursor-pointer items-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Privacy Policy</Link>
        </div>

        {/* Overview cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><ShieldCheck aria-hidden="true" className="size-4 text-emerald-600" /> GDPR / ePrivacy</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">EU/EEA, UK & Brazil: non-essential cookies stay <span className="font-medium text-foreground">off until you consent</span>. Accept and Reject are equally prominent. You can change your mind anytime.</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Globe aria-hidden="true" className="size-4 text-sky-600" /> CCPA / US states</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">California, Colorado, Connecticut etc.: cookies may be set by default, but you have the right to opt out of sale/share. We honor <span className="font-medium text-foreground">Global Privacy Control</span>.</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Settings2 aria-hidden="true" className="size-4 text-violet-600" /> Your controls</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Customize per category, re-open via your <span className="font-medium text-foreground">avatar → Cookie Preferences</span> or this page. Consent expires after 12 months.</p></CardContent>
          </Card>
        </div>

        {/* Categories */}
        <h2 className="mt-12 text-2xl tracking-tight">Cookie categories</h2>
        <div className="mt-4 grid gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Strictly Necessary — always on</CardTitle><CardDescription>Required for the site to function. Cannot be disabled.</CardDescription></CardHeader>
            <CardContent className="text-sm text-muted-foreground"><ul className="list-disc pl-5 space-y-1"><li><code className="rounded bg-muted px-1 py-0.5 text-xs">better-auth.*</code> — authentication & session</li><li><code className="rounded bg-muted px-1 py-0.5 text-xs">tgaw_consent</code> — remembers your choice (12 months)</li><li><code className="rounded bg-muted px-1 py-0.5 text-xs">__Host-*</code> — CSRF / security</li></ul></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Functional / Preferences</CardTitle><CardDescription>Remembers choices that improve your experience.</CardDescription></CardHeader>
            <CardContent className="text-sm text-muted-foreground"><p>Language, timezone, sidebar state, theme. Set only if you allow Functional.</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Analytics</CardTitle><CardDescription>Help us understand usage in aggregate.</CardDescription></CardHeader>
            <CardContent className="text-sm text-muted-foreground"><p>Page views, feature usage, performance metrics — pseudonymized, no cross-site tracking. Only set if you allow Analytics. Respects Consent Mode v2 <code className="text-xs">analytics_storage</code>.</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Marketing / Tracking</CardTitle><CardDescription>Personalised content & campaign measurement.</CardDescription></CardHeader>
            <CardContent className="text-sm text-muted-foreground"><p>Cross-site identifiers for ads or personalization — only set if you allow Marketing. Respects <code className="text-xs">ad_storage</code> / <code className="text-xs">ad_personalization</code>. In the US this is where “Do Not Sell or Share” applies.</p></CardContent>
          </Card>
        </div>

        {/* Table */}
        <h2 className="mt-12 text-2xl tracking-tight">Cookies we set</h2>
        <Card className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-4 py-2">Cookie</th><th className="px-4 py-2">Category</th><th className="px-4 py-2">Purpose</th><th className="px-4 py-2">Duration</th><th className="px-4 py-2">Provider</th></tr>
              </thead>
              <tbody className="divide-y">
                {cookieTable.map((row) => (
                  <tr key={row.name} className="align-top">
                    <td className="px-4 py-2 font-mono text-xs">{row.name}</td>
                    <td className="px-4 py-2 text-xs"><Badge variant="secondary" className="text-[11px]">{row.category}</Badge></td>
                    <td className="px-4 py-2 text-muted-foreground">{row.purpose}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs">{row.duration}</td>
                    <td className="px-4 py-2 text-xs">{row.provider}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* GPC & Do Not Sell */}
        <div id="do-not-sell" className="scroll-mt-20">
          <h2 className="mt-12 text-2xl tracking-tight">Do Not Sell or Share My Personal Information</h2>
          <Card className="mt-4">
            <CardContent className="pt-6 text-sm leading-relaxed text-muted-foreground">
              <p>If you are in California (CCPA/CPRA), Colorado (CPA), Connecticut (CTDPA) or other US states with opt-out rights, you may opt out of the sale or sharing of your personal information for cross-context behavioral advertising at any time.</p>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>Click <span className="font-medium text-foreground">Customize → Marketing → off</span> and <span className="font-medium text-foreground">Save Preferences</span>.</li>
                <li>Or enable <span className="font-medium text-foreground">Global Privacy Control (GPC)</span> in your browser (Brave, Firefox, etc.) — we detect <code className="text-xs">Sec-GPC: 1</code> and automatically set Marketing to denied on your first visit.</li>
                <li>This opt-out is stored in your <code className="text-xs">tgaw_consent</code> cookie for 12 months and honored via Consent Mode <code className="text-xs">ad_storage: denied</code>.</li>
              </ul>
              <div className="mt-4"><CookieManageButton /></div>
            </CardContent>
          </Card>
        </div>

        <h2 className="mt-12 text-2xl tracking-tight">How to manage cookies otherwise</h2>
        <Card className="mt-4">
          <CardContent className="pt-6 text-sm leading-relaxed text-muted-foreground">
            <ul className="list-disc space-y-1 pl-5">
              <li>Dashboard: <span className="font-medium text-foreground">Avatar → Cookie Preferences</span> (or the button above) to reopen at any time.</li>
              <li>Clear cookies from your browser settings — this also clears <code className="text-xs">tgaw_consent</code> and the banner will reappear.</li>
              <li>Your preference expires after 12 months or whenever we add a new category (version bump) — you’ll be asked again.</li>
            </ul>
          </CardContent>
        </Card>

        <Separator className="my-10" />

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>Questions? Contact <Link href="mailto:info@tgaw.app" className="cursor-pointer underline underline-offset-2 hover:text-foreground">info@tgaw.app</Link></p>
          <Link href="/privacy" className="cursor-pointer underline underline-offset-2 hover:text-foreground">Privacy Policy →</Link>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">TGAW honors Google Consent Mode v2, IAB TCF principles (where applicable), and Global Privacy Control.</p>
      </main>
    </div>
  )
}
