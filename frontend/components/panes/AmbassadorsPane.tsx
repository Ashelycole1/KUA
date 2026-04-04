'use client'

import React, { useState } from 'react'

export default function AmbassadorsPane({ onTabChange }: { onTabChange: (tab: any) => void }) {
  const [payBox, setPayBox] = useState<any>(null)
  const [payDone, setPayDone] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteCopied, setInviteCopied] = useState(false)

  const ambassadors = [
    { id: 1, init: 'TN', name: 'Thandi Nkosi', stats: '4 groups · 18 clicks · 3 sales', prog: 90, c: 'bg-primary/10 text-primary border border-primary/20', pc: 'bg-primary', owed: 'R45' },
    { id: 2, init: 'KM', name: 'Kofi Mensah', stats: '3 groups · 14 clicks · 1 sale', prog: 65, c: 'bg-kPurple/10 text-kPurple border border-kPurple/20', pc: 'bg-kPurple', owed: 'R35' },
    { id: 3, init: 'AB', name: 'Amara Bah', stats: '2 groups · 9 clicks · 1 sale', prog: 40, c: 'bg-kAmber/10 text-kAmber border border-kAmber/20', pc: 'bg-kAmber', owed: 'R20' },
  ]

  const confirmPay = () => {
    setPayDone(true)
    setTimeout(() => {
      setPayDone(false)
      setPayBox(null)
    }, 2500)
  }

  const copyInvite = () => {
    navigator.clipboard.writeText("Hey! You've been a loyal customer and we really appreciate you. We want to invite you to be a KUA Ambassador. For every person who buys because of you, we'll send you R10 airtime. Reply YES and we'll set you up right away!").catch(()=>{})
    setInviteCopied(true)
    setTimeout(() => setInviteCopied(false), 1500)
  }

  return (
    <div className="animate-fade-in pb-12">
      <div className="heading-sec">Your active ambassador matrix</div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="met"><span className="met-n text-white">12</span><span className="met-l">Active</span></div>
        <div className="met"><span className="met-n text-kAmber">3,840</span><span className="met-l">People reached</span></div>
        <div className="met"><span className="met-n text-kPurple">R184</span><span className="met-l">Paid out</span></div>
      </div>

      <div className="card">
        {ambassadors.map((a) => (
          <div key={a.id} className="row-item py-4 border-white/5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0 ${a.c}`}>
              {a.init}
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <div className="text-[14px] font-bold text-white mb-0.5">{a.name}</div>
              <div className="text-[12px] text-textMuted mb-2">{a.stats}</div>
              <div className="h-[4px] bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${a.pc} shadow-[0_0_10px_currentColor]`} style={{ width: `${a.prog}%` }} />
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={`font-bold text-[16px] tracking-tight ${a.id === 1 ? 'text-primary' : a.id === 2 ? 'text-kPurple' : 'text-kAmber'}`}>
                {a.owed}
              </div>
              <button 
                className={`mt-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wide
                    ${a.id === 1 ? 'bg-primary border border-primary/20 text-[#0B1215] shadow-[0_0_10px_rgba(0,255,163,0.3)] hover:bg-primaryHover' : 
                      a.id === 2 ? 'bg-kPurple/20 text-kPurple border border-kPurple/30 hover:bg-kPurple/30' : 
                      'bg-kAmber/20 text-kAmberDark border border-kAmber/30 hover:bg-kAmber/30'}`}
                onClick={() => setPayBox(a)}
              >
                Pay now
              </button>
            </div>
          </div>
        ))}
      </div>

      {payBox && (
        <div className="card hi mt-4 animate-fade-in shadow-[0_0_30px_rgba(0,255,163,0.05)]">
          <div className="label-sm mb-2 font-bold tracking-widest text-[11px]">Deploy Payment Execution</div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="pill on">MTN MoMo</span>
            <span className="pill">M-Pesa</span>
            <span className="pill">Airtime Load</span>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-3 text-[13px] font-bold bg-primary text-[#0B1215] rounded-xl transition-colors shadow-[0_0_20px_rgba(0,255,163,0.3)] hover:bg-primaryHover" onClick={confirmPay}>
              Deploy {payBox.owed} to {payBox.name.split(' ')[0]}
            </button>
            <button className="py-3 px-6 text-[13px] font-bold bg-white/5 border border-white/10 text-white rounded-xl transition-colors hover:bg-white/10" onClick={() => setPayBox(null)}>Cancel</button>
          </div>
          {payDone && (
            <div className="mt-3 bg-primary/10 border border-primary/20 rounded-xl p-3 text-[13px] text-primary text-center font-bold animate-fade-in">
              Execution Confirmed. {payBox.name.split(' ')[0]} will be notified instantly.
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 mt-6 mb-6">
        <button className="btn-primary" onClick={() => onTabChange('studio')}>Draft Ambassador Push</button>
        <button className="btn-secondary whitespace-nowrap" onClick={() => setShowInvite(!showInvite)}>+ Add Node</button>
      </div>

      {showInvite && (
        <div className="glass-panel p-5 animate-fade-in">
          <div className="label-sm mb-2 font-bold tracking-widest text-[11px]">Network Expansion Invitation</div>
          <div className="bg-[#141E24] rounded-xl p-4 text-[13px] leading-relaxed text-textSecondary border border-white/5 mb-4 font-medium italic">
            "Hey [Name]! You've been a loyal customer and we really appreciate you. We want to invite you to be a KUA Ambassador. For every person who buys because of you, we'll send you R10 airtime. Reply YES and we'll set you up right away!"
          </div>
          <button className="btn-primary" onClick={copyInvite}>
            {inviteCopied ? 'Link Copied to Clipboard!' : 'Copy Invitation Link'}
          </button>
        </div>
      )}
    </div>
  )
}
