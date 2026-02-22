import { fetchJson } from './http'
import { UserSession } from '../types/models'

interface LoginResponse {
  success: boolean
  message: string
  user?: UserSession
}

export const authApi = {
  async login(username: string, password: string): Promise<UserSession> {
    const data = await fetchJson<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })

    if (!data.success || !data.user) {
      throw new Error(data.message || 'Login failed')
    }

    return data.user
  },

  async register(username: string, email: string, password: string): Promise<UserSession> {
    const data = await fetchJson<LoginResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    })

    if (!data.success || !data.user) {
      throw new Error(data.message || 'Registration failed')
    }

    return data.user
  },

  async logout(): Promise<void> {
    await fetchJson<LoginResponse>('/api/auth/logout', { method: 'POST' })
  },

  async me(): Promise<UserSession> {
    return fetchJson<UserSession>('/api/auth/me')
  },

  async googleLogin(idToken: string): Promise<UserSession> {
    const data = await fetchJson<LoginResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    })

    if (!data.success || !data.user) {
      throw new Error(data.message || 'Google Login failed')
    }

    return data.user
  },
}
