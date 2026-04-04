'use client'

import React, { useState } from 'react'
import { useKua } from '../KuaProvider'

function ToggleRow({ title, desc, defaultOn = false }: { title: string, desc: string, defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="row-item justify-between border-b border-br last:border-b-0 py-2.5">
      <div className="pr-4">
        <div className="text-[13px] font-medium text-tx">{title}</div>
        <div className="text-[11px] text-mu mt-0.5">{desc}</div>
      </div>
      <button 
        onClick={() => setOn(!on)}
        className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${on ? 'bg-kGreen' : 'bg-br'}`}
      >
        <span 
          className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white transition-transform ${on ? 'translate-x-[16px]' : 'translate-x-0'}`} 
        />
      </button>
    </div>
  )
}

export default function SettingsPane() {
  const { user } = useKua()
  const [payMethod, setPayMethod] = useState('mtn')

  return (
    <div className="animate-fade-in pb-8">
      <div className="heading-sec">Platform settings</div>

      <div className="card">
        <div className="font-medium text-[13px] text-tx mb-2.5">Connected channels</div>
        <ToggleRow title="WhatsApp Business" desc="+27 83 456 7890 · Connected" defaultOn={true} />
        <ToggleRow title="Facebook Page" desc={user.bizName || "Business"} defaultOn={true} />
        <ToggleRow title="Instagram" desc="@business_social · Connected" defaultOn={false} />
        <ToggleRow title="SMS broadcast" desc="Bulk SMS via local gateway · Not connected" defaultOn={false} />
      </div>

      <div className="card">
        <div className="font-medium text-[13px] text-tx mb-2.5">Ambassador payout method</div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {['MTN MoMo', 'M-Pesa', 'Airtel Money', 'Airtime top-up'].map((m) => {
            const key = m.split(' ')[0].toLowerCase()
            return (
              <span 
                key={m} 
                onClick={() => setPayMethod(key)}
                className={`pill ${payMethod === key ? 'on' : ''}`}
              >
                {m}
              </span>
            )
          })}
        </div>

        <div className="text-[12px] text-mu mb-1.5">Default reward per referral click</div>
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="text-[13px] text-mu">R</span>
          <input className="inp !w-20 !mb-0 text-center" type="number" defaultValue="10" min="1" step="1" />
          <span className="text-[12px] text-mu">per click · R25 per confirmed sale</span>
        </div>
      </div>

      <div className="card">
        <div className="font-medium text-[13px] text-tx mb-1.5">AI content preferences</div>
        <ToggleRow title="Always include ambassador version" desc="Every generated post includes an ambassador-friendly variant" defaultOn={true} />
        <ToggleRow title="Auto-assign best ambassador" desc="KUA picks the ambassador most likely to convert for each post" defaultOn={true} />
        <ToggleRow title="Offline draft saving" desc="Save posts without data, auto-sends when reconnected" defaultOn={true} />
      </div>

      <div className="card flex items-center justify-between mt-4">
        <div>
          <div className="font-syne text-[18px] font-bold text-kGreen">Grower</div>
          <div className="text-[12px] text-mu">R99/month · All features unlocked</div>
        </div>
        <span className="badge badge-bg text-[11px] px-2.5 py-1">Active</span>
      </div>
    </div>
  )
}
