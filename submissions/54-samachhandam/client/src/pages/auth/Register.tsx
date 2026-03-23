import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Recycle, ArrowRight, Loader2, AlertCircle, Home, Briefcase, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { MessageSquare } from "lucide-react";
import { cn } from '@/utils/cn';


export default function Register() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');

  // Step 2 Fields
  const [location, setLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [locationStatus, setLocationStatus] = useState<'home' | 'work'>('home');
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (step === 1) {
      if (!name || !email || !password || !mobile) {
        setError("Please fill in all basic information fields.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      if (mobile.length < 10) {
        setError("Please enter a valid mobile number");
        return;
      }
      setStep(2);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            if (data.address) {
              setCity(data.address.city || data.address.town || data.address.village || '');
              setPostalCode(data.address.postcode || '');
              setState(data.address.state || '');
              setCountry(data.address.country || '');
              setLocation(data.display_name || '');
            }
          } catch (err) {
            console.error("Error fetching address:", err);
            setError("Could not fetch address details automatically.");
          } finally {
            setIsLocating(false);
          }
        },
        (err) => {
          console.error("Error getting location:", err);
          setError("Location access denied. Please enter details manually.");
          setIsLocating(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!location || !city || !postalCode || !state || !country) {
      setError("Please fill in all location details.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        mobile,
        role: 'user' as const,
        location: {
          lat: coords?.lat || 0,
          lng: coords?.lng || 0,
          address: location,
          landmark,
          city,
          postalCode,
          state,
          country
        },
        locationStatus
      };

      const response = await api.auth.register(payload);

      if (response && response.success && 'data' in response) {
        await login(response.data.auth.accessToken, response.data.user);
        navigate('/dashboard');
      } else if (response && !response.success) {
        setError(response.message || 'Registration failed');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-white transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-4 z-10 w-full max-w-6xl mx-auto py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center w-full">
          {/* Left Side */}
          <div className="hidden lg:flex flex-col space-y-8 max-w-lg order-2 lg:order-1">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 w-fit group">
              <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-indigo-600/20 group-hover:shadow-indigo-600/40 transition-all duration-300">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600">
                ResolveX
              </span>
            </Link>

            {/* Content */}
            <div className="space-y-5 pt-4 text-zinc-600">

              {/* Heading */}
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-zinc-900">
                Start your <br />Smart Support <span className="text-primary">Journey.</span>
              </h1>

              {/* Description */}
              <p className="text-lg pb-4 leading-relaxed">
                Resolve issues faster with AI-powered complaint management. Create tickets seamlessly,
                track progress in real-time, and get intelligent support routing for quicker resolutions.
              </p>

              {/* Features */}
              <div className="space-y-5 pt-4">
                {[
                  {
                    title: "AI Complaint Handling",
                    desc: "Automatically detect user intent and generate structured support tickets"
                  },
                  {
                    title: "Smart Priority Routing",
                    desc: "Assign and prioritize issues based on severity and urgency"
                  },
                  {
                    title: "Real-Time Updates",
                    desc: "Track status, receive notifications, and chat with support instantly"
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 group">

                    {/* Icon */}
                    <div className="mt-1 bg-primary/20 p-1.5 rounded-full group-hover:bg-primary/30 transition">
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>

                    {/* Text */}
                    <div>
                      <h3 className="font-semibold text-zinc-900">{feature.title}</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">{feature.desc}</p>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex justify-center w-full order-1 lg:order-2">
            <Card className="w-full max-w-md border-0 shadow-2xl shadow-zinc-200/50 bg-white/80 backdrop-blur-xl ring-1 ring-zinc-200">
              <CardHeader className="space-y-3 pb-6 text-center">
                <div className="lg:hidden flex items-center justify-center gap-2 mb-2">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Recycle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-zinc-900">ResolveX</span>
                </div>
                <CardTitle className="text-2xl lg:text-3xl font-bold text-zinc-900">
                  {step === 1 ? 'Create an account' : 'Almost there'}
                </CardTitle>
                <CardDescription className="text-base text-zinc-500">
                  {step === 1 ? 'Step 1 of 2: Basic Information' : 'Step 2 of 2: Your Location'}
                </CardDescription>
              </CardHeader>
              <form onSubmit={step === 1 ? handleNextStep : handleRegister}>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  {step === 1 ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Full Name</label>
                        <Input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="h-11 bg-zinc-50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Email address</label>
                        <Input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 bg-zinc-50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Password</label>
                        <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 bg-zinc-50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Mobile Number</label>
                        <Input type="tel" placeholder="+91 98765 43210" value={mobile} onChange={(e) => setMobile(e.target.value)} required className="h-11 bg-zinc-50" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Select Location</label>
                        <div className="relative">
                          <Input placeholder="Enter or fetch location" value={location} onChange={(e) => setLocation(e.target.value)} required className="h-11 bg-zinc-50 pr-24" />
                          <button
                            type="button"
                            onClick={handleGetLocation}
                            disabled={isLocating}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-xs font-bold hover:bg-blue-200"
                          >
                            {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Get GPS'}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Landmarks</label>
                        <Input type="text" placeholder="Near Central Park" value={landmark} onChange={(e) => setLandmark(e.target.value)} className="h-11 bg-zinc-50" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700">City</label>
                          <Input type="text" value={city} onChange={(e) => setCity(e.target.value)} required className="h-11 bg-zinc-50" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700">Postal Code</label>
                          <Input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required className="h-11 bg-zinc-50" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700">State</label>
                          <Input type="text" value={state} onChange={(e) => setState(e.target.value)} required className="h-11 bg-zinc-50" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-700">Country</label>
                          <Input type="text" value={country} onChange={(e) => setCountry(e.target.value)} required className="h-11 bg-zinc-50" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Location Type</label>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setLocationStatus('home')}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border-2 transition-all",
                              locationStatus === 'home' ? "border-blue-600 bg-blue-50 text-blue-600" : "border-zinc-100 bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                            )}
                          >
                            <Home className="w-4 h-4" /> Home
                          </button>
                          <button
                            type="button"
                            onClick={() => setLocationStatus('work')}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border-2 transition-all",
                              locationStatus === 'work' ? "border-blue-600 bg-blue-50 text-blue-600" : "border-zinc-100 bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                            )}
                          >
                            <Briefcase className="w-4 h-4" /> Work
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-2">
                  <div className="flex gap-3 w-full">
                    {step === 2 && (
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-11 px-4">
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className="flex-1 h-11 text-base bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <>
                          {step === 1 ? 'Next Step' : 'Create Account'}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-center text-sm text-zinc-500 pt-2 flex flex-col gap-2">
                    <div>
                      Already have an account?{' '}
                      <Link to="/login" className="font-semibold text-blue-600 hover:underline">Sign in</Link>
                    </div>
                    <div className="pt-2 border-t border-zinc-100">
                      Are you a worker?{' '}
                      <Link to="/register/worker" className="font-semibold text-blue-600 hover:underline">Register as Worker</Link>
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
