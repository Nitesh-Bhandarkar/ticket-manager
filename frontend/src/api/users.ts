import api from "./client"
import type { User } from "@/types"

export async function getAllUsers(): Promise<User[]> {
  const res = await api.get<User[]>("/users")
  return res.data
}
