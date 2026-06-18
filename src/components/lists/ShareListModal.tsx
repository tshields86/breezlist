import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase.ts'
import { useAuth } from '@/hooks/useAuth.ts'
import { useModalDismiss } from '@/hooks/useModalDismiss.ts'
import { useKeyboardInset } from '@/hooks/useKeyboardInset.ts'

interface Member {
  user_id: string
  role: string
  profile: { display_name: string | null; avatar_url: string | null } | null
}

interface ShareListModalProps {
  open: boolean
  onClose: () => void
  listId: string
  isOwner: boolean
  members: Member[]
  onMembersChange: () => void
}

export function ShareListModal({ open, onClose, listId, isOwner, members, onMembersChange }: ShareListModalProps) {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const keyboardInset = useKeyboardInset()

  useModalDismiss(open, onClose)

  if (!open) return null

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !user) return

    setError(null)
    setSuccess(null)
    setLoading(true)

    const trimmedEmail = email.trim().toLowerCase()

    if (trimmedEmail === user.email) {
      setError("You can't invite yourself")
      setLoading(false)
      return
    }

    // Check if already a member
    const existingMember = members.find((m) => m.profile?.display_name === trimmedEmail)
    if (existingMember) {
      setError('This user is already a member')
      setLoading(false)
      return
    }

    // Check if user exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', trimmedEmail)
      .single()

    if (profile) {
      const { error: memberError } = await supabase
        .from('list_members')
        .insert({
          list_id: listId,
          user_id: profile.id,
          role: 'editor',
          invited_by: user.id,
        })

      if (memberError) {
        setError(memberError.message.includes('duplicate') ? 'Already a member' : memberError.message)
      } else {
        setSuccess(`${trimmedEmail} added!`)
        onMembersChange()
      }
    } else {
      const { error: inviteError } = await supabase
        .from('list_invites')
        .insert({
          list_id: listId,
          email: trimmedEmail,
          role: 'editor',
          invited_by: user.id,
        })

      if (inviteError) {
        setError(inviteError.message.includes('duplicate') ? 'Invite already sent' : inviteError.message)
      } else {
        setSuccess(`Invite sent to ${trimmedEmail}`)
      }
    }

    setEmail('')
    setLoading(false)
  }

  const handleRemoveMember = async (userId: string) => {
    const { error } = await supabase
      .from('list_members')
      .delete()
      .eq('list_id', listId)
      .eq('user_id', userId)

    if (!error) {
      onMembersChange()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ paddingBottom: keyboardInset }}
    >
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-bg-primary rounded-t-2xl sm:rounded-2xl p-6 shadow-xl max-h-full overflow-y-auto">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Share List</h2>

        {isOwner && (
          <form onSubmit={handleInvite} className="mb-6">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="px-4 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 shrink-0"
              >
                Invite
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
            {success && <p className="mt-2 text-sm text-success">{success}</p>}
          </form>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-text-muted">Members</h3>
          {members.length === 0 ? (
            <p className="text-sm text-text-secondary">No one else has access yet</p>
          ) : (
            members.map((member) => (
              <div key={member.user_id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-sm font-medium text-text-secondary">
                    {member.profile?.display_name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {member.profile?.display_name ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-text-muted capitalize">{member.role}</p>
                  </div>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleRemoveMember(member.user_id)}
                    className="text-sm text-danger hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 px-4 rounded-lg border border-border text-text-secondary font-medium hover:bg-bg-secondary transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )
}
