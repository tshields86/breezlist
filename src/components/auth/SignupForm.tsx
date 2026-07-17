import { useState, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth.ts'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton.tsx'
import { TextField } from '@/components/ui/TextField.tsx'

interface SignupFormProps {
  onSwitchToLogin: () => void
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { signUp, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
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

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-4xl">🎉</div>
        <h2 className="text-xl font-bold text-text-primary">Check your email</h2>
        <p className="text-text-secondary">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <button onClick={onSwitchToLogin} className="font-semibold text-accent-text hover:underline">
          Back to login
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          id="signup-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <TextField
          id="signup-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
        <TextField
          id="signup-confirm"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="Repeat your password"
        />

        {error && (
          <p className="text-sm text-danger" role="alert">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="grad-sky shadow-sky w-full rounded-xl py-3 font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm text-text-muted">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleAuthButton onClick={handleGoogle} />

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="font-semibold text-accent-text hover:underline">
          Sign in
        </button>
      </p>
    </div>
  )
}
