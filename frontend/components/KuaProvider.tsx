'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { CountryCurrencyMap, getCountryByPrefix } from '@/lib/currency'

interface User {
  phone: string
  bizName: string
  bizType: string
  brandKw: string
  credits: number
  balance: number
  countryCode: string
}

interface KuaContextType {
  user: User
  setUser: (u: Partial<User>) => void
  isHydrated: boolean
  toast: (msg: string) => void
  toastMsg: string
  toastVisible: boolean
}

const defaultUser: User = {
  phone: '',
  bizName: '',
  bizType: '',
  brandKw: 'Fresh, Affordable, Daily, Trusted, Local',
  credits: 0,
  balance: 0,
  countryCode: 'KE',
}

const KuaCtx = createContext<KuaContextType>({
  user: defaultUser,
  setUser: () => {},
  isHydrated: false,
  toast: () => {},
  toastMsg: '',
  toastVisible: false,
})

export function KuaProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User>(defaultUser)
  const [isHydrated, setIsHydrated] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kua_user')
      if (saved) {
        setUserState(prev => ({ ...prev, ...JSON.parse(saved) }))
      }
    } catch {}
    setIsHydrated(true)
  }, [])

  const setUser = useCallback((partial: Partial<User>) => {
    setUserState(prev => {
      const next = { ...prev, ...partial }
      localStorage.setItem('kua_user', JSON.stringify(next))
      return next
    })
  }, [])

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2400)
  }, [])

  return (
    <KuaCtx.Provider value={{ user, setUser, isHydrated, toast, toastMsg, toastVisible }}>
      {children}
      {/* Global toast */}
      <div
        className="toast-bar z-[100]"
        style={{ opacity: toastVisible ? 1 : 0, pointerEvents: toastVisible ? 'auto' : 'none' }}
      >
        {toastMsg}
      </div>
    </KuaCtx.Provider>
  )
}

export function useKua() {
  const ctx = useContext(KuaCtx)
  return {
    ...ctx,
    countryData: getCountryByPrefix(ctx.user.phone || ctx.user.countryCode)
  }
}
