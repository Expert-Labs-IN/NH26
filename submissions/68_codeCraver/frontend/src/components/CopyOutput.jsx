import React, { useState } from 'react'
import { Search, Instagram, Linkedin, Copy, Check, Save, Tag } from 'lucide-react'
import { motion } from 'framer-motion'

const PLATFORMS = [
  {
    key: 'seoDescription',
    label: 'SEO Web Description',
    Icon: Search,
    color: 'text-[#059669]',
    bg: 'bg-[#f0fdf4]',
    border: 'border-[#bbf7d0]',
    buttonColor: 'bg-[#059669]',
    desc: 'Storefront & Google optimised'
  },
  {
    key: 'instagramCaption',
    label: 'Instagram Caption',
    Icon: Instagram,
    color: 'text-[#e1306c]',
    bg: 'bg-[#fff0f6]',
    border: 'border-[#fcc2d7]',
    buttonColor: 'bg-[#e1306c]',
    desc: 'Trendy · hashtags included'
  },
  {
    key: 'linkedinPost',
    label: 'LinkedIn Post',
    Icon: Linkedin,
    color: 'text-[#0077b5]',
    bg: 'bg-[#eff8ff]',
    border: 'border-[#bfdbfe]',
    buttonColor: 'bg-[#0077b5]',
    desc: 'Professional · B2B ready'
  },
]

function CopyCard({ platform, text, onCopy }) {
  const [copied, setCopied] = useState(false)
  const { Icon } = platform

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy && onCopy(platform.label)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-[var(--radius)] border flex flex-col gap-3 ${platform.bg} ${platform.border}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={18} className={platform.color} />
          <div>
            <div className={`text-[13px] font-bold ${platform.color}`}>{platform.label}</div>
            <div className="text-[11px] text-text3">{platform.desc}</div>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 border transition-all ${copied ? `${platform.buttonColor} text-white border-transparent` : `bg-white ${platform.color} ${platform.border} hover:bg-gray-50`
            }`}
        >
          {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
        </button>
      </div>
      <div className={`text-[13px] leading-relaxed text-text bg-white rounded-lg p-3.5 border whitespace-pre-wrap ${platform.border}`}>
        {text}
      </div>
    </motion.div>
  )
}

export default function CopyOutput({ result, onSave, saving }) {
  if (!result) return null

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg2 rounded-[var(--radius)] border border-border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[var(--shadow)]"
      >
        <div className="flex items-center gap-3">
          {result.imageBase64 && (
            <img src={result.imageBase64} alt="product"
              className="w-12 h-12 object-cover rounded-lg border border-border" />
          )}
          <div>
            <div className="text-[11px] text-text3 uppercase tracking-wide font-semibold">Generated product</div>
            <div className="text-lg font-extrabold">{result.productName}</div>
          </div>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className={`px-5 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-all w-full sm:w-auto justify-center ${saving ? 'bg-bg3 text-text3 cursor-not-allowed' : 'bg-text text-white hover:bg-black'
            }`}
        >
          <Save size={16} /> {saving ? 'Saving…' : 'Save to Catalog'}
        </button>
      </motion.div>

      {PLATFORMS.map(p => (
        <CopyCard key={p.key} platform={p} text={result[p.key]} />
      ))}

      {result.tags?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg2 rounded-[var(--radius)] border border-border p-4 sm:p-5 shadow-[var(--shadow)]"
        >
          <div className="text-xs font-bold text-text2 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
            <Tag size={14} /> Dynamic Tags
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.tags.map(tag => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-[var(--tag-bg)] text-[var(--tag-color)] font-semibold border border-indigo-200">
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
