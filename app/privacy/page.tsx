import Link from "next/link"
import {
  ShieldCheck,
  Cookie,
  Mail,
  Globe,
  Clock,
  Database,
  Eye,
  Trash2,
  Lock,
  Users,
  FileText,
  Scale,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CookieManageButton } from "@/components/consent/CookieManageButton"

export const metadata = {
  title: "Privacy Policy — The Global Altar Watch",
  description: "How TGAW collects, uses, and protects your personal information — GDPR, CCPA/CPRA, LGPD, POPIA, APPI, PIPA compliant.",
}

const dataTable = [
  { category: "Account & Profile", examples: "Name, email, password hash, avatar, role, timezone, country, age range", purpose: "Create & secure your account; personalize bookings", basis: "Contract · Legitimate interest", retention: "While account active + 30 days after deletion request" },
  { category: "Content & Activity", examples: "Posts, comments, likes, bookings, messages, group membership, presence heartbeat", purpose: "Deliver community, slots, chat and feed", basis: "Contract · Legitimate interest", retention: "Until you delete or account closure" },
  { category: "Technical & Cookies", examples: "IP country, device, tgaw_consent, session_token, analytics events (if consented)", purpose: "Geo-adaptive consent, security, aggregated metrics", basis: "Consent · Legitimate interest", retention: "tgaw_consent 12 months; session 30 days; analytics 14 months" },
  { category: "Communications", examples: "Email/push preferences, notification logs, support messages", purpose: "Send devotion reminders & updates per your preferences", basis: "Consent · Contract", retention: "Until unsubscribe or account deletion" },
]

const rightsTable = [
  { right: "Access / Know", eu: "Art. 15", us: "CCPA §1798.100", action: "Request a copy of your personal information" },
  { right: "Rectification / Correction", eu: "Art. 16", us: "CPA / CPRA", action: "Fix inaccurate profile or content" },
  { right: "Deletion / Erasure", eu: "Art. 17", us: "CCPA §1798.105", action: "Delete account & associated content" },
  { right: "Restriction / Limit", eu: "Art. 18", us: "CPRA Sensitive PI limit", action: "Limit processing to storage only" },
  { right: "Portability", eu: "Art. 20", us: "CCPA / CPA", action: "Export your data in JSON/CSV" },
  { right: "Object / Opt-out", eu: "Art. 21", us: "Do Not Sell/Share + GPC", action: "Avatar → Cookie Preferences → Marketing off" },
  { right: "Withdraw consent", eu: "Art. 7(3)", us: "Universal opt-out", action: "Change cookie toggles anytime" },
]

