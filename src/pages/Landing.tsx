import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth.ts'
import { BrandMark } from '@/components/ui/Mark.tsx'
import { Logo } from '@/components/ui/Logo.tsx'
import { LoginForm } from '@/components/auth/LoginForm.tsx'
import { SignupForm } from '@/components/auth/SignupForm.tsx'

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
    <div className="relative min-h-screen overflow-hidden px-4 py-10">
      <div className="grad-dawn absolute inset-0 opacity-90" />
      <div className="sun-glow absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-sm flex-col justify-center">
        <div className="mb-7 flex flex-col items-center text-center">
          <BrandMark size={60} />
          <Logo className="mt-4 text-3xl" />
          <p className="mt-2 text-text-secondary">Lists that feel like a breeze</p>
        </div>

        <div className="glass shadow-soft rounded-3xl p-6 sm:p-8">
          {mode === 'login' ? (
            <LoginForm onSwitchToSignup={() => setMode('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setMode('login')} />
          )}
        </div>
      </div>
    </div>
  )
}
