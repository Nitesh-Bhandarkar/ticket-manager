import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom"
import { LoginPage } from "@/pages/LoginPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { TicketDetailPage } from "@/pages/TicketDetailPage"
import { KnowledgeBasePage } from "@/pages/KnowledgeBasePage"
import { PrivateRoute } from "@/components/PrivateRoute"
import { useAuth } from "@/hooks/useAuth"

function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <span className="font-semibold text-sm">Ticket Manager</span>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "text-sm font-medium" : "text-sm text-muted-foreground"
            }
          >
            Tickets
          </NavLink>
          <NavLink
            to="/knowledge-base"
            className={({ isActive }) =>
              isActive ? "text-sm font-medium" : "text-sm text-muted-foreground"
            }
          >
            Knowledge Base
          </NavLink>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{user?.email}</span>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
