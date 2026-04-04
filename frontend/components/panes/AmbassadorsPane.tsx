'use client'

import React, { useState } from 'react'

export default function AmbassadorsPane({ onTabChange }: { onTabChange: (tab: any) => void }) {
  const [payBox, setPayBox] = useState<any>(null)
  const [payDone, setPayDone] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteCopied, setInviteCopied] = useState(false)

  const ambassadors = [
    { id: 1, init: 'TN', name: 'Thandi Nkosi', stats: '4 groups · 18 clicks · 3 sales', prog: 90, c: 'bg-kGreenLight text-kGreenMid', pc: 'bg-kGreen', owed: 'R45' },
    { id: 2, init: 'KM', name: 'Kofi Mensah', stats: '3 groups · 14 clicks · 1 sale', prog: 65, c: 'bg-kPurpleLight text-kPurpleDark', pc: 'bg-kPurple', owed: 'R35' },
    { id: 3, init: 'AB', name: 'Amara Bah', stats: '2 groups · 9 clicks · 1 sale', prog: 40, c: 'bg-kAmberLight text-kAmberDark', pc: 'bg-kAmber', owed: 'R20' },
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
    <div className="animate-fade-in pb-8">
      <div className="heading-sec">Your ambassador network</div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="met"><span className="met-n">12</span><span className="met-l">Active</span></div>
        <div className="met"><span className="met-n text-kAmber">3,840</span><span className="met-l">People reached</span></div>
        <div className="met"><span className="met-n text-kPurple">R184</span><span className="met-l">Paid out</span></div>
      </div>

      <div className="card">
        {ambassadors.map((a) => (
          <div key={a.id} className="row-item border-b border-br last:border-b-0 py-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-[12px] shrink-0 ${a.c}`}>
              {a.init}
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <div className="text-[13px] font-medium text-tx">{a.name}</div>
              <div className="text-[11px] text-mu mb-1.5">{a.stats}</div>
              <div className="h-[5px] bg-su rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${a.pc}`} style={{ width: `${a.prog}%` }} />
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={`font-syne text-[15px] font-bold ${a.id === 1 ? 'text-kGreen' : a.id === 2 ? 'text-kPurple' : 'text-kAmber'}`}>
                {a.owed}
              </div>
              <button 
                className={`btn btn-sm mt-1 px-2.5 py-1 !text-[10px] ${a.id === 1 ? 'btn-pr' : a.id === 2 ? 'btn-pu' : 'btn-am'}`}
                onClick={() => setPayBox(a)}
              >
                Pay now
              </button>
            </div>
          </div>
        ))}
      </div>

      {payBox && (
        <div className="card hi mt-4 animate-fade-in">
          <div className="text-[12px] text-mu mb-1.5">Pay via mobile money</div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="pill on">MTN MoMo</span>
            <span className="pill">M-Pesa</span>
            <span className="pill">Airtime</span>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-pr flex-1" onClick={confirmPay}>
              Send {payBox.owed} to {payBox.name.split(' ')[0]}
            </button>
            <button className="btn btn-gh" onClick={() => setPayBox(null)}>Cancel</button>
          </div>
          {payDone && (
            <div className="mt-2.5 bg-kGreenLight rounded-kuasm p-2.5 text-[12px] text-kGreenMid text-center font-medium animate-fade-in">
              Sent! {payBox.name.split(' ')[0]} will receive a notification on her phone.
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-4 mb-4">
        <button className="btn btn-pr flex-1" onClick={() => onTabChange('create')}>Create message for ambassadors</button>
        <button className="btn btn-gh" onClick={() => setShowInvite(!showInvite)}>+ Recruit new</button>
      </div>

      {showInvite && (
        <div className="card animate-fade-in">
          <div className="text-[12px] text-mu mb-1.5">Invite message — sent to their WhatsApp</div>
          <div className="bg-kGreenLight rounded-bl-kualg rounded-br-kualg rounded-tr-kualg rounded-tl-none p-3 text-[12px] leading-relaxed text-kGreenDark border border-[#9FE1CB] mb-3">
            Hey [Name]! You've been a loyal customer and we really appreciate you. We want to invite you to be a KUA Ambassador. For every person who buys because of you, we'll send you R10 airtime. Reply YES and we'll set you up right away!
          </div>
          <button className="btn btn-pr btn-sm btn-fl" onClick={copyInvite}>
            {inviteCopied ? 'Copied!' : 'Copy & send on WhatsApp'}
          </button>
        </div>
      )}
    </div>
  )
}
