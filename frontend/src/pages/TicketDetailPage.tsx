import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/StatusBadge"
import { SLABadge } from "@/components/SLABadge"
import { getTicket, sendReply } from "@/api/tickets"
import type { Ticket, TicketPriority } from "@/types"

const priorityVariant: Record<TicketPriority, "destructive" | "default" | "secondary"> = {
  HIGH: "destructive",
  MEDIUM: "default",
  LOW: "secondary",
}

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [replyBody, setReplyBody] = useState("")
  const [sending, setSending] = useState(false)
  const [replySent, setReplySent] = useState(false)

  useEffect(() => {
    if (id) getTicket(id).then(setTicket)
  }, [id])

  const handleReply = async () => {
    if (!id || !replyBody.trim()) return
    setSending(true)
    try {
      await sendReply(id, replyBody)
      setReplyBody("")
      setReplySent(true)
      const updated = await getTicket(id)
      setTicket(updated)
      setTimeout(() => setReplySent(false), 3000)
    } finally {
      setSending(false)
    }
  }

  if (!ticket) {
    return (
      <div className="p-6 max-w-3xl space-y-4">
        <div className="h-7 w-64 bg-muted animate-pulse rounded" />
        <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded-md" />
      </div>
    )
  }

  const isClosed = ticket.status === "RESOLVED" || ticket.status === "CLOSED"

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-semibold leading-tight">{ticket.subject}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>From: <span className="text-foreground">{ticket.emailFrom}</span></span>
          <span>·</span>
          <span>{new Date(ticket.createdAt).toLocaleString()}</span>
          <span>·</span>
          <StatusBadge status={ticket.status} />
          <Badge variant={priorityVariant[ticket.priority]}>{ticket.priority}</Badge>
          <SLABadge ticket={ticket} />
        </div>
      </div>

      <div className="rounded-lg border bg-muted/20 p-4 text-sm whitespace-pre-wrap leading-relaxed">
        {ticket.body}
      </div>

      {isClosed ? (
        <div className="flex items-center gap-2 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          This ticket is {ticket.status.toLowerCase()}. No further replies needed.
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium">Reply to customer</p>
          <Textarea
            value={replyBody}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyBody(e.target.value)}
            placeholder="Write your reply…"
            rows={6}
            className="resize-none"
          />
          <div className="flex items-center gap-3">
            <Button onClick={handleReply} disabled={sending || !replyBody.trim()}>
              {sending ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending…
                </span>
              ) : "Send Reply"}
            </Button>
            {replySent && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Reply sent — ticket marked resolved
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
