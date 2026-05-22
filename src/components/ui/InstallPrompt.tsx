'use client'

import { useEffect, useState } from 'react'
import { Plane, X, Download } from 'lucide-react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible,    setIsVisible]    = useState(false)
  const [isDismissed,  setIsDismissed]  = useState(false)

  useEffect(() => {
    // Check if already dismissed in this session
    const dismissed = sessionStorage.getItem('pwa-install-dismissed')
    if (dismissed) return

    // Check if already installed (running in standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!installEvent) return
    await installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === 'accepted') {
      setIsVisible(false)
    }
  }

  function handleDismiss() {
    setIsVisible(false)
    setIsDismissed(true)
    sessionStorage.setItem('pwa-install-dismissed', '1')
  }

  if (!isVisible || isDismissed) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="max-w-sm mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 pointer-events-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-3">
          {/* App icon */}
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Plane className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">Install SkyBook</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Add to your home screen for quick access to your flights.
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 shrink-0 p-1"
            aria-label="Dismiss install prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Install App
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
