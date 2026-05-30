import { createContext, useContext, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import type { AuthUser, UserRole } from "@/types"

function parseToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return { email: payload.sub, role: payload.role as UserRole }
  } catch {
    return null
  }
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  signIn: (token: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
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
    navigate("/login", { replace: true })
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
