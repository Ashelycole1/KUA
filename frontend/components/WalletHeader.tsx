'use client'

import { Bell, Wallet } from 'lucide-react'
import { useKua } from './KuaProvider'
import { formatCurrency } from '@/lib/currency'

interface WalletHeaderProps {
  onTopUp?: () => void
  onNotificationClick?: () => void
}

export default function WalletHeader({ onTopUp, onNotificationClick }: WalletHeaderProps) {
  const { user, countryData } = useKua()

  return (
    <div className="w-full bg-background/80 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none pb-5 border-b border-white/[0.04]">
      {/* Brand row - Only visible on Mobile since Desktop has a Sidebar logo */}
      <div className="flex md:hidden justify-between items-center mb-5 pt-5 px-6">
        <div className="font-bold text-2xl tracking-tight text-white flex items-center gap-1">
          Kua<span className="text-primary text-3xl leading-none">.</span>
        </div>
        <button 
          onClick={onNotificationClick}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 relative transition-all hover:bg-white/10"
        >
          <Bell size={18} className="text-textSecondary" />
          {user.credits <= 2 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-background" />
          )}
        </button>
      </div>

      {/* Credits card - Now Primary focus */}
      <div className="px-6 md:px-0">
        <button
          onClick={onTopUp}
          className="w-full p-4 flex flex-col justify-center rounded-kua bg-primary/10 border border-primary/20 transition-all hover:bg-primary/20 text-left relative overflow-hidden group min-h-[80px]"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-all" />
          <div className="flex items-center gap-1.5 mb-1.5 opacity-90 relative z-10">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-[12px] font-bold uppercase tracking-widest text-primary">AI Generation Credits</span>
          </div>
          <div className="text-3xl font-bold text-primary tracking-tight relative z-10">
            {user.credits} <span className="text-sm font-medium opacity-60">Gens available</span>
          </div>
        </button>
      </div>
    </div>
  )
}
