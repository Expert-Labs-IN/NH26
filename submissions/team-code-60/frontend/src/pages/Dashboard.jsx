import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LogOut, Sparkles, Wand2, LayoutDashboard, Rocket, ChevronRight,
  FileText, Image, Mail, Search, History, Clock, X, Moon, Sun, TrendingUp, Smartphone,
  Zap, BarChart3, Globe, Layers, Mic, Camera, Download
} from 'lucide-react';
import ProductForm from '../components/ProductForm';
import CampaignOutput from '../components/CampaignOutput';
import BannerGallery from '../components/BannerGallery';
import AdCopyOutput from '../components/AdCopyOutput';
import EmailCopyOutput from '../components/EmailCopyOutput';
import ContentScore from '../components/ContentScore';
import InstagramPreview from '../components/InstagramPreview';
import SocialPreviews from '../components/SocialPreviews';
import AudiencePersonas from '../components/AudiencePersonas';
import ExportPDF from '../components/ExportPDF';
import LoadingSkeleton from '../components/LoadingSkeleton';

import { Users as UsersIcon } from 'lucide-react';

const outputTabs = [
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'ads', label: 'Ad Copy', icon: Search },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'banners', label: 'Banners', icon: Image },
  { id: 'preview', label: 'Preview', icon: Smartphone },
  { id: 'social', label: 'Social', icon: Globe },
  { id: 'personas', label: 'Personas', icon: UsersIcon },
  { id: 'score', label: 'Score', icon: TrendingUp },
];

