'use client'

import { useState } from 'react'
import { KuaProvider } from '@/components/KuaProvider'
import SplashScreen from '@/components/SplashScreen'
import Onboarding from '@/components/Onboarding'
import MainApp from '@/components/MainApp'

type View = 'splash' | 'onboard' | 'app'

export default function Home() {
  const [view, setView] = useState<View>('splash')

  return (
    <KuaProvider>
      <div className="flex-1 flex flex-col min-h-screen">
        {view === 'splash'  && <SplashScreen onEnter={() => setView('onboard')} />}
        {view === 'onboard' && <Onboarding onComplete={() => setView('app')} />}
        {view === 'app'     && <MainApp />}
      </div>
    </KuaProvider>
  )
}
