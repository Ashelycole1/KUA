'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useKua } from './KuaProvider'

export default function SplashPage({ onEnter, onLogin }: { onEnter: () => void, onLogin: () => void }) {
  const { setUser, toast } = useKua()
  const [loading, setLoading] = useState(false)
  const tags = [
    { label: 'Business DNA', active: true },
    { label: 'Bulk SMS', active: false },
    { label: 'AI WebP Flyers', active: true },
    { label: 'Sheng / Local', active: false },
  ]

  useEffect(() => {
    const clerkUser = (window as any).Clerk?.user
    if (clerkUser) {
      onLogin()
    }
  }, [onLogin])

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative z-0 w-full min-h-[100dvh]">
      {/* Background glowing orbs */}
      <div className="absolute top-[-100px] left-[10%] w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-primary/10 rounded-full blur-[100px] z-[-1]" />
      <div className="absolute bottom-[-100px] right-[10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-secondary/10 rounded-full blur-[120px] z-[-1]" />

      <div className="w-full max-w-md flex flex-col items-center h-full flex-1 pb-12 pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex-1 flex flex-col items-center justify-center px-8 text-center"
        >
          {/* Logo Shield */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-10 shadow-lg relative"
            style={{ background: 'linear-gradient(135deg, #00FFA3 0%, #00B373 100%)' }}
          >
            <div className="absolute inset-0 bg-white/20 blur-md rounded-[20px]" />
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0B1215" strokeWidth="2.5" className="relative z-10">
              <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinejoin="round" />
              <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>

          {/* Catchphrase */}
          <h1 className="heading-1 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Effortless</span> Marketing.<br/>
            Exponential Growth.
          </h1>
          <p className="text-[16px] text-textSecondary leading-relaxed mb-10 max-w-[280px]">
            AI-powered campaigns for the progressive African merchant.
          </p>

          {/* Feature Checkmarks */}
          <div className="flex flex-col gap-3 mb-10 text-left w-full max-w-[260px]">
            {tags.map((t, i) => (
              <motion.div 
                key={t.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 size={18} className={t.active ? "text-primary" : "text-textMuted"} />
                <span className={t.active ? "text-textPrimary" : "text-textMuted font-medium"}>
                  {t.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="px-6 pb-2 w-full mt-auto"
        >
          <button className="btn-primary mb-4 w-full flex items-center justify-center gap-2" onClick={() => { onEnter(); (window as any).Clerk?.openSignUp({ forceRedirectUrl: '/KUA' }) }}>
            Build your DNA
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="btn-secondary w-full" onClick={() => (window as any).Clerk?.openSignIn({ forceRedirectUrl: '/KUA' })}>
            I already have an account
          </button>
        </motion.div>
      </div>
    </div>
  )
}
