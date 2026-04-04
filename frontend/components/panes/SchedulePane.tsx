'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Plus, X, Clock, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useKua } from '../KuaProvider'

interface ScheduledEvent {
  id: number
  date: string       // 'YYYY-MM-DD'
  title: string
  time: string
  channel: string
  type: 'post' | 'amb'
}

const CHANNELS = ['WhatsApp', 'Facebook', 'Instagram', 'SMS Broadcast', 'Ambassador Network']
const TIMES    = ['07:00', '08:00', '09:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']

// Seed 3 starter events relative to today so calendar always looks populated
function seedEvents(): ScheduledEvent[] {
  const base = new Date()
  const fmt  = (d: Date) => d.toISOString().split('T')[0]
  const add  = (n: number) => { const d = new Date(base); d.setDate(d.getDate() + n); return fmt(d) }
  return [
    { id: 1, date: add(3),  title: 'Weekend spinach specials', time: '09:00', channel: 'WhatsApp',           type: 'post' },
    { id: 2, date: add(3),  title: 'Network Sync: Thandi, Kofi', time: '09:30', channel: 'Ambassador Network', type: 'amb'  },
    { id: 3, date: add(5),  title: 'Flash sale: 30% off tomatoes', time: '12:00', channel: 'Facebook',        type: 'post' },
  ]
}

