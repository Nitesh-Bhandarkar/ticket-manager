export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REOPENED"
export type TicketPriority = "HIGH" | "MEDIUM" | "LOW"
export type UserRole = "ADMIN" | "AGENT"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
}

export interface Ticket {
  id: string
  subject: string
  body: string
  emailFrom: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  assignedAgentId?: string
  assignedAgentName?: string
  slaDeadline?: string
  slaBreached: boolean
  slaAtRisk: boolean
  createdAt: string
  resolvedAt?: string
}

export interface TicketReply {
  id: string
  ticketId: string
  body: string
  sentBy?: string
  aiGenerated: boolean
  sentAt: string
}

export interface KnowledgeBaseEntry {
  id: string
  title: string
  category: string
  problemDescription: string
  resolution: string
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface AuthUser {
  email: string
  role: UserRole
}
