'use client'

import { useState } from 'react'
import { useKua } from './KuaProvider'
import HomePane from './panes/HomePane'
import CreatePane from './panes/CreatePane'
import SchedulePane from './panes/SchedulePane'
import AmbassadorsPane from './panes/AmbassadorsPane'
import AnalyticsPane from './panes/AnalyticsPane'
import SettingsPane from './panes/SettingsPane'

type Tab = 'home' | 'create' | 'schedule' | 'ambassadors' | 'analytics' | 'settings'

const NAV: { id: Tab, label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'create', label: 'Create' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'ambassadors', label: 'Ambassadors' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' },
]

export default function MainApp() {
  const { user } = useKua()
  const [tab, setTab] = useState<Tab>('home')

  return (
    <div className="pb-12 bg-ca min-h-screen">
      {/* Topbar */}
      <div className="flex items-center justify-between py-3.5 px-5 border-b border-br bg-ca gap-3 flex-wrap sticky top-0 z-50">
        <div className="font-syne text-[21px] font-extrabold text-kGreen tracking-[-0.5px] whitespace-nowrap">
          KUA
        </div>
        <div className="flex items-center gap-2 bg-su border border-br rounded-full px-3.5 py-1.5 text-[12px] text-mu">
          <div className="w-2 h-2 rounded-full bg-kGreen shrink-0" />
          {user.bizName || "General Account"}
        </div>
      </div>

      {/* Sidenav (Horizontal scroll on mobile) */}
      <div className="flex gap-[2px] py-3 px-5 border-b border-br overflow-x-auto bg-ca sticky top-[60px] z-40 hide-scrollbar">
        {NAV.map(n => {
          const active = tab === n.id
          return (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`px-[15px] py-[7px] rounded-full border text-[12px] font-medium font-sans transition-all whitespace-nowrap ${
                active 
                  ? 'bg-kGreen text-white border-kGreen' 
                  : 'bg-transparent text-mu border-transparent hover:bg-su hover:text-tx hover:border-br'
              }`}
            >
              {n.label}
            </button>
          )
        })}
      </div>

      {/* Pane Content */}
      <div className="p-5 max-w-2xl mx-auto">
        {tab === 'home' && <HomePane onTabChange={setTab} />}
        {tab === 'create' && <CreatePane onTabChange={setTab} />}
        {tab === 'schedule' && <SchedulePane onTabChange={setTab} />}
        {tab === 'ambassadors' && <AmbassadorsPane onTabChange={setTab} />}
        {tab === 'analytics' && <AnalyticsPane />}
        {tab === 'settings' && <SettingsPane />}
      </div>
      
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
