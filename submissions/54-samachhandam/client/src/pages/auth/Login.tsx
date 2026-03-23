import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Recycle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';

export default function Login() {
  const [mobile, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    if (user.role === 'admin') navigate('/admin');
    else if (user.role === 'worker') navigate('/worker');
    else navigate('/dashboard');
  }


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.auth.login({ mobile, password });

      if (response && response.success && 'data' in response) {
        await login(response.data.auth.accessToken, response.data.user);
        const role = response.data.user.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'worker') navigate('/worker');
        else navigate('/dashboard');
      } else if (response && !response.success) {
        setError(response.message || 'Login failed');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-white transition-colors duration-300">

      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-4 z-10 w-full max-w-6xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center w-full">

          {/* Left Side - Brand/Hero area */}
          {/* <div className="hidden lg:flex flex-col space-y-8 max-w-lg">
            <Link to="/" className="flex items-center gap-3 w-fit group">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/40 transition-all duration-300">
                <Recycle className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-zinc-900 to-zinc-600">
                UrbanClean AI
              </span>
            </Link>

            <div className="space-y-6 pt-4 text-zinc-600">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-zinc-900">
                Recycle Your <br /><span className="text-blue-600">Waste Material.</span>
              </h1>
              <p className="text-lg">
                Smart solutions for a cleaner urban environment. Track your recycling impact, report waste issues, and contribute to a sustainable future with AI-driven insights.
              </p>
            </div>
          </div> */}
          <div className="hidden lg:flex flex-col space-y-8 max-w-lg">
            <Link to="/" className="flex items-center gap-3 w-fit group">
              <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-indigo-600/20 group-hover:shadow-indigo-600/40 transition-all duration-300">
                {/* <Recycle className="w-8 h-8 text-white" /> */}
              </div>
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600">
                ResolveX
              </span>
            </Link>

            <div className="space-y-6 pt-4 text-zinc-600">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-zinc-900">
                Smart Complaint <br />
                <span className="text-primary">Resolution System.</span>
              </h1>
              <p className="text-lg">
                AI-powered support platform to handle customer queries efficiently. Automate ticket creation, classify issues by severity, and enable faster resolution through intelligent routing and real-time assistance.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center w-full">
            <Card className="w-full max-w-md border-0 shadow-2xl shadow-zinc-200/50 bg-white/80 backdrop-blur-xl ring-1 ring-zinc-200">
              <CardHeader className="space-y-3 pb-6 text-center">
                <div className="lg:hidden flex items-center justify-center gap-2 mb-2">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Recycle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-zinc-900">
                    UrbanClean AI
                  </span>
                </div>
                <CardTitle className="text-2xl lg:text-3xl font-bold text-zinc-900">Welcome back</CardTitle>
                <CardDescription className="text-base text-zinc-500">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-5">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-zinc-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="mobileNumber">
                      Mobile Number
                    </label>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={mobile}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="h-12 bg-zinc-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium leading-none text-zinc-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                        Password
                      </label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-zinc-50"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-4">
                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-600/25 group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>


                  <div className="text-center text-sm text-zinc-500 pt-2 flex flex-col gap-2">
                    <div>
                      Don't have an account?{' '}
                      <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                        Sign up
                      </Link>
                    </div>
                    <div className="pt-2 border-t border-zinc-100">
                      Are you a worker?{' '}
                      <Link to="/register/worker" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                        Register as Worker
                      </Link>
                    </div>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
