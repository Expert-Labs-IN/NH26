import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Shield, Trash2, Search, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API = '/api/admin'
const getToken = () => localStorage.getItem('token') || ''
const getHeaders = () => {
  const token = getToken()
  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : { headers: {} }
}

export default function AdminUsers({ showToast }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')

  const fetchUsers = async () => {
    try {
      const token = getToken()
      if (!token) {
        showToast?.('Please log in to access admin.', 'error')
        navigate('/login', { replace: true })
        return
      }
      const { data } = await axios.get(`${API}/users/recent`, getHeaders())
      setUsers(data)
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('token')
        showToast?.('Admin session expired. Please log in again.', 'error')
        navigate('/login', { replace: true })
        return
      }
      showToast?.(err.response?.data?.error || 'Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q))
  }, [query, users])

  const handleDelete = async (id) => {
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
      setLoading(true)
      await fetchUsers()
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('token')
        showToast?.('Admin session expired. Please log in again.', 'error')
        navigate('/login', { replace: true })
        return
      }
      showToast?.(err.response?.data?.error || 'Delete failed', 'error')
      setLoading(false)
    }
  }

  return (
    <div className="bg-bg2 border border-border rounded-[var(--radius)] p-6 shadow-[var(--shadow)]">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-accent" />
            <h2 className="text-xl font-extrabold tracking-tight">Users</h2>
          </div>
          <p className="text-[13px] text-text3">Recent registered users</p>
        </div>

        <button
          onClick={() => {
            setLoading(true)
            fetchUsers()
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold bg-bg border border-border text-text2 hover:bg-bg3 transition-colors"
          type="button"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 bg-bg rounded-[var(--radius-sm)] border border-border px-3 py-2">
          <Search size={16} className="text-text3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-transparent outline-none text-sm text-text"
          />
        </div>
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
                <th className="pb-2 font-semibold">Email</th>
                <th className="pb-2 font-semibold">Role</th>
                <th className="pb-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id} className="border-b border-border/50 hover:bg-bg3 transition-colors">
                  <td className="py-2.5 font-semibold">{u.name}</td>
                  <td className="py-2.5 text-text3 truncate max-w-[220px]">{u.email}</td>
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
                        onClick={() => handleDelete(u._id)}
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text3">
                    {users.length === 0 ? 'No users yet' : 'No matches'}
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

