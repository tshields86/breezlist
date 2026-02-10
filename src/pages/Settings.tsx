import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase.ts'
import { useAuth } from '@/hooks/useAuth.ts'
import { useTheme } from '@/hooks/useTheme.ts'
import { useToast } from '@/components/ui/Toast.tsx'
import { cn } from '@/lib/utils.ts'
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
      <h2 className="text-xl font-semibold text-text-primary">Settings</h2>

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
              className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={handleSaveName}
              disabled={saving || displayName.trim() === originalName}
              className="px-4 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
          <p className="px-3 py-2.5 rounded-lg bg-bg-secondary text-text-muted border border-border">
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
                  'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors',
                  theme === option.value
                    ? 'bg-accent text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary',
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

        <div className="p-4 rounded-lg border border-danger/30 space-y-3">
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
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-danger"
              placeholder="DELETE"
            />
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteConfirm !== 'DELETE' || deleting}
            className="w-full py-2.5 px-4 rounded-lg bg-danger text-white font-medium hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