export default function PrivacyPage() {
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
          <Link href="/" className="cursor-pointer text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1.5">
            <ShieldCheck aria-hidden="true" className="size-3.5" /> Privacy Policy
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Globe aria-hidden="true" className="size-3" /> Global
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock aria-hidden="true" className="size-3" /> Updated Sep 2026
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Scale aria-hidden="true" className="size-3" /> GDPR · CCPA/CPRA · LGPD
          </Badge>
        </div>

        <h1 className="mt-4 text-4xl tracking-tight sm:text-5xl">Privacy Policy</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          TGAW is built for the global watch — from the EU to California to Brazil and beyond. This policy explains what we collect, why we collect it, and the rights you have in your region. We keep it plain, and the same protections travel with you.
        </p>

        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Cookie aria-hidden="true" className="size-4" /> Manage non-essential cookies anytime: Avatar → Cookie Preferences, or below.
            </span>
            <CookieManageButton />
          </CardContent>
        </Card>

        {/* Overview cards */}
        <div className="mt-10 grid gap-2 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Database aria-hidden="true" className="size-4 text-violet-600" /> What we collect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Account details you give us, content you create (posts, bookings, messages), and technical signals (IP country, device, consent). No sensitive categories unless you share them.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Scale aria-hidden="true" className="size-4 text-emerald-600" /> Why & legal basis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                To run the community you joined (contract), keep it safe (legitimate interest), and only set analytics/marketing when you <span className="font-medium text-foreground">consent</span> (Art. 6 GDPR).
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Eye aria-hidden="true" className="size-4 text-sky-600" /> Your controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View, correct, delete, or export your data. In the US: <span className="font-medium text-foreground">Do Not Sell/Share + GPC</span>. Everywhere: withdraw consent in one tap.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Controller */}
        <h2 className="mt-12 text-2xl tracking-tight">1. Who we are</h2>
        <Card className="mt-4">
          <CardContent className="pt-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">The Global Altar Watch (“TGAW”, “we”, “us”)</span> operates the community platform for devotion, prayer, Bible reading, and fellowship at{" "}
              <Link href="/" className="cursor-pointer underline underline-offset-2 hover:text-foreground">
                tgaw.app
              </Link>
              . We are the controller for personal data processed on the site.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                Contact: <Link href="mailto:info@tgaw.app" className="cursor-pointer underline underline-offset-2 hover:text-foreground">info@tgaw.app</Link>
              </li>
              <li>DPO / privacy contact: same address — subject “Privacy Request”.</li>
              <li>
                EU representative (where applicable) and US contact details are provided on request.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Data categories */}
        <h2 className="mt-12 text-2xl tracking-tight">2. Personal data we collect</h2>
        <Card className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Examples</th>
                  <th className="px-4 py-2">Purpose</th>
                  <th className="px-4 py-2">Legal basis</th>
                  <th className="px-4 py-2">Retention</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dataTable.map((row) => (
                  <tr key={row.category} className="align-top">
                    <td className="px-4 py-3 font-medium text-foreground">{row.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.examples}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.purpose}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">{row.basis}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{row.retention}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="mt-4 border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <Users aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>
                We do not intentionally collect data from children under 13, and do not process special categories (health, political, religious beliefs) except where you voluntarily share a testimony or prayer request — processed only for the feature you used.
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Purposes & bases */}
        <h2 className="mt-12 text-2xl tracking-tight">3. Purposes & legal bases (GDPR Art. 6)</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm"><FileText aria-hidden="true" className="size-4 text-primary" /> Contract</CardTitle>
              <CardDescription>To deliver what you signed up for.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Creating your account, saving bookings, delivering messages, posts, and presence — without this, the watch cannot function.</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm"><Lock aria-hidden="true" className="size-4 text-emerald-600" /> Legitimate interest</CardTitle>
              <CardDescription>Security, safety, and basic analytics.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Fraud prevention, rate limiting, crash logs, and strictly necessary cookies. We balance this against your rights and keep it minimal.</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm"><Cookie aria-hidden="true" className="size-4 text-amber-600" /> Consent</CardTitle>
              <CardDescription>You opt in, we activate.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Non-essential cookies, email/push notifications, and any analytics/marketing. Withdraw in <span className="font-medium text-foreground">Avatar → Cookie Preferences</span> or <Link href="/cookies" className="cursor-pointer underline underline-offset-2 hover:text-foreground">Cookie Policy</Link>.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm"><Scale aria-hidden="true" className="size-4 text-sky-600" /> Legal obligation</CardTitle>
              <CardDescription>When the law requires it.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Responding to lawful requests, tax record-keeping, or enforcing our Terms. We only share what is required.</CardContent>
          </Card>
        </div>

        {/* Cookies & signals */}
        <h2 className="mt-12 text-2xl tracking-tight">4. Cookies, Consent Mode & signals</h2>
        <Card className="mt-4">
          <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              We use a <span className="font-medium text-foreground">geo-adaptive</span> banner: EU/EEA, UK, Brazil, Canada, Japan, Korea, South Africa and similar regions see strict opt-in (non-essential cookies off until you consent); US states see opt-out with <span className="font-medium text-foreground">Do Not Sell or Share</span>; elsewhere we show notice-only. See the full{" "}
              <Link href="/cookies" className="cursor-pointer underline underline-offset-2 hover:text-foreground">Cookie Policy</Link> for the cookie table and durations.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Consent Mode v2: <code className="text-xs">ad_storage</code>, <code className="text-xs">analytics_storage</code>, <code className="text-xs">ad_user_data</code> stay <code className="text-xs">denied</code> until you allow Analytics/Marketing.
              </li>
              <li>
                Global Privacy Control: browsers sending <code className="text-xs">Sec-GPC: 1</code> automatically get Marketing = denied on first visit (CCPA/CPRA, CPA, CTDPA).
              </li>
              <li>
                Your choice is stored in <code className="text-xs">tgaw_consent</code> (12 months, v{1}) and honors expiry/version bumps.
              </li>
            </ul>
            <div className="pt-2">
              <CookieManageButton />
            </div>
          </CardContent>
        </Card>

        {/* Sharing */}
        <h2 className="mt-12 text-2xl tracking-tight">5. Sharing & processors</h2>
        <Card className="mt-4">
          <CardContent className="pt-6 text-sm leading-relaxed text-muted-foreground">
            <p>We only share with trusted processors who make TGAW work:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li><span className="font-medium text-foreground">Hosting & database</span> — Vercel / MongoDB Atlas (infrastructure, strictly necessary).</li>
              <li><span className="font-medium text-foreground">Auth & email</span> — Better Auth, SMTP provider (to verify email, reset passwords).</li>
              <li><span className="font-medium text-foreground">Media & storage</span> — Cloudinary (if you upload images/tracts).</li>
              <li><span className="font-medium text-foreground">Analytics (only if consented)</span> — Google Analytics 4 via Consent Mode; never loaded before consent in strict regions.</li>
            </ul>
            <p className="mt-3">We do not sell your personal information. US “sharing” for cross-context ads only occurs if you allow Marketing — turn it off to opt out.</p>
          </CardContent>
        </Card>

        {/* Retention */}
        <h2 className="mt-12 text-2xl tracking-tight">6. Retention</h2>
        <Card className="mt-4">
          <CardContent className="pt-6 text-sm leading-relaxed text-muted-foreground">
            <ul className="list-disc space-y-1 pl-5">
              <li>Account & content: while your account is active; deleted quickly after you delete your account or content (residual backups expire within 30–60 days).</li>
              <li>Logs & heartbeat presence: short-lived (minutes to days); presence rows auto-expire via TTL.</li>
              <li>Cookie consent: 12 months or until a version bump.</li>
              <li>Where the law requires longer (e.g., tax, abuse logs), we keep the minimum required and no more.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Transfers */}
        <h2 className="mt-12 text-2xl tracking-tight">7. International transfers</h2>
        <Card className="mt-4">
          <CardContent className="pt-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              Our infrastructure may process data in the US and EU. For transfers from the EEA/UK/Switzerland we rely on adequacy decisions where available, otherwise <span className="font-medium text-foreground">Standard Contractual Clauses (SCCs)</span> and supplementary measures. Brazil (LGPD), South Africa (POPIA), and others are handled on the same basis.
            </p>
          </CardContent>
        </Card>

        {/* Security */}
        <h2 className="mt-12 text-2xl tracking-tight">8. Security</h2>
        <Card className="mt-4">
          <CardContent className="pt-6 text-sm leading-relaxed text-muted-foreground">
            <p>We protect data with hashed passwords, scoped sessions, RBAC (member → superadmin), TLS, and least-privilege access. No system is 100% secure — use a strong, unique password and enable 2FA in Settings when available.</p>
          </CardContent>
        </Card>

        {/* Rights */}
        <h2 className="mt-12 text-2xl tracking-tight">9. Your rights</h2>
        <p className="mt-2 text-sm text-muted-foreground">Your region shapes your rights — we honor the strongest among them. To exercise any right, email <Link href="mailto:info@tgaw.app" className="cursor-pointer underline underline-offset-2 hover:text-foreground">info@tgaw.app</Link> or use in-app Settings where available.</p>
        <Card className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-4 py-2">Right</th><th className="px-4 py-2">EU/EEA/UK</th><th className="px-4 py-2">US (CA/CO/CT…)</th><th className="px-4 py-2">How to act</th></tr>
              </thead>
              <tbody className="divide-y">
                {rightsTable.map((r) => (
                  <tr key={r.right} className="align-top">
                    <td className="px-4 py-2 font-medium text-foreground">{r.right}</td>
                    <td className="px-4 py-2 font-mono text-xs">{r.eu}</td>
                    <td className="px-4 py-2 font-mono text-xs">{r.us}</td>
                    <td className="px-4 py-2 text-muted-foreground">{r.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Card className="border-dashed">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 font-medium text-foreground"><Trash2 aria-hidden="true" className="size-4" /> Deletion</p>
              <p className="mt-1">Delete your account in Settings. We will remove posts, bookings, and profile promptly; backups age out within 60 days. We keep only what the law requires.</p>
            </CardContent>
          </Card>
          <Card className="border-dashed">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 font-medium text-foreground"><Eye aria-hidden="true" className="size-4" /> Do Not Sell / GPC</p>
              <p className="mt-1">US residents: <span className="font-medium text-foreground">Avatar → Cookie Preferences → Marketing off</span>, or turn on GPC in your browser. No discrimination for exercising rights.</p>
            </CardContent>
          </Card>
        </div>

        {/* Changes */}
        <h2 className="mt-12 text-2xl tracking-tight">10. Changes & contact</h2>
        <Card className="mt-4">
          <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
            <p>We will update this policy when our practices or applicable laws change. Material changes bump <code className="text-xs">tgaw_consent</code> version and re-show the banner; the “Updated” badge at the top will change.</p>
            <p>
              Questions or requests? <Link href="mailto:info@tgaw.app" className="cursor-pointer underline underline-offset-2 hover:text-foreground">info@tgaw.app</Link> · See also <Link href="/cookies" className="cursor-pointer underline underline-offset-2 hover:text-foreground">Cookie Policy</Link> and{" "}
              <Link href="/terms" className="cursor-pointer underline underline-offset-2 hover:text-foreground">Terms & Conditions</Link>.
            </p>
            <p className="text-xs">Supervisory authority (EEA/UK) and state AG (US) contact details available on request. We respond to verifiable requests within 30 days (EU) / 45 days (US), with a single 45-day extension where allowed.</p>
          </CardContent>
        </Card>

        <Separator className="my-10" />

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>
            Related: <Link href="/cookies" className="cursor-pointer underline underline-offset-2 hover:text-foreground">Cookies</Link> ·{" "}
            <Link href="/terms" className="cursor-pointer underline underline-offset-2 hover:text-foreground">Terms & Conditions</Link>
          </p>
          <Link href="mailto:info@tgaw.app" className="inline-flex cursor-pointer items-center gap-1.5 hover:text-foreground">
            <Mail aria-hidden="true" className="size-3.5" /> info@tgaw.app
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">GDPR · CCPA/CPRA · LGPD · POPIA · APPI · PIPA compliant · Consent Mode v2 & GPC supported · This is not legal advice.</p>
      </main>
    </div>
  )
}