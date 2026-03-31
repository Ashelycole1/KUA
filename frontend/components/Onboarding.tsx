'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, MessageSquare, CheckCircle, Store, Zap, ChevronLeft, CreditCard } from 'lucide-react'
import { useKua } from './KuaProvider'
import { COUNTRIES, formatCurrency, getCountryByPrefix } from '@/lib/currency'

type ObStep = 1 | 2 | 3

interface OnboardProps {
  onComplete: () => void
}

function ProgressBar({ step }: { step: ObStep }) {
  return (
    <div className="flex gap-2 flex-1 max-w-[150px] mx-auto">
      {[1, 2, 3].map(n => (
        <div
          key={n}
          className="flex-1 h-1.5 rounded-full transition-all duration-500 overflow-hidden bg-white/10"
        >
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: n <= step ? '100%' : '0%' }}
            transition={{ duration: 0.4 }}
          />
        </div>
      ))}
    </div>
  )
}

export default function Onboarding({ onComplete }: OnboardProps) {
  const { user, setUser, toast } = useKua()
  const [step, setStep]   = useState<ObStep>(1)
  const [name, setName]   = useState('')
  const [type, setType]   = useState('')
  const [phone, setPhone] = useState('')
  const [chatMsg, setChatMsg] = useState('')
  const [aiReply, setAiReply] = useState('')
  const [paying, setPaying]   = useState(false)
  const [prefix, setPrefix]   = useState(COUNTRIES[0].prefix)

  const activeCountry = getCountryByPrefix(prefix)

  function back() { if (step > 1) setStep((step - 1) as ObStep) }

  function goOb2() {
    const bName = name.trim() || 'Mama Wanjiku Vegetables'
    setUser({ bizName: bName, bizType: type.trim(), phone: `${prefix}${phone.trim()}`, countryCode: activeCountry.code })
    setStep(2)
  }

  function goOb3() { setStep(3) }

  function sendAiChat() {
    if (!chatMsg.trim()) return
    setChatMsg('')
    setTimeout(() => {
      setAiReply("Great! I've noted that. Your Business DNA is being built — sounds like a trusted, local brand with great prices. Tap Continue to review your profile.")
    }, 900)
  }

  async function syncUserAuth(addCredits = 0) {
    try {
      const fullPhone = `${prefix}${phone.trim()}`
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, currency_code: activeCountry.code })
      })
      const data = await res.json()
      // If Momoflow succeeded, we force 10 local credits as default since backend might not be hooked up.
      setUser({ credits: addCredits > 0 ? addCredits : data.credit_balance })
    } catch {
      // Offline fallback
      setUser({ credits: addCredits > 0 ? addCredits : 3 })
    }
  }

  async function momoFlow() {
    setPaying(true)
    toast(`Payment prompt sent to ${prefix}${phone.trim() || 'your number'}…`)
    await new Promise(r => setTimeout(r, 2500))
    await syncUserAuth(10)
    setUser({ balance: 0 })
    toast(`✅ Payment confirmed! 10 credits added via ${activeCountry.paymentMethod}.`)
    await new Promise(r => setTimeout(r, 600))
    onComplete()
  }

  const HeaderBar = () => (
    <div className="flex items-center px-6 pt-6 pb-2">
      <button
        onClick={back}
        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${step === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-white/5 border border-white/10'}`}
      >
        <ChevronLeft className="text-textSecondary" size={20} />
      </button>
      <ProgressBar step={step} />
      <div className="w-10 h-10" /> {/* Spacer */}
    </div>
  )

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  return (
    <div className="flex-1 flex flex-col items-center relative overflow-hidden bg-background w-full min-h-screen">
      {/* Dynamic blurred background accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[30vw] h-[30vw] min-w-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md flex flex-col h-full flex-1">
        <HeaderBar />

        <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex-1 flex flex-col px-6 pt-6 pb-8 h-full"
        >

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-primary/10 border border-primary/20">
                <Store className="text-primary" size={28} />
              </div>

              <h2 className="heading-2 mb-2">Tell us about your business</h2>
              <p className="text-[14px] text-textSecondary leading-relaxed mb-8">
                We'll build your Business DNA so every campaign sounds exactly like you.
              </p>

              <div className="glass-panel p-5 mb-8 flex flex-col gap-5">
                <div>
                  <label className="label-sm">Business name</label>
                  <input className="inp" placeholder="e.g. Joy's Electronics" value={name} onChange={e => setName(e.target.value)} />
                </div>
                
                <div>
                  <label className="label-sm">What do you sell?</label>
                  <input className="inp" placeholder="Phones, accessories, repairs…" value={type} onChange={e => setType(e.target.value)} />
                </div>

                <div>
                  <label className="label-sm">WhatsApp Number</label>
                  <div className="flex gap-2">
                    <select 
                      className="inp w-[110px] flex-none px-2"
                      value={prefix} 
                      onChange={e => setPrefix(e.target.value)}
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.prefix} className="bg-card text-white">
                          {c.code} {c.prefix}
                        </option>
                      ))}
                    </select>
                    <input className="inp" type="tel" placeholder="7XX XXX XXX" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* AI Chat option */}
              <div className="flex items-center gap-3 mb-5 px-2">
                <div className="h-[1px] flex-1 bg-border" />
                <span className="text-[11px] font-bold tracking-widest uppercase text-textMuted text-center">or chat with AI</span>
                <div className="h-[1px] flex-1 bg-border" />
              </div>

              <div className="bg-[#1A2327] rounded-2xl rounded-tl-sm p-4 text-[13px] text-textPrimary leading-relaxed mb-3">
                Hi! Just talk to me naturally about your business. What do you sell, and what makes you special?
              </div>

              {aiReply && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tr-sm p-4 text-[13px] text-primary leading-relaxed mb-3 ml-6"
                >
                  {aiReply}
                </motion.div>
              )}

              <div className="flex gap-2 mb-6">
                <input
                  className="inp flex-1"
                  placeholder="Type anything here…"
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendAiChat()}
                />
                <button
                  onClick={sendAiChat}
                  className="w-12 h-[50px] flex items-center justify-center rounded-kuasm flex-shrink-0 bg-primary/10 text-primary border border-primary/20 transition-all hover:bg-primary hover:text-black"
                >
                  <MessageSquare size={18} />
                </button>
              </div>

              <button className="btn-primary mt-auto" onClick={goOb2}>
                Build my DNA
                <ArrowRight size={18} />
              </button>
            </div>
          )}


          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white/5 border border-white/10">
                <Zap className="text-white fill-white/20" size={28} />
              </div>

              <h2 className="heading-2 mb-2">Your Business DNA</h2>
              <p className="text-[14px] text-textSecondary leading-relaxed mb-6">
                Our AI analysed your info and built a brand profile. This guarantees your campaigns sound authentic.
              </p>

              <div className="glass-panel p-5 mb-6 flex flex-col gap-4">
                {[
                  { k: 'Business',  v: user.bizName || 'Mama Wanjiku Vegetables' },
                  { k: 'Category',  v: user.bizType || 'Fresh produce · Retail' },
                  { k: 'Tone',      v: 'Warm, community, trusted' },
                  { k: 'Audience',  v: 'Families, daily shoppers' },
                ].map((row, i, arr) => (
                  <div key={row.k} className="flex justify-between items-start text-[14px]">
                    <span className="text-textMuted font-medium w-1/3">{row.k}</span>
                    <span className="text-textPrimary font-semibold text-right w-2/3">{row.v}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="label-sm">Brand Keywords (Edit freely)</label>
                <input
                  className="inp"
                  value={user.brandKw}
                  onChange={e => setUser({ brandKw: e.target.value })}
                />
              </div>

              <button className="btn-primary mt-auto" onClick={goOb3}>
                Activate DNA
                <CheckCircle size={18} />
              </button>
            </div>
          )}


          {/* ── Step 3 ── */}
          {step === 3 && (
            <div className="flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-secondary/10 border border-secondary/20">
                <CreditCard className="text-secondary" size={28} />
              </div>

              <h2 className="heading-2 mb-2">Fund your workbench</h2>
              <p className="text-[14px] text-textSecondary leading-relaxed mb-6">
                Micro-utility pricing. No subscriptions. {formatCurrency(activeCountry.pricePer10, activeCountry)} gives you 10 AI campaign generations.
              </p>

              <div className="bg-[#141E24] rounded-2xl p-5 mb-8 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-2xl rounded-full" />
                
                <div className="text-[12px] font-bold uppercase tracking-widest text-textMuted mb-2">
                  {activeCountry.paymentMethod} Trigger
                </div>
                <div className="text-2xl font-bold tracking-tight text-white mb-6">
                  {user.phone || `${prefix} 7XX XXX XXX`}
                </div>
                
                <div className="h-[1px] w-full bg-border mb-4" />
                
                <div className="flex justify-between items-center text-[14px] mb-3">
                  <span className="text-textSecondary">Deposit</span>
                  <span className="text-white font-semibold">{formatCurrency(activeCountry.pricePer10, activeCountry)}</span>
                </div>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-textSecondary">You receive</span>
                  <span className="text-primary font-bold">+10 AI Credits</span>
                </div>
              </div>

              <button
                className="btn-primary mb-5"
                onClick={momoFlow}
                disabled={paying}
                style={paying ? { background: '#1A2327', color: 'white' } : {}}
              >
                {paying ? (
                  <>
                    <span className="spin-light" />
                    Waiting for {activeCountry.paymentMethod}
                  </>
                ) : (
                  <>
                    Pay {formatCurrency(activeCountry.pricePer10, activeCountry)}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                className="btn-secondary border-none bg-transparent hover:bg-white/5 disabled:opacity-50"
                disabled={paying}
                onClick={async () => {
                  setPaying(true)
                  await syncUserAuth(3)
                  onComplete()
                }}
              >
                Skip — start with 3 free credits
              </button>
            </div>
          )}

        </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