function Dashboard({ user, onLogout, dark, setDark }) {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastProduct, setLastProduct] = useState(null);
  const [lastModel, setLastModel] = useState(null);
  const [activeOutput, setActiveOutput] = useState('content');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeView, setActiveView] = useState('create');
  const [productImage, setProductImage] = useState(null);

  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    try {
      const res = await axios.get('/api/campaign/history', authHeaders);
      setHistory(res.data.data || []);
    } catch { /* ignore */ }
  };

  const loadCampaign = async (id) => {
    setLoading(true);
    setError('');
    setCampaign(null);
    setActiveView('create');
    setShowHistory(false);
    try {
      const res = await axios.get(`/api/campaign/${id}`, authHeaders);
      setCampaign(res.data.data);
      setActiveOutput('content');
    } catch (err) {
      setError('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const generateCampaign = async (productData, model, imgPreview) => {
    setLoading(true);
    setError('');
    setCampaign(null);
    setLastProduct(productData);
    setLastModel(model);
    setProductImage(imgPreview || null);
    setActiveOutput('content');
    try {
      const res = await axios.post('/api/campaign/generate', { productData, model }, authHeaders);
      setCampaign(res.data.data);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (lastProduct && lastModel) generateCampaign(lastProduct, lastModel);
    else setCampaign(null);
  };

  const statsCards = [
    { label: 'Campaigns', value: history.length, icon: Layers, color: 'from-brand-500 to-purple-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
    { label: 'Platforms', value: 5, icon: Globe, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'AI Models', value: 2, icon: Zap, color: 'from-orange-500 to-red-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Languages', value: 10, icon: BarChart3, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-purple-600 rounded-xl flex items-center justify-center shadow-brand">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">MarketAI</h1>
              <p className="text-[11px] text-gray-400 font-medium">AI Campaign Studio</p>
            </div>
          </div>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
            {[
              { id: 'create', label: 'Create', icon: Wand2 },
              { id: 'history', label: 'History', icon: History },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => { setActiveView(id); if (id === 'history') setShowHistory(true); else setShowHistory(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                  ${activeView === id ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setDark(!dark)}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
              {dark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/30 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-brand-700 dark:text-brand-300">{user.email}</span>
            </div>
            <button onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 text-sm font-medium">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 animate-slide-up">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjU2IDAgMyAxLjM0NCAzIDNzLTEuMzQ0IDMtMyAzLTMtMS4zNDQtMy0zIDEuMzQ0LTMgMy0zeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{greeting()}, {user.email?.split('@')[0]}!</h2>
              <p className="text-white/70 text-sm">Ready to create your next viral marketing campaign?</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-white/60 text-xs">
                  <Camera className="w-3.5 h-3.5" /> Image Scan
                </div>
                <div className="flex items-center gap-1.5 text-white/60 text-xs">
                  <Mic className="w-3.5 h-3.5" /> Voice Input
                </div>
                <div className="flex items-center gap-1.5 text-white/60 text-xs">
                  <Globe className="w-3.5 h-3.5" /> 10 Languages
                </div>
                <div className="flex items-center gap-1.5 text-white/60 text-xs">
                  <Download className="w-3.5 h-3.5" /> PDF Export
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <Sparkles className="w-16 h-16 text-white/10" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-slide-up">
          {statsCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-4 border border-transparent hover:shadow-md transition-all duration-200`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</span>
              </div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Campaign History Sidebar */}
          {showHistory && (
            <aside className="w-72 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 animate-slide-up flex-shrink-0 self-start sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Campaign History</h3>
                <button onClick={() => { setShowHistory(false); setActiveView('create'); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              {history.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No campaigns yet</p>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {history.map((c) => (
                    <button key={c._id} onClick={() => loadCampaign(c._id)}
                      className="w-full text-left p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-brand-200 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-all duration-200 group">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-brand-700 dark:group-hover:text-brand-400">
                        {c.productData?.name || 'Untitled'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 uppercase">{c.model}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeView === 'create' && (
              <>
                <div className="grid lg:grid-cols-5 gap-6">
                  {/* Left: Form (2/5) */}
                  <div className="lg:col-span-2 animate-slide-up">
                    <ProductForm onSubmit={generateCampaign} loading={loading} />
                  </div>

                  {/* Right: Output (3/5) */}
                  <div className="lg:col-span-3 animate-slide-up-delay">
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 px-5 py-4 rounded-2xl mb-6 text-sm font-medium animate-scale-in flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center flex-shrink-0">!</div>
                        <div>
                          <p className="font-semibold">Generation Failed</p>
                          <p className="text-red-500 dark:text-red-400 text-xs mt-0.5">{error}</p>
                        </div>
                      </div>
                    )}

                    {loading && <LoadingSkeleton />}

                    {campaign && !loading && (
                      <div className="animate-fade-in space-y-5">
                        {/* Output Tab Switcher */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-1.5 flex gap-1 overflow-x-auto">
                          {outputTabs.map(({ id, label, icon: Icon }) => (
                            <button key={id} onClick={() => setActiveOutput(id)}
                              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap
                                ${activeOutput === id ? 'bg-brand-600 text-white shadow-brand' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                              <Icon className="w-4 h-4" />
                              <span className="hidden sm:inline">{label}</span>
                            </button>
                          ))}
                        </div>

                        {/* Tab Content */}
                        {activeOutput === 'content' && (
                          <CampaignOutput data={campaign} onRegenerate={handleRegenerate} />
                        )}
                        {activeOutput === 'ads' && <AdCopyOutput adCopy={campaign.adCopy} />}
                        {activeOutput === 'email' && <EmailCopyOutput emailCopy={campaign.emailCopy} />}
                        {activeOutput === 'banners' && <BannerGallery banners={campaign.bannerUrls} productImage={productImage} price={lastProduct?.price} />}
                        {activeOutput === 'preview' && <InstagramPreview caption={campaign.instagram} productName={lastProduct?.name} />}
                        {activeOutput === 'social' && <SocialPreviews twitter={campaign.twitter} linkedin={campaign.linkedin} productName={lastProduct?.name} />}
                        {activeOutput === 'personas' && <AudiencePersonas productData={lastProduct} />}
                        {activeOutput === 'score' && <ContentScore contentScore={campaign.contentScore} />}

                        {/* Actions */}
                        <div className="flex gap-3">
                          <ExportPDF data={campaign} />
                        </div>
                      </div>
                    )}

                    {!campaign && !error && !loading && (
                      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-900/30 dark:to-purple-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
                          <Wand2 className="w-10 h-10 text-brand-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Ready to create magic?</h3>
                        <p className="text-gray-400 max-w-sm mx-auto mb-6">
                          Upload an image, use voice, or type your product details to generate a complete marketing campaign.
                        </p>
                        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                          {[
                            { icon: Camera, label: 'Image Scan', desc: 'Upload & auto-detect' },
                            { icon: Mic, label: 'Voice Input', desc: 'Speak to fill form' },
                            { icon: Wand2, label: 'AI Generate', desc: '5 platforms at once' },
                          ].map(({ icon: Icon, label, desc }) => (
                            <div key={label} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                              <Icon className="w-5 h-5 text-brand-500 mx-auto mb-1.5" />
                              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{label}</p>
                              <p className="text-[10px] text-gray-400">{desc}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-[11px] text-gray-400">
                          {['SEO Content', 'Ad Banners', 'Ad Copy', 'Email Templates', 'PDF Export', 'Instagram Preview', 'Quality Score'].map(f => (
                            <div key={f} className="flex items-center gap-1"><Rocket className="w-3 h-3" /> {f}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeView === 'history' && !showHistory && (
              <div className="text-center py-16">
                <History className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Select a campaign from the sidebar</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
