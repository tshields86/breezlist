import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth.ts'
import { Logo } from '@/components/ui/Logo.tsx'
import { LoginForm } from '@/components/auth/LoginForm.tsx'
import { SignupForm } from '@/components/auth/SignupForm.tsx'
import { InstallBanner } from '@/components/ui/InstallBanner.tsx'

export default function Landing() {
  const { user, loading } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/lists" replace />
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <Logo className="text-4xl" />
        <p className="mt-2 text-text-secondary">Easy shared lists for everything</p>
      </div>

      <div className="w-full max-w-sm">
        <InstallBanner />
      </div>

      <div className="mt-4">
        {mode === 'login' ? (
          <LoginForm onSwitchToSignup={() => setMode('signup')} />
        ) : (
          <SignupForm onSwitchToLogin={() => setMode('login')} />
        )}
      </div>
    </div>
  )
}
