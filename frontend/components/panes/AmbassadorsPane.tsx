'use client'

import React, { useState } from 'react'
import { useKua } from '../KuaProvider'
import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

export default function AmbassadorsPane({ onTabChange }: { onTabChange: (tab: any) => void }) {
  const { user, setUser, toast, countryData, addHistoryItem } = useKua()
  const [payBox, setPayBox]         = useState<any>(null)
  const [payDone, setPayDone]       = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteCopied, setInviteCopied] = useState(false)
  const [selectedGateway, setSelectedGateway] = useState(0)

  // Per-click and per-sale reward rates scaled to the user's active country currency.
  // Base rates in KES (Kenya): R10 per click, R25 per confirmed sale.
  // We scale relative to KES pricePer10 = 100, so 1 KES unit = pricePer10 / 100.
  const scale = countryData.pricePer10 / 100

  // Ambassador payout amounts (raw numbers in local currency)
  const ambassadors = [
    {
      id: 1, init: 'TN', name: 'Thandi Nkosi',
      stats: '4 groups · 18 clicks · 3 sales',
      prog: 90,
      owedRaw: Math.round(45 * scale), // 45 KES equivalent
      c: 'bg-primary/10 text-primary border border-primary/20',
      pc: 'bg-primary',
      colorClass: 'text-primary',
      btnClass: 'bg-primary border border-primary/20 text-[#0B1215] shadow-[0_0_10px_rgba(0,255,163,0.3)] hover:bg-primaryHover',
    },
    {
      id: 2, init: 'KM', name: 'Kofi Mensah',
      stats: '3 groups · 14 clicks · 1 sale',
      prog: 65,
      owedRaw: Math.round(35 * scale), // 35 KES equivalent
      c: 'bg-kPurple/10 text-kPurple border border-kPurple/20',
      pc: 'bg-kPurple',
      colorClass: 'text-kPurple',
      btnClass: 'bg-kPurple/20 text-kPurple border border-kPurple/30 hover:bg-kPurple/30',
    },
    {
      id: 3, init: 'AB', name: 'Amara Bah',
      stats: '2 groups · 9 clicks · 1 sale',
      prog: 40,
      owedRaw: Math.round(20 * scale), // 20 KES equivalent
      c: 'bg-kAmber/10 text-kAmber border border-kAmber/20',
      pc: 'bg-kAmber',
      colorClass: 'text-kAmber',
      btnClass: 'bg-kAmber/20 text-kAmberDark border border-kAmber/30 hover:bg-kAmber/30',
    },
  ]

  // Total paid out (all 3 ambassadors worth)
  const totalPaidOut = Math.round(184 * scale)

  // Available gateway options per country
  const gateways = [countryData.paymentMethod, 'Airtime Top-up', 'Bank Transfer'].filter(
    (g, i, arr) => arr.indexOf(g) === i // deduplicate
  )

  const confirmPay = () => {
    if (!payBox) return
    const amount = payBox.owedRaw

    if (user.balance < amount) {
      toast(`Insufficient balance. Please top up your wallet first.`)
      return
    }

    // Deduct from balance
    setUser({ balance: user.balance - amount })

    addHistoryItem('payout', {
      amount: formatCurrency(amount, countryData),
      amountRaw: amount,
      recipient: payBox.name,
      gateway: gateways[selectedGateway],
      stats: payBox.stats,
    })

    toast(`✅ ${formatCurrency(amount, countryData)} sent to ${payBox.name.split(' ')[0]} via ${gateways[selectedGateway]}`)
    setPayDone(true)
    setTimeout(() => {
      setPayDone(false)
      setPayBox(null)
    }, 2500)
  }

  const copyInvite = () => {
    const rewardAmt = formatCurrency(Math.round(10 * scale), countryData)
    const msg = `Hey! You've been a loyal customer and we really appreciate you. We want to invite you to be a KUA Ambassador. For every person who buys because of you, we'll send you ${rewardAmt} airtime. Reply YES and we'll set you up right away!`
    navigator.clipboard.writeText(msg).catch(() => {})
    setInviteCopied(true)
    setTimeout(() => setInviteCopied(false), 1500)
  }

  const insufficientBalance = payBox && user.balance < payBox.owedRaw

  return (
    <div className="animate-fade-in pb-12">
      <div className="heading-sec">Your active ambassador matrix</div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="met"><span className="met-n text-white">12</span><span className="met-l">Active</span></div>
        <div className="met"><span className="met-n text-kAmber">3,840</span><span className="met-l">People reached</span></div>
        <div className="met"><span className="met-n text-kPurple">{formatCurrency(totalPaidOut, countryData)}</span><span className="met-l">Paid out</span></div>
      </div>

      {/* Wallet Balance Banner */}
      <div className="glass-panel p-3 mb-4 flex items-center justify-between">
        <div className="text-[11px] text-textMuted uppercase tracking-widest font-bold">Wallet Balance</div>
        <div className={cn("text-[16px] font-black tracking-tight", user.balance <= 0 ? "text-red-400" : "text-white")}>
          {formatCurrency(user.balance, countryData)}
        </div>
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
              <div className={`font-bold text-[16px] tracking-tight ${a.colorClass}`}>
                {formatCurrency(a.owedRaw, countryData)}
              </div>
              <button
                className={`mt-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wide ${a.btnClass}`}
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
          <div className="label-sm mb-1 font-bold tracking-widest text-[11px]">Deploy Payment Execution</div>
          <div className="text-[12px] text-textMuted mb-3">
            Sending <span className="text-white font-bold">{formatCurrency(payBox.owedRaw, countryData)}</span> to <span className="text-white font-bold">{payBox.name}</span>
          </div>

          {/* Gateway selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {gateways.map((g, i) => (
              <button
                key={g}
                onClick={() => setSelectedGateway(i)}
                className={cn(
                  'pill text-[11px]',
                  selectedGateway === i ? 'on' : ''
                )}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Insufficient balance warning */}
          {insufficientBalance && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-3 text-[12px] text-red-400">
              <AlertCircle size={14} className="shrink-0" />
              Insufficient wallet balance. Top up at least {formatCurrency(payBox.owedRaw - user.balance, countryData)} to proceed.
            </div>
          )}

          <div className="flex gap-2">
            <button
              className={cn(
                "flex-1 py-3 text-[13px] font-bold rounded-xl transition-colors",
                insufficientBalance
                  ? "bg-white/5 border border-white/10 text-textMuted cursor-not-allowed"
                  : "bg-primary text-[#0B1215] shadow-[0_0_20px_rgba(0,255,163,0.3)] hover:bg-primaryHover"
              )}
              onClick={confirmPay}
              disabled={!!insufficientBalance}
            >
              Deploy {formatCurrency(payBox.owedRaw, countryData)} to {payBox.name.split(' ')[0]}
            </button>
            <button className="py-3 px-6 text-[13px] font-bold bg-white/5 border border-white/10 text-white rounded-xl transition-colors hover:bg-white/10" onClick={() => setPayBox(null)}>
              Cancel
            </button>
          </div>

          {payDone && (
            <div className="mt-3 bg-primary/10 border border-primary/20 rounded-xl p-3 text-[13px] text-primary text-center font-bold animate-fade-in">
              ✅ Execution Confirmed. {payBox.name.split(' ')[0]} will be notified instantly via {gateways[selectedGateway]}.
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 mt-6 mb-6">
        <button className="btn-primary" onClick={() => onTabChange('create')}>Draft Ambassador Push</button>
        <button className="btn-secondary whitespace-nowrap" onClick={() => setShowInvite(!showInvite)}>+ Add Node</button>
      </div>

      {showInvite && (
        <div className="glass-panel p-5 animate-fade-in">
          <div className="label-sm mb-2 font-bold tracking-widest text-[11px]">Network Expansion Invitation</div>
          <div className="bg-[#141E24] rounded-xl p-4 text-[13px] leading-relaxed text-textSecondary border border-white/5 mb-4 font-medium italic">
            "Hey [Name]! You've been a loyal customer. We want to invite you to be a KUA Ambassador. For every person who buys because of you, we'll send you {formatCurrency(Math.round(10 * scale), countryData)} airtime. Reply YES and we'll set you up right away!"
          </div>
          <button className="btn-primary" onClick={copyInvite}>
            {inviteCopied ? 'Copied to Clipboard!' : 'Copy Invitation Link'}
          </button>
        </div>
      )}
    </div>
  )
}
