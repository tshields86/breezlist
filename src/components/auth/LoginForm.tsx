import { useState, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth.ts'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton.tsx'
import { TextField } from '@/components/ui/TextField.tsx'

interface LoginFormProps {
  onSwitchToSignup: () => void
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const { signIn, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <TextField
          id="login-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="Your password"
        />

        {error && (
          <p className="text-sm text-danger" role="alert">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="grad-sky shadow-sky w-full rounded-xl py-3 font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm text-text-muted">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleAuthButton onClick={handleGoogle} />

      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <button onClick={onSwitchToSignup} className="font-semibold text-accent-text hover:underline">
          Sign up
        </button>
      </p>
    </div>
  )
}
