import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, RefreshCw, Sparkles, ShieldCheck, Mail } from 'lucide-react';

function VerifyOTP({ onLogin }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  if (!email) { navigate('/signup'); return null; }

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/verify-otp', { email, otp: code });
      onLogin(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await axios.post('/api/auth/resend-otp', { email });
      setSuccess('OTP resent! Check your email or terminal.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh dark:bg-gray-950 p-4">
      <div className="w-full max-w-md animate-scale-in opacity-0">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">MarketAI</span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 p-8 border border-gray-100 dark:border-gray-800 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-brand-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verify your email</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-1">We sent a 6-digit code to</p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <Mail className="w-4 h-4 text-brand-500" />
            <span className="text-brand-600 font-semibold text-sm">{email}</span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium animate-scale-in">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium animate-scale-in">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 dark:border-gray-700 rounded-xl
                             focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/40
                             transition-all duration-200 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                />
              ))}
            </div>

            <button type="submit" disabled={loading || otp.join('').length !== 6} className="btn-primary w-full flex items-center justify-center gap-2 mb-4">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify Email</>}
            </button>
          </form>

          <button onClick={handleResend} disabled={resending}
            className="text-sm text-gray-500 hover:text-brand-600 transition-colors font-medium flex items-center gap-2 mx-auto">
            {resending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Resend code
          </button>

          <p className="text-xs text-gray-400 mt-6">Tip: Check the backend terminal for the OTP code</p>
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;
