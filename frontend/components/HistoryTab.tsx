'use client'

import { useState, useEffect } from 'react'
import { Activity, Clock, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useKua } from './KuaProvider'

export default function HistoryTab() {
  const { user } = useKua()
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      if (!user.phone) return
      try {
        const token = await window.Clerk.session?.getToken({ template: 'supabase' })
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/campaign-history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          setHistory(data || [])
        }
      } catch (err) {
        console.error("History fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [user.phone])

  const stats = [
    { label: 'Generations', value: history.length.toString() },
    { label: 'Credits used', value: history.length.toString() },
    { label: 'Cloud assets', value: history.filter(h => h.flyer_url).length.toString() },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-textMuted">
        <span className="spin-dark mb-4" />
        <span className="text-[12px] font-bold uppercase tracking-widest">Retrieving Archive...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="label-sm flex items-center gap-2">
        <Activity size={14} className="text-primary" />
        Campaign History
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

      <div className="flex flex-col gap-3 mt-2">
        {history.length === 0 ? (
          <div className="glass-panel p-8 text-center text-textMuted text-[13px] border-dashed">
            No history detected. Initiate your first synthesis in the Studio.
          </div>
        ) : (
          history.map((h, i) => {
            const date = new Date(h.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
            return (
              <div
                key={h.id || i}
                className="glass-panel p-4 flex flex-col gap-2 hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[15px] font-bold text-white tracking-tight line-clamp-1">{h.prompt}</span>
                  <span className="flex items-center gap-1 text-[11px] text-textMuted font-medium whitespace-nowrap ml-2">
                    <Clock size={12} />
                    {date}
                  </span>
                </div>
                <div className="text-[13px] leading-relaxed text-textSecondary line-clamp-2 italic">
                  "{h.hype || h.professional || h.sheng}"
                </div>
                
                <div className="flex gap-1.5 flex-wrap mt-1">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/5 text-textMuted border border-white/10">
                    AI Content
                  </span>
                  {h.flyer_url && (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-secondary/10 text-secondary border border-secondary/20 flex items-center gap-1">
                      <ImageIcon size={10} />
                      Flyer
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    Verified
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
