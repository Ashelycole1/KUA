'use client'

import React from 'react'

export default function AnalyticsPane() {
  return (
    <div className="animate-fade-in">
      <div className="heading-sec">Your full picture — direct + ambassador</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        <div className="met">
          <span className="met-n">4,821</span>
          <span className="met-l">Total reach (direct)</span>
        </div>
        <div className="met">
          <span className="met-n text-kPurple">3,840</span>
          <span className="met-l">Ambassador reach</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
        <div className="met">
          <span className="met-n">312</span>
          <span className="met-l">Direct clicks</span>
        </div>
        <div className="met">
          <span className="met-n text-kAmber">47</span>
          <span className="met-l">Ambassador referrals</span>
        </div>
      </div>

      <div className="heading-sec">Direct posts vs ambassador posts</div>
      <div className="card">
        <div className="flex justify-between text-[11px] text-mu mb-2">
          <span>Channel performance comparison</span>
          <span>Click-through rate</span>
        </div>
        
        <div className="flex items-center gap-2.5 mb-2">
          <div className="text-[12px] text-tx w-[90px] shrink-0">Your posts</div>
          <div className="flex-1 bg-su rounded-sm h-4 overflow-hidden">
            <div className="w-[64%] h-full bg-kGreen rounded-sm"></div>
          </div>
          <div className="text-[12px] font-medium text-kGreen w-8 text-right">6.4%</div>
        </div>
        
        <div className="flex items-center gap-2.5 mb-2">
          <div className="text-[12px] text-tx w-[90px] shrink-0">Ambassadors</div>
          <div className="flex-1 bg-su rounded-sm h-4 overflow-hidden">
            <div className="w-[85%] h-full bg-kPurple rounded-sm"></div>
          </div>
          <div className="text-[12px] font-medium text-kPurple w-8 text-right">14.7%</div>
        </div>
        
        <div className="flex items-center gap-2.5">
          <div className="text-[12px] text-tx w-[90px] shrink-0">Facebook ads</div>
          <div className="flex-1 bg-su rounded-sm h-4 overflow-hidden">
            <div className="w-[18%] h-full bg-kCoral rounded-sm"></div>
          </div>
          <div className="text-[12px] font-medium text-kCoral w-8 text-right">1.8%</div>
        </div>
      </div>

      <div className="heading-sec mt-6">Cost per reach</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
        <div className="met"><span className="met-n !text-[16px]">R0.04</span><span className="met-l">Your posts</span></div>
        <div className="met"><span className="met-n !text-[16px] text-kPurple">R0.05</span><span className="met-l">Ambassadors</span></div>
        <div className="met"><span className="met-n !text-[16px] text-kCoral">R0.22</span><span className="met-l">Facebook ads</span></div>
      </div>

      <div className="bg-kGreenLight rounded-kualg p-4 mb-4 mt-2">
        <div className="font-medium text-[13px] text-kGreenDark mb-1">The combined power</div>
        <div className="text-[12px] text-kGreenMid leading-relaxed">
          Your ambassador network is generating a 14.7% click rate — 8× better than Facebook ads — at 4× lower cost. This is the KUA advantage. The more ambassadors you recruit, the more this gap widens.
        </div>
      </div>
    </div>
  )
}
