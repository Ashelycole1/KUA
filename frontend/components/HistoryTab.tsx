'use client'

import { Activity, Clock, Image as ImageIcon, Zap, ArrowDownLeft, ArrowUpRight, MessageCircle, Share2 } from 'lucide-react'
import { useKua } from './KuaProvider'
import { cn } from '@/lib/utils'

export default function HistoryTab() {
  const { activityHistory } = useKua()

  const campaigns = activityHistory.filter(e => e.type === 'campaign')
  const deposits  = activityHistory.filter(e => e.type === 'deposit')
  const payouts   = activityHistory.filter(e => e.type === 'payout')

  const stats = [
    { label: 'Campaigns', value: campaigns.length.toString() },
    { label: 'Deposits',  value: deposits.length.toString() },
    { label: 'Payouts',   value: payouts.length.toString() },
  ]

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="flex flex-col gap-4 pb-12 animate-fade-in">
      <div className="label-sm flex items-center gap-2">
        <Activity size={14} className="text-primary" />
        Activity History
      </div>

      {/* Summary strip */}
      <div className="glass-panel p-4 flex justify-between items-center bg-white/[0.02]">
        {stats.map((s, i) => (
          <div key={s.label} className={cn("flex flex-col text-center flex-1", i > 0 && "border-l border-white/5")}>
            <div className="text-xl font-bold text-white tracking-tight">{s.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-textMuted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {activityHistory.length === 0 ? (
        <div className="glass-panel p-10 text-center border-dashed flex flex-col items-center gap-3">
          <Zap size={28} className="text-primary/40" />
          <div className="text-[13px] text-textMuted font-medium">No activity yet.</div>
          <div className="text-[11px] text-textMuted/60 max-w-[200px] leading-relaxed">
            Generate a campaign, top up your wallet, or pay an ambassador to see your full history here.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activityHistory.map((item) => {
            const time = timeAgo(item.timestamp)

            /* ── Campaign Card ── */
            if (item.type === 'campaign') {
              const { prompt, bizName, tone, language } = item.payload
              return (
                <div key={item.id} className="glass-panel p-4 flex flex-col gap-2 hover:bg-white/[0.03] transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <MessageCircle size={13} className="text-primary" />
                      </div>
                      <span className="text-[14px] font-bold text-white tracking-tight line-clamp-1">{prompt}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-textMuted font-medium whitespace-nowrap shrink-0">
                      <Clock size={10} />
                      {time}
                    </span>
                  </div>
                  <div className="text-[11px] text-textMuted ml-9">for <span className="text-white/60 font-semibold">{bizName}</span></div>
                  <div className="flex gap-1.5 flex-wrap ml-9 mt-0.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      WhatsApp · FB · Amb
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/5 text-textMuted border border-white/10">
                      {tone}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/5 text-textMuted border border-white/10">
                      {language.toUpperCase()}
                    </span>
                  </div>
                </div>
              )
            }

            /* ── Deposit Card ── */
            if (item.type === 'deposit') {
              const { amount, currency, credits, gateway } = item.payload
              return (
                <div key={item.id} className="glass-panel p-4 flex items-center gap-3 hover:bg-white/[0.03] transition-colors">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <ArrowDownLeft size={16} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-emerald-400">+ {credits} AI Credits funded</div>
                    <div className="text-[11px] text-textMuted mt-0.5">via {gateway} · {currency}{amount}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-textMuted whitespace-nowrap flex items-center gap-1 justify-end">
                      <Clock size={9} />
                      {time}
                    </div>
                    <span className="mt-1 inline-block px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Wallet Top-up
                    </span>
                  </div>
                </div>
              )
            }

            /* ── Payout Card ── */
            if (item.type === 'payout') {
              const { amount, recipient, gateway } = item.payload
              return (
                <div key={item.id} className="glass-panel p-4 flex items-center gap-3 hover:bg-white/[0.03] transition-colors">
                  <div className="w-9 h-9 rounded-full bg-kPurple/10 border border-kPurple/20 flex items-center justify-center shrink-0">
                    <ArrowUpRight size={16} className="text-kPurple" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-kPurple">Ambassador Payout</div>
                    <div className="text-[11px] text-textMuted mt-0.5">{amount} → {recipient} · {gateway}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-textMuted whitespace-nowrap flex items-center gap-1 justify-end">
                      <Clock size={9} />
                      {time}
                    </div>
                    <span className="mt-1 inline-block px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-kPurple/10 text-kPurple border border-kPurple/20">
                      Sent
                    </span>
                  </div>
                </div>
              )
            }

            return null
          })}
        </div>
      )}
    </div>
  )
}
