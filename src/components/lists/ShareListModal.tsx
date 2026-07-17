import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase.ts'
import { useAuth } from '@/hooks/useAuth.ts'
import { ModalShell } from '@/components/ui/ModalShell.tsx'
import { useToast } from '@/components/ui/Toast.tsx'
import { cn } from '@/lib/utils.ts'
import { inputClasses } from '@/lib/formClasses.ts'

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
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [shareEnabled, setShareEnabled] = useState(false)
  const [linkBusy, setLinkBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = shareToken ? `${window.location.origin}/s/${shareToken}` : ''

  // Load the current share-link state when the modal opens (owner only).
  useEffect(() => {
    if (!open || !isOwner) return
    supabase
      .from('lists')
      .select('share_token, share_enabled')
      .eq('id', listId)
      .single()
      .then(({ data }) => {
        setShareToken(data?.share_token ?? null)
        setShareEnabled(data?.share_enabled ?? false)
      })
  }, [open, isOwner, listId])

  const handleCreateLink = async () => {
    setLinkBusy(true)
    const { data, error: linkError } = await supabase.rpc('create_share_link', { _list_id: listId })
    setLinkBusy(false)
    if (linkError || !data) {
      toast('Could not create link. Please try again.', 'error')
      return
    }
    setShareToken(data)
    setShareEnabled(true)
  }

  const handleRevokeLink = async () => {
    setLinkBusy(true)
    const { error: linkError } = await supabase.rpc('revoke_share_link', { _list_id: listId })
    setLinkBusy(false)
    if (linkError) {
      toast('Could not disable link. Please try again.', 'error')
      return
    }
    setShareEnabled(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast('Could not copy. Long-press the link to copy it.', 'error')
    }
  }

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

    // Look up the invitee. Duplicate members are caught by the DB unique
    // constraint below (we don't have member emails on the client to pre-check).
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
        setError(memberError.message.includes('duplicate') ? 'Already a member' : 'Could not add member. Please try again.')
      } else {
        setSuccess(`${trimmedEmail} added!`)
        setEmail('')
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
        setError(inviteError.message.includes('duplicate') ? 'Invite already sent' : 'Could not send invite. Please try again.')
      } else {
        setSuccess(`Invite sent to ${trimmedEmail}`)
        setEmail('')
      }
    }

    setLoading(false)
  }

  const handleRemoveMember = async (userId: string) => {
    const { error: removeError } = await supabase
      .from('list_members')
      .delete()
      .eq('list_id', listId)
      .eq('user_id', userId)

    if (removeError) {
      toast('Could not remove member. Please try again.', 'error')
    } else {
      onMembersChange()
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Share List"
      left={false}
      right={
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-2 rounded-lg text-accent-text font-semibold hover:bg-bg-secondary transition-colors"
        >
          Done
        </button>
      }
    >
      {isOwner && (
        <div className="mb-6">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">Share by link</h3>
          {shareEnabled && shareToken ? (
            <>
              <div className="flex gap-2">
                <input readOnly value={shareUrl} onFocus={(e) => e.target.select()} className={cn('flex-1', inputClasses)} />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="grad-sky shadow-sky shrink-0 rounded-xl px-5 font-bold text-white transition-transform hover:-translate-y-0.5"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-text-secondary">Anyone with the link can view. Sign in to edit.</p>
                <button
                  type="button"
                  onClick={handleRevokeLink}
                  disabled={linkBusy}
                  className="text-sm font-semibold text-danger hover:underline disabled:opacity-50"
                >
                  Disable link
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={handleCreateLink}
              disabled={linkBusy}
              className="grad-sky shadow-sky w-full rounded-xl px-4 py-2.5 font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {linkBusy ? 'Creating…' : 'Create share link'}
            </button>
          )}
        </div>
      )}

      {isOwner && (
        <form onSubmit={handleInvite} className="mb-6">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">Invite by email</h3>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              autoComplete="off"
              className={cn('flex-1', inputClasses)}
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="grad-sky shadow-sky shrink-0 rounded-xl px-5 font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              Invite
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          {success && <p className="mt-2 text-sm text-success">{success}</p>}
        </form>
      )}

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Members</h3>
        {members.length === 0 ? (
          <p className="text-sm text-text-secondary">No one else has access yet</p>
        ) : (
          members.map((member) => (
            <div key={member.user_id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="grad-sky flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
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
    </ModalShell>
  )
}
