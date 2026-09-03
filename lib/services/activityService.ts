import { prisma } from "@/lib/db/prisma"

export type ActivityType = "post" | "member" | "prayer_answered" | "booking"

export interface ActivityItem {
  id: string
  type: ActivityType
  category: "praise" | "prayer" | "member" | "all"
  title: string
  subtitle: string
  href: string
  initials: string
  name: string
  image?: string | null
  createdAt: string
}

function initialsFor(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("") || "?"
}
function tintFor(category: ActivityItem["category"]): string {
  switch (category) {
    case "praise": return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
    case "prayer": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
    case "member": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
    default: return "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
  }
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return "just now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export async function getCommunityActivity(limit = 8): Promise<ActivityItem[]> {
  const [posts, members] = await Promise.all([
    prisma.post.findMany({
      where: { isHidden: false },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, type: true, body: true, authorId: true, createdAt: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, name: true, image: true, createdAt: true },
    }),
  ])

  const authorIds = [...new Set(posts.map((p) => p.authorId))]
  const authors = authorIds.length ? await prisma.user.findMany({ where: { id: { in: authorIds } }, select: { id: true, name: true, image: true } }) : []
  const authorMap = new Map(authors.map((u) => [u.id, u]))

  const postActivities: ActivityItem[] = posts.map((p) => {
    const author = authorMap.get(p.authorId)
    const name = author?.name ?? "Member"
    const isPraise = p.type === "PRAISE_REPORT" || p.type === "TESTIMONIAL"
    const isPrayer = p.type === "PRAYER_REQUEST" || p.type === "PRAYER_ANSWER"
    const category: ActivityItem["category"] = p.type === "PRAYER_ANSWER" ? "prayer" : isPraise ? "praise" : isPrayer ? "prayer" : "all"
    const type: ActivityType = p.type === "PRAYER_ANSWER" ? "prayer_answered" : "post"
    let title = ""
    if (p.type === "PRAISE_REPORT") title = `${name} posted a praise report`
    else if (p.type === "TESTIMONIAL") title = `${name} shared a testimony`
    else if (p.type === "PRAYER_REQUEST") title = `${name} shared a prayer request`
    else if (p.type === "PRAYER_ANSWER") title = `${name} marked a prayer as answered`
    else if (p.type === "BIBLE_VERSE") title = `${name} shared a verse`
    else title = `${name} posted`
    if (p.body) {
      const snippet = p.body.slice(0, 48)
      title = `${title} — ${snippet}${p.body.length > 48 ? "…" : ""}`
    }
    // tint is derived, not stored
    return {
      id: `post-${p.id}`,
      type,
      category,
      title,
      subtitle: timeAgo(p.createdAt),
      href: `/feed#${p.id}`,
      initials: initialsFor(name),
      name,
      image: author?.image ?? null,
      createdAt: p.createdAt.toISOString(),
    }
  })

  const memberActivities: ActivityItem[] = members.map((u) => ({
    id: `member-${u.id}`,
    type: "member" as const,
    category: "member" as const,
    title: `${u.name} joined`,
    subtitle: `Welcome — ${timeAgo(u.createdAt)}`,
    href: `/feed`,
    initials: initialsFor(u.name),
    name: u.name,
    image: u.image ?? null,
    createdAt: u.createdAt.toISOString(),
  }))

  const all = [...postActivities, ...memberActivities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map((a) => ({ ...a, subtitle: a.subtitle }))

  // ensure tint is computed via helper if needed client-side; we keep category for client tint
  return all
}
