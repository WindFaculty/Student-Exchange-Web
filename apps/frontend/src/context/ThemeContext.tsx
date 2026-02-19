/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  mode: ThemeMode
  resolvedTheme: ResolvedTheme
  setMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const STORAGE_KEY = 'student-exchange-theme'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const resolveTheme = (mode: ThemeMode): ResolvedTheme => {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved
    }
    return 'system'
  })
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(mode))

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const nextResolved = resolveTheme(mode)
      setResolvedTheme(nextResolved)
      document.documentElement.classList.toggle('dark', nextResolved === 'dark')
    }

    apply()
    const handler = () => {
      if (mode === 'system') {
        apply()
      }
    }

    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [mode])

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode)
    localStorage.setItem(STORAGE_KEY, nextMode)
  }, [])

  const toggleTheme = useCallback(() => {
    const effective = resolveTheme(mode)
    setMode(effective === 'dark' ? 'light' : 'dark')
  }, [mode, setMode])

  const value = useMemo<ThemeContextValue>(() => ({
    mode,
    resolvedTheme,
    setMode,
    toggleTheme,
  }), [mode, resolvedTheme, setMode, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }
  return context
}
