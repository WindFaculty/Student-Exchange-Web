/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/authApi'
import { UserSession } from '../types/models'

interface AuthContextValue {
  user: UserSession | null
  isAuthenticated: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<UserSession>
  register: (username: string, email: string, password: string) => Promise<UserSession>
  googleLogin: (idToken: string) => Promise<UserSession>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    try {
      const currentUser = await authApi.me()
      setUser(currentUser)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const login = useCallback(async (username: string, password: string) => {
    const loggedInUser = await authApi.login(username, password)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const register = useCallback(async (username: string, email: string, password: string) => {
    const registeredUser = await authApi.register(username, email, password)
    setUser(registeredUser)
    return registeredUser
  }, [])

  const googleLogin = useCallback(async (idToken: string) => {
    const loggedInUser = await authApi.googleLogin(idToken)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    googleLogin,
    logout,
    refreshSession,
  }), [user, loading, login, register, googleLogin, logout, refreshSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
