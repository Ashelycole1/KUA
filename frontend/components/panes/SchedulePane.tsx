'use client'

import React, { useState } from 'react'

export default function SchedulePane({ onTabChange }: { onTabChange: (tab: any) => void }) {
  const [autoSend, setAutoSend] = useState(true)
  const [smartTiming, setSmartTiming] = useState(true)
  const [crossPost, setCrossPost] = useState(true)

  const calDays = ['S','M','T','W','T','F','S']
  const postDays = [4,7,9,11,14,16,21,23,25]
  const ambDays = [7,9,11,14,21,25]
  
  const renderCalendar = () => {
    const cells = []
    
    // Header
    calDays.forEach((d, i) => {
      cells.push(
        <div key={`h-${i}`} className="text-center text-[10px] text-textMuted py-1 font-bold">{d}</div>
      )
    })
    
    // Blank offsets
    for(let i=0; i<3; i++) {
        cells.push(<div key={`blank-${i}`} className="aspect-square" />)
    }

    // Days
    for(let d=1; d<=30; d++) {
        const isPost = postDays.includes(d)
        const isAmb = ambDays.includes(d)
        const isToday = d===4
        
        cells.push(
            <div 
              key={`day-${d}`} 
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[12px] cursor-pointer gap-0.5 border transition-all
                ${isPost ? 'bg-primary/20 text-primary border-primary/30' : 'bg-[#141E24] text-textSecondary border-white/5'}
                ${isToday ? 'border-[2px] border-primary font-bold shadow-[0_0_15px_rgba(0,255,163,0.2)]' : 'font-medium'}
                ${(isToday || isPost) ? 'text-white' : ''}
              `}
            >
                {d}
                {isAmb && <div className="w-1.5 h-1.5 rounded-full bg-kPurple shadow-[0_0_5px_rgba(138,130,232,0.8)]" />}
            </div>
        )
    }
    
    return cells
  }

  return (
    <div className="animate-fade-in pb-12">
      <div className="heading-sec mb-2">Campaign Pipeline</div>
      <div className="sub-text">Every scheduled post shows alongside its ambassador sync — one timeline, global view.</div>

      <div className="glass-panel p-5 mb-8">
          <div className="grid grid-cols-7 gap-1.5 mb-3">
              {renderCalendar()}
          </div>
          <div className="flex gap-4 mt-4 text-[11px] font-bold uppercase tracking-wide text-textMuted border-t border-white/5 pt-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[2px] bg-primary/40 inline-block border border-primary" />Direct Broadcast</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-kPurple inline-block shadow-[0_0_8px_currentColor]" />Network Send</span>
          </div>
      </div>

      <div className="heading-sec">Pending Operations</div>
      <div className="card">
        <div className="row-item py-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-2 text-center min-w-[50px] shrink-0">
            <div className="text-[10px] text-primary font-bold tracking-widest mb-0.5">MON</div>
            <div className="text-[18px] font-bold text-white tracking-tight leading-none">07</div>
          </div>
          <div className="flex-1 min-w-0 pr-3">
            <div className="text-[14px] font-bold text-white mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Weekend spinach specials</div>
            <div className="text-[12px] text-textMuted">09:00 · WhatsApp · 284 nodes</div>
          </div>
          <span className="tag tag-sched shrink-0"><span className="dot-sched"></span>Queued</span>
        </div>
        
        <div className="row-item bg-kPurple/5 rounded-xl border border-kPurple/10 px-4 py-3 mx-0 mb-3 border-b-white/5">
          <div className="min-w-[50px] text-center shrink-0 pr-3">
            <span className="badge badge-bp !text-[9px]">AMB</span>
          </div>
          <div className="flex-1 min-w-0 pr-3">
            <div className="text-[13px] font-bold text-kPurple mb-0.5">Network Sync: Thandi, Kofi...</div>
            <div className="text-[12px] text-textMuted">~900 indirect reach guaranteed</div>
          </div>
          <span className="tag tag-amb !text-[9px] shrink-0"><span className="dot-amb"></span>Auto-fire</span>
        </div>
        
        <div className="row-item py-4 border-b-0 pb-2">
          <div className="bg-kAmber/10 border border-kAmber/20 rounded-lg px-2.5 py-2 text-center min-w-[50px] shrink-0">
            <div className="text-[10px] text-kAmberDark font-bold tracking-widest mb-0.5">WED</div>
            <div className="text-[18px] font-bold text-white tracking-tight leading-none">09</div>
          </div>
          <div className="flex-1 min-w-0 pr-3">
            <div className="text-[14px] font-bold text-white mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Flash sale: 30% off tomatoes</div>
            <div className="text-[12px] text-textMuted">12:00 · FB + Instagram Sync</div>
          </div>
          <span className="tag tag-sched shrink-0"><span className="dot-sched"></span>Queued</span>
        </div>
      </div>

      <div className="space-y-0 mt-8 mb-8 border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#111A1F]">
              <div className="pr-4">
                  <div className="text-[14px] font-bold text-white mb-0.5">Autonomous Dispatch</div>
                  <div className="text-[12px] text-textSecondary">Every new post automatically queues to network</div>
              </div>
              <button onClick={() => setAutoSend(!autoSend)} className={`w-10 h-6 rounded-full relative transition-colors ${autoSend ? 'bg-primary' : 'bg-white/10'}`}><span className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white transition-transform ${autoSend ? 'translate-x-[16px]' : 'translate-x-0'} shadow-sm`} /></button>
          </div>
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#111A1F]">
              <div className="pr-4">
                  <div className="text-[14px] font-bold text-white mb-0.5">Chronological Optimizer</div>
                  <div className="text-[12px] text-textSecondary">Neural Engine selects highest engagement window</div>
              </div>
              <button onClick={() => setSmartTiming(!smartTiming)} className={`w-10 h-6 rounded-full relative transition-colors ${smartTiming ? 'bg-primary' : 'bg-white/10'}`}><span className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white transition-transform ${smartTiming ? 'translate-x-[16px]' : 'translate-x-0'} shadow-sm`} /></button>
          </div>
          <div className="flex items-center justify-between p-4 bg-[#111A1F]">
              <div className="pr-4">
                  <div className="text-[14px] font-bold text-white mb-0.5">Platform Bridging</div>
                  <div className="text-[12px] text-textSecondary">Synchronous push to Meta suite and local SMS Gateways</div>
              </div>
              <button onClick={() => setCrossPost(!crossPost)} className={`w-10 h-6 rounded-full relative transition-colors ${crossPost ? 'bg-primary' : 'bg-white/10'}`}><span className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white transition-transform ${crossPost ? 'translate-x-[16px]' : 'translate-x-0'} shadow-sm`} /></button>
          </div>
      </div>
      
      <button className="btn-primary" onClick={() => onTabChange('create')}>Launch Campaign Sequence</button>
    </div>
  )
}