export default function SchedulePane({ onTabChange }: { onTabChange: (tab: any) => void }) {
  const { toast } = useKua()

  const [currentDate,  setCurrentDate]  = useState(new Date())
  const [events,       setEvents]       = useState<ScheduledEvent[]>(seedEvents())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showForm,     setShowForm]     = useState(false)

  // Form state
  const [formTitle,   setFormTitle]   = useState('')
  const [formTime,    setFormTime]    = useState('09:00')
  const [formChannel, setFormChannel] = useState('WhatsApp')
  const [formType,    setFormType]    = useState<'post' | 'amb'>('post')

  const [autoSend,    setAutoSend]    = useState(true)
  const [smartTiming, setSmartTiming] = useState(true)
  const [crossPost,   setCrossPost]   = useState(true)

  // ── Helpers ──
  const today       = new Date()
  const todayStr    = today.toISOString().split('T')[0]
  const currentMonth = currentDate.getMonth()
  const currentYear  = currentDate.getFullYear()

  const getDaysInMonth  = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay()
  const toDateStr       = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const eventsOnDate    = (dateStr: string) => events.filter(e => e.date === dateStr)
  const selectedEvents  = selectedDate ? eventsOnDate(selectedDate) : []

  // ── Add Event ──
  function addEvent() {
    if (!selectedDate || !formTitle.trim()) {
      toast('Please enter a campaign title.')
      return
    }
    const newEv: ScheduledEvent = {
      id:      Date.now(),
      date:    selectedDate,
      title:   formTitle.trim(),
      time:    formTime,
      channel: formChannel,
      type:    formType,
    }
    setEvents(prev => [...prev, newEv])
    toast(`✅ Scheduled: "${newEv.title}" on ${formatDisplayDate(selectedDate)}`)
    setFormTitle('')
    setShowForm(false)
  }

  function deleteEvent(id: number) {
    setEvents(prev => prev.filter(e => e.id !== id))
    toast('Event removed from schedule.')
  }

  // ── Format helpers ──
  function formatDisplayDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    })
  }
  function formatShortDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d).toUpperCase()
  }
  function formatDayNum(dateStr: string) {
    return String(new Date(dateStr + 'T00:00:00').getDate()).padStart(2, '0')
  }

  // ── Render calendar grid ──
  const renderCalendar = () => {
    const cells = []
    const calDays = ['S','M','T','W','T','F','S']
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay    = getFirstDayOfMonth(currentYear, currentMonth)

    calDays.forEach((d, i) => cells.push(
      <div key={`h-${i}`} className="text-center text-[10px] text-textMuted py-1 font-bold">{d}</div>
    ))
    for (let i = 0; i < firstDay; i++) cells.push(<div key={`blank-${i}`} className="aspect-square" />)

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr    = toDateStr(currentYear, currentMonth, d)
      const isToday    = dateStr === todayStr
      const isSelected = dateStr === selectedDate
      const dayEvents  = eventsOnDate(dateStr)
      const hasPost    = dayEvents.some(e => e.type === 'post')
      const hasAmb     = dayEvents.some(e => e.type === 'amb')
      const isPast     = dateStr < todayStr

      cells.push(
        <button
          key={`day-${d}`}
          onClick={() => { setSelectedDate(dateStr); setShowForm(false) }}
          className={cn(
            'aspect-square rounded-lg flex flex-col items-center justify-center text-[12px] gap-0.5 border transition-all relative',
            isPast && !isToday && 'opacity-30',
            isSelected
              ? 'bg-primary/30 border-primary text-white shadow-[0_0_15px_rgba(0,255,163,0.25)] scale-[1.08]'
              : hasPost
                ? 'bg-primary/15 text-primary border-primary/30 hover:bg-primary/25'
                : 'bg-[#141E24] text-textSecondary border-white/5 hover:border-white/25 hover:bg-white/[0.04]',
            isToday && !isSelected && 'border-[2px] border-primary font-black shadow-[0_0_12px_rgba(0,255,163,0.2)] text-white',
          )}
        >
          {d}
          {(hasPost || hasAmb) && (
            <div className="flex gap-0.5 items-center">
              {hasPost && <span className="w-1 h-1 rounded-full bg-primary" />}
              {hasAmb  && <span className="w-1 h-1 rounded-full bg-kPurple" />}
            </div>
          )}
        </button>
      )
    }
    return cells
  }

  // ── Upcoming (next 7 days) ──
  const upcoming = events
    .filter(e => e.date >= todayStr)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5)

  return (
    <div className="animate-fade-in pb-12">
      <div className="heading-sec mb-1">Campaign Pipeline</div>
      <div className="sub-text mb-4">Click any date to plan or view scheduled campaigns.</div>

      {/* ── Calendar ── */}
      <div className="glass-panel p-5 mb-4 relative">
        {/* Nav header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[15px] font-black text-white tracking-tight">
            <Calendar size={15} className="text-primary" />
            {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate)}
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}
              className="p-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white">
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(todayStr) }}
              className="px-2.5 py-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest text-textMuted transition-colors">
              Today
            </button>
            <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}
              className="p-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-3">
          {renderCalendar()}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3 text-[10px] font-bold uppercase tracking-wide text-textMuted border-t border-white/5 pt-3">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Direct Broadcast</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-kPurple inline-block" />Ambassador Send</span>
        </div>
      </div>

      {/* ── Day Detail Panel ── */}
      {selectedDate && (
        <div className="glass-panel p-5 mb-4 animate-fade-in border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[13px] font-black text-white">{formatDisplayDate(selectedDate)}</div>
              <div className="text-[11px] text-textMuted mt-0.5">
                {selectedEvents.length === 0 ? 'No events planned' : `${selectedEvents.length} event${selectedEvents.length > 1 ? 's' : ''} scheduled`}
              </div>
            </div>
            <button
              onClick={() => { setShowForm(s => !s); setFormTitle('') }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all",
                showForm ? "bg-white/5 border border-white/10 text-textMuted" : "bg-primary text-[#0B1215] shadow-[0_0_15px_rgba(0,255,163,0.3)] hover:bg-primaryHover"
              )}
            >
              {showForm ? <><X size={12} />Cancel</> : <><Plus size={12} />Add Event</>}
            </button>
          </div>

          {/* Add event form */}
          {showForm && (
            <div className="bg-[#0d1519] border border-white/10 rounded-xl p-4 mb-3 flex flex-col gap-3 animate-fade-in">
              <div className="flex flex-col gap-1">
                <label className="label-sm">Campaign Title</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-textMuted outline-none focus:border-primary/50 transition-colors"
                  placeholder="e.g. Flash sale: tomatoes 20% off"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addEvent()}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="label-sm">Time</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-primary/50 transition-colors"
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                  >
                    {TIMES.map(t => <option key={t} value={t} className="bg-[#0d1519]">{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-sm">Channel</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-primary/50 transition-colors"
                    value={formChannel}
                    onChange={e => setFormChannel(e.target.value)}
                  >
                    {CHANNELS.map(c => <option key={c} value={c} className="bg-[#0d1519]">{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormType('post')}
                  className={cn("flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest border transition-all",
                    formType === 'post' ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/10 text-textMuted")}
                >Direct Broadcast</button>
                <button
                  onClick={() => setFormType('amb')}
                  className={cn("flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest border transition-all",
                    formType === 'amb' ? "bg-kPurple/20 border-kPurple/40 text-kPurple" : "bg-white/5 border-white/10 text-textMuted")}
                >Ambassador Send</button>
              </div>
              <button
                onClick={addEvent}
                className="btn-primary flex items-center justify-center gap-2 py-2.5"
              >
                <Check size={15} />
                Confirm Schedule
              </button>
            </div>
          )}

          {/* Events list for this day */}
          {selectedEvents.length > 0 && (
            <div className="flex flex-col gap-2">
              {selectedEvents.map(ev => (
                <div key={ev.id} className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 border",
                  ev.type === 'amb'
                    ? "bg-kPurple/5 border-kPurple/20"
                    : "bg-primary/5 border-primary/15"
                )}>
                  <div className={cn("w-1 h-8 rounded-full shrink-0", ev.type === 'amb' ? "bg-kPurple" : "bg-primary")} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-white truncate">{ev.title}</div>
                    <div className="text-[11px] text-textMuted flex items-center gap-1 mt-0.5">
                      <Clock size={10} />{ev.time} · {ev.channel}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEvent(ev.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Upcoming queue ── */}
      {!selectedDate && (
        <>
          <div className="heading-sec">Upcoming Queue</div>
          <div className="card !p-2">
            {upcoming.length === 0 ? (
              <div className="p-6 text-center text-textMuted text-[13px] border-dashed border border-white/10 rounded-xl">
                No upcoming events. Click a date on the calendar to plan your first campaign.
              </div>
            ) : upcoming.map((ev, i) => (
              <div key={ev.id} className={cn("row-item py-3 px-2", i > 0 && "border-t border-white/5")}>
                <div className={cn(
                  "rounded-lg px-2 py-1.5 text-center min-w-[46px] shrink-0",
                  ev.type === 'amb' ? "bg-kPurple/10 border border-kPurple/20" : "bg-primary/10 border border-primary/20"
                )}>
                  <div className={cn("text-[9px] font-black tracking-widest mb-0.5", ev.type === 'amb' ? "text-kPurple" : "text-primary")}>
                    {formatShortDate(ev.date)}
                  </div>
                  <div className="text-[15px] font-black text-white leading-none">{formatDayNum(ev.date)}</div>
                </div>
                <div className="flex-1 min-w-0 px-3">
                  <div className="text-[13px] font-bold text-white truncate">{ev.title}</div>
                  <div className="text-[11px] text-textMuted">{ev.time} · {ev.channel}</div>
                </div>
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <span className={cn("tag shrink-0", ev.type === 'amb' ? "tag-amb" : "tag-sched")}>
                    <span className={ev.type === 'amb' ? "dot-amb" : "dot-sched"} />
                    {ev.type === 'amb' ? 'Network' : 'Queued'}
                  </span>
                  <button onClick={() => deleteEvent(ev.id)} className="text-red-400/50 hover:text-red-400 transition-colors">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Automation toggles ── */}
      <div className="space-y-0 mt-8 mb-8 border border-white/10 rounded-xl overflow-hidden glass-panel !p-0">
        {[
          { label: 'Autonomous Dispatch', desc: 'Every new post queues to network', state: autoSend, fn: setAutoSend },
          { label: 'Chronological Optimizer', desc: 'Neural Engine selects engagement window', state: smartTiming, fn: setSmartTiming },
          { label: 'Platform Bridging', desc: 'Sync push to Meta suite and SMS Gateways', state: crossPost, fn: setCrossPost },
        ].map((item, i, arr) => (
          <div key={item.label} className={cn("flex items-center justify-between p-4 bg-white/[0.02]", i < arr.length - 1 && "border-b border-white/5")}>
            <div className="pr-4">
              <div className="text-[13px] font-bold text-white mb-0.5">{item.label}</div>
              <div className="text-[11px] text-textSecondary uppercase tracking-wide">{item.desc}</div>
            </div>
            <button onClick={() => item.fn(!item.state)} className={`w-10 h-6 rounded-full relative transition-colors ${item.state ? 'bg-primary' : 'bg-white/10'}`}>
              <span className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white transition-transform ${item.state ? 'translate-x-[16px]' : 'translate-x-0'} shadow-sm`} />
            </button>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={() => onTabChange('create')}>Launch Campaign Sequence</button>
    </div>
  )
}
