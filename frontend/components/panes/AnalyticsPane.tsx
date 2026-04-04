'use client'

import React from 'react'

export default function AnalyticsPane() {
  return (
    <div className="animate-fade-in pb-12">
      <div className="heading-sec">Your full picture — direct vs ambassador</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div className="met">
          <span className="met-n">4,821</span>
          <span className="met-l">Total reach (direct)</span>
        </div>
        <div className="met">
          <span className="met-n text-kPurple">3,840</span>
          <span className="met-l">Ambassador reach</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <div className="met">
          <span className="met-n text-white">312</span>
          <span className="met-l">Direct clicks</span>
        </div>
        <div className="met">
          <span className="met-n text-kAmber">47</span>
          <span className="met-l">Ambassador referrals</span>
        </div>
      </div>

      <div className="heading-sec">Channel performance benchmark</div>
      <div className="card p-5">
        <div className="flex justify-between text-[11px] font-bold tracking-widest uppercase text-textMuted mb-4 border-b border-white/5 pb-2">
          <span>Channel</span>
          <span>Click-through</span>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="text-[13px] font-bold text-white w-[100px] shrink-0">Your posts</div>
          <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden items-center flex">
            <div className="w-[64%] h-full bg-primary rounded-full shadow-[0_0_10px_rgba(0,255,163,0.5)]"></div>
          </div>
          <div className="text-[13px] font-bold text-primary w-10 text-right">6.4%</div>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="text-[13px] font-bold text-white w-[100px] shrink-0">Ambassadors</div>
          <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden items-center flex">
            <div className="w-[85%] h-full bg-kPurple rounded-full shadow-[0_0_10px_rgba(138,130,232,0.5)]"></div>
          </div>
          <div className="text-[13px] font-bold text-kPurple w-10 text-right">14.7%</div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-[13px] font-bold text-white w-[100px] shrink-0">Facebook ads</div>
          <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden items-center flex">
            <div className="w-[18%] h-full bg-kCoral rounded-full shadow-[0_0_10px_rgba(216,90,48,0.5)]"></div>
          </div>
          <div className="text-[13px] font-bold text-kCoral w-10 text-right">1.8%</div>
        </div>
      </div>

      <div className="heading-sec mt-8">Customer Acquisition Cost Tracker</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="met"><span className="met-n text-white !text-[18px]">R0.04</span><span className="met-l">Your posts</span></div>
        <div className="met"><span className="met-n !text-[18px] text-kPurple">R0.05</span><span className="met-l">Ambassadors</span></div>
        <div className="met"><span className="met-n !text-[18px] text-kCoral">R0.22</span><span className="met-l">FB Ads</span></div>
      </div>

      <div className="glass-panel p-5 bg-primary/5 border-primary/20 mb-4 mt-4">
        <div className="font-bold text-[14px] text-primary mb-1">The KUA Multiplying Effect</div>
        <div className="text-[13px] text-textSecondary leading-relaxed">
          Your ambassador network is generating a 14.7% click rate — 8× better than Facebook ads — at 4× lower cost. The more ambassadors you lock-in with guaranteed rewards, the more this gap aggressively widens.
        </div>
      </div>
    </div>
  )
}
