import React from 'react'
import { motion } from 'framer-motion'
import { Trash2, BookOpen, Search, Instagram, Linkedin, Package } from 'lucide-react'

const PLATFORM_ICONS = [
  { label: 'SEO', Icon: Search, color: 'text-[#059669] bg-[#059669]/10' },
  { label: 'IG', Icon: Instagram, color: 'text-[#e1306c] bg-[#e1306c]/10' },
  { label: 'LI', Icon: Linkedin, color: 'text-[#0077b5] bg-[#0077b5]/10' },
]

export default function ProductCatalog({ products, onDelete }) {
  if (!products.length) return null

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2.5 mb-4">
        <BookOpen size={20} className="text-accent" />
        <h2 className="text-[18px] font-extrabold">Saved Catalog</h2>
        <span className="text-[11px] font-bold bg-accentLight text-accent px-2 py-0.5 rounded-full">
          {products.length} products
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {products.map((p, idx) => (
          <motion.div
            key={p._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -2, boxShadow: 'var(--shadow-lg)' }}
            className="bg-bg2 rounded-[var(--radius)] border border-border shadow-[var(--shadow)] overflow-hidden flex flex-col transition-all cursor-default"
          >
            {p.imageBase64 ? (
              <img src={p.imageBase64} alt={p.name}
                className="w-full h-40 object-cover border-b border-border" />
            ) : (
              <div className="w-full h-40 bg-bg border-b border-border flex items-center justify-center">
                <Package size={40} className="text-border2" />
              </div>
            )}
            <div className="p-4 flex-1 flex flex-col">
              <div className="text-[14px] font-extrabold mb-1 truncate">{p.name}</div>
              <div className="text-[12px] text-text3 mb-2.5 leading-relaxed flex-1">
                {p.copy?.seoDescription?.slice(0, 80)}…
              </div>

              <div className="flex flex-wrap gap-1 mb-2.5">
                {p.tags?.slice(0, 4).map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--tag-bg)] text-[var(--tag-color)] font-semibold border border-[#c7d2fe]">
                    #{t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-border/50">
                {PLATFORM_ICONS.map(({ label, Icon, color }) => (
                  <span key={label} className={`text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1 ${color}`}>
                    <Icon size={10} /> {label}
                  </span>
                ))}
                <button
                  onClick={() => onDelete(p._id)}
                  className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-2 py-1 rounded border border-red-200 transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
