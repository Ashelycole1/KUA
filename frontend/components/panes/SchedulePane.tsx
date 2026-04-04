'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

export default function SchedulePane({ onTabChange }: { onTabChange: (tab: any) => void }) {
  const [autoSend, setAutoSend] = useState(true)
  const [smartTiming, setSmartTiming] = useState(true)
  const [crossPost, setCrossPost] = useState(true)

  const [currentDate, setCurrentDate] = useState(new Date())

  // Dynamic Calendar Logic
  const today = new Date()
  const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  // Mapped live sequence so mock events continuously populate seamlessly correctly
  const msPerDay = 24 * 60 * 60 * 1000
  const upcomingEvents = [
    { type: 'post', offset: 3, title: 'Weekend spinach specials', details: '09:00 · WhatsApp · 284 nodes' },
    { type: 'amb', offset: 3, title: 'Network Sync: Thandi, Kofi...', details: '~900 indirect reach guaranteed' },
    { type: 'post', offset: 5, title: 'Flash sale: 30% off tomatoes', details: '12:00 · FB + Instagram Sync' },
  ].map(e => ({
    ...e,
    timestamp: todayAtMidnight + (e.offset * msPerDay)
  }))

  const renderCalendar = () => {
    const cells = []
    const calDays = ['S','M','T','W','T','F','S']
    
    // Header
    calDays.forEach((d, i) => {
      cells.push(
        <div key={`h-${i}`} className="text-center text-[10px] text-textMuted py-1 font-bold">{d}</div>
      )
    })
    
    // Blank offsets for first day
    for(let i = 0; i < firstDay; i++) {
        cells.push(<div key={`blank-${i}`} className="aspect-square" />)
    }

    // Actual Days
    for(let d = 1; d <= daysInMonth; d++) {
        const cellDate = new Date(currentYear, currentMonth, d).getTime()
        const isToday = cellDate === todayAtMidnight

        const cellEvents = upcomingEvents.filter(e => e.timestamp === cellDate)
        const hasPost = cellEvents.some(e => e.type === 'post')
        const hasAmb = cellEvents.some(e => e.type === 'amb')
        
        cells.push(
            <div 
              key={`day-${d}`} 
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[12px] cursor-pointer gap-0.5 border transition-all
                ${hasPost ? 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30' : 'bg-[#141E24] text-textSecondary border-white/5 hover:border-white/20'}
                ${isToday ? 'border-[2px] border-primary font-bold shadow-[0_0_15px_rgba(0,255,163,0.2)]' : 'font-medium'}
                ${(isToday || hasPost) ? 'text-white' : ''}
              `}
            >
                {d}
                {hasAmb && <div className="w-1.5 h-1.5 rounded-full bg-kPurple shadow-[0_0_5px_rgba(138,130,232,0.8)] mt-0.5" />}
            </div>
        )
    }
    
    return cells
  }

  // Pending items mapping cleanly onto chronological sorted logic
  const pendingItems = upcomingEvents.filter(e => e.timestamp >= todayAtMidnight).sort((a,b) => a.timestamp - b.timestamp)

  return (
    <div className="animate-fade-in pb-12">
      <div className="heading-sec mb-2">Campaign Pipeline</div>
      <div className="sub-text">Every scheduled post shows alongside its ambassador sync — one timeline, global view.</div>

      <div className="glass-panel p-5 mb-8 mt-4 relative overflow-hidden">
        {/* Dynamic Nav Header */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2 text-[15px] font-black text-white tracking-tight">
            <Calendar size={16} className="text-primary" />
            {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate)}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))} className="p-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest text-textMuted transition-colors">
              Today
            </button>
            <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))} className="p-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-3 relative z-10">
            {renderCalendar()}
        </div>
        <div className="flex gap-4 mt-4 text-[11px] font-bold uppercase tracking-wide text-textMuted border-t border-white/5 pt-4 relative z-10">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[2px] bg-primary/40 inline-block border border-primary" />Direct Broadcast</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-kPurple inline-block shadow-[0_0_8px_currentColor]" />Network Send</span>
        </div>
      </div>

      <div className="heading-sec">Pending Operations</div>
      <div className="card !p-2">
        {pendingItems.map((ev, i) => {
          const dt = new Date(ev.timestamp)
          const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dt).toUpperCase()
          const dayNum = String(dt.getDate()).padStart(2, '0')
          const isFirst = i === 0

          if (ev.type === 'amb') {
            return (
              <div key={i} className={`row-item bg-kPurple/5 rounded-xl border border-kPurple/10 px-4 py-3 mx-2 mb-2 ${!isFirst ? 'mt-2' : ''}`}>
                <div className="min-w-[50px] text-center shrink-0 pr-3">
                  <span className="badge badge-bp !text-[9px]">AMB</span>
                </div>
                <div className="flex-1 min-w-0 pr-3">
                  <div className="text-[13px] font-bold text-kPurple mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{ev.title}</div>
                  <div className="text-[11px] text-kPurple/70">{ev.details}</div>
                </div>
                <span className="tag tag-amb !text-[9px] shrink-0"><span className="dot-amb"></span>Auto-fire</span>
              </div>
            )
          }

          return (
            <div key={i} className={`row-item py-4 px-2 ${!isFirst ? 'border-t border-white/5' : ''}`}>
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-2 text-center min-w-[48px] shrink-0 shadow-[inset_0_0_10px_rgba(0,255,163,0.05)]">
                <div className="text-[9px] text-primary font-black tracking-widest mb-0.5">{dayName}</div>
                <div className="text-[16px] font-black text-white tracking-tight leading-none">{dayNum}</div>
              </div>
              <div className="flex-1 min-w-0 px-3">
                <div className="text-[14px] font-bold text-white mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{ev.title}</div>
                <div className="text-[12px] text-textMuted">{ev.details}</div>
              </div>
              <span className="tag tag-sched shrink-0 mr-2"><span className="dot-sched"></span>Queued</span>
            </div>
          )
        })}
      </div>

      <div className="space-y-0 mt-8 mb-8 border border-white/10 rounded-xl overflow-hidden glass-panel !p-0">
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
              <div className="pr-4">
                  <div className="text-[13px] font-bold text-white mb-0.5">Autonomous Dispatch</div>
                  <div className="text-[11px] text-textSecondary uppercase tracking-wide">Every new post queues to network</div>
              </div>
              <button onClick={() => setAutoSend(!autoSend)} className={`w-10 h-6 rounded-full relative transition-colors ${autoSend ? 'bg-primary' : 'bg-white/10'}`}><span className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white transition-transform ${autoSend ? 'translate-x-[16px]' : 'translate-x-0'} shadow-sm`} /></button>
          </div>
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
              <div className="pr-4">
                  <div className="text-[13px] font-bold text-white mb-0.5">Chronological Optimizer</div>
                  <div className="text-[11px] text-textSecondary uppercase tracking-wide">Neural Engine selects engagement window</div>
              </div>
              <button onClick={() => setSmartTiming(!smartTiming)} className={`w-10 h-6 rounded-full relative transition-colors ${smartTiming ? 'bg-primary' : 'bg-white/10'}`}><span className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white transition-transform ${smartTiming ? 'translate-x-[16px]' : 'translate-x-0'} shadow-sm`} /></button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/[0.02]">
              <div className="pr-4">
                  <div className="text-[13px] font-bold text-white mb-0.5">Platform Bridging</div>
                  <div className="text-[11px] text-textSecondary uppercase tracking-wide">Sync push to Meta suite and SMS Gateways</div>
              </div>
              <button onClick={() => setCrossPost(!crossPost)} className={`w-10 h-6 rounded-full relative transition-colors ${crossPost ? 'bg-primary' : 'bg-white/10'}`}><span className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white transition-transform ${crossPost ? 'translate-x-[16px]' : 'translate-x-0'} shadow-sm`} /></button>
          </div>
      </div>
      
      <button className="btn-primary" onClick={() => onTabChange('create')}>Launch Campaign Sequence</button>
    </div>
  )
}
