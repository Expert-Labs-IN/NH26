import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { cn } from '@/utils/cn';
import { AlertCircle, ArrowRight, Briefcase, Calendar, Check, ChevronLeft, Loader2, MapPin } from 'lucide-react';

export default function WorkerRegister() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');

  // Step 2 Fields
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

  const [availableOccupations, setAvailableOccupations] = useState<{ _id: string, name: string }[]>([]);
  const [occupations, setOccupations] = useState<string[]>([]);
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2) {
      fetchInitialData();
    }
  }, [step]);

  const fetchInitialData = async () => {
    try {
      const response = await api.occupation.getAllOccupations();
      // Handle different API response structures
      const data = response?.data || response || [];
      setAvailableOccupations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching occupations:", err);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !mobile || !password) {
      setError("Please fill all basic info");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (mobile.length < 10) {
      setError("Please enter a valid mobile number");
      return;
    }
    setStep(2);
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
              setCity(data.address.city || data.address.town || data.address.village || "");
              setPostalCode(data.address.postcode || '');
            }
          } catch (err) {
            console.error("Error fetching address:", err);
            setError("GPS located but address lookup failed. Please enter details manually.");
          } finally {
            setIsLocating(false);
          }
        },
        (err) => {
          console.error("Error getting location:", err);
          setError("GPS access denied. You can still enter your city and postal code manually.");
          setIsLocating(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const toggleDay = (day: string) => {
    setWorkingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleAllDays = () => {
    if (workingDays.length === days.length) {
      setWorkingDays([]);
    } else {
      setWorkingDays([...days]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Final Validation
    if (occupations.length === 0) {
       setError("Please select at least one occupation");
       return;
    }
    if (workingDays.length === 0) {
       setError("Please select your working days");
       return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        mobile,
        role: 'worker' as const,
        location: [
          coords?.lng || 0,
          coords?.lat || 0,
        ] as [number, number],
        occupation_object_id: occupations[0],
        working_days: workingDays,
        start_time: startTime,
        end_time: endTime,
      };

      const response = await api.auth.registerWorker(payload);

      if (response && response.success) {
        // Correctly handle the response data structure from AuthController
        const loginData = response.data;
        if (loginData?.auth?.accessToken) {
          await login(loginData.auth.accessToken, loginData.user);
          navigate('/worker');
        } else {
           setError("Registration successful but login failed. Please sign in.");
           setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        setError(response?.message || 'Registration failed. Check your connection.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex relative overflow-hidden bg-white selection:bg-blue-100">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[60%] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-4 z-10 w-full max-w-6xl mx-auto py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center w-full">
          <div className="hidden lg:flex flex-col space-y-8 max-w-lg">
            <Link to="/" className="flex items-center gap-3 w-fit group">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/40 transition-all">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold tracking-tight text-zinc-900">ResolveX</span>
            </Link>

            <div className="space-y-6 text-zinc-600">
              <h1 className="text-5xl font-bold leading-tight text-zinc-900 tracking-tight">
                Empowering the<br />Frontline Workforce<span className="text-blue-600">.</span>
              </h1>
              <p className="text-lg leading-relaxed">
                Join our network of skilled workers and start resolving community complaints efficiently. 
                Get real-time tasks, smart routing, and fair rewards.
              </p>

              <div className="space-y-6 pt-4">
                {[
                  { title: "Smart Scheduling", desc: "Automated task assignment based on your availability and location." },
                  { title: "Real-time Tracking", desc: "Navigate effortlessly to complaint sites with built-in mapping." },
                  { title: "Digital Proof of Work", desc: "Upload photos and completions directly through the app." }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 group">
                    <div className="mt-1 bg-blue-50 p-1.5 rounded-full group-hover:bg-blue-100 transition">
                      <Check className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 leading-none mb-1">{feature.title}</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <Card className="w-full max-w-md border border-zinc-200 shadow-2xl shadow-zinc-200/50 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
              <CardHeader className="space-y-1 pb-6 text-center bg-zinc-50/50 border-b border-zinc-100">
                <CardTitle className="text-2xl font-bold text-zinc-900">
                  {step === 1 ? 'Join the Fleet' : 'Configure Service'}
                </CardTitle>
                <CardDescription className="text-sm font-medium uppercase tracking-widest text-zinc-400">
                  Step {step} of 2
                </CardDescription>
              </CardHeader>
              <form onSubmit={step === 1 ? handleNextStep : handleRegister}>
                <CardContent className="space-y-5 pt-8">
                  {error && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-sm text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p className="font-medium">{error}</p>
                    </div>
                  )}

                  {step === 1 ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Full Name</label>
                        <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="h-12 bg-white rounded-xl border-zinc-200 focus:ring-blue-500/20" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Email address</label>
                        <Input type="email" placeholder="worker@resolvex.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 bg-white rounded-xl border-zinc-200" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Mobile Number</label>
                        <Input type="tel" placeholder="+91 98765 43210" value={mobile} onChange={(e) => setMobile(e.target.value)} required className="h-12 bg-white rounded-xl border-zinc-200" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Security Password</label>
                        <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 bg-white rounded-xl border-zinc-200" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1 flex items-center justify-between">
                          Work Location
                          <button
                            type="button"
                            onClick={handleGetLocation}
                            disabled={isLocating}
                            className="text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-700 disabled:opacity-50 transition-all font-bold tracking-widest uppercase"
                          >
                            {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                            Auto-Detect GPS
                          </button>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required className="h-12 bg-white rounded-xl border-zinc-200" />
                            <Input placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required className="h-12 bg-white rounded-xl border-zinc-200" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Primary Occupation</label>
                        <select
                          className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val && !occupations.includes(val)) {
                              setOccupations([val]); // Single selection for simplicity in step 2
                            }
                          }}
                          value={occupations[0] || ""}
                        >
                          <option value="">Choose your specialty...</option>
                          {availableOccupations.map(occ => (
                            <option key={occ._id} value={occ._id}>{occ.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Available Days
                          </label>
                          <button type="button" onClick={toggleAllDays} className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">
                            {workingDays.length === days.length ? 'Clear All' : 'Select All'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {days.map(day => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all uppercase tracking-wider shadow-sm",
                                workingDays.includes(day) ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-zinc-200 text-zinc-400 hover:border-blue-400"
                              )}
                            >
                              {day.slice(0, 3)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1 flex items-center gap-2">
                             Start Shift
                          </label>
                          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="h-12 bg-white rounded-xl border-zinc-200" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1 flex items-center gap-2">
                             End Shift
                          </label>
                          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="h-12 bg-white rounded-xl border-zinc-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-6 pb-8 px-6">
                  <div className="flex gap-3 w-full">
                    {step === 2 && (
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-12 px-5 rounded-xl border-zinc-200 text-zinc-500 hover:bg-zinc-50">
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className="flex-1 h-12 text-sm font-bold uppercase tracking-widest bg-zinc-900 hover:bg-blue-600 text-white transition-all rounded-xl relative overflow-hidden group shadow-xl shadow-zinc-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          {step === 1 ? 'Configure Work Details' : 'Finalize Registration'}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </div>

                  <p className="text-center text-[11px] font-semibold text-zinc-400 uppercase tracking-widest pt-2">
                    Already registered? <Link to="/login" className="text-blue-600 hover:underline">Sign In here</Link>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
