import api from "./client"
import type { Ticket, TicketStatus } from "@/types"

export const getAllTickets = () =>
  api.get<Ticket[]>("/tickets").then((r) => r.data)

export const getMyTickets = () =>
  api.get<Ticket[]>("/tickets/my").then((r) => r.data)

export const getTicket = (id: string) =>
  api.get<Ticket>(`/tickets/${id}`).then((r) => r.data)

export const updateTicketStatus = (id: string, status: TicketStatus) =>
  api.patch<Ticket>(`/tickets/${id}/status`, null, { params: { status } }).then((r) => r.data)

export const assignTicket = (id: string, agentId: string) =>
  api.patch<Ticket>(`/tickets/${id}/assign`, null, { params: { agentId } }).then((r) => r.data)

export const sendReply = (id: string, body: string) =>
  api.post(`/tickets/${id}/reply`, { body })
