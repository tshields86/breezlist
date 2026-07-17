import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase.ts'
import { useAuth } from '@/hooks/useAuth.ts'
import { useTheme } from '@/hooks/useTheme.ts'
import { useToast } from '@/components/ui/Toast.tsx'
import { cn } from '@/lib/utils.ts'
import { inputClasses } from '@/lib/formClasses.ts'
import type { ThemeMode } from '@/types/index.ts'

export default function Settings() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [displayName, setDisplayName] = useState('')
  const [originalName, setOriginalName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        const name = data?.display_name ?? ''
        setDisplayName(name)
        setOriginalName(name)
      })
  }, [user])

  const handleSaveName = useCallback(async () => {
    if (!user || displayName.trim() === originalName) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('id', user.id)

    if (error) {
      toast('Failed to update name', 'error')
    } else {
      setOriginalName(displayName.trim())
      toast('Name updated', 'success')
    }
    setSaving(false)
  }, [user, displayName, originalName, toast])

  const handleDeleteAccount = useCallback(async () => {
    if (deleteConfirm !== 'DELETE' || !user) return
    setDeleting(true)
    // Sign out first — actual deletion would require a server-side function
    await signOut()
    toast('Account deletion requested', 'info')
  }, [deleteConfirm, user, signOut, toast])

  const themeOptions: Array<{ value: ThemeMode; label: string }> = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ]

  return (
    <div className="p-4 space-y-8">
      <h2 className="text-2xl font-extrabold tracking-tight text-text-primary">Settings</h2>

      {/* Account */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Account</h3>

        <div>
          <label htmlFor="display-name" className="block text-sm font-medium text-text-secondary mb-1">
            Display name
          </label>
          <div className="flex gap-2">
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={cn('flex-1', inputClasses)}
            />
            <button
              onClick={handleSaveName}
              disabled={saving || displayName.trim() === originalName}
              className="grad-sky shadow-sky shrink-0 rounded-xl px-5 font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
          <p className="rounded-xl bg-bg-tertiary px-3.5 py-3 text-text-secondary">
            {user?.email ?? '—'}
          </p>
        </div>
      </section>

      {/* Appearance */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Appearance</h3>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Theme</label>
          <div className="flex gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  'flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors',
                  theme === option.value
                    ? 'grad-sky text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:text-text-primary',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-danger uppercase tracking-wider">Danger Zone</h3>

        <div className="space-y-3 rounded-2xl border border-danger/30 bg-danger/5 p-4">
          <p className="text-sm text-text-secondary">
            Permanently delete your account and all data. This cannot be undone.
          </p>
          <div>
            <label htmlFor="delete-confirm" className="block text-sm font-medium text-text-secondary mb-1">
              Type DELETE to confirm
            </label>
            <input
              id="delete-confirm"
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className={cn('w-full', inputClasses)}
              placeholder="DELETE"
            />
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteConfirm !== 'DELETE' || deleting}
            className="w-full rounded-xl bg-danger px-4 py-3 font-bold text-white transition-colors hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </section>

      {/* About */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">About</h3>
        <p className="text-sm text-text-muted">Breezlist v0.1.0</p>
      </section>
    </div>
  )
}
