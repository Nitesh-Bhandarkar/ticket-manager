import { useState, useCallback } from "react"
import type { AuthUser, UserRole } from "@/types"

function parseToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return { email: payload.sub, role: payload.role as UserRole }
  } catch {
    return null
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem("token")
    return token ? parseToken(token) : null
  })

  const signIn = useCallback((token: string) => {
    localStorage.setItem("token", token)
    setUser(parseToken(token))
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem("token")
    setUser(null)
  }, [])

  return { user, signIn, signOut, isAuthenticated: !!user }
}
