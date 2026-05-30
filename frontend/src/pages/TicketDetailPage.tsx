import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/StatusBadge"
import { SLABadge } from "@/components/SLABadge"
import { getTicket, sendReply } from "@/api/tickets"
import type { Ticket } from "@/types"

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [replyBody, setReplyBody] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (id) getTicket(id).then(setTicket)
  }, [id])

  const handleReply = async () => {
    if (!id || !replyBody.trim()) return
    setSending(true)
    try {
      await sendReply(id, replyBody)
      setReplyBody("")
      const updated = await getTicket(id)
      setTicket(updated)
    } finally {
      setSending(false)
    }
  }

  if (!ticket) return <p className="p-6 text-muted-foreground">Loading…</p>

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{ticket.subject}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>From: {ticket.emailFrom}</span>
          <span>·</span>
          <StatusBadge status={ticket.status} />
          <SLABadge ticket={ticket} />
        </div>
      </div>

      <div className="rounded-md border p-4 bg-muted/30 text-sm whitespace-pre-wrap">
        {ticket.body}
      </div>

      {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Reply</p>
          <Textarea
            value={replyBody}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyBody(e.target.value)}
            placeholder="Write your reply…"
            rows={6}
          />
          <Button onClick={handleReply} disabled={sending || !replyBody.trim()}>
            {sending ? "Sending…" : "Send Reply"}
          </Button>
        </div>
      )}
    </div>
  )
}
