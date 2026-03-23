import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Wand2, Package, FileText, Palette, Layers, Info, Sparkles, Cpu, Weight, Ruler, DollarSign, Users, Globe, MessageSquare, Swords, Upload, Camera, X, ScanLine, Mic, MicOff, AudioLines } from 'lucide-react';

const models = [
  { id: 'groq', name: 'Groq', desc: 'Llama 3.3 70B' },
  { id: 'gemini', name: 'Gemini', desc: 'Google AI' },
  { id: 'claude', name: 'Claude', desc: 'Anthropic Claude Sonnet' },
];

function ProductForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '',
    material: '',
    weight: '',
    dimensions: '',
    price: '',
    targetAudience: '',
    additionalInfo: '',
    language: 'English',
    tone: 'professional',
    competitor: ''
  });
  const [model, setModel] = useState('groq');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, model, imagePreview);
  };

  const update = (field, value) => setFormData({ ...formData, [field]: value });

  const handleImageSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    setScanError('');
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageSelect(file);
  };

  const handleScanImage = async () => {
    if (!imageFile) return;
    setScanning(true);
    setScanError('');
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/campaign/analyze-image', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const d = res.data.data;
      setFormData(prev => ({
        ...prev,
        name: d.name || prev.name,
        description: d.description || prev.description,
        color: d.color || prev.color,
        material: d.material || prev.material,
        weight: d.weight || prev.weight,
        dimensions: d.dimensions || prev.dimensions,
        price: d.price || prev.price,
        targetAudience: d.targetAudience || prev.targetAudience,
        additionalInfo: d.additionalInfo || prev.additionalInfo,
      }));
    } catch (err) {
      setScanError(err.response?.data?.message || 'Image scan failed. Make sure GEMINI_API_KEY is set.');
    } finally {
      setScanning(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setScanError('');
  };

  // Voice Input
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceParsing, setVoiceParsing] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (e) => {
        let t = '';
        for (let i = 0; i < e.results.length; i++) {
          t += e.results[i][0].transcript;
        }
        setTranscript(t);
      };
      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
    }
    return () => { if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {} };
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      setVoiceError('Speech recognition not supported in this browser. Use Chrome.');
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setTranscript('');
      setVoiceError('');
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const handleVoiceParse = async () => {
    if (!transcript.trim()) return;
    setVoiceParsing(true);
    setVoiceError('');
    try {
      if (listening && recognitionRef.current) { recognitionRef.current.stop(); setListening(false); }
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/campaign/parse-voice', { transcript }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = res.data.data;
      setFormData(prev => ({
        ...prev,
        name: d.name || prev.name,
        description: d.description || prev.description,
        color: d.color || prev.color,
        material: d.material || prev.material,
        weight: d.weight || prev.weight,
        dimensions: d.dimensions || prev.dimensions,
        price: d.price || prev.price,
        targetAudience: d.targetAudience || prev.targetAudience,
        additionalInfo: d.additionalInfo || prev.additionalInfo,
      }));
      setTranscript('');
    } catch (err) {
      setVoiceError(err.response?.data?.message || 'Voice parse failed');
    } finally {
      setVoiceParsing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-5">
      {/* Image Upload */}
      <div>
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Quick Start — Image or Voice</p>

        {/* Voice Input */}
        <div className="mb-3 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900">
            <button type="button" onClick={toggleVoice}
              className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0
                ${listening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-200 dark:shadow-red-900/40 animate-pulse'
                  : 'bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-900/30 dark:to-purple-900/30 text-brand-500 hover:shadow-md'
                }`}>
              {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {listening && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />}
            </button>
            <div className="flex-1 min-w-0">
              {!transcript && !listening && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Click mic and describe your product</p>
              )}
              {listening && !transcript && (
                <div className="flex items-center gap-2">
                  <AudioLines className="w-4 h-4 text-red-500 animate-pulse" />
                  <p className="text-sm font-medium text-red-500">Listening... speak now</p>
                </div>
              )}
              {transcript && (
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">"{transcript}"</p>
              )}
            </div>
          </div>
          {transcript && (
            <div className="px-3 pb-3 bg-white dark:bg-gray-900 flex gap-2">
              <button type="button" onClick={handleVoiceParse} disabled={voiceParsing}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-2 text-sm">
                {voiceParsing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Parsing...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Auto-Fill from Voice</>
                )}
              </button>
              <button type="button" onClick={() => { setTranscript(''); setVoiceError(''); }}
                className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Clear</button>
            </div>
          )}
          {voiceError && (
            <div className="px-3 pb-3 bg-white dark:bg-gray-900"><p className="text-xs text-red-500 font-medium">{voiceError}</p></div>
          )}
        </div>
        {!imagePreview ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
              ${dragOver
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-brand-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageSelect(e.target.files[0])}
            />
            <div className="w-14 h-14 bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Camera className="w-7 h-7 text-brand-500" />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Drop product image here or click to upload</p>
            <p className="text-xs text-gray-400 mt-1">AI will auto-detect product name, brand, color, material & more</p>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <img src={imagePreview} alt="Product" className="w-full h-48 object-contain bg-gray-50 dark:bg-gray-800" />
            <button type="button" onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
              <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
            </button>
            <div className="p-3 bg-white dark:bg-gray-900 flex items-center gap-2">
              <button type="button" onClick={handleScanImage} disabled={scanning}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm">
                {scanning ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Scanning with AI...</>
                ) : (
                  <><ScanLine className="w-4 h-4" /> Scan & Auto-Fill</>
                )}
              </button>
            </div>
            {scanError && (
              <div className="px-3 pb-3"><p className="text-xs text-red-500 font-medium">{scanError}</p></div>
            )}
          </div>
        )}
      </div>

      {/* Model Selector */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          <Cpu className="w-3.5 h-3.5 text-brand-500" /> AI Model
        </label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="input-field text-sm py-2.5"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.name} — {m.desc}</option>
          ))}
        </select>
      </div>

      {/* Product Name */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          <Package className="w-3.5 h-3.5 text-brand-500" /> Product Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => update('name', e.target.value)}
          className="input-field"
          placeholder="e.g., Wireless Noise-Canceling Headphones"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          <FileText className="w-3.5 h-3.5 text-brand-500" /> Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => update('description', e.target.value)}
          className="input-field h-28 resize-none"
          placeholder="Describe your product features, benefits, and unique selling points..."
          required
        />
      </div>

      {/* Technical Specs Section */}
      <div>
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Technical Specs</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              <Palette className="w-3 h-3" /> Color
            </label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => update('color', e.target.value)}
              className="input-field text-sm py-2.5"
              placeholder="e.g., Midnight Black"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              <Layers className="w-3 h-3" /> Material
            </label>
            <input
              type="text"
              value={formData.material}
              onChange={(e) => update('material', e.target.value)}
              className="input-field text-sm py-2.5"
              placeholder="e.g., Aluminum, Leather"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              <Weight className="w-3 h-3" /> Weight
            </label>
            <input
              type="text"
              value={formData.weight}
              onChange={(e) => update('weight', e.target.value)}
              className="input-field text-sm py-2.5"
              placeholder="e.g., 250g"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              <Ruler className="w-3 h-3" /> Dimensions
            </label>
            <input
              type="text"
              value={formData.dimensions}
              onChange={(e) => update('dimensions', e.target.value)}
              className="input-field text-sm py-2.5"
              placeholder="e.g., 15 x 8 x 3 cm"
            />
          </div>
        </div>
      </div>

      {/* Marketing Details */}
      <div>
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Marketing Details</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              <DollarSign className="w-3 h-3" /> Price Range
            </label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => update('price', e.target.value)}
              className="input-field text-sm py-2.5"
              placeholder="e.g., $49.99"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              <Users className="w-3 h-3" /> Target Audience
            </label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => update('targetAudience', e.target.value)}
              className="input-field text-sm py-2.5"
              placeholder="e.g., Tech enthusiasts"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
          <Info className="w-3 h-3" /> Additional Info
        </label>
        <input
          type="text"
          value={formData.additionalInfo}
          onChange={(e) => update('additionalInfo', e.target.value)}
          className="input-field text-sm py-2.5"
          placeholder="Any other details, USPs, certifications..."
        />
      </div>

      {/* Campaign Settings */}
      <div>
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Campaign Settings</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              <Globe className="w-3 h-3" /> Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => update('language', e.target.value)}
              className="input-field text-sm py-2.5"
            >
              {['English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic', 'Portuguese', 'Korean'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              <MessageSquare className="w-3 h-3" /> Tone
            </label>
            <select
              value={formData.tone}
              onChange={(e) => update('tone', e.target.value)}
              className="input-field text-sm py-2.5"
            >
              {['professional', 'casual', 'luxury', 'humorous', 'urgent', 'friendly', 'bold', 'minimalist'].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
            <Swords className="w-3 h-3" /> Competitor (optional)
          </label>
          <input
            type="text"
            value={formData.competitor}
            onChange={(e) => update('competitor', e.target.value)}
            className="input-field text-sm py-2.5"
            placeholder="e.g., Apple AirPods — we'll position yours better"
          />
        </div>
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2.5 py-3.5">
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating Campaign...</span>
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            <span>Generate Campaign</span>
          </>
        )}
      </button>
    </form>
  );
}

export default ProductForm;
