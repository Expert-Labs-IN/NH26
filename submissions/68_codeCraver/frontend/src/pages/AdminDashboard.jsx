export { default } from './AdminDashboardSimple'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
    Users, Package, FolderOpen, Tag,
    Trash2, Shield, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react'

const API = '/api/admin'
const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

const COLORS = ['#2563eb', '#059669', '#e1306c', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16', '#ec4899', '#14b8a6']

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const StatCard = ({ title, value, icon: Icon, growth, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className="bg-bg2 rounded-[var(--radius)] border border-border p-5 shadow-[var(--shadow)] hover:shadow-[var(--shadow-lg)] transition-shadow"
    >
        <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={20} />
            </div>
            {growth !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${growth > 0 ? 'text-[#059669] bg-[#f0fdf4]' : growth < 0 ? 'text-red-500 bg-red-50' : 'text-text3 bg-bg3'}`}>
                    {growth > 0 ? <ArrowUpRight size={14} /> : growth < 0 ? <ArrowDownRight size={14} /> : <Minus size={14} />}
                    {Math.abs(growth)}%
                </div>
            )}
        </div>
        <div className="text-2xl font-extrabold tracking-tight">{value}</div>
        <div className="text-[13px] text-text3 mt-0.5">{title}</div>
    </motion.div>
)

const ChartCard = ({ title, children, delay = 0, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className={`bg-bg2 rounded-[var(--radius)] border border-border p-5 shadow-[var(--shadow)] ${className}`}
    >
        <h3 className="text-[15px] font-bold mb-4">{title}</h3>
        {children}
    </motion.div>
)

export default function AdminDashboard({ showToast }) {
    const [stats, setStats] = useState(null)
    const [userGrowth, setUserGrowth] = useState([])
    const [productTrends, setProductTrends] = useState([])
    const [categories, setCategories] = useState([])
    const [topTags, setTopTags] = useState([])
    const [recentProducts, setRecentProducts] = useState([])
    const [recentUsers, setRecentUsers] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const h = getHeaders()
            const [s, ug, pt, cat, tags, rp, ru] = await Promise.all([
                axios.get(`${API}/stats`, h),
                axios.get(`${API}/users/growth`, h),
                axios.get(`${API}/products/trends`, h),
                axios.get(`${API}/categories`, h),
                axios.get(`${API}/tags`, h),
                axios.get(`${API}/products/recent`, h),
                axios.get(`${API}/users/recent`, h),
            ])
            setStats(s.data)
            setUserGrowth(ug.data.map(d => ({ ...d, date: formatDate(d.date) })))
            setProductTrends(pt.data.map(d => ({ ...d, date: formatDate(d.date) })))
            setCategories(cat.data)
            setTopTags(tags.data)
            setRecentProducts(rp.data)
            setRecentUsers(ru.data)
        } catch (err) {
            showToast?.('Failed to load admin data', 'error')
        }
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    const handleDeleteUser = async (id) => {
        if (!confirm('Delete this user?')) return
        try {
            await axios.delete(`${API}/users/${id}`, getHeaders())
            showToast?.('User deleted')
            fetchData()
        } catch (err) {
            showToast?.(err.response?.data?.error || 'Delete failed', 'error')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-[3px] border-border border-t-accent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1200px] mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white">
                    <Shield size={20} />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Admin Dashboard</h1>
                    <p className="text-[13px] text-text3">Platform overview and analytics</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} growth={stats?.userGrowth} color="bg-blue-100 text-blue-600" delay={0} />
                <StatCard title="Total Products" value={stats?.totalProducts || 0} icon={Package} growth={stats?.productGrowth} color="bg-emerald-100 text-emerald-600" delay={0.05} />
                <StatCard title="Categories" value={stats?.totalCategories || 0} icon={FolderOpen} color="bg-amber-100 text-amber-600" delay={0.1} />
                <StatCard title="Unique Tags" value={stats?.totalTags || 0} icon={Tag} color="bg-purple-100 text-purple-600" delay={0.15} />
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-2 gap-4 mb-4">
                <ChartCard title="📦 Products Created (Last 30 Days)" delay={0.2}>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={productTrends}>
                            <defs>
                                <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e2d9" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9e9b93" />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9e9b93" />
                            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e2d9', fontSize: 13 }} />
                            <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} fill="url(#colorProducts)" name="Products" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="👥 User Registrations (Last 30 Days)" delay={0.25}>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={userGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e2d9" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9e9b93" />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9e9b93" />
                            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e2d9', fontSize: 13 }} />
                            <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={2.5} dot={{ r: 4, fill: '#059669' }} name="Users" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Charts Row 2 */}
            <div className="grid lg:grid-cols-2 gap-4 mb-4">
                <ChartCard title="📊 Category Distribution" delay={0.3}>
                    {categories.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={categories}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={100}
                                    dataKey="value" nameKey="name"
                                    paddingAngle={3}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {categories.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e2d9', fontSize: 13 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[280px] text-text3 text-sm">No category data yet</div>
                    )}
                </ChartCard>

                <ChartCard title="🏷️ Top Tags" delay={0.35}>
                    {topTags.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={topTags} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e2d9" />
                                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9e9b93" />
                                <YAxis dataKey="tag" type="category" tick={{ fontSize: 11 }} stroke="#9e9b93" width={80} />
                                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e2d9', fontSize: 13 }} />
                                <Bar dataKey="count" name="Usage" radius={[0, 6, 6, 0]}>
                                    {topTags.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[280px] text-text3 text-sm">No tag data yet</div>
                    )}
                </ChartCard>
            </div>

            {/* Tables Row */}
            <div className="grid lg:grid-cols-2 gap-4">
                <ChartCard title="🛒 Recent Products" delay={0.4}>
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
                                {recentProducts.map(p => (
                                    <tr key={p._id} className="border-b border-border/50 hover:bg-bg3 transition-colors">
                                        <td className="py-2.5 font-semibold truncate max-w-[150px]">{p.name}</td>
                                        <td className="py-2.5">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold">
                                                {p.specs?.category || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-text3">{new Date(p.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {recentProducts.length === 0 && (
                                    <tr><td colSpan={3} className="py-6 text-center text-text3">No products yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </ChartCard>

                <ChartCard title="👤 Recent Users" delay={0.45}>
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
                                {recentUsers.map(u => (
                                    <tr key={u._id} className="border-b border-border/50 hover:bg-bg3 transition-colors">
                                        <td className="py-2.5 font-semibold">{u.name}</td>
                                        <td className="py-2.5 text-text3 truncate max-w-[140px]">{u.email}</td>
                                        <td className="py-2.5">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-bg3 text-text3'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-right">
                                            {u.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleDeleteUser(u._id)}
                                                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {recentUsers.length === 0 && (
                                    <tr><td colSpan={4} className="py-6 text-center text-text3">No users yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </ChartCard>
            </div>
        </motion.div>
    )
}