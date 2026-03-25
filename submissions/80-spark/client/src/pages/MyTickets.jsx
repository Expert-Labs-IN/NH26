import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import PageShell from '../components/PageShell'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import styles from './MyTickets.module.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const SOCKET_URL = API_URL

const STATUS_META = {
    open: { label: 'Open', emoji: '🔵', cls: 'statusOpen' },
    'in-progress': { label: 'In Progress', emoji: '🟠', cls: 'statusProgress' },
    resolved: { label: 'Resolved', emoji: '🟢', cls: 'statusResolved' },
    closed: { label: 'Closed', emoji: '⚪', cls: 'statusClosed' },
}

const SEV_CLS = {
    Critical: 'sevCritical',
    High: 'sevHigh',
    Medium: 'sevMedium',
    Low: 'sevLow',
}

export default function MyTickets() {
    const navigate = useNavigate()
    const email = sessionStorage.getItem('userEmail')
    const name = sessionStorage.getItem('userName')
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const socketRef = useRef(null)

    useEffect(() => {
        if (!email) { navigate('/'); return }

        // Fetch tickets
        fetch(`${API_URL}/api/tickets/user/${encodeURIComponent(email)}`)
            .then(r => r.json())
            .then(data => { setTickets(Array.isArray(data) ? data : []); setLoading(false) })
            .catch(() => setLoading(false))

        // Real-time updates
        const socket = io(SOCKET_URL, { timeout: 3000, reconnectionAttempts: 3 })
        socketRef.current = socket

        socket.on('ticket_updated', (updated) => {
            setTickets(prev => prev.map(t =>
                (t._id === updated._id || t.ticketId === updated.ticketId)
                    ? { ...t, ...updated }
                    : t
            ))
        })

        socket.on('new_ticket', (ticket) => {
            if (ticket.userEmail === email) {
                setTickets(prev => {
                    if (prev.find(t => t.ticketId === ticket.ticketId)) return prev
                    return [ticket, ...prev]
                })
            }
        })

        return () => socket.disconnect()
    }, [])

    const filtered = filter === 'all'
        ? tickets
        : tickets.filter(t => t.status === filter)

    const counts = {
        all: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        'in-progress': tickets.filter(t => t.status === 'in-progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
    }

    const ago = (date) => {
        if (!date) return ''
        const diff = Date.now() - new Date(date).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'just now'
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        const days = Math.floor(hrs / 24)
        return `${days}d ago`
    }

    return (
        <PageShell>
            <div className={styles.page}>
                <nav className={styles.nav}>
                    <div className={styles.navLeft}>
                        <Logo size={20} />
                        SmartDesk
                    </div>
                    <div className={styles.navRight}>
                        <span className={styles.userName}>{name || email}</span>
                        <ThemeToggle />
                        <button className={styles.backBtn} onClick={() => navigate('/chat')}>
                            ← Back to Chat
                        </button>
                    </div>
                </nav>

                <div className={styles.body}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>My Tickets</h1>
                        <p className={styles.subtitle}>{tickets.length} total ticket{tickets.length !== 1 ? 's' : ''}</p>
                    </div>

                    {/* Filter chips */}
                    <div className={styles.filterBar}>
                        {[
                            { value: 'all', label: `All (${counts.all})` },
                            { value: 'open', label: `Open (${counts.open})` },
                            { value: 'in-progress', label: `In Progress (${counts['in-progress']})` },
                            { value: 'resolved', label: `Resolved (${counts.resolved})` },
                        ].map(f => (
                            <button
                                key={f.value}
                                className={`${styles.filterChip} ${filter === f.value ? styles.filterActive : ''}`}
                                onClick={() => setFilter(f.value)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className={styles.loadingWrap}><div className={styles.spinner} /></div>
                    ) : filtered.length === 0 ? (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>📋</div>
                            <div className={styles.emptyTitle}>
                                {tickets.length === 0 ? 'No tickets yet' : 'No tickets match this filter'}
                            </div>
                            <div className={styles.emptyText}>
                                {tickets.length === 0
                                    ? 'Start a conversation with SmartDesk AI to create your first support ticket.'
                                    : 'Try a different filter to see your tickets.'}
                            </div>
                            {tickets.length === 0 && (
                                <button className={styles.startBtn} onClick={() => navigate('/chat')}>
                                    Start a Chat
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {filtered.map(ticket => {
                                const sm = STATUS_META[ticket.status] || STATUS_META.open
                                const sc = SEV_CLS[ticket.severity] || 'sevMedium'
                                return (
                                    <div key={ticket.ticketId} className={styles.card}>
                                        <div className={styles.cardTop}>
                                            <span className={styles.ticketId}>{ticket.ticketId}</span>
                                            <span className={`${styles.statusPill} ${styles[sm.cls]}`}>
                                                {sm.emoji} {sm.label}
                                            </span>
                                        </div>

                                        <p className={styles.summary}>
                                            {ticket.summary || 'No summary available'}
                                        </p>

                                        <div className={styles.badges}>
                                            <span className={`${styles.badge} ${styles[sc]}`}>{ticket.severity}</span>
                                            <span className={styles.categoryBadge}>{ticket.category}</span>
                                            {ticket.emotion && ticket.emotion !== 'Calm' && (
                                                <span className={styles.emotionBadge}>{ticket.emotion}</span>
                                            )}
                                        </div>

                                        <div className={styles.cardBottom}>
                                            <span className={styles.meta}>
                                                {ticket.assignedAgent
                                                    ? `👤 ${ticket.assignedAgent}`
                                                    : '⏳ Awaiting agent'}
                                            </span>
                                            <span className={styles.meta}>{ago(ticket.createdAt)}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </PageShell>
    )
}
