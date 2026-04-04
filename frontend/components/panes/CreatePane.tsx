'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Sparkles, Copy, MessageCircle, ExternalLink, Download, X, ImageIcon, ArrowRight, Send, Users, FileSpreadsheet, Smartphone, Zap } from 'lucide-react'
import { useKua } from '../KuaProvider'
import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'

interface CampaignResult {
  whatsapp: string
  social: string
  ambassador: string
  flyerUrl?: string
}

const TONES = [
  { key: 'warm',   label: 'Warm & Friendly', eg: 'Community focus, helpful' },
  { key: 'urgent', label: 'Urgent Deal',     eg: 'Flash sale, limited stock' },
  { key: 'local',  label: 'Local Slang',     eg: 'Sheng/Vernacular relatable' },
  { key: 'formal', label: 'Professional',    eg: 'Corporate, serious biz' },
] as const

const LANGUAGES = [
  { key: 'en', label: 'English' },
  { key: 'zu', label: 'Zulu' },
  { key: 'sw', label: 'Swahili' },
  { key: 'yo', label: 'Yoruba' },
] as const

type ToneKey = typeof TONES[number]['key']
type LangKey = typeof LANGUAGES[number]['key']

const MOCK: Record<string, string> = {
  whatsapp:   "Hey fam! Fresh stock arrived at the shop. Quality you can trust! WhatsApp 0712345678 to secure your pair now! 👟📉",
  social:     "🔥🔥 NEW ARRIVALS!! Fresh kicks just landed. CRAZY discounts for the next 24 hours. Don't be left out — visit us today! 👟🔥",
  ambassador: "Guys! My friend at the shop has a crazy deal — fresh sneakers just landed. Check it out here: kua.link/amb-thandi-apr 🔥",
}

const RECIPIENT_OPTIONS = [
  { id: 'contacts', label: 'Phone Contacts', count: 0, icon: Smartphone },
  { id: 'csv',      label: 'Upload CSV / Text', count: 0, icon: FileSpreadsheet },
  { id: 'manual',   label: 'Manual Entry', count: 1, icon: Users },
]

