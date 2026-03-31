'use client'

import { useState } from 'react'
import { Store, Tag, Save, User as UserIcon } from 'lucide-react'
import { useKua } from './KuaProvider'
import { cn } from '@/lib/utils'

export default function SettingsTab() {
  const { user, setUser, toast, syncUser } = useKua()
  const [bizName, setBizName] = useState(user.bizName)
  const [bizType, setBizType] = useState(user.bizType)
  const [brandKw, setBrandKw] = useState(user.brandKw)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      // Update local state first for immediate UI response
      setUser({ bizName, bizType, brandKw })
      
      // Sync with Supabase
      await syncUser({ bizName, bizType, brandKw })
      
      toast('✅ Business DNA calibrated and saved to cloud.')
    } catch (e) {
      toast('❌ Failed to sync: Check your Supabase connection.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="label-sm flex items-center gap-2">
        <Store size={14} className="text-primary" />
        Business Settings
      </div>

      <div className="glass-panel p-6 flex flex-col gap-6 bg-white/[0.02]">
        
        <div className="flex flex-col gap-2">
          <label className="label-sm text-textMuted flex items-center gap-2">
            <UserIcon size={12} />
            Business Name
          </label>
          <input 
            className="inp" 
            value={bizName} 
            onChange={e => setBizName(e.target.value)} 
            placeholder="e.g. Joy's Electronics"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="label-sm text-textMuted flex items-center gap-2">
            <Tag size={12} />
            Category / Niche
          </label>
          <input 
            className="inp" 
            value={bizType} 
            onChange={e => setBizType(e.target.value)} 
            placeholder="Phones, accessories, repairs…"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="label-sm text-textMuted">Brand Keywords (AI Focus)</label>
          <textarea 
            className="inp h-24 resize-none py-3" 
            value={brandKw} 
            onChange={e => setBrandKw(e.target.value)} 
            placeholder="Fresh, Affordable, Daily, Trusted, Local"
          />
          <p className="text-[10px] text-textMuted italic mt-1">
            * These keywords guide the "voice" of your generated campaigns.
          </p>
        </div>

        <div className="h-[1px] bg-white/5 w-full my-2" />

        <div className="flex flex-col gap-2">
          <label className="label-sm text-textMuted">Account ID</label>
          <div className="px-4 py-3 bg-black/30 rounded-xl border border-white/5 text-[14px] text-white font-mono flex items-center justify-between">
            {user.phone || 'Unknown'}
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">Active</span>
          </div>
        </div>
      </div>

      <button 
        className={cn("btn-primary", saving && "opacity-80")} 
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <div className="flex items-center gap-2">
            <span className="spin-dark" />
            Calibrating...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            Save Changes
            <Save size={18} />
          </div>
        )}
      </button>

      {/* Danger Zone */}
      <div className="mt-8 flex flex-col gap-3">
        <label className="label-sm text-secondary/60">System Actions</label>
        <button 
          className="glass-panel p-4 text-[13px] font-bold text-secondary border-secondary/20 bg-secondary/5 hover:bg-secondary/10 transition-colors text-center uppercase tracking-widest"
          onClick={() => {
            localStorage.removeItem('kua_user')
            window.location.reload()
          }}
        >
          Logout & Reset Session
        </button>
      </div>
    </div>
  )
}
