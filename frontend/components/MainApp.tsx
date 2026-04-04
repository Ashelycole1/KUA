'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home as HomeIcon, Wand2, Send, Clock, ChevronRight, Settings, Bell, Users, Calendar, BarChart2 } from 'lucide-react'
import WalletHeader from './WalletHeader'
import HistoryTab from './HistoryTab'
import SettingsPane from './panes/SettingsPane'
import NotificationOverlay from './NotificationOverlay'
import SchedulePane from './panes/SchedulePane'
import AmbassadorsPane from './panes/AmbassadorsPane'
import AnalyticsPane from './panes/AnalyticsPane'
import HomePane from './panes/HomePane'
import CreatePane from './panes/CreatePane'
import { useKua } from './KuaProvider'
import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'

type Tab = 'home' | 'create' | 'ambassadors' | 'schedule' | 'analytics' | 'history' | 'settings'

const NAV = [
  { id: 'home' as Tab,        label: 'Home',        icon: HomeIcon },
  { id: 'create' as Tab,      label: 'Create',      icon: Wand2 },
  { id: 'ambassadors' as Tab, label: 'Ambassadors', icon: Users },
  { id: 'schedule' as Tab,    label: 'Schedule',    icon: Calendar },
  { id: 'analytics' as Tab,   label: 'Analytics',   icon: BarChart2 },
  { id: 'history' as Tab,     label: 'History',     icon: Clock },
]

