'use client'

import { useState, useEffect } from 'react'
import { KuaProvider, useKua } from '@/components/KuaProvider'
import SplashScreen from '@/components/SplashScreen'
import Onboarding from '@/components/Onboarding'
import MainApp from '@/components/MainApp'

type View = 'splash' | 'onboard' | 'app'

function RootRouter() {
  const { user, isHydrated } = useKua()
  const [view, setView] = useState<View>('splash')

  useEffect(() => {
    // Fast-track returning users directly into the studio
    if (isHydrated && user.phone) {
      setView('app')
    }
  }, [isHydrated, user.phone])

  if (!isHydrated) {
    return <div className="min-h-screen bg-background flex flex-col items-center justify-center text-textMuted"><span className="spin-dark" /></div>
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {view === 'splash'  && <SplashScreen onEnter={() => setView('onboard')} onLogin={() => setView('app')} />}
      {view === 'onboard' && <Onboarding onComplete={() => setView('app')} />}
      {view === 'app'     && <MainApp />}
    </div>
  )
}

export default function Home() {
  return (
    <KuaProvider>
      <RootRouter />
    </KuaProvider>
  )
}
