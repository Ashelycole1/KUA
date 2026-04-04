'use client'

import React from 'react'
import { ChevronRight } from 'lucide-react'

export default function HomePane({ onTabChange }: { onTabChange: (tab: any) => void }) {
  return (
    <div className="animate-fade-in pb-12">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="met" onClick={() => onTabChange('analytics')}>
          <span className="met-n">4,821</span>
          <span className="met-l">Total reach</span>
        </div>
        <div className="met" onClick={() => onTabChange('ambassadors')}>
          <span className="met-n text-kAmber">12</span>
          <span className="met-l">Ambassadors</span>
        </div>
        <div className="met">
          <span className="met-n text-kPurple">47</span>
          <span className="met-l">Referrals</span>
        </div>
        <div className="met">
          <span className="met-n text-white">R184</span>
          <span className="met-l">Paid out</span>
        </div>
      </div>

      <div className="heading-sec">What needs your attention today</div>

      <div className="card hi">
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-[14px] font-bold text-white">Your Friday post is scheduled</div>
          <span className="tag tag-sched"><span className="dot-sched"></span>Scheduled</span>
        </div>
        <div className="sub-text">Weekend specials · WhatsApp + Facebook · 07:30am</div>
        <div className="flex gap-3">
          <button className="flex-1 py-2 text-[12px] font-bold bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors" onClick={() => onTabChange('schedule')}>View schedule</button>
          <button className="flex-1 py-2 text-[12px] font-bold bg-primary text-[#0B1215] rounded-lg transition-colors shadow-[0_0_15px_rgba(0,255,163,0.3)] hover:bg-primaryHover" onClick={() => onTabChange('ambassadors')}>Use Ambassadors</button>
        </div>
      </div>

      <div className="card amber mt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[14px] font-bold text-white">Thandi is waiting for her message</div>
          <span className="tag tag-amb"><span className="dot-amb"></span>Ambassador</span>
        </div>
        <div className="sub-text">You created a post yesterday but haven't sent it to Thandi's network yet. She reaches 4 groups with ~600 people.</div>
        <button className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-bold bg-kAmber text-white rounded-lg transition-colors hover:opacity-90" onClick={() => onTabChange('ambassadors')}>
          Send her the message <ChevronRight size={14} />
        </button>
      </div>

      <div className="card purple mt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[14px] font-bold text-white">R75 reward owed to Thandi</div>
          <span className="badge badge-bp">Pay out</span>
        </div>
        <div className="sub-text">Her last referral campaign brought in 3 confirmed sales. Pay her airtime to keep her motivated.</div>
        <button className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-bold bg-kPurple text-white rounded-lg transition-colors hover:opacity-90" onClick={() => onTabChange('ambassadors')}>
          Pay R75 via MTN MoMo <ChevronRight size={14} />
        </button>
      </div>

      <div className="heading-sec mt-8">This week's activity</div>
      <div className="card">
        <div className="row-item">
          <span className="tag tag-live"><span className="dot-live"></span>Live</span>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold text-white mb-0.5">Tomato flash sale</div>
            <div className="text-[11px] text-textMuted uppercase tracking-wide">Posted Wed · 1,240 reached</div>
          </div>
          <div className="text-[16px] font-bold text-primary">7.2% ctr</div>
        </div>
        <div className="row-item">
          <span className="tag tag-amb"><span className="dot-amb"></span>Thandi</span>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold text-white mb-0.5">Tomato flash sale (FWD)</div>
            <div className="text-[11px] text-textMuted uppercase tracking-wide">4 WA groups · 580 reached</div>
          </div>
          <div className="text-[16px] font-bold text-kPurple">6.5% ctr</div>
        </div>
        <div className="row-item border-b-0 pb-1">
          <span className="tag tag-sched"><span className="dot-sched"></span>Queued</span>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold text-white mb-0.5">Weekend market hours</div>
            <div className="text-[11px] text-textMuted uppercase tracking-wide">Friday 07:30 · WhatsApp/FB</div>
          </div>
          <span className="badge badge-bx">Tomorrow</span>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mt-4 mb-2 shadow-[0_0_30px_rgba(0,255,163,0.05)]">
        <div className="font-bold tracking-tight text-[15px] text-primary mb-1">KUA insight for today</div>
        <div className="text-[13px] text-textSecondary leading-relaxed mb-4">
          Your ambassador posts are getting 2.3× more clicks than your direct posts. Consider recruiting 3 more ambassadors this week — you currently only have 12 and your reach potential is much higher.
        </div>
        <button 
          className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-lg text-[12px] font-bold transition-all hover:bg-primary/20"
          onClick={() => onTabChange('ambassadors')}
        >
          Recruit more ambassadors
        </button>
      </div>
    </div>
  )
}
