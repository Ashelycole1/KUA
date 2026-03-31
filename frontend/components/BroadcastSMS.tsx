'use client'

import { useState } from 'react'
import { Send, Users, FileSpreadsheet, Smartphone, History, Zap } from 'lucide-react'
import { useKua } from './KuaProvider'
import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'

const RECIPIENT_OPTIONS = [
  { label: 'My 50 contacts', count: 50, icon: Users },
  { label: 'Upload CSV (200)', count: 200, icon: FileSpreadsheet },
  { label: 'Single test', count: 1, icon: Smartphone },
]

const HISTORY = [
  {
    title: 'Mitumba Jeans Sale',
    time: '2 hrs ago',
    preview: 'FRESH MITUMBA JEANS! All sizes, Gikomba prices. Call now…',
    tags: [{ label: '50 SMS sent', type: 'sms' }, { label: 'KSh 25', type: 'cost' }, { label: 'WhatsApp', type: 'wa' }],
  },
]

export default function BroadcastSMS({ prefilledText }: { prefilledText?: string }) {
  const { toast, countryData } = useKua()
  const [smsText, setSmsText]   = useState(prefilledText || 'Fresh tomatoes from Limuru! Very sweet, 50/- per kilo. Today only — call 0712 345 678 now!')
  const [selected, setSelected] = useState(0)
  const [sending, setSending]   = useState(false)

  const recipients = RECIPIENT_OPTIONS[selected].count
  const cost = recipients === 1 ? countryData.smsCost : recipients * countryData.smsCost

  async function broadcast() {
    if (sending) return
    setSending(true)
    toast(`Routing to ${recipients} numbers via Africa's Talking…`)
    await new Promise(r => setTimeout(r, 2200))
    toast(`✅ Confirmed! ${recipients} messages dispatched.`)
    setSending(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="label-sm flex items-center gap-2">
        <Send size={14} className="text-secondary" />
        Deploy Broadcast
      </div>

      {/* SMS compose card */}
      <div className="glass-panel p-5 flex flex-col gap-5">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Zap size={20} className="text-primary fill-primary/20" />
          </div>
          <div>
            <div className="text-[14px] font-bold text-white mb-0.5">Africa's Talking Engine</div>
            <div className="text-[11px] font-medium text-textSecondary tracking-wide uppercase">High deliverability routing</div>
          </div>
        </div>

        <div>
          <label className="label-sm">Compose Message</label>
          <div className="bg-[#141E24] rounded-2xl border border-white/5 overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-shadow">
            <textarea
              className="w-full bg-transparent border-none outline-none p-4 text-[14px] text-white resize-none leading-relaxed placeholder:text-textMuted"
              rows={3}
              value={smsText}
              onChange={e => setSmsText(e.target.value)}
            />
            <div className="bg-white/[0.02] px-4 py-2 flex justify-between items-center border-t border-white/5">
              <span className="text-[11px] font-medium text-textMuted">
                {smsText.length} characters
              </span>
              <span className="text-[11px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                {Math.ceil(smsText.length / 160)} SMS Parts
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="label-sm">Audience Targeting</label>
          <div className="flex flex-col gap-2">
            {RECIPIENT_OPTIONS.map((opt, i) => {
              const active = selected === i
              const Icon = opt.icon
              return (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                    active 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-[#141E24] border-white/5 hover:border-white/10"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    active ? "bg-primary text-background" : "bg-white/5 text-textMuted"
                  )}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1">
                    <div className={cn("text-[13px] font-bold mb-0.5", active ? "text-primary" : "text-white")}>
                      {opt.label}
                    </div>
                    <div className="text-[11px] text-textMuted">Cost: {formatCurrency(opt.count * countryData.smsCost, countryData)}</div>
                  </div>
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                    active ? "border-primary" : "border-white/20"
                  )}>
                    {active && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Cost estimate */}
        <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.03] border border-white/5 mt-2">
          <span className="text-[12px] font-bold uppercase tracking-wider text-textSecondary">Execution Cost</span>
          <span className="text-xl font-bold tracking-tight text-white">
            {formatCurrency(cost, countryData)}
          </span>
        </div>

        <button
          className="btn-primary"
          onClick={broadcast}
          disabled={sending}
        >
          {sending ? (
            <>
              <span className="spin-dark" />
              Routing...
            </>
          ) : (
            <>
              Deploy {recipients} SMS
              <Send size={18} />
            </>
          )}
        </button>
      </div>

      {/* Broadcast history preview */}
      <div className="label-sm flex items-center gap-2 mt-4 text-textMuted">
        <History size={14} />
        Recent Dispatches
      </div>
      
      {HISTORY.map((h, i) => (
        <div key={i} className="glass-panel p-4 flex flex-col gap-2 opacity-80">
          <div className="flex justify-between items-start">
            <span className="text-[14px] font-bold text-white tracking-tight">{h.title}</span>
            <span className="text-[11px] text-textSecondary">{h.time}</span>
          </div>
          <div className="text-[12px] leading-relaxed text-textSecondary line-clamp-1">{h.preview}</div>
        </div>
      ))}
    </div>
  )
}
