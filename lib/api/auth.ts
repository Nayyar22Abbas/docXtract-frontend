export const API_BASE = (process.env.NEXT_PUBLIC_API_URL as string | undefined) ?? 'http://127.0.0.1:8000'

const TOKEN_KEY = 'dx_access_token'
const USERNAME_KEY = 'dx_username'
const DISPLAY_NAME_KEY = 'dx_display_name'

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  user?: {
    id: string
    name: string
    email: string
  }
}

function emitAuthChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('dx-auth-changed'))
  }
}

function saveAuth(token: string, email: string, displayName?: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USERNAME_KEY, email)
  if (displayName) {
    localStorage.setItem(DISPLAY_NAME_KEY, displayName)
  }
  emitAuthChanged()
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getUsername(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(USERNAME_KEY)
}

export function getDisplayName(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(DISPLAY_NAME_KEY) ?? localStorage.getItem(USERNAME_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
  localStorage.removeItem(DISPLAY_NAME_KEY)
  emitAuthChanged()
}

export function setAuthFromToken(token: string): void {
  if (typeof window === 'undefined') return

  let username: string | undefined

  try {
    const parts = token.split('.')
    if (parts.length >= 2) {
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const decoded = typeof atob !== 'undefined' ? atob(payload) : Buffer.from(payload, 'base64').toString('binary')
      const json = JSON.parse(decoded)
      if (typeof json.sub === 'string') {
        username = json.sub
      }
    }
  } catch {
    // If decoding fails, fall back to unknown username
  }

  const effectiveUsername = username ?? 'unknown'
  saveAuth(token, effectiveUsername)
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/authuser/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: credentials.email,
        password: credentials.password,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return {
        success: false,
        message: data.detail || 'Login failed',
      }
    }

    if (!data.access_token) {
      return {
        success: false,
        message: 'No access token returned from server',
      }
    }

    // Do not set display name here; it will be set on signup or remain from previous sessions
    saveAuth(data.access_token, credentials.email)

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: credentials.email,
        name: credentials.email,
        email: credentials.email,
      },
    }
  } catch {
    return {
      success: false,
      message: 'An error occurred during login',
    }
  }
}

export async function signup(credentials: SignupCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/authuser/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: credentials.email,
        password: credentials.password,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return {
        success: false,
        message: data.detail || 'Signup failed',
      }
    }

    // Auto-login after successful signup
    const loginResult = await login({ email: credentials.email, password: credentials.password })

    // If login succeeded, store display name (frontend-only)
    if (loginResult.success) {
      const token = getToken()
      if (token) {
        saveAuth(token, credentials.email, credentials.name)
      }
    }

    return loginResult
  } catch {
    return {
      success: false,
      message: 'An error occurred during signup',
    }
  }
}

export function logout(): void {
  clearAuth()
}
