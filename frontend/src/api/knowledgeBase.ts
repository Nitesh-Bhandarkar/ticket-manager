import api from "./client"
import type { KnowledgeBaseEntry } from "@/types"

export const getAllEntries = () =>
  api.get<KnowledgeBaseEntry[]>("/knowledge-base").then((r) => r.data)

export const addEntry = (entry: Omit<KnowledgeBaseEntry, "id" | "createdAt">) =>
  api.post<KnowledgeBaseEntry>("/knowledge-base", entry).then((r) => r.data)
