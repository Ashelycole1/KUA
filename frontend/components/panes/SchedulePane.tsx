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
        <div key={`h-${i}`} className="text-center text-[10px] text-mu py-1 font-medium">{d}</div>
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
              className={`aspect-square rounded-kuasm flex flex-col items-center justify-center text-[11px] cursor-pointer gap-0.5 border
                ${isPost ? 'bg-kGreenLight text-kGreenMid' : 'bg-su text-tx'}
                ${isToday ? 'border-[1.5px] border-kGreen font-bold' : 'border-transparent font-normal'}
                ${(isToday || isPost) ? 'font-medium' : ''}
              `}
            >
                {d}
                {isAmb && <div className="w-1 h-1 rounded-full bg-kPurple" />}
            </div>
        )
    }
    
    return cells
  }

  return (
    <div className="animate-fade-in pb-8">
      <div className="heading-sec">Content calendar</div>
      <div className="sub-text">Every scheduled post shows alongside its ambassador version — one campaign, full picture.</div>

      <div className="mb-6">
          <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
          </div>
          <div className="flex gap-4 mt-2 text-[11px] text-mu">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-kGreenLight inline-block" />Post scheduled</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-kPurple inline-block" />Ambassador send</span>
          </div>
      </div>

      <div className="heading-sec">This week</div>
      <div className="card">
        <div className="row-item">
          <div className="bg-kGreenLight rounded-kuasm px-2.5 py-1.5 text-center min-w-[44px]">
            <div className="text-[9px] text-kGreenMid">MON</div>
            <div className="font-syne text-[16px] font-bold text-kGreenDark">07</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium">Weekend spinach specials</div>
            <div className="text-[11px] text-mu">09:00 · WhatsApp · 284 contacts</div>
          </div>
          <span className="tag tag-sched"><span className="dot-sched"></span>Scheduled</span>
        </div>
        
        <div className="row-item bg-kPurpleLight rounded-kuasm px-2.5 py-2 my-1.5 border-none">
          <div className="w-[44px] text-center shrink-0">
            <span className="badge badge-bp !text-[9px]">AMB</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium text-kPurpleDark">Same post · via Thandi, Kofi, Amara</div>
            <div className="text-[11px] text-kPurple">~900 extra people in community groups</div>
          </div>
          <span className="tag tag-amb !text-[9px]"><span className="dot-amb"></span>Auto-send</span>
        </div>
        
        <div className="row-item border-none pb-1">
          <div className="bg-kAmberLight rounded-kuasm px-2.5 py-1.5 text-center min-w-[44px]">
            <div className="text-[9px] text-kAmberDark">WED</div>
            <div className="font-syne text-[16px] font-bold text-kAmberDark">09</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium">Flash sale: 30% off tomatoes</div>
            <div className="text-[11px] text-mu">12:00 · Facebook + Instagram</div>
          </div>
          <span className="tag tag-sched"><span className="dot-sched"></span>Scheduled</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between border-b border-br pb-3">
              <div>
                  <div className="text-[13px] font-medium text-tx">Auto-send to ambassadors</div>
                  <div className="text-[11px] text-mu mt-0.5">Every new post automatically queues</div>
              </div>
              <button onClick={() => setAutoSend(!autoSend)} className={`w-9 h-5 rounded-full relative transition-colors ${autoSend ? 'bg-kGreen' : 'bg-br'}`}><span className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white transition-transform ${autoSend ? 'translate-x-[16px]' : 'translate-x-0'}`} /></button>
          </div>
          <div className="flex items-center justify-between border-b border-br pb-3">
              <div>
                  <div className="text-[13px] font-medium text-tx">Smart timing</div>
                  <div className="text-[11px] text-mu mt-0.5">KUA picks the best time</div>
              </div>
              <button onClick={() => setSmartTiming(!smartTiming)} className={`w-9 h-5 rounded-full relative transition-colors ${smartTiming ? 'bg-kGreen' : 'bg-br'}`}><span className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white transition-transform ${smartTiming ? 'translate-x-[16px]' : 'translate-x-0'}`} /></button>
          </div>
          <div className="flex items-center justify-between pb-1">
              <div>
                  <div className="text-[13px] font-medium text-tx">Cross-post to all platforms</div>
                  <div className="text-[11px] text-mu mt-0.5">Push to Meta suite and SMS</div>
              </div>
              <button onClick={() => setCrossPost(!crossPost)} className={`w-9 h-5 rounded-full relative transition-colors ${crossPost ? 'bg-kGreen' : 'bg-br'}`}><span className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white transition-transform ${crossPost ? 'translate-x-[16px]' : 'translate-x-0'}`} /></button>
          </div>
      </div>
      
      <button className="btn btn-pr btn-fl" onClick={() => onTabChange('create')}>+ Create new post</button>
    </div>
  )
}
