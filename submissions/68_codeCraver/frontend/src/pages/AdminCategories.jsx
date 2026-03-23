import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { FolderOpen, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API = '/api/admin'
const getToken = () => localStorage.getItem('token') || ''
const getHeaders = () => {
  const token = getToken()
  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : { headers: {} }
}

export default function AdminCategories({ showToast }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])

  const fetchCategories = async () => {
    try {
      const token = getToken()
      if (!token) {
        showToast?.('Please log in to access admin.', 'error')
        navigate('/login', { replace: true })
        return
      }
      const { data } = await axios.get(`${API}/categories`, getHeaders())
      setCategories(data)
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('token')
        showToast?.('Admin session expired. Please log in again.', 'error')
        navigate('/login', { replace: true })
        return
      }
      showToast?.(err.response?.data?.error || 'Failed to load categories', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return (
    <div className="bg-bg2 border border-border rounded-[var(--radius)] p-6 shadow-[var(--shadow)]">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderOpen size={18} className="text-accent" />
            <h2 className="text-xl font-extrabold tracking-tight">Categories</h2>
          </div>
          <p className="text-[13px] text-text3">Distribution by product count</p>
        </div>

        <button
          onClick={() => {
            setLoading(true)
            fetchCategories()
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
                <th className="pb-2 font-semibold">Category</th>
                <th className="pb-2 font-semibold">Value</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c, idx) => (
                <tr key={`${c.name}-${idx}`} className="border-b border-border/50 hover:bg-bg3 transition-colors">
                  <td className="py-2.5 font-semibold">{c.name}</td>
                  <td className="py-2.5 text-text3">{c.value}</td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-10 text-center text-text3">
                    No categories yet
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

