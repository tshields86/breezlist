import { useInstallPrompt } from '@/hooks/useInstallPrompt.ts'

export function InstallBanner() {
  const { canPrompt, isIOSDevice, install, dismiss, hasNativePrompt } = useInstallPrompt()

  if (!canPrompt) return null

  return (
    <div className="mx-4 mt-3 rounded-xl bg-accent/10 border border-accent/20 p-4 animate-[fadeInUp_0.3s_ease-out]">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">
            Install Breezlist
          </p>
          {isIOSDevice ? (
            <p className="text-xs text-text-secondary mt-1">
              Tap{' '}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-0.5">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              {' '}then &ldquo;Add to Home Screen&rdquo; for the full app experience.
            </p>
          ) : (
            <p className="text-xs text-text-secondary mt-1">
              Add to your home screen for quick access and a full-screen experience.
            </p>
          )}
          <div className="flex items-center gap-2 mt-3">
            {hasNativePrompt && (
              <button
                onClick={install}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
              >
                Install
              </button>
            )}
            <button
              onClick={dismiss}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-text-secondary hover:bg-bg-tertiary transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
