import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/StatusBadge"
import { SLABadge } from "@/components/SLABadge"
import { useAuth } from "@/hooks/useAuth"
import { getAllTickets, getMyTickets } from "@/api/tickets"
import type { Ticket, TicketPriority } from "@/types"

const priorityVariant: Record<TicketPriority, "destructive" | "default" | "secondary"> = {
  HIGH: "destructive",
  MEDIUM: "default",
  LOW: "secondary",
}

function SkeletonRow() {
  return (
    <TableRow>
      {[60, 40, 20, 24, 20, 28].map((w, i) => (
        <TableCell key={i}>
          <div className={`h-5 w-${w} bg-muted animate-pulse rounded`} />
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    const fetch = user?.role === "ADMIN" ? getAllTickets : getMyTickets
    fetch()
      .then(setTickets)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {user?.role === "ADMIN" ? "All Tickets" : "My Tickets"}
          </h1>
          {!loading && !error && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
            </p>
          )}
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-medium text-sm">Failed to load tickets</p>
          <p className="text-sm text-muted-foreground mt-1">Try refreshing the page</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="font-medium text-sm">No tickets yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Tickets will appear here when received</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <TableCell className="font-medium max-w-xs truncate">{ticket.subject}</TableCell>
                    <TableCell className="text-muted-foreground">{ticket.category ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={priorityVariant[ticket.priority]}>{ticket.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell>
                      <SLABadge ticket={ticket} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