export default function MainApp() {
  const { user, setUser, toast, countryData, notifications } = useKua()
  const [tab, setTab] = useState<Tab>('home')
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  function handleTopUp() {
    toast('Payment prompt sent to device…')
    setTimeout(() => {
      setUser({ credits: user.credits + 10 })
      toast(`✅ 10 credits funded via ${countryData.paymentMethod}!`)
    }, 2000)
  }

  function handleFundWallet() {
    toast('Payment prompt sent to device…')
    setTimeout(() => {
      setUser({ balance: user.balance + 500 })
      toast(`✅ ${formatCurrency(500, countryData)} added to your wallet!`)
    }, 2000)
  }

  const Sidebar = () => (
    <div className="hidden md:flex w-64 flex-col border-r border-white/5 h-screen sticky top-0 bg-[#070b0c] p-6 z-50">
      <div className="font-bold text-3xl tracking-tight text-white mb-2 ml-2">
        Kua<span className="text-primary leading-none">.</span>
      </div>
      <div className="text-[12px] text-textMuted ml-3 font-medium mb-6 tracking-widest uppercase flex items-center gap-2">
        Marketing Engine
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      </div>

      {/* Mini Schedule Indicator */}
      <div className="mx-2 mb-8 p-3 rounded-xl bg-white/5 border border-white/10 group cursor-pointer hover:border-primary/30 transition-all" onClick={() => setTab('schedule')}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-textMuted group-hover:text-primary transition-colors">Next Sequence</span>
          <div className="dot-sched" />
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-lg px-2 py-1 text-center shrink-0 border border-primary/20">
            <div className="text-[8px] font-bold text-primary leading-tight">MON</div>
            <div className="text-[13px] font-black text-white leading-tight">07</div>
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-bold text-white truncate">Weekend Spinach</div>
            <div className="text-[10px] text-textMuted truncate">09:30 · 284 nodes</div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 flex-1">
        {NAV.map(n => {
          const active = tab === n.id
          const Icon = n.icon
          return (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all relative font-bold text-[14px]",
                active ? "text-primary bg-primary/10 shadow-[inner_0_0_15px_rgba(0,255,163,0.05)] border border-primary/20" : "text-textMuted hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={18} />
              {n.label}
              {active && <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          )
        })}
      </div>

      <div className="h-[1px] bg-white/5 w-full my-6" />

      <button 
        onClick={() => setTab('settings')}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-bold text-[14px] text-left",
          tab === 'settings' ? "text-primary bg-primary/10 border border-primary/20" : "text-textMuted hover:text-white hover:bg-white/5"
        )}
      >
        <Settings size={18} />
        Settings
      </button>
    </div>
  )

  const BottomDock = () => (
    <div className="fixed bottom-6 left-0 right-0 px-4 z-[60] md:hidden pointer-events-none">
      <div className="bg-[#141E24]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-1 flex justify-between shadow-[0_20px_50px_rgba(0,0,0,0.9)] pointer-events-auto max-w-[400px] mx-auto overflow-hidden">
        {NAV.filter(n => n.id !== 'history').map(n => {
          const active = tab === n.id
          const Icon = n.icon
          return (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className="relative flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-colors z-10 min-w-0"
            >
              {active && (
                <motion.div 
                  layoutId="activeTabMobile"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl z-[-1]"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <Icon size={20} className={active ? "text-primary" : "text-textMuted"} />
              <span className={cn(
                "text-[10px] font-semibold tracking-wide",
                active ? "text-primary" : "text-textMuted"
              )}>
                {n.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background w-full">
      {/* ── Left Sidebar (Desktop Only) ── */}
      <Sidebar />

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col relative w-full h-full min-h-screen pt-4 md:pt-10">
        
        {/* Desktop Header row mapping notifications */}
        <div className="hidden md:flex justify-end px-12 pb-6 relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 relative transition-all hover:bg-white/10"
          >
            <Bell size={20} className={isNotifOpen ? "text-primary" : "text-textSecondary"} />
            {(user.credits <= 2 || notifications.length > 0) && (
              <span className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-secondary border-2 border-background" />
            )}
          </button>
        </div>

        <div className="md:max-w-3xl md:mx-auto w-full px-0 md:px-12 flex flex-col flex-1 pb-32 md:pb-12">
          
          <WalletHeader onTopUp={handleTopUp} onFundWallet={handleFundWallet} onNotificationClick={() => setIsNotifOpen(true)} />

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="mt-6 px-6 md:px-0"
            >
              {/* ── HOME TAB ── */}
              {tab === 'home' && (
                <div className="flex flex-col gap-5">
                  <div className="glass-panel p-5 flex gap-4 items-center bg-primary/5 border-primary/20">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="w-3.5 h-3.5 bg-primary rounded-full shadow-[0_0_15px_3px_rgba(0,255,163,0.5)]" />
                    </div>
                    <div>
                      <div className="text-[15px] font-bold text-primary mb-1">Neural DNA Active</div>
                      <div className="text-[13px] text-textSecondary leading-relaxed md:max-w-md">
                        AI has been fully calibrated to your brand voice. All campaigns will natively sound like you.
                      </div>
                    </div>
                  </div>

                  {user.credits <= 2 && (
                    <div className="glass-panel p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-secondary/5 border-secondary/20">
                      <div className="flex-1">
                        <div className="text-[14px] font-bold text-secondary mb-1">Low Credits Warning</div>
                        <div className="text-[13px] text-textSecondary">
                          Fund {formatCurrency(countryData.pricePer10, countryData)} to unlock 10 more campaigns.
                        </div>
                      </div>
                      <button className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-secondary text-background hover:bg-[#ff8533] transition-colors whitespace-nowrap" onClick={handleTopUp}>
                        Fund Wallet
                      </button>
                    </div>
                  )}

                  <div className="mt-4">
                    <HomePane onTabChange={setTab} />
                  </div>
                </div>
              )}

              {tab === 'create'      && <CreatePane onTabChange={(t: string) => setTab(t as Tab)} />}
              {tab === 'ambassadors' && <AmbassadorsPane onTabChange={setTab} />}
              {tab === 'schedule'    && <SchedulePane onTabChange={setTab} />}
              {tab === 'analytics'   && <AnalyticsPane />}
              {tab === 'history'     && <HistoryTab />}
              {tab === 'settings'    && <SettingsPane />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Mobile Bottom Dock (Phones Only) ── */}
      <BottomDock />
      
      {/* Global Overlays */}
      <NotificationOverlay 
        isOpen={isNotifOpen} 
        onClose={() => setIsNotifOpen(false)} 
        onNavigate={(t: string) => { setTab(t as Tab); setIsNotifOpen(false); }}
      />
    </div>
  )
}
