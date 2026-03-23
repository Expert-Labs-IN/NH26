import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Package, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API = '/api/admin'
const getToken = () => localStorage.getItem('token') || ''
const getHeaders = () => {
  const token = getToken()
  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : { headers: {} }
}

export default function AdminProducts({ showToast }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])

  const fetchProducts = async () => {
    try {
      const token = getToken()
      if (!token) {
        showToast?.('Please log in to access admin.', 'error')
        navigate('/login', { replace: true })
        return
      }
      const { data } = await axios.get(`${API}/products/recent`, getHeaders())
      setProducts(data)
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('token')
        showToast?.('Admin session expired. Please log in again.', 'error')
        navigate('/login', { replace: true })
        return
      }
      showToast?.(err.response?.data?.error || 'Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <div className="bg-bg2 border border-border rounded-[var(--radius)] p-6 shadow-[var(--shadow)]">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package size={18} className="text-accent" />
            <h2 className="text-xl font-extrabold tracking-tight">Products</h2>
          </div>
          <p className="text-[13px] text-text3">Most recently created products</p>
        </div>

        <button
          onClick={() => {
            setLoading(true)
            fetchProducts()
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold bg-bg border border-border text-text2 hover:bg-bg3 transition-colors"
          type="button"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-10 h-10 border-[3px] border-border border-t-accent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-text3 border-b border-border">
                <th className="pb-2 font-semibold">Name</th>
                <th className="pb-2 font-semibold">Category</th>
                <th className="pb-2 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-border/50 hover:bg-bg3 transition-colors">
                  <td className="py-2.5 font-semibold truncate max-w-[220px]">{p.name}</td>
                  <td className="py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold">
                      {p.specs?.category || 'N/A'}
                    </span>
                  </td>
                  <td className="py-2.5 text-text3">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-text3">
                    No products yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

