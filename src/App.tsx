import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { WorkoutNewPage } from '@/pages/WorkoutNewPage'
import { WorkoutDetailPage } from '@/pages/WorkoutDetailPage'
import { AdminRoute } from '@/components/AdminRoute'
import { AdminExercisesPage } from '@/pages/admin/AdminExercisesPage'
import { AdminExerciseNewPage } from '@/pages/admin/AdminExerciseNewPage'
import { AdminExerciseEditPage } from '@/pages/admin/AdminExerciseEditPage'

const queryClient = new QueryClient()

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnly>
                  <LoginPage />
                </PublicOnly>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicOnly>
                  <SignupPage />
                </PublicOnly>
              }
            />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route
              path="/workout/new"
              element={
                <ProtectedRoute>
                  <WorkoutNewPage />
                </ProtectedRoute>
              }
            />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/workout/:id" element={<WorkoutDetailPage />} />
              <Route
                path="/admin/exercises"
                element={
                  <AdminRoute>
                    <AdminExercisesPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/exercises/new"
                element={
                  <AdminRoute>
                    <AdminExerciseNewPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/exercises/:id/edit"
                element={
                  <AdminRoute>
                    <AdminExerciseEditPage />
                  </AdminRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
