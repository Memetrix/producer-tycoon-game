// Safari private mode blocks localStorage, so we use cookies as fallback

export class SafariCompatibleStorage {
  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = "__storage_test__"
      window.localStorage.setItem(testKey, "test")
      window.localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(";").shift()
      return cookieValue || null
    }
    return null
  }

  private setCookie(name: string, value: string, days = 365): void {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  }

  getItem(key: string): string | null {
    if (this.isLocalStorageAvailable()) {
      return window.localStorage.getItem(key)
    }
    return this.getCookie(key)
  }

  setItem(key: string, value: string): void {
    if (this.isLocalStorageAvailable()) {
      try {
        window.localStorage.setItem(key, value)
      } catch (error) {
        console.warn("[v0] localStorage failed, using cookies:", error)
        this.setCookie(key, value)
      }
    } else {
      this.setCookie(key, value)
    }
  }

  removeItem(key: string): void {
    if (this.isLocalStorageAvailable()) {
      try {
        window.localStorage.removeItem(key)
      } catch {
        this.deleteCookie(key)
      }
    } else {
      this.deleteCookie(key)
    }
  }
}
