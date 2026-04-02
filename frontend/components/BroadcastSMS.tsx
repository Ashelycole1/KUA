'use client'

import { useState } from 'react'
import { Send, Users, FileSpreadsheet, Smartphone, History, Zap } from 'lucide-react'
import { useKua } from './KuaProvider'
import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'

const RECIPIENT_OPTIONS = [
  { id: 'contacts', label: 'Phone Contacts', count: 0, icon: Smartphone },
  { id: 'csv',      label: 'Upload CSV / Text', count: 0, icon: FileSpreadsheet },
  { id: 'manual',   label: 'Manual Entry', count: 1, icon: Users },
]

const HISTORY = [
  {
    title: 'Mitumba Jeans Sale',
    time: '2 hrs ago',
    preview: 'FRESH MITUMBA JEANS! All sizes, Gikomba prices. Call now…',
    tags: [{ label: '50 SMS sent', type: 'sms' }, { label: 'KSh 25', type: 'cost' }, { label: 'WhatsApp', type: 'wa' }],
  },
]

export default function BroadcastSMS({ prefilledText }: { prefilledText?: string }) {
  const { user, toast, countryData, syncUser } = useKua()
  const [smsText, setSmsText]   = useState(prefilledText || 'Fresh tomatoes from Limuru! Very sweet, 50/- per kilo. Today only — call 0712 345 678 now!')
  const [selected, setSelected] = useState(0)
  const [sending, setSending]   = useState(false)
  const [recipients, setRecipients] = useState<string[]>([])
  const [fileName, setFileName] = useState('')

  const recipientCount = recipients.length || RECIPIENT_OPTIONS[selected].count
  const smsRate = 2.5
  const requiredBalance = recipientCount * smsRate
  const hasEnoughBalance = user.balance >= requiredBalance

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      // Basic parser: split by comma, newline or semicolon
      const matches = text.match(/\+?[0-9]{7,15}/g) || []
      const unique = Array.from(new Set(matches))
      setRecipients(unique)
      toast(`✅ Found ${unique.length} unique numbers in ${file.name}`)
    }
    reader.readAsText(file)
  }

  async function pickContacts() {
    if (!('contacts' in navigator)) {
      toast("Contact picker not supported on this device.")
      return
    }
    try {
      const props = ['name', 'tel']
      const opts = { multiple: true }
      const contacts = await (navigator as any).contacts.select(props, opts)
      if (contacts && contacts.length > 0) {
        const numbers = contacts.flatMap((c: any) => 
          (c.tel || []).map((t: string) => t.replace(/[\s\-\(\)]/g, ''))
        ).filter(Boolean)
        const unique = Array.from(new Set(numbers)) as string[]
        setRecipients(unique)
        toast(`✅ Selected ${unique.length} contacts`)
      } else {
        toast("No contacts selected.")
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function broadcast() {
    if (sending) return
    if (recipientCount === 0) {
      toast("Please select or upload recipients first.")
      return
    }
    if (!hasEnoughBalance) {
      toast(`Insufficient balance. You need ${formatCurrency(requiredBalance, countryData)} for this broadcast.`)
      return
    }

    setSending(true)
    try {
      const token = await (window as any).Clerk?.session?.getToken({ template: 'supabase' })
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/broadcast/send`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          recipients: recipients.length ? recipients : ['+254712345678'], // fallback for manual test
          message: smsText
        })
      })

      if (res.ok) {
        toast(`✅ Success! ${recipientCount} messages sent.`)
        await syncUser({}) // Refresh credits
        setRecipients([])
        setFileName('')
      } else {
        const err = await res.json()
        toast(`Error: ${err.detail || 'Dispatch failed'}`)
      }
    } catch (e) {
      toast("Broadcast failed. Check connection.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="label-sm flex items-center gap-2">
        <Send size={14} className="text-secondary" />
        Deploy Broadcast
      </div>

      {/* SMS compose card */}
      <div className="glass-panel p-5 flex flex-col gap-5">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Zap size={20} className="text-primary fill-primary/20" />
          </div>
          <div>
            <div className="text-[14px] font-bold text-white mb-0.5">Africa's Talking Engine</div>
            <div className="text-[11px] font-medium text-textSecondary tracking-wide uppercase">High deliverability routing</div>
          </div>
        </div>

        <div>
          <label className="label-sm">Compose Message</label>
          <div className="bg-[#141E24] rounded-2xl border border-white/5 overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-shadow">
            <textarea
              className="w-full bg-transparent border-none outline-none p-4 text-[14px] text-white resize-none leading-relaxed placeholder:text-textMuted"
              rows={3}
              value={smsText}
              onChange={e => setSmsText(e.target.value)}
            />
            <div className="bg-white/[0.02] px-4 py-2 flex justify-between items-center border-t border-white/5">
              <span className="text-[11px] font-medium text-textMuted">
                {smsText.length} characters
              </span>
              <span className="text-[11px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                {Math.ceil(smsText.length / 160)} SMS Parts
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="label-sm">Audience Targeting</label>
          <div className="flex flex-col gap-2">
            {RECIPIENT_OPTIONS.map((opt, i) => {
              const active = selected === i
              const Icon = opt.icon
              return (
                <div key={i} className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelected(i)
                      if (opt.id === 'manual') setRecipients([])
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all text-left w-full",
                      active 
                        ? "bg-primary/10 border-primary/30" 
                        : "bg-[#141E24] border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      active ? "bg-primary text-background" : "bg-white/5 text-textMuted"
                    )}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1">
                      <div className={cn("text-[13px] font-bold mb-0.5", active ? "text-primary" : "text-white")}>
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-textMuted">
                        {active && recipients.length > 0 ? `${recipients.length} selected` : 'Choose source'}
                      </div>
                    </div>
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                      active ? "border-primary" : "border-white/20"
                    )}>
                      {active && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                  </button>

                  {/* Actions for specific sources */}
                  {active && opt.id === 'contacts' && (
                    <button 
                      onClick={pickContacts}
                      className="mx-3 mb-2 py-2 px-3 rounded-lg bg-white/5 text-[12px] font-bold text-primary flex items-center justify-center gap-2 border border-white/5"
                    >
                      Pick from Phonebook
                    </button>
                  )}

                  {active && opt.id === 'csv' && (
                    <div className="mx-3 mb-2 flex flex-col gap-2">
                      <label 
                        className="py-2 px-3 rounded-lg bg-white/5 text-[12px] font-bold text-center flex items-center justify-center gap-2 border border-dashed border-white/20 cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <FileSpreadsheet size={14} />
                        {fileName || 'Upload CSV or TXT'}
                        <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Cost estimate */}
        <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.03] border border-white/5 mt-2">
          <div className="flex flex-col">
            <span className="text-[12px] font-bold uppercase tracking-wider text-textSecondary">Execution Cost</span>
            <span className="text-[10px] text-textMuted font-bold uppercase mt-1">{formatCurrency(smsRate, countryData)} per SMS</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xl font-bold tracking-tight text-white">
              {formatCurrency(requiredBalance, countryData)}
            </span>
            <span className={cn("text-[10px] font-bold uppercase mt-1", hasEnoughBalance ? "text-primary" : "text-red-400")}>
              {hasEnoughBalance ? 'Verified' : 'Insufficient Balance'}
            </span>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={broadcast}
          disabled={sending || !hasEnoughBalance || recipientCount === 0}
        >
          {sending ? (
            <>
              <span className="spin-dark" />
              Routing...
            </>
          ) : (
            <>
              Deploy {recipientCount} SMS
              <Send size={18} />
            </>
          )}
        </button>
      </div>

      {/* Broadcast history preview */}
      <div className="label-sm flex items-center gap-2 mt-4 text-textMuted">
        <History size={14} />
        Recent Dispatches
      </div>
      
      {HISTORY.map((h, i) => (
        <div key={i} className="glass-panel p-4 flex flex-col gap-2 opacity-80">
          <div className="flex justify-between items-start">
            <span className="text-[14px] font-bold text-white tracking-tight">{h.title}</span>
            <span className="text-[11px] text-textSecondary">{h.time}</span>
          </div>
          <div className="text-[12px] leading-relaxed text-textSecondary line-clamp-1">{h.preview}</div>
        </div>
      ))}
    </div>
  )
}
