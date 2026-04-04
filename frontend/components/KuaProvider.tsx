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
  notifications: any[]
  addNotification: (n: any) => void
  activityHistory: any[]
  addHistoryItem: (type: 'campaign' | 'deposit' | 'payout', payload: any) => void
}

const defaultUser: User = {
  phone: '',
  bizName: '',
  bizType: '',
  brandKw: 'Fresh, Affordable, Daily, Trusted, Local',
  credits: 100,
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
  notifications: [],
  addNotification: () => {},
  activityHistory: [],
  addHistoryItem: () => {},
})

export function KuaProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User>(defaultUser)
  const [isHydrated, setIsHydrated] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [activityHistory, setActivityHistory] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [clerkUser, setClerkUser] = useState<any>(null)

  useEffect(() => {
    const checkClerk = setInterval(() => {
      if (window.Clerk && (window.Clerk as any).loaded) {
        clearInterval(checkClerk)
        setIsLoaded(true)
        setClerkUser(window.Clerk.user)
        
        window.Clerk.addListener(({ user }) => {
          setClerkUser(user)
        })
      }
    }, 200)
    return () => clearInterval(checkClerk)
  }, [])

  useEffect(() => {
    if (isLoaded && clerkUser) {
      const meta = clerkUser.publicMetadata as any
      setUserState(prev => ({
        ...prev,
        phone: clerkUser.primaryPhoneNumber?.phoneNumber || prev.phone,
        bizName: meta.bizName as string || prev.bizName,
        bizType: meta.bizType as string || prev.bizType,
        brandKw: meta.brandKw as string || prev.brandKw,
      }))
    }
  }, [isLoaded, clerkUser])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kua_user')
      if (saved) setUserState((prev: User) => ({ ...prev, ...JSON.parse(saved) }))
      
      const savedHistory = localStorage.getItem('kua_history')
      if (savedHistory) setActivityHistory(JSON.parse(savedHistory))
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

  const addNotification = useCallback((n: any) => {
    setNotifications(prev => [{ ...n, id: Date.now(), time: 'Just now' }, ...prev].slice(0, 5))
  }, [])

  const addHistoryItem = useCallback((type: 'campaign' | 'deposit' | 'payout', payload: any) => {
    setActivityHistory(prev => {
      const next = [{ id: Date.now(), type, timestamp: new Date().toISOString(), payload }, ...prev]
      localStorage.setItem('kua_history', JSON.stringify(next))
      return next
    })
  }, [])

  const syncUser = useCallback(async (details: Partial<User>) => {
    if (!window.Clerk?.user) return

    try {
      const token = await window.Clerk.session?.getToken({ template: 'supabase' })
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
          balance: data.balance,
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
    <KuaCtx.Provider value={{ user, setUser, isHydrated, toast, toastMsg, toastVisible, syncUser, notifications, addNotification, activityHistory, addHistoryItem }}>
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
