import { cn } from "@/lib/utils"
import type { Ticket } from "@/types"

export function SLABadge({ ticket }: { ticket: Ticket }) {
  if (!ticket.slaDeadline) return null

  const cls = ticket.slaBreached
    ? "bg-red-100 text-red-700"
    : ticket.slaAtRisk
    ? "bg-yellow-100 text-yellow-700"
    : "bg-green-100 text-green-700"

  const label = ticket.slaBreached ? "Breached" : ticket.slaAtRisk ? "At Risk" : "On Track"

  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", cls)}>
      {label}
    </span>
  )
}
