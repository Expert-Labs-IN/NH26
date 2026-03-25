import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import PageShell from '../components/PageShell'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import styles from './LandingPage.module.css'

export default function LandingPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleStart = (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    sessionStorage.setItem('userName', name.trim())
    sessionStorage.setItem('userEmail', email.trim())
    navigate('/chat')
  }

  const handleGoogleSuccess = async (response) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const res = await fetch(`${apiUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential })
      })
      const data = await res.json()
      if (data.token) {
        sessionStorage.setItem('token', data.token)
        sessionStorage.setItem('userName', data.user.name)
        sessionStorage.setItem('userEmail', data.user.email)
        sessionStorage.setItem('userAvatar', data.user.avatar || '')
        navigate('/chat')
      } else {
        alert('Backend rejected Google token: ' + (data.error || 'Unknown error. Check if GOOGLE_CLIENT_ID matches in server/.env'))
      }
    } catch (err) {
      console.error('Google login failed:', err)
      alert('Network error connecting to backend auth route.')
    }
  }

  return (
    <PageShell>
      <nav className={styles.nav}>
        <span className={styles.navLogo}>
          <Logo size={22} />
          SmartDesk
        </span>
        <div className={styles.navRight}>
          <a href="/agent/login" className={styles.navLink}>Agent Sign In</a>
          <ThemeToggle />
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>AI-Powered Support</span>

          <h1 className={styles.heroTitle}>
            Support that<br /><span>actually helps.</span>
          </h1>

          <p className={styles.heroSub}>
            Get instant answers from our AI. Complex issues are escalated to a human agent automatically — no hold music, no waiting.
          </p>

          <div className={styles.card}>
            <p className={styles.cardTitle}>Get started</p>
            <p className={styles.cardSub}>Sign in with Google or continue as a guest.</p>

            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert('Google returned an error. Check VITE_GOOGLE_CLIENT_ID in .env')}
              />
            </div>

            <div className={styles.divider}>or continue manually</div>

            <form onSubmit={handleStart} className={styles.form}>
              <div>
                <label className={styles.fieldLabel} htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={styles.fieldLabel} htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn}>Start Guest Chat</button>
            </form>

            <div className={styles.divider}>or</div>
            <p className={styles.agentLink}>
              Support agent? <a href="/agent/login">Sign in here</a>
            </p>
          </div>
        </div>
      </section>

    </PageShell>
  )
}
