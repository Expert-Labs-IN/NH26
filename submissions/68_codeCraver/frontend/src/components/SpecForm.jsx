import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Zap, Image as ImageIcon, CheckCircle, X, Loader2, FileText, Globe } from 'lucide-react'

const FIELDS = [
  { key: 'name', label: 'Product Name', placeholder: 'e.g. Wireless Noise-Cancelling Headphones', full: true },
  { key: 'category', label: 'Category', placeholder: 'e.g. Electronics, Fashion, Home' },
  { key: 'price', label: 'Price / Range', placeholder: 'e.g. $49.99' },
  { key: 'material', label: 'Material', placeholder: 'e.g. Aluminium, Cotton, Leather' },
  { key: 'color', label: 'Color / Finish', placeholder: 'e.g. Midnight Black' },
  { key: 'weight', label: 'Weight', placeholder: 'e.g. 250g' },
  { key: 'dimensions', label: 'Dimensions', placeholder: 'e.g. 18 x 15 x 8 cm' },
  { key: 'extra', label: 'Key Features', placeholder: 'e.g. 40hr battery, foldable, USB-C', full: true },
]

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Portuguese', 'Italian', 'Russian', 'Dutch', 'Turkish']

export default function SpecForm({ onGenerate, loading }) {
  const [mode, setMode] = useState('specs')
  const [specs, setSpecs] = useState({})
  const [brandVoice, setBrandVoice] = useState('')
  const [language, setLanguage] = useState('English')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [errors, setErrors] = useState({})
  const fileRef = useRef()

  const switchMode = (newMode) => {
    if (newMode === mode) return
    setMode(newMode)
    if (newMode === 'image') {
      setSpecs({})
    } else {
      setImage(null)
      setImagePreview(null)
    }
    setErrors({})
  }

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setImage(file)
    const reader = new FileReader()
    reader.onload = e => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = () => {
    if (mode === 'specs') {
      const newErrors = {}
      if (!specs.name?.trim()) newErrors.name = 'Product name is mandatory'
      if (!specs.category?.trim()) newErrors.category = 'Category is recommended'
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setTimeout(() => setErrors({}), 4000)
        if (!specs.name?.trim()) return // Only block submission if name is missing
      }
    }
    
    if (mode === 'image' && !image) {
      setErrors({ image: 'Please upload a product image first!' })
      setTimeout(() => setErrors({}), 4000)
      return
    }

    setErrors({})
    onGenerate(
      mode === 'specs' ? specs : {},
      mode === 'image' ? image : null,
      { brandVoice, language }
    )
  }

  const filled = Object.values(specs).filter(Boolean).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg2 rounded-[var(--radius)] border border-border shadow-[var(--shadow)] overflow-hidden"
    >
      <div className="p-6 pb-5 border-b border-border">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white">
            <Zap size={20} className="fill-current" />
          </div>
          <div>
            <h2 className="text-[17px] font-bold">Product Input</h2>
            <p className="text-xs text-text3">Upload an image or enter product details</p>
          </div>
          {mode === 'specs' && filled > 0 && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="ml-auto text-[11px] font-bold bg-accentLight text-accent px-2.5 py-1 rounded-full"
            >
              {filled} fields
            </motion.span>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="flex rounded-lg border border-border overflow-hidden mb-5">
          <button
            onClick={() => switchMode('image')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold transition-colors ${
              mode === 'image'
                ? 'bg-accent text-white'
                : 'bg-bg text-text2 hover:bg-bg3'
            }`}
          >
            <ImageIcon size={15} /> Upload Image
          </button>
          <button
            onClick={() => switchMode('specs')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold transition-colors ${
              mode === 'specs'
                ? 'bg-accent text-white'
                : 'bg-bg text-text2 hover:bg-bg3'
            }`}
          >
            <FileText size={15} /> Enter Details
          </button>
        </div>

        {mode === 'image' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative overflow-hidden border-2 border-dashed rounded-[var(--radius-sm)] p-5 text-center cursor-pointer mb-5 transition-colors ${dragOver ? 'border-accent bg-accentLight' : imagePreview ? 'border-[#059669] bg-[#f0fdf4]' : 'border-border2 bg-bg hover:bg-bg3'
              }`}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleFile(e.target.files[0])} />
            {imagePreview ? (
              <div className="flex items-center gap-3.5">
                <img src={imagePreview} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-border" />
                <div className="text-left">
                  <div className="text-[13px] font-semibold text-[#059669] flex items-center gap-1.5">
                    <CheckCircle size={14} /> Image uploaded
                  </div>
                  <div className="text-[11px] text-text3 mt-0.5 truncate max-w-[150px]">{image?.name}</div>
                  <button onClick={e => { e.stopPropagation(); setImage(null); setImagePreview(null) }}
                    className="mt-1.5 text-[11px] text-text3 underline hover:text-text2 flex items-center gap-1">
                    <X size={12} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-2 text-text3"><ImageIcon size={28} /></div>
                <div className="text-[13px] font-semibold text-text2">Drop product image here</div>
                <div className="text-[11px] text-text3 mt-0.5">or click to browse · PNG, JPG, WEBP</div>
                {errors.image && <div className="text-xs text-red-500 font-bold mt-2">{errors.image}</div>}
                <div className="mt-2 text-[10px] font-bold tracking-wide text-accent bg-accentLight inline-block px-2 py-0.5 rounded-full">
                  Vision AI enabled
                </div>
              </>
            )}
          </motion.div>
        )}

        {mode === 'specs' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-2 gap-3">
              {FIELDS.map(f => (
                <div key={f.key} className={f.full ? 'col-span-2' : ''}>
                  <label className="text-[11px] font-semibold text-text2 uppercase tracking-wide flex justify-between mb-1.5">
                    <span>{f.label} {f.key === 'name' && <span className="text-red-500">*</span>}</span>
                    {f.key === 'category' && <span className="text-text3 text-[9px]">Highly recommended</span>}
                  </label>
                  <input
                    value={specs[f.key] || ''}
                    onChange={e => {
                      setSpecs(p => ({ ...p, [f.key]: e.target.value }))
                      if (errors[f.key]) setErrors(p => ({ ...p, [f.key]: null }))
                    }}
                    placeholder={f.placeholder}
                    className={`w-full px-3 py-2 border rounded-[var(--radius-sm)] text-[13px] text-text outline-none transition-all ${
                        errors[f.key] 
                          ? 'border-red-500 bg-red-500/5 focus:border-red-500' 
                          : specs[f.key] ? 'border-accent bg-accentLight' : 'border-border bg-bg focus:border-accent'
                      }`}
                  />
                  {errors[f.key] && <div className="text-[10px] text-red-500 mt-1 font-medium">{errors[f.key]}</div>}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Brand Voice & Language */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[11px] font-semibold text-text2 uppercase tracking-wide block mb-1.5">
              <Globe size={11} className="inline mr-1" />Language
            </label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className={`w-full px-3 py-2 border rounded-[var(--radius-sm)] text-[13px] text-text outline-none transition-all appearance-none bg-bg ${
                language !== 'English' ? 'border-accent bg-accentLight' : 'border-border focus:border-accent'
              }`}
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[11px] font-semibold text-text2 uppercase tracking-wide block mb-1.5">
              Brand Voice (optional)
            </label>
            <input
              value={brandVoice}
              onChange={e => setBrandVoice(e.target.value)}
              placeholder="e.g. Nike — bold & empowering"
              className={`w-full px-3 py-2 border rounded-[var(--radius-sm)] text-[13px] text-text outline-none transition-all ${
                brandVoice ? 'border-accent bg-accentLight' : 'border-border bg-bg focus:border-accent'
              }`}
            />
          </div>
        </div>

        <motion.button
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full mt-5 py-3 rounded-[var(--radius-sm)] text-sm font-bold flex items-center justify-center gap-2 transition-colors ${loading ? 'bg-border2 text-text3 cursor-not-allowed' : 'bg-accent text-white hover:bg-blue-700'
            }`}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating with AI…
            </>
          ) : (
            <>
              <Zap size={16} className="fill-current" /> Generate Marketing Copy
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
