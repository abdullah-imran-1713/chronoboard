/** localStorage flag — first-visit brand splash already played */
export const BRAND_SPLASH_STORAGE_KEY = 'chronoboard_brand_splash_seen'

/** Set on <html> by early head script until splash finishes */
export const BRAND_SPLASH_PENDING_CLASS = 'brand-splash-pending'

export function useBrandSplashGate() {
  function unlockBoard() {
    if (!import.meta.client) return
    document.documentElement.classList.remove(BRAND_SPLASH_PENDING_CLASS)
  }

  function hasSeenSplash(): boolean {
    if (!import.meta.client) return true
    try {
      return localStorage.getItem(BRAND_SPLASH_STORAGE_KEY) === '1'
    }
    catch {
      return false
    }
  }

  function markSplashSeen() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(BRAND_SPLASH_STORAGE_KEY, '1')
    }
    catch {
      // ignore quota / private mode
    }
  }

  return { unlockBoard, hasSeenSplash, markSplashSeen }
}
