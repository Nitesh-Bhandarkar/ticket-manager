import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom"
import { AuthProvider, useAuth } from "@/hooks/useAuth"
import { LoginPage } from "@/pages/LoginPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { TicketDetailPage } from "@/pages/TicketDetailPage"
import { KnowledgeBasePage } from "@/pages/KnowledgeBasePage"
import { UsersPage } from "@/pages/UsersPage"
import { PrivateRoute } from "@/components/PrivateRoute"

function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card px-6 py-0 flex items-center justify-between h-14 shrink-0">
        <nav className="flex items-center gap-1">
          <span className="font-semibold text-sm mr-4">Ticket Manager</span>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? "text-sm font-medium px-3 py-2 rounded-md bg-accent text-accent-foreground"
                : "text-sm text-muted-foreground px-3 py-2 rounded-md hover:bg-accent/50 hover:text-foreground transition-colors"
            }
          >
            Tickets
          </NavLink>
          <NavLink
            to="/knowledge-base"
            className={({ isActive }) =>
              isActive
                ? "text-sm font-medium px-3 py-2 rounded-md bg-accent text-accent-foreground"
                : "text-sm text-muted-foreground px-3 py-2 rounded-md hover:bg-accent/50 hover:text-foreground transition-colors"
            }
          >
            Knowledge Base
          </NavLink>
          {user?.role === "ADMIN" && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                isActive
                  ? "text-sm font-medium px-3 py-2 rounded-md bg-accent text-accent-foreground"
                  : "text-sm text-muted-foreground px-3 py-2 rounded-md hover:bg-accent/50 hover:text-foreground transition-colors"
              }
            >
              Users
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
            {user?.role}
          </span>
          <button
            onClick={signOut}
            className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <TicketDetailPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/knowledge-base"
            element={
              <PrivateRoute>
                <Layout>
                  <KnowledgeBasePage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute roles={["ADMIN"]}>
                <Layout>
                  <UsersPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
