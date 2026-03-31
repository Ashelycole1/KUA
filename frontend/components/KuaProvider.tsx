'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

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
  toast: (msg: string) => void
  toastMsg: string
  toastVisible: boolean
}

const defaultUser: User = {
  phone: '',
  bizName: '',
  bizType: '',
  brandKw: 'Fresh, Affordable, Daily, Trusted, Local',
  credits: 3,
  balance: 0,
  countryCode: 'KE',
}

const KuaCtx = createContext<KuaContextType>({
  user: defaultUser,
  setUser: () => {},
  toast: () => {},
  toastMsg: '',
  toastVisible: false,
})

export function KuaProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User>(defaultUser)
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  const setUser = useCallback((partial: Partial<User>) => {
    setUserState(prev => ({ ...prev, ...partial }))
  }, [])

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2400)
  }, [])

  return (
    <KuaCtx.Provider value={{ user, setUser, toast, toastMsg, toastVisible }}>
      {children}
      {/* Global toast */}
      <div
        className="toast-bar"
        style={{ opacity: toastVisible ? 1 : 0 }}
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
