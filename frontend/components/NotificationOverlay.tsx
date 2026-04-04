'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle, Zap, CreditCard, X } from 'lucide-react'
import { useKua } from './KuaProvider'
import { cn } from '@/lib/utils'

interface NotificationOverlayProps {
  isOpen: boolean
  onClose: () => void
  onNavigate?: (tab: string) => void
}

export default function NotificationOverlay({ isOpen, onClose, onNavigate }: NotificationOverlayProps) {
  const { user } = useKua()

  // Mock notifications based on actual state or session
  const notifications = [
    {
      id: 1,
      title: 'Neural DNA Calibration',
      desc: 'Your brand voice has been fully mapped to your profile.',
      icon: Zap,
      type: 'success',
      time: 'Just now'
    },
    {
      id: 2,
      title: 'Sync Success',
      desc: 'All campaign history has been synced with Supabase.',
      icon: CheckCircle,
      type: 'success',
      time: '2 mins ago'
    },
    user.credits <= 2 ? {
      id: 3,
      title: 'Low AI Credits',
      desc: `You have ${user.credits} credits left. Please top up soon.`,
      icon: CreditCard,
      type: 'warning',
      time: 'System'
    } : null,
  ].filter(Boolean) as any[]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed top-20 right-6 md:right-12 w-[calc(100vw-48px)] md:w-80 bg-[#141E24]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-primary" />
                <span className="text-[14px] font-bold text-white uppercase tracking-widest">Archive Log</span>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                <X size={16} className="text-textMuted" />
              </button>
            </div>

            {/* Mobile Navigation Shortcuts */}
            <div className="flex bg-white/[0.01] border-b border-white/5 p-2 gap-2">
              <button 
                onClick={() => onNavigate?.('history')}
                className="flex-1 flex justify-center py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-white uppercase tracking-widest transition-colors"
                >
                History
              </button>
              <button 
                onClick={() => onNavigate?.('settings')}
                className="flex-1 flex justify-center py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-white uppercase tracking-widest transition-colors"
                >
                Settings
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-textMuted text-[13px] flex flex-col items-center gap-2">
                  <Bell size={24} className="opacity-20" />
                  No new transmissions.
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((n, i) => {
                    const Icon = n.icon
                    return (
                      <div 
                        key={n.id} 
                        className={cn(
                          "p-4 border-b border-white/5 flex gap-4 transition-colors hover:bg-white/[0.02] cursor-pointer",
                          i === notifications.length - 1 && "border-none"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          n.type === 'success' ? "bg-primary/10 text-primary border border-primary/20" : 
                          "bg-secondary/10 text-secondary border border-secondary/20"
                        )}>
                          <Icon size={18} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[13px] font-bold text-white tracking-tight">{n.title}</span>
                            <span className="text-[9px] text-textMuted font-bold uppercase tracking-widest">{n.time}</span>
                          </div>
                          <p className="text-[12px] text-textSecondary leading-relaxed">{n.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="p-3 bg-black/40 text-center">
              <button className="text-[11px] font-bold text-primary uppercase tracking-widest hover:underline">
                Clear Archival Log
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
