import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { CountryCurrencyMap, getCountryByPrefix } from '@/lib/currency'
import { useUser, useAuth } from '@clerk/nextjs'

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
  notifications: [],
  addNotification: () => {},
})

export function KuaProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser()
  const { getToken } = useAuth()
  const [user, setUserState] = useState<User>(defaultUser)
  const [isHydrated, setIsHydrated] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  // Sync Clerk User to Local State
  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      setUserState(prev => ({
        ...prev,
        phone: clerkUser.primaryPhoneNumber?.phoneNumber || prev.phone,
        bizName: clerkUser.publicMetadata.bizName as string || prev.bizName,
        // We sync from clerk metadata if available, otherwise keep local
      }))
    }
  }, [isLoaded, isSignedIn, clerkUser])

  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      setUserState(prev => ({
        ...prev,
        phone: clerkUser.primaryPhoneNumber?.phoneNumber || prev.phone,
        bizName: clerkUser.publicMetadata.bizName as string || prev.bizName,
        bizType: clerkUser.publicMetadata.bizType as string || prev.bizType,
        brandKw: clerkUser.publicMetadata.brandKw as string || prev.brandKw,
      }))
    }
  }, [isLoaded, isSignedIn, clerkUser])

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

  const addNotification = useCallback((n: any) => {
    setNotifications(prev => [{ ...n, id: Date.now(), time: 'Just now' }, ...prev].slice(0, 5))
  }, [])

  const syncUser = useCallback(async (details: Partial<User>) => {
    if (!isSignedIn) return

    try {
      const token = await getToken({ template: 'supabase' })
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login`, {
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
          phone: data.phone_number,
        })
      }
    } catch (e) {
      console.error("Sync error:", e)
    }
  }, [user, setUser, isSignedIn, getToken])

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2400)
  }, [])

  return (
    <KuaCtx.Provider value={{ user, setUser, isHydrated, toast, toastMsg, toastVisible, syncUser, notifications, addNotification }}>
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
