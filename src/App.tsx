import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext.tsx'
import { AuthProvider } from '@/contexts/AuthContext.tsx'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute.tsx'
import { AppShell } from '@/components/layout/AppShell.tsx'
import { ToastProvider } from '@/components/ui/Toast.tsx'

const Landing = lazy(() => import('@/pages/Landing.tsx'))
const AuthCallback = lazy(() => import('@/pages/AuthCallback.tsx'))
const Home = lazy(() => import('@/pages/Home.tsx'))
const ListView = lazy(() => import('@/pages/ListView.tsx'))
const Templates = lazy(() => import('@/pages/Templates.tsx'))
const Settings = lazy(() => import('@/pages/Settings.tsx'))

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/login" element={<Landing />} />
              <Route path="/signup" element={<Landing />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route path="/lists" element={<Home />} />
                <Route path="/lists/:id" element={<ListView />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<Navigate to="/lists" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
