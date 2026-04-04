'use client'

import React, { useState } from 'react'

const waTemplates: Record<string, (b: string, p: string) => string> = {
  warm: (b,p) => `Hey fam! ${b} has something special for you this weekend — ${p}. Come early and tell your neighbours! We always look after our community 🙌`,
  urgent: (b,p) => `QUICK! ${b} — ${p}. Stock is LIMITED and going FAST 🔥 Don't wait!`,
  local: (b,p) => `Eish guys! ${b} is killing it — ${p}. Yho, straight fire neh! Tag your neighbour 👊`,
  formal: (b,p) => `Dear valued customers. ${b} would like to inform you of a current offer: ${p}. We appreciate your continued support.`
}

const fbTemplates: Record<string, (b: string, p: string) => string> = {
  warm: (b,p) => `Fresh from ${b}! 🌿 ${p} — quality you can taste, prices that make sense. Share this with your community and come see us!`,
  urgent: (b,p) => `🚨 LIMITED TIME at ${b}! ${p} — once it's gone, it's gone. DM us or visit today!`,
  local: (b,p) => `Weekend vibes = ${b} vibes 🎉 ${p}. Your cooking will thank you! Tag someone who needs to see this 👇`,
  formal: (b,p) => `${b} is pleased to offer: ${p}. Visit us or place your order in advance for guaranteed stock.`
}

const ambTemplates: Record<string, (b: string, p: string, n?: string) => string> = {
  warm: (b,p,n) => `Hey everyone! Just want to share something from my friend at ${b} — ${p}. I've been buying from them for ages and honestly they never disappoint. Check it out 👉 kua.link/amb-${(n||'thandi').toLowerCase().replace(/\\s/g,'-')}-apr`,
  urgent: (b,p,n) => `GUYS! My friend at ${b} has a deal on right now — ${p}. Stock is running out! Check it here 🔥 kua.link/amb-${(n||'thandi').toLowerCase().replace(/\\s/g,'-')}-apr`,
  local: (b,p,n) => `Eish! My people at ${b} — ${p}. Yhooo don't sleep on this one neh 👊 kua.link/amb-${(n||'thandi').toLowerCase().replace(/\\s/g,'-')}-apr`,
  formal: (b,p,n) => `Good day. I am sharing this on behalf of ${b}: ${p}. More info here: kua.link/amb-${(n||'thandi').toLowerCase().replace(/\\s/g,'-')}-apr`
}

export default function CreatePane({ onTabChange }: { onTabChange: (tab: any) => void }) {
  const [promoText, setPromoText] = useState('')
  const [bizName, setBizName] = useState('')
  const [tone, setTone] = useState('warm')
  const [lang, setLang] = useState('en')
  
  const [generated, setGenerated] = useState(false)
  const [waOut, setWaOut] = useState('')
  const [fbOut, setFbOut] = useState('')
  const [ambOut, setAmbOut] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)

  const generateAll = () => {
    const p = promoText.trim() || 'fresh spinach R15/bunch this weekend only'
    const b = bizName.trim() || "Mama Zara's Fresh Produce"
    
    setWaOut((waTemplates[tone] || waTemplates.warm)(b, p))
    setFbOut((fbTemplates[tone] || fbTemplates.warm)(b, p))
    setAmbOut((ambTemplates[tone] || ambTemplates.warm)(b, p, 'Thandi'))
    
    setGenerated(true)
  }

  const resetAll = () => {
    setGenerated(false)
    setPromoText('')
    setBizName('')
  }
  
  const copyLink = () => {
    navigator.clipboard.writeText('https://kua.link/amb-thandi-apr').catch(()=>{})
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 1500)
  }

  return (
    <div className="animate-fade-in pb-8">
      <div className="heading-sec mb-1.5">Create a new campaign</div>
      <div className="sub-text">Write once — KUA automatically formats it for every channel and your ambassador network.</div>

      <div className="card">
        <label className="text-[12px] text-mu mb-1.5 block">What are you promoting?</label>
        <textarea 
          className="inp resize-none" 
          rows={3} 
          placeholder="e.g. Fresh spinach this weekend — R15/bunch, straight from the farm. Come early, stock runs out fast!"
          value={promoText}
          onChange={(e) => setPromoText(e.target.value)}
        />
        
        <label className="text-[12px] text-mu mb-1.5 block mt-1">Business name / your name</label>
        <input 
          className="inp" 
          placeholder="e.g. Mama Zara's Fresh Produce" 
          value={bizName}
          onChange={(e) => setBizName(e.target.value)}
        />
        
        <label className="text-[12px] text-mu mb-1.5 block mt-1">Tone</label>
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {[
            { id: 'warm', label: 'Warm & friendly' },
            { id: 'urgent', label: 'Urgent deal' },
            { id: 'local', label: 'Local slang' },
            { id: 'formal', label: 'Professional' }
          ].map(t => (
            <span 
              key={t.id} 
              className={`pill ${tone === t.id ? 'on' : ''}`}
              onClick={() => setTone(t.id)}
            >
              {t.label}
            </span>
          ))}
        </div>
        
        <label className="text-[12px] text-mu mb-1.5 block mt-1">Language</label>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {[
            { id: 'en', label: 'English' },
            { id: 'zu', label: 'Zulu' },
            { id: 'sw', label: 'Swahili' },
            { id: 'yo', label: 'Yoruba' }
          ].map(l => (
            <span 
              key={l.id} 
              className={`pill ${lang === l.id ? 'on' : ''}`}
              onClick={() => setLang(l.id)}
            >
              {l.label}
            </span>
          ))}
        </div>
        
        <button className="btn btn-pr btn-fl" onClick={generateAll}>
          Generate all versions at once
        </button>
      </div>

      {generated && (
        <div className="animate-fade-in mt-6">
          <div className="heading-sec mb-4">Your campaign — ready to go</div>

          <label className="text-[12px] text-mu mb-1.5 block">WhatsApp / SMS version</label>
          <div className="bg-kGreenLight border border-[#9FE1CB] rounded-tl-none rounded-tr-kualg rounded-b-kualg p-3.5 text-[13px] leading-relaxed text-kGreenDark mb-4">
            {waOut}
          </div>

          <label className="text-[12px] text-mu mb-1.5 block">Facebook / Instagram caption</label>
          <div className="bg-kPurpleLight border border-[#AFA9EC] rounded-kualg p-3.5 text-[13px] leading-relaxed text-kPurpleDark mb-4">
            {fbOut}
          </div>

          <label className="text-[12px] text-mu mb-1.5 block">Ambassador forwarding message (personalised for Thandi)</label>
          <div className="bg-kAmberLight border border-[#FAC775] rounded-tr-none rounded-tl-kualg rounded-b-kualg p-3.5 text-[13px] leading-relaxed text-kAmberDark mb-2">
            {ambOut}
          </div>
          
          <div className="bg-su border border-br rounded-kuasm px-3 py-2 text-[12px] text-mu flex items-center justify-between mb-4">
            <span className="text-kGreen font-medium">kua.link/amb-thandi-apr</span>
            <button className="btn btn-gh btn-sm" onClick={copyLink}>
              {copiedLink ? 'Copied!' : 'Copy link'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            <button className="btn btn-pr btn-sm" onClick={() => onTabChange('schedule')}>Schedule posts</button>
            <button className="btn btn-am btn-sm" onClick={() => onTabChange('ambassadors')}>Send to ambassadors</button>
            <button className="btn btn-gh btn-sm" onClick={resetAll}>Start over</button>
          </div>
        </div>
      )}
    </div>
  )
}
