import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Users, Package, Shield, Trash2, FolderOpen, Tag, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API = '/api/admin'
const getToken = () => localStorage.getItem('token') || ''
const getHeaders = () => {
  const token = getToken()
  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : { headers: {} }
}

const COLORS = ['bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600', 'bg-purple-100 text-purple-600']

function StatCard({ title, value, icon: Icon, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-bg2 rounded-[var(--radius)] border border-border p-5 shadow-[var(--shadow)] hover:shadow-[var(--shadow-lg)] transition-shadow`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="text-2xl font-extrabold tracking-tight">{value}</div>
      <div className="text-[13px] text-text3 mt-0.5">{title}</div>
    </motion.div>
  )
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-14">
      <div className="w-10 h-10 border-[3px] border-border border-t-accent rounded-full animate-spin" />
    </div>
  )
}

export default function AdminDashboardSimple({ showToast }) {
  const navigate = useNavigate()
  const authHandledRef = useRef(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentProducts, setRecentProducts] = useState([])
  const [recentUsers, setRecentUsers] = useState([])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = getToken()
      if (!token) {
        if (authHandledRef.current) return
        authHandledRef.current = true
        showToast?.('Please log in to access admin.', 'error')
        navigate('/login', { replace: true })
        return
      }

      const h = getHeaders()
      const [sRes, pRes, uRes] = await Promise.all([
        axios.get(`${API}/stats`, h),
        axios.get(`${API}/products/recent`, h),
        axios.get(`${API}/users/recent`, h),
      ])
      setStats(sRes.data)
      setRecentProducts(pRes.data)
      setRecentUsers(uRes.data)
    } catch (err) {
      if (err?.response?.status === 401) {
        if (authHandledRef.current) return
        authHandledRef.current = true
        localStorage.removeItem('token')
        showToast?.('Admin session expired. Please log in again.', 'error')
        navigate('/login', { replace: true })
        return
      }
      showToast?.(err.response?.data?.error || 'Failed to load admin data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = () => fetchData()

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return
    try {
      const token = getToken()
      if (!token) {
        showToast?.('Please log in to access admin.', 'error')
        navigate('/login', { replace: true })
        return
      }

      await axios.delete(`${API}/users/${id}`, getHeaders())
      showToast?.('User deleted')
      await fetchData()
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('token')
        showToast?.('Admin session expired. Please log in again.', 'error')
        navigate('/login', { replace: true })
        return
      }
      showToast?.(err.response?.data?.error || 'Delete failed', 'error')
    }
  }

  if (loading) return <Loading />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1200px] mx-auto px-6 py-2">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Admin Dashboard</h1>
            <p className="text-[13px] text-text3">Platform overview and recent activity</p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          type="button"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold bg-bg border border-border text-text2 hover:bg-bg3 transition-colors"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color={COLORS[0]} delay={0} />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={Package}
          color={COLORS[1]}
          delay={0.05}
        />
        <StatCard
          title="Categories"
          value={stats?.totalCategories || 0}
          icon={FolderOpen}
          color={COLORS[2]}
          delay={0.1}
        />
        <StatCard title="Unique Tags" value={stats?.totalTags || 0} icon={Tag} color={COLORS[3]} delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-bg2 rounded-[var(--radius)] border border-border p-5 shadow-[var(--shadow)]">
          <h2 className="text-[15px] font-bold mb-4">Recent Products</h2>
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
                {recentProducts.map((p) => (
                  <tr key={p._id} className="border-b border-border/50 hover:bg-bg3 transition-colors">
                    <td className="py-2.5 font-semibold truncate max-w-[180px]">{p.name}</td>
                    <td className="py-2.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold">
                        {p.specs?.category || 'N/A'}
                      </span>
                    </td>
                    <td className="py-2.5 text-text3">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
                {recentProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-text3">
                      No products yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-bg2 rounded-[var(--radius)] border border-border p-5 shadow-[var(--shadow)]">
          <h2 className="text-[15px] font-bold mb-4">Recent Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-text3 border-b border-border">
                  <th className="pb-2 font-semibold">Name</th>
                  <th className="pb-2 font-semibold">Email</th>
                  <th className="pb-2 font-semibold">Role</th>
                  <th className="pb-2 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u._id} className="border-b border-border/50 hover:bg-bg3 transition-colors">
                    <td className="py-2.5 font-semibold">{u.name}</td>
                    <td className="py-2.5 text-text3 truncate max-w-[180px]">{u.email}</td>
                    <td className="py-2.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-bg3 text-text3'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      {u.role !== 'admin' ? (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                          type="button"
                          title="Delete user"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <span className="text-text3 text-[12px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-text3">
                      No users yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

