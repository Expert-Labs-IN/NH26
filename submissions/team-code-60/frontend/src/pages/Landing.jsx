import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Zap, BarChart3, Target, Shield, Globe, Cpu,
  Instagram, Linkedin, FileText, Hash, Heart, DollarSign, Wand2,
  ChevronRight, Star, Users, TrendingUp, Layers, Twitter, Facebook
} from 'lucide-react';

const features = [
  {
    icon: Wand2,
    title: 'AI Campaign Generator',
    desc: 'Enter your product details and get complete marketing campaigns generated in seconds by cutting-edge AI models.',
    color: 'from-brand-500 to-purple-500',
  },
  {
    icon: Layers,
    title: 'A/B Variations',
    desc: 'Get 3 unique content variations — Emotional, Technical, and Sales — to test what resonates with your audience.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: FileText,
    title: 'SEO-Optimized Content',
    desc: 'Generate SEO descriptions, meta tags, and keyword-rich content that ranks higher on search engines.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Instagram,
    title: 'Social Media Ready',
    desc: 'Get platform-specific captions for Instagram and LinkedIn, complete with emojis, hashtags, and CTAs.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Cpu,
    title: 'Multi-Model Support',
    desc: 'Choose between Groq (Llama 3.3 70B) and Google Gemini for different writing styles and outputs.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    desc: 'Your data is encrypted and never shared. OTP-verified accounts with JWT authentication keep you safe.',
    color: 'from-amber-500 to-yellow-500',
  },
];

const stats = [
  { value: '10x', label: 'Faster Content', icon: Zap },
  { value: '3', label: 'A/B Variations', icon: BarChart3 },
  { value: '6', label: 'Content Types', icon: Target },
  { value: '100%', label: 'AI Powered', icon: Sparkles },
];

const outputTypes = [
  { icon: FileText, label: 'SEO Web Description', color: 'bg-brand-500' },
  { icon: Instagram, label: 'Instagram Caption', color: 'bg-pink-500' },
  { icon: Linkedin, label: 'LinkedIn Post', color: 'bg-blue-600' },
  { icon: Twitter, label: 'Twitter / X Post', color: 'bg-sky-500' },
  { icon: Facebook, label: 'Facebook Post', color: 'bg-blue-700' },
  { icon: Hash, label: 'Dynamic Tags', color: 'bg-amber-500' },
];

const variations = [
  { icon: Heart, label: 'Emotional', desc: 'Lifestyle & feeling-focused', color: 'from-pink-50 to-rose-50', border: 'border-pink-200', text: 'text-pink-600' },
  { icon: Cpu, label: 'Technical', desc: 'Feature & spec-focused', color: 'from-blue-50 to-cyan-50', border: 'border-blue-200', text: 'text-blue-600' },
  { icon: DollarSign, label: 'Sales', desc: 'Conversion & CTA-focused', color: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-600' },
];

function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-purple-600 rounded-xl flex items-center justify-center shadow-brand">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">MarketAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">How It Works</a>
            <a href="#variations" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">A/B Testing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-brand-600 transition-colors px-4 py-2">
              Login
            </Link>
            <Link to="/signup" className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-200 rounded-full blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 border border-brand-100 rounded-full mb-8">
              <Zap className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-semibold text-brand-700">Powered by Groq & Gemini AI</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
              Generate Marketing<br />
              Campaigns with{' '}
              <span className="text-gradient">AI Magic</span>
            </h1>

            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Create SEO content, social media captions, and A/B variations in seconds. 
              Just describe your product and let AI do the heavy lifting.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/signup" className="btn-primary text-base px-8 py-4 flex items-center gap-2 shadow-2xl shadow-brand-200">
                Start Generating Free <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#how-it-works" className="btn-secondary text-base px-8 py-4 flex items-center gap-2">
                See How It Works <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="animate-slide-up-delay-2 opacity-0">
            <div className="inline-flex flex-wrap justify-center gap-8 sm:gap-12 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 px-8 sm:px-12 py-6">
              {stats.map(({ value, label, icon: Icon }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 rounded-full mb-4">
              <Star className="w-3.5 h-3.5 text-brand-600" />
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">Features</span>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              A complete AI marketing toolkit designed to save you hours of content creation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 card-hover group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full mb-4">
              <Globe className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">How It Works</span>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Three Simple Steps</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">From product details to full campaigns in under 30 seconds.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Describe Your Product', desc: 'Enter your product name, description, and optional details like color and material.', icon: FileText },
              { step: '02', title: 'Choose AI Model', desc: 'Select Groq (Llama 3.3) or Gemini and click Generate Campaign.', icon: Cpu },
              { step: '03', title: 'Get Full Campaign', desc: 'Receive SEO content, social captions, tags, and 3 A/B variations instantly.', icon: Sparkles },
            ].map(({ step, title, desc, icon: Icon }, i) => (
              <div key={i} className="relative text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl mb-6 shadow-brand group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 sm:right-auto sm:left-1/2 sm:ml-6 w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-extrabold text-brand-700">{step}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Output Types */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Content Types</span>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">What You Get</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Every generation produces 6 types of marketing content, ready to copy and use.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {outputTypes.map(({ icon: Icon, label, color }, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 text-center card-hover">
                <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{label}</h3>
                <p className="text-xs text-gray-400">One-click copy</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A/B Variations */}
      <section id="variations" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-full mb-4">
              <BarChart3 className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">A/B Variations</span>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Test What Works Best</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Each campaign generates 3 distinct content variations targeting different audience mindsets.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {variations.map(({ icon: Icon, label, desc, color, border, text }, i) => (
              <div key={i} className={`rounded-2xl border ${border} bg-gradient-to-br ${color} p-8 text-center card-hover`}>
                <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-5 shadow-sm`}>
                  <Icon className={`w-7 h-7 ${text}`} />
                </div>
                <h3 className={`text-xl font-bold ${text} mb-2`}>{label}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-purple-600 to-brand-800" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            Ready to 10x Your<br />Marketing Content?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            Join the platform and start generating AI-powered campaigns in seconds. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="bg-white text-brand-700 font-bold rounded-xl px-8 py-4 text-base hover:bg-gray-50 transition-all duration-200 shadow-xl flex items-center gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="text-white/90 font-semibold border border-white/30 rounded-xl px-8 py-4 text-base hover:bg-white/10 transition-all duration-200 flex items-center gap-2">
              Login to Account <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">MarketAI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#variations" className="hover:text-white transition-colors">A/B Testing</a>
            </div>
            <p className="text-sm text-gray-500">&copy; 2026 MarketAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
