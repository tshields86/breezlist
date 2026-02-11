import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'breezlist-install-dismissed'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone)
  )
}

function isIOS(): boolean {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)) return true
  // iPad on iOS 13+ reports as MacIntel with touch support
  if (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua)) return true
  return false
}

function wasDismissedRecently(): boolean {
  const dismissed = localStorage.getItem(DISMISSED_KEY)
  if (!dismissed) return false
  const dismissedAt = parseInt(dismissed, 10)
  return Date.now() - dismissedAt < DISMISS_DURATION_MS
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled] = useState(isStandalone)
  const [isDismissed, setIsDismissed] = useState(wasDismissedRecently)
  const [isIOSDevice] = useState(isIOS)

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString())
    setIsDismissed(true)
  }, [])

  const canPrompt = !isInstalled && !isDismissed && (!!deferredPrompt || isIOSDevice)

  return {
    canPrompt,
    isIOSDevice,
    isInstalled,
    install,
    dismiss,
    hasNativePrompt: !!deferredPrompt,
  }
}
