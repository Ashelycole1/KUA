'use client'

import { Activity, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const HISTORY = [
  {
    title: 'Fresh Tomatoes',
    time: 'Today',
    preview: 'Fresh tomatoes from Limuru! Very sweet, 50/- per kilo. Today only — call now!',
    tags: [{ label: 'WhatsApp', type: 'wa' }, { label: 'SMS x50', type: 'sms' }, { label: 'Hype tone', type: 'default' }],
    credits: 1,
  },
  {
    title: 'Mitumba Jeans Sale',
    time: 'Yesterday',
    preview: 'FRESH MITUMBA JEANS ARE HERE!! All sizes — Gikomba prices that will SHOCK you!',
    tags: [{ label: 'WhatsApp', type: 'wa' }, { label: 'Hype tone', type: 'default' }, { label: '+AI flyer', type: 'flyer' }],
    credits: 1,
  },
  {
    title: 'Phone Accessories',
    time: '3 days ago',
    preview: 'Quality phone covers & chargers. All brands. Bei nafuu sana, karibu!',
    tags: [{ label: 'SMS x200', type: 'sms' }, { label: 'Sheng tone', type: 'default' }],
    credits: 1,
  },
]

export default function HistoryTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="label-sm flex items-center gap-2">
        <Activity size={14} className="text-primary" />
        Campaign History
      </div>

      {/* Summary strip */}
      <div className="glass-panel p-4 flex justify-between items-center bg-white/[0.02]">
        {[
          { label: 'Generations', value: '3' },
          { label: 'Credits used', value: '3' },
          { label: 'SMS sent', value: '250' },
        ].map((s, i) => (
          <div key={s.label} className={cn("flex flex-col text-center flex-1", i > 0 && "border-l border-white/5")}>
            <div className="text-xl font-bold text-white tracking-tight">{s.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-textMuted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 mt-2">
        {HISTORY.map((h, i) => (
          <div
            key={i}
            className="glass-panel p-4 flex flex-col gap-2 hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <span className="text-[15px] font-bold text-white tracking-tight">{h.title}</span>
              <span className="flex items-center gap-1 text-[11px] text-textMuted font-medium">
                <Clock size={12} />
                {h.time}
              </span>
            </div>
            <div className="text-[13px] leading-relaxed text-textSecondary line-clamp-2">
              {h.preview}
            </div>
            
            <div className="flex gap-1.5 flex-wrap mt-1">
              {h.tags.map((tag, j) => (
                <span
                  key={j}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                    tag.type === 'wa' ? "bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20" : 
                    tag.type === 'sms' ? "bg-primary/10 text-primary border border-primary/20" : 
                    tag.type === 'flyer' ? "bg-secondary/10 text-secondary border border-secondary/20" : 
                    "bg-white/5 text-textMuted border border-white/10"
                  )}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
