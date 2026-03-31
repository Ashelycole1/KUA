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
  syncUser: (details: Partial<User>) => Promise<void>
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
  syncUser: async () => {},
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
        setUserState((prev: User) => ({ ...prev, ...JSON.parse(saved) }))
      }
    } catch {}
    setIsHydrated(true)
  }, [])

  const setUser = useCallback((partial: Partial<User>) => {
    setUserState((prev: User) => {
      const next = { ...prev, ...partial }
      localStorage.setItem('kua_user', JSON.stringify(next))
      return next
    })
  }, [])

  const syncUser = useCallback(async (details: Partial<User>) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: details.phone || user.phone,
          biz_name: details.bizName || user.bizName,
          biz_type: details.bizType || user.bizType,
          brand_keywords: details.brandKw || user.brandKw,
          currency_code: details.countryCode || user.countryCode,
        })
      })
      if (res.ok) {
        const data = await res.json()
        setUser({
          credits: data.credit_balance,
          phone: data.phone_number,
        })
      }
    } catch (e) {
      console.error("Sync error:", e)
    }
  }, [user, setUser])

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2400)
  }, [])

  return (
    <KuaCtx.Provider value={{ user, setUser, isHydrated, toast, toastMsg, toastVisible, syncUser }}>
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
