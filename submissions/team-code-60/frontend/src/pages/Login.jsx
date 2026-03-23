import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Loader2, Sparkles, ArrowRight, Zap, BarChart3, Target } from 'lucide-react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      onLogin(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-600 via-purple-600 to-brand-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="animate-slide-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <span className="text-2xl font-bold">MarketAI</span>
            </div>
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              AI-Powered<br />Marketing<br />
              <span className="text-yellow-300">Made Simple</span>
            </h1>
            <p className="text-lg text-white/80 mb-10 max-w-md">
              Generate SEO content, social media captions, and campaign variations in seconds with cutting-edge AI.
            </p>
          </div>
          <div className="space-y-4 animate-slide-up-delay-2 opacity-0">
            {[
              { icon: Zap, text: 'Generate campaigns in seconds' },
              { icon: BarChart3, text: 'A/B test with 3 variation styles' },
              { icon: Target, text: 'SEO-optimized content ready to publish' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 gradient-mesh dark:bg-gray-950">
        <div className="w-full max-w-md animate-scale-in opacity-0">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">MarketAI</span>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 p-8 border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Enter your credentials to continue</p>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium animate-scale-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-500 transition-colors z-10" />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-500 transition-colors z-10" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                  Create free account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
