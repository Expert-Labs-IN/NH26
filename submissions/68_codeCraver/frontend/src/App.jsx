import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import Toast from './components/Toast'
import LoadingState from './components/LoadingState'
import EmptyState from './components/EmptyState'
import SpecForm from './components/SpecForm'
import CopyOutput from './components/CopyOutput'
import ProductCatalog from './components/ProductCatalog'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthPage from './pages/AuthPage'
import Landing from './pages/Landing'
import BulkUpload from './pages/BulkUpload'
import ChatWidget from './components/ChatWidget'
import AdminLayout from './pages/AdminLayout'
import AdminDashboard from './pages/AdminDashboardSimple'
import AdminUsers from './pages/AdminUsers'
import AdminProducts from './pages/AdminProducts'
import AdminCategories from './pages/AdminCategories'
import AdminTags from './pages/AdminTags'

function AppContent() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState([])
  const [currentSpecs, setCurrentSpecs] = useState({})
  const [toast, setToast] = useState(null)
  const [user, setUser] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const { data } = await axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      setUser(data.user)
    } catch (err) {
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } })
    } catch (e) { }
    localStorage.removeItem('token')
    setUser(null)
    showToast('Logged out successfully')
  }

  const fetchProducts = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const { data } = await axios.get('/api/products', { headers: { Authorization: `Bearer ${token}` } })
      setProducts(data)
    } catch (err) {
      /* MongoDB optional */
    }
  }

  useEffect(() => {
    checkAuth()
    fetchProducts()
  }, [])

  const RequireAdmin = ({ children }) => {
    // Admin routes are intentionally public (per your request).
    // Still keep the component wrapper so routing structure stays the same.
    return children
  }

  const handleGenerate = async (specs, image, options = {}) => {
    setLoading(true)
    setResult(null)
    setCurrentSpecs(specs)
    try {
      const formData = new FormData()
      formData.append('specs', JSON.stringify(specs))
      if (image) formData.append('image', image)
      if (options.brandVoice) formData.append('brandVoice', options.brandVoice)
      if (options.language && options.language !== 'English') formData.append('language', options.language)

      const token = localStorage.getItem('token')
      const { data } = await axios.post('/api/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
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
      const token = localStorage.getItem('token')
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
      }, { headers: { Authorization: `Bearer ${token}` } })
      showToast('Product saved to catalog!')
      fetchProducts()
    } catch (err) {
      showToast('Could not save — is MongoDB running?', 'error')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setProducts(p => p.filter(x => x._id !== id))
      showToast('Product deleted')
    } catch (err) {
      showToast('Delete failed', 'error')
    }
  }

  const Home = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      <HeroSection />

      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[420px_1fr] gap-6 items-start">
          <div className="lg:sticky lg:top-24">
            <SpecForm onGenerate={handleGenerate} loading={loading} />
          </div>

          <div>
            {!result && !loading && <EmptyState />}
            {loading && <LoadingState />}
            <CopyOutput result={result} onSave={handleSave} saving={saving} />
          </div>
        </div>

        <ProductCatalog products={products} onDelete={handleDelete} />
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar user={user} onLogout={handleLogout} />

      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
          <Route path="/dashboard" element={user ? <Home /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage setAuth={setUser} showToast={showToast} />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage setAuth={setUser} showToast={showToast} />} />
          <Route path="/bulk" element={user ? <BulkUpload showToast={showToast} /> : <Navigate to="/login" replace />} />

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout user={user} />
              </RequireAdmin>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard showToast={showToast} />} />
            <Route path="users" element={<AdminUsers showToast={showToast} />} />
            <Route path="products" element={<AdminProducts showToast={showToast} />} />
            <Route path="categories" element={<AdminCategories showToast={showToast} />} />
            <Route path="tags" element={<AdminTags showToast={showToast} />} />
          </Route>

          <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
        </Routes>
      </AnimatePresence>

      <Toast toast={toast} />
      {user && <ChatWidget />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
