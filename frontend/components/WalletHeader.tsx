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

      {/* Balance + Credits cards */}
      <div className="grid grid-cols-2 gap-3 px-6 md:px-0">
        {/* Balance */}
        <div className="glass-panel p-3.5 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-1 opacity-70">
            <Wallet size={12} className="text-textSecondary" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">Wallet Balance</span>
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            {formatCurrency(user.balance, countryData)}
          </div>
        </div>

        {/* Credits */}
        <button
          onClick={onTopUp}
          className="p-3.5 flex flex-col justify-center rounded-kua bg-primary/10 border border-primary/20 transition-all hover:bg-primary/20 text-left relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-all" />
          <div className="flex items-center gap-1.5 mb-1 opacity-90 relative z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">AI Credits</span>
          </div>
          <div className="text-xl font-bold text-primary tracking-tight relative z-10">
            {user.credits} Gens
          </div>
        </button>
      </div>
    </div>
  )
}
