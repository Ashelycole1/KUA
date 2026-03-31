'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home as HomeIcon, Wand2, Send, Clock, ChevronRight } from 'lucide-react'
import WalletHeader from './WalletHeader'
import CampaignStudio from './CampaignStudio'
import BroadcastSMS from './BroadcastSMS'
import HistoryTab from './HistoryTab'
import { useKua } from './KuaProvider'
import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'

type Tab = 'home' | 'studio' | 'broadcast' | 'history'

const NAV = [
  { id: 'home' as Tab,      label: 'Home',      icon: HomeIcon },
  { id: 'studio' as Tab,    label: 'Studio',    icon: Wand2 },
  { id: 'broadcast' as Tab, label: 'Broadcast', icon: Send },
  { id: 'history' as Tab,   label: 'History',   icon: Clock },
]

export default function MainApp() {
  const { user, setUser, toast, countryData } = useKua()
  const [tab, setTab] = useState<Tab>('home')

  function handleTopUp() {
    toast('Payment prompt sent to device…')
    setTimeout(() => {
      setUser({ credits: user.credits + 10 })
      toast(`✅ 10 credits funded via ${countryData.paymentMethod}!`)
    }, 2000)
  }

  return (
    <div className="flex-1 flex flex-col h-[100dvh] relative bg-background">
      <WalletHeader onTopUp={handleTopUp} />

      {/* Main scrollable content view */}
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-24" id="scroll-area">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {/* ── HOME ── */}
            {tab === 'home' && (
              <div className="flex flex-col gap-4">
                
                {/* Active DNA module */}
                <div className="glass-panel p-4 flex gap-4 items-center bg-primary/5 border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_2px_rgba(0,255,163,0.5)]" />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-primary mb-0.5">Neural DNA Active</div>
                    <div className="text-[12px] text-textSecondary leading-relaxed">
                      AI is calibrated to your brand voice. All generations will sound native.
                    </div>
                  </div>
                </div>

                {/* Low credit alert */}
                {user.credits <= 2 && (
                  <div className="glass-panel p-4 flex gap-3 items-center bg-secondary/5 border-secondary/20">
                    <div className="flex-1">
                      <div className="text-[13px] font-bold text-secondary mb-1">Low Credits Warning</div>
                      <div className="text-[12px] text-textSecondary">
                        Fund {formatCurrency(countryData.pricePer10, countryData)} to unlock 10 more campaigns.
                      </div>
                    </div>
                    <button
                      className="px-4 py-2 rounded-lg text-[12px] font-bold bg-secondary text-background hover:bg-[#ff8533] transition-colors"
                      onClick={handleTopUp}
                    >
                      Fund
                    </button>
                  </div>
                )}

                <div className="label-sm mt-2">Marketing Engine</div>
                
                <div className="flex flex-col gap-3">
                  {[
                    { n: 1, done: true,  title: 'Identity Synced', desc: 'Brand profile verified', tab: 'studio' as Tab },
                    { n: 2, done: false, title: 'Generate Campaign', desc: 'Draft copy + AI visual flyers', tab: 'studio' as Tab },
                    { n: 3, done: false, title: 'Broadcast Audience', desc: 'Deploy via SMS & WhatsApp', tab: 'broadcast' as Tab },
                  ].map(s => (
                    <button
                      key={s.n}
                      onClick={() => setTab(s.tab)}
                      className="glass-panel p-4 flex items-center gap-4 text-left group hover:border-primary/30 transition-colors"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors",
                          s.done ? "bg-primary text-background" : 
                          s.n === 2 ? "bg-primary/20 text-primary border border-primary/30" : 
                          "bg-white/5 text-textMuted border border-white/10"
                        )}
                      >
                        {s.done ? "✓" : s.n}
                      </div>
                      <div className="flex-1">
                        <div className="text-[14px] font-semibold text-white mb-0.5">{s.title}</div>
                        <div className="text-[12px] text-textSecondary">{s.desc}</div>
                      </div>
                      <ChevronRight size={18} className="text-textMuted group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <button className="btn-primary" onClick={() => setTab('studio')}>
                    Enter Studio
                    <Wand2 size={16} />
                  </button>
                </div>
              </div>
            )}

            {tab === 'studio'    && <CampaignStudio />}
            {tab === 'broadcast' && <BroadcastSMS />}
            {tab === 'history'   && <HistoryTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Bottom Nav Dock */}
      <div className="absolute bottom-6 left-0 right-0 px-6 z-50">
        <div className="bg-[#141E24]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 flex justify-between shadow-2xl">
          {NAV.map(n => {
            const active = tab === n.id
            const Icon = n.icon
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className="relative flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors z-10"
              >
                {active && (
                  <motion.div 
                    layoutId="activeTab"
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
    </div>
  )
}
