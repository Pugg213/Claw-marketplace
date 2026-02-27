'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch, getToken, getUser, setToken, setUser } from '@/lib/api-client'

type AuthState = {
  token: string | null
  user: any | null
  login: (token: string, user: any) => void
  logout: () => void
}

const Ctx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTok] = useState<string | null>(null)
  const [user, setUsr] = useState<any | null>(null)

  useEffect(() => {
    setTok(getToken())
    setUsr(getUser())
  }, [])

  // Refresh server-side user (plan/proUntil) after load
  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        const me = await apiFetch<any>('/api/me')
        if (me?.user) {
          setUser(me.user)
          setUsr(me.user)
        }
      } catch {
        // ignore
      }
    })()
  }, [token])

  const value = useMemo<AuthState>(() => ({
    token,
    user,
    login: (t, u) => {
      setToken(t)
      setUser(u)
      setTok(t)
      setUsr(u)
    },
    logout: () => {
      setToken(null)
      setUser(null)
      setTok(null)
      setUsr(null)
    }
  }), [token, user])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('AuthProvider missing')
  return v
}
