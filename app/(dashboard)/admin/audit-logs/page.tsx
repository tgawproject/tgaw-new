import { redirect } from "next/navigation"

export default function AdminAuditLogsRedirect() {
  redirect("/admin/activity-logs")
}