export default function CreatePane() {
  const { user, setUser, toast, countryData, syncUser } = useKua()
  
  // ── Studio State ──
  const [input, setInput]               = useState('')
  const [tone, setTone]                 = useState<ToneKey>('warm')
  const [lang, setLang]                 = useState<LangKey>('en')
  const [customBiz, setCustomBiz]       = useState(user.bizName || '')
  const [loading, setLoading]           = useState(false)
  const [result, setResult]             = useState<CampaignResult | null>(null)
  const [injectedImage, setInjectedImage] = useState<string | null>(null)
  const [ocrLoading, setOcrLoading]     = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Broadcast State ──
  const [selectedOpt, setSelectedOpt] = useState(0)
  const [sending, setSending]         = useState(false)
  const [recipients, setRecipients]   = useState<string[]>([])
  const [fileName, setFileName]       = useState('')

  const recipientCount = recipients.length || RECIPIENT_OPTIONS[selectedOpt].count
  const requiredCredits = Math.ceil(recipientCount / 20)
  const hasEnoughCredits = user.credits >= requiredCredits

  // Reactive BizName Sync
  React.useEffect(() => {
    if (!customBiz && user.bizName) setCustomBiz(user.bizName)
  }, [user.bizName])

  // ── Image Injection Logic ──
  function handleInjectImage() {
    fileInputRef.current?.click()
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('Please select an image file (JPG, PNG, WebP)')
      return
    }

    const base64 = await fileToBase64(file)
    setInjectedImage(base64)
    setOcrLoading(true)

    try {
      const token = await (window as any).Clerk?.session?.getToken({ template: 'supabase' })
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/ocr-image`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`
          },
          body: JSON.stringify({ image: base64, filename: file.name }),
        }
      )
      if (res.ok) {
        const data = await res.json()
        const extracted = (data.text || '').trim()
        if (extracted) {
          setInput(prev => (prev ? `${prev} ${extracted}` : extracted).slice(0, 200))
          toast('✅ Text extracted and injected from image!')
        } else {
          toast('Image scanned — no text found. Add details manually.')
        }
      } else {
        fallbackInject(file.name)
      }
    } catch {
      fallbackInject(file.name)
    }

    setOcrLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function fallbackInject(filename: string) {
    const hint = filename
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .slice(0, 80)
    if (hint) setInput(prev => (prev ? `${prev} ${hint}` : hint).slice(0, 200))
    toast('Image attached! Describe your product above for best results.')
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload  = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // ── Generation Logic ──
  async function generate() {
    if (loading) return
    if (user.credits <= 0) {
      toast(`Action Denied: Top up ${formatCurrency(countryData.pricePer10, countryData)} via ${countryData.paymentMethod}`)
      return
    }
    const text = input.trim() || 'New stock of premium sneakers'
    setLoading(true)
    setResult(null)

    try {
      const body: Record<string, unknown> = {
        text,
        phone: user.phone,
        biz_name: customBiz || user.bizName,
        brand_keywords: user.brandKw,
        tone: tone,
        language: lang
      }
      if (injectedImage) body.image = injectedImage

      const token = await (window as any).Clerk?.session?.getToken({ template: 'supabase' })
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/generate-campaign`,
        { 
          method: 'POST', 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`
          }, 
          body: JSON.stringify(body) 
        }
      )

      if (res.ok) {
        const data = await res.json()
        // If backend doesn't return the unified categories yet, we map from the old tones temporarily
        setResult({
          whatsapp: data.whatsapp || data.sheng || data.sms || data.hype || MOCK.whatsapp,
          social: data.social || data.hype || data.professional || MOCK.social,
          ambassador: data.ambassador || data.sheng || MOCK.ambassador,
          flyerUrl: data.flyerUrl
        })
        if (data.credits_remaining !== undefined) setUser({ credits: data.credits_remaining })
      } else if (res.status === 403) {
        toast(`Action Denied: Top up ${formatCurrency(countryData.pricePer10, countryData)} for AI Credits`)
        setLoading(false)
        return
      } else {
        setResult({ ...MOCK, flyerUrl: undefined } as any)
      }
    } catch {
      setResult({ ...MOCK, flyerUrl: undefined } as any)
    }

    setLoading(false)
    toast('✨ Synthesis Complete.')
  }

  // ── Audience / Broadcast Logic ──
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
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isIOS) {
        toast("💡 iOS Tip: Please use 'Manual Entry' or 'Upload CSV' as Safari doesn't support phonebook access yet.")
        setSelectedOpt(2)
      } else {
        toast("Contact picker not supported on this device.")
      }
      return
    }
    try {
      const props = ['tel']
      if ((navigator as any).contacts.getProperties) {
         const supported = await (navigator as any).contacts.getProperties()
         if (supported.includes('name')) props.push('name')
      }
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
    if (!hasEnoughCredits) {
      toast(`Insufficient credits. You need ${requiredCredits} Credits for this broadcast.`)
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
          recipients: recipients.length ? recipients : ['+254712345678'],
          message: activeText
        })
      })

      if (res.ok) {
        toast(`✅ Success! ${recipientCount} messages dispatched.`)
        await syncUser({})
        setResult(null)
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

  function shareWA(text: string) {
    window.open('whatsapp://send?text=' + encodeURIComponent(text), '_blank')
  }

  const activeText = result ? result.whatsapp : ''

  function copyText(text: string) {
    navigator.clipboard?.writeText(text).catch(() => {})
    toast('Copied to clipboard')
  }

  function copyLink() {
    navigator.clipboard?.writeText(`https://kua.link/amb-${(user.bizName || 'shop').toLowerCase().replace(/\s/g,'-')}`).catch(() => {})
    toast('Ambassador link copied!')
  }

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in relative z-10">

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelected}
      />

      <div className="heading-sec mb-[-4px]">Campaign Creator</div>

      {/* ── IDEATION PHASE ── */}
      <div className={cn("transition-all duration-500", result && "opacity-40 select-none pointer-events-none")}>
        <div className="flex flex-col gap-2">
          <label className="label-sm">Subject Material</label>
          <div className="glass-panel p-4 pb-3 flex flex-col gap-3 group focus-within:border-primary/40 transition-colors">
            <textarea
              className="w-full bg-transparent border-none outline-none text-[15px] text-white resize-none leading-relaxed placeholder:text-textMuted"
              rows={3}
              placeholder="e.g. New stock of premium sneakers. Giving a 20% discount today!"
              value={input}
              onChange={e => setInput(e.target.value.slice(0, 200))}
            />

            {/* Injected image preview strip */}
            <AnimatePresence>
              {injectedImage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-primary/20"
                >
                  <div className="relative w-12 h-12 rounded-md overflow-hidden border border-white/10 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={injectedImage} alt="Injected product" className="w-full h-full object-cover" />
                    {ocrLoading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-primary uppercase tracking-widest">
                      {ocrLoading ? 'Scanning image…' : 'Image attached'}
                    </p>
                    <p className="text-[10px] text-textMuted mt-0.5">
                      {ocrLoading ? 'Extracting text via OCR' : 'Will be used in generation below'}
                    </p>
                  </div>
                  <button
                    onClick={() => setInjectedImage(null)}
                    className="shrink-0 p-1 rounded-md hover:bg-white/10 text-textMuted hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between items-center pt-3 border-t border-white/5">
              <button
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[11px] font-bold uppercase tracking-wider',
                  ocrLoading
                    ? 'bg-secondary/5 text-secondary/50 border-secondary/10 cursor-wait'
                    : 'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 hover:shadow-[0_0_12px_rgba(255,107,0,0.2)]'
                )}
                onClick={handleInjectImage}
                disabled={ocrLoading}
              >
                {ocrLoading ? <span className="w-3.5 h-3.5 border-2 border-secondary border-t-transparent rounded-full animate-spin" /> : <Camera size={14} />}
                {ocrLoading ? 'Scanning…' : 'Inject Image'}
              </button>
              <span className={cn('text-[11px] font-bold tracking-widest', input.length > 180 ? 'text-secondary' : 'text-textMuted')}>
                {injectedImage && <ImageIcon size={10} className="inline mr-1 text-primary" />}
                {input.length}/200
              </span>
            </div>
          </div>
        </div>

        {/* ── Biz Name Override ── */}
        <div className="flex flex-col gap-2 mt-4">
          <label className="label-sm">Business Name</label>
          <input
            className="w-full bg-[#141E24] border border-white/5 rounded-xl p-3.5 text-[14px] text-white outline-none focus:border-primary/40 transition-colors"
            placeholder="e.g. Mama Zara's Fresh Produce"
            value={customBiz}
            onChange={e => setCustomBiz(e.target.value)}
          />
        </div>

        {/* ── Language Selector ── */}
        <div className="flex flex-col gap-2 mt-4">
          <label className="label-sm">Output Language</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(l => (
              <button
                key={l.key}
                onClick={() => setLang(l.key)}
                className={cn(
                  "px-4 py-2 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all",
                  lang === l.key ? "bg-primary text-background border-primary" : "bg-white/5 border-white/10 text-textMuted"
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tone Matrix ── */}
        <div className="flex flex-col gap-2 mt-4">
          <label className="label-sm">Semantic Calibration</label>
          <div className="grid grid-cols-2 gap-3">
            {TONES.map(t => {
              const active = tone === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => setTone(t.key)}
                  className={cn(
                    'p-3 rounded-xl border text-left flex flex-col gap-1 transition-all',
                    active ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(0,255,163,0.1)]' : 'bg-[#141E24] border-white/5 hover:border-white/10'
                  )}
                >
                  <div className={cn('text-[13px] font-bold tracking-tight', active ? 'text-primary' : 'text-white')}>{t.label}</div>
                  <div className="text-[10px] text-textMuted leading-tight">{t.eg}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Generate ── */}
        <div className="flex flex-col gap-2 mt-5">
          <button 
            className={cn("btn-primary relative overflow-hidden group", user.credits <= 0 && "bg-secondary text-white shadow-[0_4px_20px_rgba(255,107,0,0.3)]")} 
            onClick={generate} 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <span className="spin-dark border-t-background" />
                <span className="tracking-wide">Synthesizing DNA...</span>
              </div>
            ) : user.credits <= 0 ? (
              <div className="flex items-center gap-2">Top Up for Credits <ArrowRight size={18} /></div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="relative z-10">Initiate Synthesis</span>
                <Sparkles size={18} className="relative z-10" />
              </div>
            )}
            
            {!loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-black/20 text-[10px] font-black tracking-widest uppercase border border-white/10">
                {user.credits > 0 ? "1 Credit" : formatCurrency(countryData.pricePer10, countryData)}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* ── SYNTHESIS RESULTS & BROADCAST PIPELINE ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-2" />

            {/* Generated Outputs - UNIFIED CHANNEL VIEW */}
            <div>
              <div className="heading-sec !text-[16px] mb-4">Your campaign — ready to go</div>

              {/* 1. WhatsApp / SMS */}
              <div className="flex flex-col gap-2 mb-6">
                <label className="label-sm flex items-center justify-between">
                  <span>WhatsApp / SMS Channel</span>
                  <span className="text-[9px] font-bold text-primary tracking-widest">DIRECT</span>
                </label>
                <div className="glass-panel p-4 bg-primary/[0.03] border-primary/20">
                  <div className="text-[14px] leading-relaxed text-white mb-4">{result.whatsapp}</div>
                  <div className="flex gap-2">
                    <button onClick={() => shareWA(result.whatsapp)} className="btn-secondary !py-2 !text-[11px] flex-1 gap-2"><MessageCircle size={14} /> Send WA</button>
                    <button onClick={() => copyText(result.whatsapp)} className="btn-secondary !py-2 !text-[11px] flex-1 gap-2"><Copy size={14} /> Copy</button>
                  </div>
                </div>
              </div>

              {/* 2. Social / Ads */}
              <div className="flex flex-col gap-2 mb-6">
                <label className="label-sm flex items-center justify-between">
                  <span>Facebook / Instagram Caption</span>
                  <span className="text-[9px] font-bold text-kAmberDark tracking-widest">SOCIAL</span>
                </label>
                <div className="glass-panel p-4 bg-kAmber/5 border-kAmber/20">
                  <div className="text-[14px] leading-relaxed text-white mb-4">{result.social}</div>
                  <button onClick={() => copyText(result.social)} className="btn-secondary !py-2 !text-[11px] w-full gap-2"><Copy size={14} /> Copy Caption</button>
                </div>
              </div>

              {/* 3. Ambassador Forward */}
              <div className="flex flex-col gap-2 mb-6">
                <label className="label-sm flex items-center justify-between">
                  <span>Ambassador Personalised (Thandi)</span>
                  <span className="text-[9px] font-bold text-kPurple tracking-widest">NETWORK</span>
                </label>
                <div className="glass-panel p-4 bg-kPurple/5 border-kPurple/20">
                  <div className="text-[14px] leading-relaxed text-white mb-4 italic opacity-80">{result.ambassador}</div>
                  
                  {/* Link Box */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/10 mb-4">
                    <span className="text-[11px] font-bold text-primary truncate">kua.link/amb-{(user.bizName || 'shop').toLowerCase().replace(/\s/g,'-')}</span>
                    <button onClick={copyLink} className="text-[10px] font-bold text-white bg-white/10 px-3 py-1 rounded-md hover:bg-white/20 transition-all uppercase tracking-widest shrink-0">Copy Link</button>
                  </div>

                  <button onClick={() => shareWA(result.ambassador)} className="btn-secondary !py-2 !text-[11px] w-full border-kPurple/30 text-kPurple gap-2 hover:bg-kPurple/10 focus:ring-kPurple/30 transition-all"><MessageCircle size={14} /> Send to Ambassadors</button>
                </div>
              </div>
            </div>

            {/* Flyer generation display */}
            <div className="glass-panel p-2">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#0A1013] border border-white/5 flex flex-col items-center justify-center">
                {result.flyerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={result.flyerUrl} alt="Campaign Flyer" className="absolute inset-0 w-full h-full object-cover z-20" />
                ) : injectedImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={injectedImage} alt="Product" className="absolute inset-0 w-full h-full object-cover z-10 opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-20" />
                    <div className="relative z-30 flex flex-col items-center gap-3 text-center px-6">
                      <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter" style={{ fontFamily: 'var(--font-pj)' }}>
                        {input.split(' ').slice(0, 3).join(' ') || 'NEW URBAN DRIP'}
                      </h3>
                      <div className="px-4 py-1.5 bg-secondary/20 text-secondary border border-secondary/30 rounded-full font-bold text-[10px] tracking-widest uppercase">
                        SALE TRIGGER
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
                    <div className="absolute inset-x-0 h-[2px] bg-primary/20 top-1/4 animate-pulse" />
                    <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
                      <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center bg-primary/5">
                        <Sparkles size={20} className="text-primary" />
                      </div>
                      <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter" style={{ fontFamily: 'var(--font-pj)' }}>
                        {input.split(' ').slice(0, 3).join(' ') || 'NEW URBAN DRIP'}
                      </h3>
                      <div className="px-4 py-1.5 bg-secondary/20 text-secondary border border-secondary/30 rounded-full font-bold text-[10px] tracking-widest uppercase">
                        SALE TRIGGER
                      </div>
                    </div>
                  </>
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 z-30">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Imagen 3</span>
                </div>
              </div>

              <div className="flex gap-2 p-2">
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 text-white font-bold text-[11px] uppercase tracking-wider hover:bg-white/10 transition-colors"
                  onClick={() => toast('Flyer cached to clipboard')}
                >
                  <ExternalLink size={14} /> Share
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 text-white font-bold text-[11px] uppercase tracking-wider hover:bg-white/10 transition-colors"
                  onClick={() => toast('WebP compressed asset downloading')}
                >
                  <Download size={14} /> Save
                </button>
              </div>
            </div>

            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mt-4 mb-2" />

            {/* ── TARGETING & DEPLOYMENT ── */}
            <div>
              <label className="label-sm mb-3">Audience Targeting</label>
              
              <div className="flex items-center gap-3 mb-4 bg-primary/5 p-3 rounded-xl border border-primary/10">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                  <Zap size={18} className="text-primary fill-primary/20" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-white mb-0.5">Africa's Talking Engine</div>
                  <div className="text-[11px] font-medium text-textSecondary tracking-wide uppercase">Deploying active semantic output above via SMS</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                {RECIPIENT_OPTIONS.map((opt, i) => {
                  const active = selectedOpt === i
                  const Icon = opt.icon
                  return (
                    <div key={i} className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setSelectedOpt(i)
                          if (opt.id === 'manual') setRecipients([])
                        }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border transition-all text-left w-full",
                          active ? "bg-primary/10 border-primary/30" : "bg-card border-white/5 hover:border-white/10"
                        )}
                      >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", active ? "bg-primary text-background" : "bg-white/5 text-textMuted")}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1">
                          <div className={cn("text-[13px] font-bold mb-0.5", active ? "text-primary" : "text-white")}>{opt.label}</div>
                          <div className="text-[11px] text-textMuted">{active && recipients.length > 0 ? `${recipients.length} selected` : 'Choose source'}</div>
                        </div>
                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors", active ? "border-primary" : "border-white/20")}>
                          {active && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                      </button>

                      {active && opt.id === 'contacts' && (
                         <button onClick={pickContacts} className="mx-3 mb-2 py-2 px-3 rounded-lg bg-white/5 text-[12px] font-bold text-primary flex items-center justify-center gap-2 border border-white/5 hover:bg-white/10 transition-colors">
                           Pick from Phonebook
                         </button>
                      )}

                      {active && opt.id === 'csv' && (
                        <div className="mx-3 mb-2">
                          <label className="py-2.5 px-3 rounded-lg bg-white/5 text-[12px] font-bold text-center flex items-center justify-center gap-2 border border-dashed border-white/20 cursor-pointer hover:bg-white/10 transition-colors">
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

              <button
                className="btn-primary"
                onClick={broadcast}
                disabled={sending || !hasEnoughCredits || recipientCount === 0}
              >
                {sending ? (
                  <><span className="spin-dark inline-block" /> Dispatching SMS...</>
                ) : (
                  <>Deploy {recipientCount} SMS <Send size={18} /></>
                )}
              </button>
            </div>
            <div className="pb-10" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
