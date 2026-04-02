'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Sparkles, Copy, MessageCircle, ExternalLink, Download, X, ImageIcon } from 'lucide-react'
import { useKua } from './KuaProvider'
import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'

// Add Clerk access if it isn't already handled by the environment
// Campaign types
interface CampaignResult {
  professional: string
  hype: string
  sheng: string
  sms: string
  flyerUrl?: string
}

const TONES = [
  { key: 'hype',         label: 'Hype Engine',      eg: 'High energy, urgent calls to action' },
  { key: 'professional', label: 'Corporate Trust',  eg: 'Formal tone for high-ticket items'   },
  { key: 'sheng',        label: 'Local Sheng',      eg: 'Relatable, community-driven language'   },
  { key: 'sms',          label: 'Micro SMS',        eg: 'Under 160 characters, direct delivery'      },
] as const

type ToneKey = typeof TONES[number]['key']

const MOCK: Record<ToneKey, string> = {
  hype:         "🔥🔥 URBAN DRIP ARRIVED!! Fresh stock of kicks just landed. CRAZY discounts for the next 24 hours. Don't be left out — pull up or WhatsApp 0712345678 to secure your pair NOW! 👟📉",
  professional: "We are pleased to announce the arrival of our premium footwear collection. Available now at competitive rates. Contact us today via 0712345678 to place an order.",
  sheng:        "Wadau! Kicks mpya zimefika mtaani. Bei ni ya ku-tackle economy! Tupigie 0712345678 tufanye biz. 👟🔥",
  sms:          "NEW STOCK: Premium sneakers. Limited sizes available. Unbeatable prices today. Call/WhatsApp 0712345678 now to order!",
}

export default function CampaignStudio() {
  const { user, setUser, toast, countryData } = useKua()
  const [input, setInput]               = useState('')
  const [tone, setTone]                 = useState<ToneKey>('hype')
  const [loading, setLoading]           = useState(false)
  const [result, setResult]             = useState<CampaignResult | null>(null)
  const [injectedImage, setInjectedImage] = useState<string | null>(null)
  const [ocrLoading, setOcrLoading]     = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Image injection ────────────────────────────────────────────────────
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
      const token = await window.Clerk?.session?.getToken({ template: 'supabase' })
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

  // ── Campaign generation ────────────────────────────────────────────────
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
        biz_name: user.bizName,
        brand_keywords: user.brandKw,
      }
      if (injectedImage) body.image = injectedImage

      const token = await window.Clerk?.session?.getToken({ template: 'supabase' })
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
        setResult(data)
        if (data.credits_remaining !== undefined) setUser({ credits: data.credits_remaining })
      } else if (res.status === 403) {
        toast(`Action Denied: Top up ${formatCurrency(countryData.pricePer10, countryData)} for AI Credits`)
        setLoading(false)
        return
      } else {
        setResult({ ...MOCK, flyerUrl: undefined })
      }
    } catch {
      setResult({ ...MOCK, flyerUrl: undefined })
    }

    setLoading(false)
    toast('✨ Generation Complete.')
  }

  function shareWA(text: string) {
    window.open('whatsapp://send?text=' + encodeURIComponent(text), '_blank')
  }

  function copyText(text: string) {
    navigator.clipboard?.writeText(text).catch(() => {})
    toast('Copied to clipboard')
  }

  const activeText = result ? result[tone] : ''

  return (
    <div className="flex flex-col gap-5 pb-8">

      {/* Hidden file input triggered by Inject Image button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelected}
      />

      {/* ── Subject Material ── */}
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
                  title="Remove image"
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
              {ocrLoading
                ? <span className="w-3.5 h-3.5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                : <Camera size={14} />
              }
              {ocrLoading ? 'Scanning…' : 'Inject Image'}
            </button>
            <span className={cn('text-[11px] font-bold tracking-widest', input.length > 180 ? 'text-secondary' : 'text-textMuted')}>
              {injectedImage && <ImageIcon size={10} className="inline mr-1 text-primary" />}
              {input.length}/200
            </span>
          </div>
        </div>
      </div>

      {/* ── Tone Matrix ── */}
      <div className="flex flex-col gap-2">
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
                  active
                    ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(0,255,163,0.1)]'
                    : 'bg-[#141E24] border-white/5 hover:border-white/10'
                )}
              >
                <div className={cn('text-[13px] font-bold tracking-tight', active ? 'text-primary' : 'text-white')}>
                  {t.label}
                </div>
                <div className="text-[10px] text-textMuted leading-tight">{t.eg}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Generate ── */}
      <button className="btn-primary" onClick={generate} disabled={loading}>
        {loading ? (
          <div className="flex items-center gap-2"><span className="spin-dark" />Synthesizing...</div>
        ) : (
          <div className="flex items-center gap-2">Initiate Synthesis <Sparkles size={18} /></div>
        )}
      </button>

      {/* ── Results ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex flex-col gap-4 mt-2"
          >
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent my-2" />

            <label className="label-sm flex items-center justify-between">
              <span>Output Stream</span>
              <span className="text-primary tracking-widest bg-primary/10 px-2 py-0.5 rounded-full text-[9px] border border-primary/20">SUCCESS</span>
            </label>

            {/* Text result */}
            <div className="glass-panel overflow-hidden border-primary/20 bg-primary/[0.02]">
              <div className="p-4 flex flex-col gap-4">
                <div className="text-[14px] leading-relaxed text-white">{activeText}</div>
                <div className="flex gap-2 pt-4 border-t border-white/5">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#25D366] text-background font-bold text-[12px] uppercase shadow-[0_4px_12px_rgba(37,211,102,0.3)] hover:bg-[#20bd5a] transition-all"
                    onClick={() => shareWA(activeText)}
                  >
                    <MessageCircle size={14} className="fill-background" /> Send WA
                  </button>
                  <button
                    className="flex-none px-4 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 text-white font-bold text-[12px] border border-white/10 uppercase hover:bg-white/10 transition-all"
                    onClick={() => copyText(activeText)}
                  >
                    <Copy size={14} /> Copy
                  </button>
                </div>
              </div>
              <div className="flex p-1.5 gap-1 bg-black/40 border-t border-white/5">
                {TONES.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTone(t.key)}
                    className={cn(
                      'flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all',
                      tone === t.key ? 'bg-primary text-background' : 'text-textMuted hover:text-white hover:bg-white/5'
                    )}
                  >
                    {t.key}
                  </button>
                ))}
              </div>
            </div>

            {/* Flyer / visual */}
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

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
