import React, { useState, useRef } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileSpreadsheet, X, Loader2, CheckCircle, AlertCircle, Download, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const SAMPLE_CSV = `name,category,price,material,color,weight,dimensions,extra
Wireless Earbuds Pro,Electronics,$79.99,Aluminium,Midnight Black,45g,3x2x1 cm,"ANC, 30hr battery, IPX5"
Organic Cotton Tee,Fashion,$34.99,Cotton,Forest Green,180g,,"Unisex, pre-shrunk, eco-dyed"
Smart Water Bottle,Lifestyle,$49.99,Stainless Steel,Silver,350g,28x7 cm,"LED temp display, 24hr insulation"`

export default function BulkUpload({ showToast }) {
  const [file, setFile] = useState(null)
  const [rows, setRows] = useState([])
  const [results, setResults] = useState([])
  const [processing, setProcessing] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(-1)
  const fileRef = useRef()

  const parseCSV = (text) => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    return lines.slice(1).map(line => {
      const values = []
      let current = ''
      let inQuotes = false
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes; continue }
        if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue }
        current += char
      }
      values.push(current.trim())
      
      const obj = {}
      headers.forEach((h, i) => { if (values[i]) obj[h] = values[i] })
      return obj
    }).filter(row => row.name)
  }

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setResults([])
    const reader = new FileReader()
    reader.onload = (e) => {
      const parsed = parseCSV(e.target.result)
      setRows(parsed)
    }
    reader.readAsText(f)
  }

  const handleProcess = async () => {
    if (rows.length === 0) return
    setProcessing(true)
    setResults([])

    for (let i = 0; i < rows.length; i++) {
      setCurrentIdx(i)
      try {
        const formData = new FormData()
        formData.append('specs', JSON.stringify(rows[i]))

        const { data } = await axios.post('/api/generate', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setResults(prev => [...prev, { status: 'success', specs: rows[i], data }])
      } catch (err) {
        setResults(prev => [...prev, { status: 'error', specs: rows[i], error: err.response?.data?.details || 'Failed' }])
      }
      if (i < rows.length - 1) await new Promise(r => setTimeout(r, 1500))
    }

    setCurrentIdx(-1)
    setProcessing(false)
    showToast?.(`Bulk generation complete! ${rows.length} products processed.`)
  }

  const handleSaveAll = async () => {
    const successful = results.filter(r => r.status === 'success')
    let saved = 0
    const token = localStorage.getItem('token')
    for (const r of successful) {
      try {
        await axios.post('/api/products', {
          name: r.data.productName,
          specs: r.specs,
          copy: {
            seoDescription: r.data.seoDescription,
            instagramCaption: r.data.instagramCaption,
            linkedinPost: r.data.linkedinPost,
          },
          tags: r.data.tags,
        }, { headers: { Authorization: `Bearer ${token}` } })
        saved++
      } catch { }
    }
    showToast?.(`${saved} products saved to catalog!`)
  }

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'copyforge_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportResults = () => {
    const successful = results.filter(r => r.status === 'success')
    if (successful.length === 0) return
    let csv = 'Product Name,SEO Description,Instagram Caption,LinkedIn Post,Tags\n'
    successful.forEach(r => {
      const d = r.data
      csv += `"${d.productName}","${d.seoDescription?.replace(/"/g, '""')}","${d.instagramCaption?.replace(/"/g, '""')}","${d.linkedinPost?.replace(/"/g, '""')}","${d.tags?.join(', ')}"\n`
    })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'copyforge_results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length
  const progress = rows.length > 0 ? Math.round((results.length / rows.length) * 100) : 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      <div className="max-w-[800px] mx-auto px-6 py-8">
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-text3 hover:text-accent mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight">Bulk Upload</h1>
          <p className="text-sm text-text2 mt-1">Upload a CSV file with product specs to generate marketing copy for multiple products at once.</p>
        </div>

        <div className="bg-accentLight border border-accent/20 rounded-[var(--radius)] p-4 mb-6 flex items-center justify-between">
          <div className="text-[13px]">
            <span className="font-semibold text-accent">Need a template?</span>
            <span className="text-text2 ml-1">Download our CSV template with sample data.</span>
          </div>
          <button onClick={downloadTemplate} className="px-4 py-2 rounded-lg text-xs font-bold text-accent bg-white border border-accent/30 hover:bg-accent hover:text-white transition-all flex items-center gap-1.5">
            <Download size={14} /> Template
          </button>
        </div>

        <motion.div
          whileHover={{ scale: 1.005 }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-[var(--radius)] p-8 text-center cursor-pointer transition-colors mb-6 ${
            file ? 'border-[#059669] bg-[#f0fdf4]' : 'border-border2 bg-bg hover:bg-bg3'
          }`}
        >
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileSpreadsheet size={24} className="text-[#059669]" />
              <div className="text-left">
                <div className="text-[13px] font-semibold text-[#059669] flex items-center gap-1.5">
                  <CheckCircle size={14} /> {file.name}
                </div>
                <div className="text-[12px] text-text3">{rows.length} products found</div>
              </div>
              <button onClick={e => { e.stopPropagation(); setFile(null); setRows([]); setResults([]) }}
                className="ml-4 text-text3 hover:text-text2">
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={32} className="mx-auto mb-2 text-text3" />
              <div className="text-[14px] font-semibold text-text2">Drop CSV file here or click to browse</div>
              <div className="text-[12px] text-text3 mt-1">Columns: name, category, price, material, color, weight, dimensions, extra</div>
            </>
          )}
        </motion.div>

        {rows.length > 0 && results.length === 0 && (
          <div className="bg-bg2 rounded-[var(--radius)] border border-border p-4 mb-6 shadow-[var(--shadow)]">
            <div className="text-xs font-bold text-text2 uppercase tracking-wide mb-3">Preview ({rows.length} products)</div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-text3 font-semibold">#</th>
                    <th className="text-left py-2 px-2 text-text3 font-semibold">Name</th>
                    <th className="text-left py-2 px-2 text-text3 font-semibold">Category</th>
                    <th className="text-left py-2 px-2 text-text3 font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 px-2 text-text3">{i + 1}</td>
                      <td className="py-2 px-2 font-medium">{row.name}</td>
                      <td className="py-2 px-2 text-text2">{row.category || '—'}</td>
                      <td className="py-2 px-2 text-text2">{row.price || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {processing && (
          <div className="bg-bg2 rounded-[var(--radius)] border border-border p-5 mb-6 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[13px] font-bold">Processing {currentIdx + 1} of {rows.length}...</div>
              <div className="text-[13px] font-bold text-accent">{progress}%</div>
            </div>
            <div className="w-full h-2.5 bg-bg3 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="mt-2 text-[11px] text-text3">
              <span className="text-[#059669]">{successCount} success</span>
              {errorCount > 0 && <span className="text-red-500 ml-3">{errorCount} failed</span>}
            </div>
          </div>
        )}

        {results.length > 0 && !processing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold">
                Results: <span className="text-[#059669]">{successCount} generated</span>
                {errorCount > 0 && <span className="text-red-500 ml-2">{errorCount} failed</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={exportResults} className="px-4 py-2 rounded-lg text-xs font-bold bg-bg2 border border-border text-text2 hover:border-accent hover:text-accent transition-all flex items-center gap-1.5">
                  <Download size={14} /> Export CSV
                </button>
                <button onClick={handleSaveAll} className="px-4 py-2 rounded-lg text-xs font-bold bg-text text-white hover:bg-black transition-all flex items-center gap-1.5">
                  <CheckCircle size={14} /> Save All to Catalog
                </button>
              </div>
            </div>

            {results.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-[var(--radius)] border p-4 ${
                  r.status === 'success' ? 'bg-[#f0fdf4] border-[#bbf7d0]' : 'bg-[#fef2f2] border-[#fecaca]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {r.status === 'success'
                    ? <CheckCircle size={16} className="text-[#059669]" />
                    : <AlertCircle size={16} className="text-red-500" />
                  }
                  <span className="text-[13px] font-bold">{r.status === 'success' ? r.data.productName : r.specs.name}</span>
                </div>
                {r.status === 'success' ? (
                  <div className="text-[12px] text-text2 line-clamp-2">{r.data.seoDescription}</div>
                ) : (
                  <div className="text-[12px] text-red-600">{r.error}</div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {rows.length > 0 && results.length === 0 && (
          <motion.button
            whileHover={!processing ? { scale: 1.02 } : {}}
            whileTap={!processing ? { scale: 0.98 } : {}}
            onClick={handleProcess}
            disabled={processing}
            className={`w-full py-3.5 rounded-[var(--radius-sm)] text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              processing ? 'bg-border2 text-text3 cursor-not-allowed' : 'bg-accent text-white hover:bg-blue-700'
            }`}
          >
            {processing ? (
              <><Loader2 size={16} className="animate-spin" /> Processing...</>
            ) : (
              <><Upload size={16} /> Generate Copy for {rows.length} Products</>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
