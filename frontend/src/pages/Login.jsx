import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'employee') navigate('/employee', { replace: true });
      else if (user.role === 'manager') navigate('/manager', { replace: true });
      else if (user.role === 'finance') navigate('/finance', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Get the updated user from localStorage since setUser is async
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo?.role === 'employee') navigate('/employee', { replace: true });
      else if (userInfo?.role === 'manager') navigate('/manager', { replace: true });
      else if (userInfo?.role === 'finance') navigate('/finance', { replace: true });
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-6 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] text-brand-500/10 dark:text-brand-400/10 animate-float" style={{ animationDelay: '0s', animationDuration: '7s' }}>
          <svg className="w-40 h-40 transform -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="absolute top-[15%] right-[15%] text-indigo-500/10 dark:text-indigo-400/10 animate-float" style={{ animationDelay: '2s', animationDuration: '9s' }}>
          <svg className="w-32 h-32 transform rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div className="absolute bottom-[10%] left-[20%] text-emerald-500/10 dark:text-emerald-400/10 animate-float" style={{ animationDelay: '1s', animationDuration: '8s' }}>
          <svg className="w-48 h-48 transform rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="absolute bottom-[15%] right-[10%] text-brand-600/5 dark:text-brand-500/5 animate-pulse-slow">
          <svg className="w-64 h-64 transform -rotate-12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
          </svg>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-6xl grid lg:grid-cols-5 gap-6 relative z-10">
        <div className="glass-card lg:col-span-3 p-8 animate-slide-up">
          <div className="mb-8">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider border border-brand-200">
              AuditFlow Platform
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white tracking-tight mt-4">
              Multi-Tier Expense Approvals With Full Visibility
            </h1>
            <p className="text-surface-600 dark:text-surface-300 mt-3 leading-relaxed">
              Submit, review, and finalize expenses through a clear workflow. Every role sees the right data at the right time, with risk checks and timeline tracking built in.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-surface-200 dark:border-surface-700 bg-white/80 dark:bg-surface-900/60 p-4">
              <p className="text-sm font-semibold text-surface-800 dark:text-white">Faster Turnaround</p>
              <p className="text-xs text-surface-500 mt-1">Auto-approve small tickets and route only what needs review.</p>
            </div>
            <div className="rounded-xl border border-surface-200 dark:border-surface-700 bg-white/80 dark:bg-surface-900/60 p-4">
              <p className="text-sm font-semibold text-surface-800 dark:text-white">Transparent Tracking</p>
              <p className="text-xs text-surface-500 mt-1">Live status, decision remarks, and full approval timeline.</p>
            </div>
            <div className="rounded-xl border border-surface-200 dark:border-surface-700 bg-white/80 dark:bg-surface-900/60 p-4">
              <p className="text-sm font-semibold text-surface-800 dark:text-white">Data-Driven Finance</p>
              <p className="text-xs text-surface-500 mt-1">Monthly category health plus year-wide spend insights.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-surface-50/70 dark:bg-surface-900/50 p-5 mb-6">
            <h2 className="text-sm font-bold text-surface-800 dark:text-surface-100 uppercase tracking-wider mb-3">Workflow Snapshot</h2>
            <div className="space-y-3">
              {[
                { title: '1. Employee Submission', detail: 'Submit amount, category, description, and receipt with OCR assistance.' },
                { title: '2. Manager Review', detail: 'Department managers approve, reject, or escalate high-value requests.' },
                { title: '3. Finance Finalization', detail: 'Finance validates policy, confirms risk, and closes the request.' }
              ].map((step) => (
                <div key={step.title} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5"></div>
                  <div>
                    <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">{step.title}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="glass-card p-8 lg:col-span-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500/10 dark:bg-brand-500/20 rounded-2xl mb-4 border border-brand-500/20 shadow-glow-brand animate-float">
              <svg className="w-8 h-8 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">Sign In</h2>
            <p className="text-surface-500 dark:text-surface-300 mt-2 font-medium">Access your role-specific workspace</p>
          </div>

          {error && (
            <div className="bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm font-semibold backdrop-blur-sm shadow-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-100 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-100 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Log In Securely'
              )}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50/70 dark:bg-surface-900/40 p-4">
            <p className="text-xs font-semibold text-surface-700 dark:text-surface-200 uppercase tracking-wider mb-1">Security Note</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Access is role-based. Data views and actions are restricted based on your assigned role and approval level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
