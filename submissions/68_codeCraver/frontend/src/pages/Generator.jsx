import React, { useState } from 'react'
import axios from 'axios'
import SpecForm from '../components/SpecForm'
import CopyOutput from '../components/CopyOutput'

export default function Generator({ showToast }) {
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [currentSpecs, setCurrentSpecs] = useState({})

    const handleGenerate = async (specs, image) => {
        setLoading(true)
        setResult(null)
        setCurrentSpecs(specs)
        try {
            const formData = new FormData()
            formData.append('specs', JSON.stringify(specs))
            if (image) formData.append('image', image)

            const { data } = await axios.post('/api/generate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setResult(data)
            showToast('Copy generated successfully!')
        } catch (err) {
            showToast(err.response?.data?.details || 'Generation failed. Check your API key.', 'error')
        }
        setLoading(false)
    }

    const handleSave = async () => {
        if (!result) return
        setSaving(true)
        try {
            await axios.post('/api/products', {
                name: result.productName,
                specs: currentSpecs,
                imageBase64: result.imageBase64 || null,
                copy: {
                    seoDescription: result.seoDescription,
                    instagramCaption: result.instagramCaption,
                    linkedinPost: result.linkedinPost,
                },
                tags: result.tags,
            })
            showToast('Product saved to catalog!')
        } catch {
            showToast('Could not save — is MongoDB running?', 'error')
        }
        setSaving(false)
    }

    return (
        <>
            <div style={{
                textAlign: 'center', padding: '48px 40px 32px',
                borderBottom: '1px solid var(--border)', background: 'var(--bg2)'
            }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 11, fontWeight: 700, color: 'var(--accent)',
                    background: 'var(--accent-light)', padding: '4px 12px',
                    borderRadius: 20, marginBottom: 16, letterSpacing: 0.8
                }}>✦ POWERED BY CLAUDE AI</div>
                <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12, lineHeight: 1.1 }}>
                    From specs to scroll-stopping<br />copy in seconds
                </h1>
                <p style={{ fontSize: 15, color: 'var(--text2)', maxWidth: 480, margin: '0 auto' }}>
                    Upload a product image or enter specs — get SEO descriptions, Instagram captions, and LinkedIn posts instantly.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
                    {[
                        { label: 'SEO Description', color: '#059669', bg: '#f0fdf4' },
                        { label: 'Instagram Caption', color: '#e1306c', bg: '#fff0f6' },
                        { label: 'LinkedIn Post', color: '#0077b5', bg: '#eff8ff' },
                    ].map(b => (
                        <span key={b.label} style={{
                            fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20,
                            background: b.bg, color: b.color
                        }}>{b.label}</span>
                    ))}
                </div>
            </div>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 24, alignItems: 'start' }}>
                    <div style={{ position: 'sticky', top: 80 }}>
                        <SpecForm onGenerate={handleGenerate} loading={loading} />
                    </div>

                    <div>
                        {!result && !loading && (
                            <div style={{
                                background: 'var(--bg2)', borderRadius: 'var(--radius)',
                                border: '2px dashed var(--border)', padding: '60px 40px',
                                textAlign: 'center', color: 'var(--text3)'
                            }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>✦</div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>
                                    Your generated copy will appear here
                                </div>
                                <div style={{ fontSize: 13 }}>Fill in product details or upload an image and click Generate</div>
                            </div>
                        )}

                        {loading && (
                            <div style={{
                                background: 'var(--bg2)', borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)', padding: '40px',
                                textAlign: 'center'
                            }}>
                                <div style={{ width: 36, height: 36, margin: '0 auto 16px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text2)', marginBottom: 4 }}>Claude is writing your copy…</div>
                                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Analysing specs and generating 3 platform variants</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}>
                                    {[120, 80, 100].map((w, i) => (
                                        <div key={i} className="skeleton" style={{ height: 14, width: `${w}px`, margin: '0 auto' }} />
                                    ))}
                                </div>
                            </div>
                        )}

                        <CopyOutput result={result} onSave={handleSave} saving={saving} />
                    </div>
                </div>
            </div>
        </>
    )
}
