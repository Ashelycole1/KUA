'use client'

import React from 'react'

export default function HomePane({ onTabChange }: { onTabChange: (tab: any) => void }) {
  return (
    <div className="animate-fade-in">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="met">
          <span className="met-n">4,821</span>
          <span className="met-l">Total reach</span>
        </div>
        <div className="met">
          <span className="met-n text-kAmber">12</span>
          <span className="met-l">Ambassadors</span>
        </div>
        <div className="met">
          <span className="met-n text-kPurple">47</span>
          <span className="met-l">Referrals</span>
        </div>
        <div className="met">
          <span className="met-n">R184</span>
          <span className="met-l">Paid out</span>
        </div>
      </div>

      <div className="heading-sec">What needs your attention today</div>

      <div className="card hi">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-medium text-tx">Your Friday post is scheduled</div>
          <span className="tag tag-sched"><span className="dot-sched"></span>Scheduled</span>
        </div>
        <div className="sub-text mb-2.5">Weekend specials · WhatsApp + Facebook · 07:30am</div>
        <div className="flex gap-2">
          <button className="btn btn-gh btn-sm" onClick={() => onTabChange('schedule')}>View schedule</button>
          <button className="btn btn-pr btn-sm" onClick={() => onTabChange('ambassadors')}>Also send via ambassadors</button>
        </div>
      </div>

      <div className="card amber">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[13px] font-medium text-tx">Thandi is waiting for her message</div>
          <span className="tag tag-amb"><span className="dot-amb"></span>Ambassador</span>
        </div>
        <div className="sub-text mb-2.5">You created a post yesterday but haven't sent it to Thandi's network yet. She reaches 4 groups with ~600 people.</div>
        <button className="btn btn-am btn-sm" onClick={() => onTabChange('ambassadors')}>Send her the message</button>
      </div>

      <div className="card purple">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[13px] font-medium text-tx">R75 reward owed to Thandi</div>
          <span className="badge badge-bp text-[11px] px-2.5 py-1">Pay out</span>
        </div>
        <div className="sub-text mb-2.5">Her last referral campaign brought in 3 confirmed sales. Pay her airtime to keep her motivated.</div>
        <button className="btn btn-pu btn-sm" onClick={() => onTabChange('ambassadors')}>Pay R75 via MTN MoMo</button>
      </div>

      <div className="heading-sec mt-6">This week's activity</div>
      <div className="card">
        <div className="row-item">
          <span className="tag tag-live"><span className="dot-live"></span>Live</span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-tx">Tomato flash sale</div>
            <div className="text-[11px] text-mu">Posted Wed · 1,240 reached · 89 clicks</div>
          </div>
          <div className="font-syne text-[15px] font-bold text-kGreen">7.2%</div>
        </div>
        <div className="row-item">
          <span className="tag tag-amb"><span className="dot-amb"></span>Via Thandi</span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-tx">Tomato flash sale (forwarded)</div>
            <div className="text-[11px] text-mu">4 WhatsApp groups · 580 reached · 38 clicks</div>
          </div>
          <div className="font-syne text-[15px] font-bold text-kPurple">6.5%</div>
        </div>
        <div className="row-item">
          <span className="tag tag-sched"><span className="dot-sched"></span>Scheduled</span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-tx">Weekend market hours</div>
            <div className="text-[11px] text-mu">Friday 07:30 · WhatsApp + Facebook</div>
          </div>
          <span className="badge badge-bx">Tomorrow</span>
        </div>
      </div>

      <div className="bg-kGreenLight rounded-kualg p-4 mt-2 mb-8">
        <div className="font-medium text-[13px] text-kGreenDark mb-1">KUA insight for today</div>
        <div className="text-[12px] text-kGreenMid leading-relaxed mb-2">
          Your ambassador posts are getting 2.3× more clicks than your direct posts. Consider recruiting 3 more ambassadors this week — you currently only have 12 and your reach potential is much higher.
        </div>
        <button 
          className="btn btn-gh btn-sm !text-kGreenMid !border-[#9FE1CB]"
          onClick={() => onTabChange('ambassadors')}
        >
          Recruit more ambassadors
        </button>
      </div>
    </div>
  )
}
