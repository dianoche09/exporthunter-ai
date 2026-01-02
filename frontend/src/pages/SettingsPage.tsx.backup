import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Building, Key, CreditCard, Save, Tag, X, Plus, Package, Upload,
  Loader2, Briefcase, Layers, Search, Trophy, Factory, FileText, ChevronDown,
  ChevronUp, Brain, Cpu, Zap, Network, Fingerprint, Gauge, Lightbulb, CheckCircle2,
  ShieldCheck, Globe, Sparkles, Check, RefreshCw, Link
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { paymentAPI, authAPI, uploadAPI, aiAPI } from '../services/api';
import { useQuery } from '@tanstack/react-query';

export default function SettingsPage() {
  const { data: userResponse, refetch, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authAPI.getCurrentUser
  });

  const user = userResponse?.data?.user;
  const [activeTab, setActiveTab] = useState<'persona' | 'knowledge' | 'api' | 'billing'>('persona');

  // Hero collapse state
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(() => {
    const saved = localStorage.getItem('settingsHeroCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('settingsHeroCollapsed', JSON.stringify(isHeroCollapsed));
  }, [isHeroCollapsed]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    jobTitle: '',
    companyType: 'manufacturer',
    logo: '',
    country: '',
    industry: '',
    preferredLanguage: 'English',
    phone: '',
    phoneCountryCode: '+90',
    geminiKey: '',
    resendKey: '',
    toneOfVoice: 'Professional',
    productGroups: [] as Array<{
      name: string;
      hsCode: string;
      certificates: string[];
      keywords: string[];
      capacity?: string;
    }>
  });

  const [crmConnections, setCrmConnections] = useState({
    salesforce: false,
    hubspot: false,
    zoho: false
  });

  const [productSearch, setProductSearch] = useState('');
  const [hsSuggestions, setHsSuggestions] = useState<any[]>([]);
  const [isSearchingHs, setIsSearchingHs] = useState(false);
  const [showHsDropdown, setShowHsDropdown] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    hsCode: '',
    certificates: [] as string[],
    keywords: [] as string[],
    capacity: ''
  });

  const availableCertificates = ['ISO 9001', 'ISO 14001', 'CE', 'FDA', 'Halal', 'Kosher', 'GMP', 'REACH', 'OEKO-TEX'];
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [verifyingApi, setVerifyingApi] = useState(false);

  // Training Score Calculation & Animation Logic
  const trainingScore = useMemo(() => Math.min(100, Math.round(
    (formData.productGroups.length * 15) +
    (formData.logo ? 10 : 0) +
    (formData.company ? 10 : 0) +
    (formData.geminiKey ? 20 : 0)
  )), [formData]);

  const [brainPulse, setBrainPulse] = useState(false);
  const prevScoreRef = useRef(trainingScore);

  useEffect(() => {
    if (trainingScore > prevScoreRef.current) {
      setBrainPulse(true);
      const timer = setTimeout(() => setBrainPulse(false), 1000); // Pulse effect duration
      return () => clearTimeout(timer);
    }
    prevScoreRef.current = trainingScore;
  }, [trainingScore]);

  const getLogoUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    return `${baseUrl}${path}`;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const formDataFile = new FormData();
    formDataFile.append('logo', file);

    setUploadingLogo(true);
    try {
      const res = (await uploadAPI.uploadLogo(formDataFile)) as any;
      if (res.success && res.data.url) {
        setFormData(prev => ({ ...prev, logo: res.data.url }));
        toast.success('Logo uploaded and AI vision updated!');
      }
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        company: user.company || '',
        jobTitle: user.jobTitle || '',
        companyType: user.companyType || 'manufacturer',
        logo: user.logo || '',
        country: user.country || '',
        industry: user.industry || '',
        preferredLanguage: user.preferredLanguage || 'English',
        phone: user.phone || '',
        phoneCountryCode: user.phoneCountryCode || '+90',
        geminiKey: user.geminiApiKey || '',
        resendKey: user.resendApiKey || '',
        toneOfVoice: 'Professional',
        productGroups: user.productGroups || []
      });
    }
  }, [user]);

  const handleUpdateProfile = async (section: string) => {
    setIsSaving(true);

    // Simulate API Verification visual feedback
    if (section === 'API Connections') {
      setVerifyingApi(true);
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s verification delay
      setVerifyingApi(false);
    }

    try {
      await authAPI.updateProfile({
        name: formData.name,
        company: formData.company,
        jobTitle: formData.jobTitle,
        companyType: formData.companyType,
        country: formData.country,
        industry: formData.industry,
        preferredLanguage: formData.preferredLanguage,
        phone: formData.phone,
        phoneCountryCode: formData.phoneCountryCode,
        logo: formData.logo,
        geminiApiKey: formData.geminiKey,
        resendApiKey: formData.resendKey,
        productGroups: formData.productGroups
      });
      toast.success(`${section} Updated Successfully!`);
      refetch();
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCrmToggle = (crm: 'salesforce' | 'hubspot' | 'zoho') => {
    // Toggle logic simulation
    setCrmConnections(prev => ({ ...prev, [crm]: !prev[crm] }));
    if (!crmConnections[crm]) {
      toast.success(`Connecting to ${crm.charAt(0).toUpperCase() + crm.slice(1)}...`);
    } else {
      toast('Disconnected', { icon: '🔌' });
    }
  }

  // HS Code Search (Mock + API Logic)
  useEffect(() => {
    const searchHs = async () => {
      if (productSearch.length < 2) {
        setHsSuggestions([]);
        return;
      }
      setIsSearchingHs(true);
      try {
        const res = await aiAPI.searchHsCodes(productSearch);
        setHsSuggestions(res.data?.codes || []);
        setShowHsDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingHs(false);
      }
    };
    const timeout = setTimeout(searchHs, 500);
    return () => clearTimeout(timeout);
  }, [productSearch]);

  const addProductGroup = () => {
    if (!newProduct.name || !newProduct.hsCode) {
      toast.error('Please enter product name and HS Code');
      return;
    }
    setFormData(prev => ({
      ...prev,
      productGroups: [...prev.productGroups, newProduct]
    }));
    setNewProduct({ name: '', hsCode: '', certificates: [], keywords: [], capacity: '' });
    setProductSearch('');
    // No explicit toast needed here because the Brain Pulse animation provides visual feedback
    toast.success('Product taught to AI Brain!', { icon: '🧠' });
  };

  const removeProductGroup = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productGroups: prev.productGroups.filter((_, i) => i !== index)
    }));
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-slate-50"><Loader2 className="animate-spin text-purple-600" /></div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto bg-slate-50 min-h-screen font-outfit">

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

        {/* 1. Header: System Brain (Collapsible Hero) */}
        <motion.div
          variants={item}
          animate={{ padding: isHeroCollapsed ? "1rem 2rem" : "2rem" }}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[2rem] text-white relative overflow-hidden shadow-xl transition-all duration-300"
        >
          <button
            onClick={() => setIsHeroCollapsed(!isHeroCollapsed)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white z-50 backdrop-blur-md transition-colors"
          >
            {isHeroCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>

          {/* Background Neural Network Effect */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
              <path d="M0,200 Q200,100 400,200 T800,200" fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 10" className="animate-[dash_20s_linear_infinite]" />
              <path d="M0,200 Q200,300 400,200 T800,200" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
              <circle cx="400" cy="200" r="100" fill="url(#grad1)" filter="url(#glow)" opacity="0.3" />
              <defs>
                <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" style={{ stopColor: 'rgb(255,255,255)', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'rgb(100,100,255)', stopOpacity: 0 }} />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="15" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
            </svg>
          </div>

          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {isHeroCollapsed ? (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex items-center gap-4 h-10"
                >
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tight">SYSTEM BRAIN</h1>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-between items-center"
                >
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full mb-4 border border-white/20">
                      <Cpu className="w-4 h-4 text-cyan-300" />
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-100">AI Configuration Center</span>
                    </div>
                    <h1 className="text-4xl font-black mb-3">System Brain</h1>
                    <p className="text-lg text-indigo-100 max-w-2xl font-medium leading-relaxed">
                      Manage your AI persona, product knowledge, and API connections to power your autonomous sales engine.
                    </p>
                  </div>

                  {/* Brain Health Widget */}
                  <div className="hidden lg:block bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl min-w-[200px] text-center">
                    <div className="flex justify-center mb-2">
                      <div className={`relative transition-transform duration-300 ${brainPulse ? 'scale-125' : ''}`}>
                        <Brain className={`w-10 h-10 ${trainingScore > 70 ? 'text-green-400' : 'text-yellow-400'} transition-colors duration-500`} />
                        <div className={`absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ${trainingScore > 70 ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-ping'}`}></div>
                      </div>
                    </div>
                    <div className={`text-3xl font-black transition-all duration-300 ${brainPulse ? 'text-white scale-110' : 'text-white'}`}>
                      {trainingScore}%
                    </div>
                    <div className="text-xs uppercase tracking-wider font-bold text-indigo-200 mt-1">Brain Trained</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'persona', icon: Fingerprint, label: 'Identity & AI Persona' },
            { id: 'knowledge', icon: DatabaseIcon, label: 'Product Knowledge Base' },
            { id: 'api', icon: Network, label: 'Neural Connections' },
            { id: 'billing', icon: CreditCard, label: 'Billing & Usage' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-white text-violet-600 shadow-lg scale-105 border border-violet-100'
                  : 'bg-white/50 text-slate-500 hover:bg-white hover:text-slate-700'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Content Area */}
          <div className="lg:col-span-12">
            <AnimatePresence mode="wait">

              {/* 1. Identity & AI Persona */}
              {activeTab === 'persona' && (
                <motion.div
                  key="persona"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100"
                >
                  <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <Fingerprint className="w-8 h-8 text-violet-500" />
                        Identity & AI Persona
                      </h2>
                      <p className="text-slate-500 mt-1 font-medium">Define who the AI is when it speaks to your customers.</p>
                    </div>
                    <button
                      onClick={() => handleUpdateProfile('Persona')}
                      disabled={isSaving}
                      className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/20"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Update Persona
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      {/* Logo & Branding */}
                      <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                            {formData.logo ? (
                              <img src={getLogoUrl(formData.logo)} alt="Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                              <Building className="w-10 h-10 text-slate-300" />
                            )}
                            {uploadingLogo && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                          <label className="absolute -bottom-2 -right-2 p-2 bg-violet-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-violet-700 transition-transform hover:scale-110">
                            <Upload className="w-4 h-4" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                          </label>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">Corporate Identity</h4>
                          <p className="text-xs text-slate-500 max-w-[200px] mb-2">Upload visual identity. AI uses this for generating branded reports.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Sender Name</label>
                          <input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                            placeholder="e.g. John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Job Title</label>
                          <input
                            value={formData.jobTitle}
                            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                            placeholder="e.g. Sales Director"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Tone of Voice (AI Personality)</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['Professional', 'Friendly', 'Aggressive'].map(tone => (
                            <button
                              key={tone}
                              onClick={() => setFormData({ ...formData, toneOfVoice: tone })}
                              className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all ${formData.toneOfVoice === tone
                                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                                  : 'border-slate-100 hover:border-slate-200 text-slate-500'
                                }`}
                            >
                              {tone}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-yellow-500" />
                          This affects how the AI writes emails and handles objections.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                        <input
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Industry</label>
                        <input
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                          placeholder="e.g. Textile Manufacturing"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Website Language</label>
                        <select
                          value={formData.preferredLanguage}
                          onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                        >
                          <option>English</option>
                          <option>Turkish</option>
                          <option>German</option>
                          <option>Spanish</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 2. Knowledge Base (Portfolio) */}
              {activeTab === 'knowledge' && (
                <motion.div
                  key="knowledge"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100"
                >
                  <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <Package className="w-8 h-8 text-blue-500" />
                        Product Knowledge Base
                      </h2>
                      <p className="text-slate-500 mt-1 font-medium">Teach AI what you sell. The more details, the better it sells.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100">
                        <Trophy className="w-5 h-5" />
                        <span className="font-bold">Training Score: {trainingScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left: Add New Product Form */}
                    <div className="xl:col-span-1 bg-slate-50 rounded-[2rem] p-6 border border-slate-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                      <h3 className="text-lg font-black text-slate-900 mb-6 relative z-10 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-600" /> Teach New Product
                      </h3>

                      <div className="space-y-4 relative z-10">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">HS Code / Product Name</label>
                          <div className="relative">
                            <input
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              placeholder="Focus input to search HS..."
                              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl font-bold placeholder:font-medium focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                            {isSearchingHs && <div className="absolute right-3 top-3"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>}
                            {/* Suggestions Dropdown (Simplified) */}
                            {showHsDropdown && hsSuggestions.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto">
                                {hsSuggestions.map((hs: any, i) => (
                                  <div
                                    key={i}
                                    className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                                    onClick={() => {
                                      setNewProduct({ ...newProduct, hsCode: hs.code, name: hs.description });
                                      setProductSearch(hs.code);
                                      setShowHsDropdown(false);
                                    }}
                                  >
                                    <div className="font-bold text-blue-600">{hs.code}</div>
                                    <div className="text-xs text-slate-600">{hs.description}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Certificates</label>
                            <div className="flex flex-wrap gap-2">
                              {availableCertificates.slice(0, 4).map(cert => (
                                <span
                                  key={cert}
                                  onClick={() => {
                                    const exists = newProduct.certificates.includes(cert);
                                    setNewProduct({
                                      ...newProduct,
                                      certificates: exists ? newProduct.certificates.filter(c => c !== cert) : [...newProduct.certificates, cert]
                                    })
                                  }}
                                  className={`text-[10px] px-2 py-1 rounded-lg cursor-pointer border font-bold ${newProduct.certificates.includes(cert)
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Capacity</label>
                            <input
                              value={newProduct.capacity}
                              onChange={(e) => setNewProduct({ ...newProduct, capacity: e.target.value })}
                              placeholder="e.g. 500k/mo"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
                            />
                          </div>
                        </div>

                        <button
                          onClick={addProductGroup}
                          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mt-4"
                        >
                          <Brain className="w-5 h-5" />
                          Train AI on This Product
                        </button>
                      </div>
                    </div>

                    {/* Right: Product List */}
                    <div className="xl:col-span-2 space-y-4">
                      {formData.productGroups.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                          <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-slate-400">Knowledge Base Empty</h3>
                          <p className="text-slate-400">Add products to start training your AI sales agent.</p>
                        </div>
                      ) : (
                        formData.productGroups.map((product, idx) => (
                          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-sm">
                                {product.hsCode.slice(0, 4)}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900">{product.name || 'Unnamed Product'}</h4>
                                <div className="flex gap-2 mt-1">
                                  {product.certificates.map(c => (
                                    <span key={c} className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 rounded-md font-medium border border-green-100">{c}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeProductGroup(idx)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3. Neural Connections (API & CRM) */}
              {activeTab === 'api' && (
                <motion.div
                  key="api"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100"
                >
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <Network className="w-8 h-8 text-cyan-500" />
                        Neural Connections
                      </h2>
                      <p className="text-slate-500 mt-1 font-medium">Connect your AI brain to external capabilities.</p>
                    </div>
                    <button
                      onClick={() => handleUpdateProfile('API Connections')}
                      disabled={isSaving}
                      className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg"
                    >
                      {isSaving ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {verifyingApi ? "Verifying..." : "Saving..."}
                        </div>
                      ) : (
                        <>
                          <Save className="w-5 h-5" /> Save Connections
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-200 relative group transition-all hover:bg-white hover:shadow-xl hover:border-cyan-200">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                            <Brain className="w-6 h-6 text-cyan-500" />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900">Reasoning Engine</h3>
                            <div className="text-xs font-bold text-slate-400">Google Gemini Flash</div>
                          </div>
                        </div>
                        {(formData.geminiKey || verifyingApi) && (
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-sm ring-1 transition-all ${verifyingApi ? 'bg-yellow-100 text-yellow-700 ring-yellow-200' : 'bg-green-100 text-green-700 ring-green-200 animate-pulse'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${verifyingApi ? 'bg-yellow-500 animate-ping' : 'bg-green-500'}`}></span>
                            {verifyingApi ? "Testing..." : "Live"}
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="password"
                          value={formData.geminiKey}
                          onChange={(e) => setFormData({ ...formData, geminiKey: e.target.value })}
                          className="w-full pl-10 pr-4 py-4 bg-white border border-slate-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-cyan-200 outline-none transition-shadow group-hover:shadow-inner"
                          placeholder="sk-..."
                        />
                        <Key className="w-4 h-4 text-slate-400 absolute left-3 top-4" />
                      </div>
                      <p className="text-xs text-slate-500 mt-3 flex items-center gap-1 font-medium">
                        <Zap className="w-3 h-3 text-cyan-500" /> Powering your intelligent reasoning engine.
                      </p>
                    </div>

                    <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-200 relative group transition-all hover:bg-white hover:shadow-xl hover:border-violet-200">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                            <Mail className="w-6 h-6 text-violet-500" />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900">Communication Node</h3>
                            <div className="text-xs font-bold text-slate-400">Resend API</div>
                          </div>
                        </div>
                        {(formData.resendKey || verifyingApi) && (
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-sm ring-1 transition-all ${verifyingApi ? 'bg-yellow-100 text-yellow-700 ring-yellow-200' : 'bg-green-100 text-green-700 ring-green-200'
                            }`}>
                            {verifyingApi ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            {verifyingApi ? "Verifying..." : "Connected"}
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="password"
                          value={formData.resendKey}
                          onChange={(e) => setFormData({ ...formData, resendKey: e.target.value })}
                          className="w-full pl-10 pr-4 py-4 bg-white border border-slate-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-violet-200 outline-none transition-shadow group-hover:shadow-inner"
                          placeholder="re_..."
                        />
                        <Key className="w-4 h-4 text-slate-400 absolute left-3 top-4" />
                      </div>
                      <p className="text-xs text-slate-500 mt-3 flex items-center gap-1 font-medium">
                        <Globe className="w-3 h-3 text-violet-500" /> Enabling high-deliverability global outreach.
                      </p>
                    </div>
                  </div>

                  {/* CRM Integrations */}
                  <div className="pt-8 border-t border-slate-100">
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-indigo-500" /> Enterprise CRM Ecosystem
                    </h3>
                    <div className="space-y-4">
                      {/* Salesforce */}
                      <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition-colors bg-white">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#00A1E0]/10 rounded-xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-[#00A1E0]" viewBox="0 0 24 24" fill="currentColor"><path d="M12.9,2.6c-0.8-0.3-1.7,0-2.3,0.6c-0.5,0.6-0.6,1.4-0.3,2.2c-1.3-0.5-2.8-0.3-3.9,0.5c-1.2,0.9-1.8,2.4-1.6,3.9 c-1.3-0.2-2.6,0.5-3.2,1.7c-0.6,1.4-0.1,3,1.1,3.9c-0.4,1.4,0.1,2.9,1.3,3.7c1.3,0.9,3,0.8,4.2-0.2c0.7,0.8,1.8,1.2,2.8,1 c1.2-0.3,2.1-1.3,2.2-2.5c0.8,0.3,1.7,0,2.3-0.6c0.5-0.6,0.6-1.4,0.3-2.2c1.3,0.5,2.8,0.3,3.9-0.5c1.2-0.9,1.8-2.4,1.6-3.9 c1.3,0.2,2.6-0.5,3.2-1.7c0.6-1.4,0.1-3-1.1-3.9c0.4-1.4-0.1-2.9-1.3-3.7C20.7,3.6,19,3.7,17.8,4.7C17.1,3.9,16,3.5,15,3.7 C13.8,4,12.9,5,12.8,6.2C12,5.9,11.1,6.2,10.5,6.8" /></svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg">Salesforce</h4>
                            <p className="text-xs text-slate-500 font-medium">Sync leads and deals automatically. <span className="text-indigo-600">2-Way Sync</span></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${crmConnections.salesforce ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                            {crmConnections.salesforce ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleCrmToggle('salesforce')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${crmConnections.salesforce ? 'bg-blue-600' : 'bg-slate-200'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${crmConnections.salesforce ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>

                      {/* HubSpot */}
                      <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 hover:border-orange-300 transition-colors bg-white">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#FF7A59]/10 rounded-xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-[#FF7A59]" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M17,14h-2v-2h2V14z M15,10h-2V8h2V10z M11,16H9v-2h2 V16z" /></svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg">HubSpot</h4>
                            <p className="text-xs text-slate-500 font-medium">Push interested prospects to pipeline. <span className="text-indigo-600">2-Way Sync</span></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${crmConnections.hubspot ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                            {crmConnections.hubspot ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleCrmToggle('hubspot')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${crmConnections.hubspot ? 'bg-orange-500' : 'bg-slate-200'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${crmConnections.hubspot ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>

                      {/* Zoho */}
                      <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 hover:border-yellow-300 transition-colors bg-white">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#F3C52C]/10 rounded-xl flex items-center justify-center">
                            <span className="font-black text-[#666] text-xl">Z</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg">Zoho CRM</h4>
                            <p className="text-xs text-slate-500 font-medium">Basic contact synchronization.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${crmConnections.zoho ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                            {crmConnections.zoho ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleCrmToggle('zoho')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${crmConnections.zoho ? 'bg-yellow-500' : 'bg-slate-200'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${crmConnections.zoho ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 4. Billing (Subscription) */}
              {activeTab === 'billing' && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100"
                >
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-8">
                    <CreditCard className="w-8 h-8 text-emerald-500" />
                    Billing & Usage
                  </h2>

                  <div className="relative overflow-hidden rounded-[2rem] p-8 text-white">
                    {/* Glassmorphism Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
                    <div className="absolute top-1/2 -left-24 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-center">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider mb-2">
                          <Sparkles className="w-3 h-3 text-yellow-300" /> Current Plan
                        </div>
                        <h3 className="text-4xl font-black mb-1">PRO Plan</h3>
                        <p className="text-slate-300 font-medium">$49/month • Renews on Dec 12</p>
                      </div>

                      <div className="w-full md:w-1/2 bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                        <div className="flex justify-between text-sm font-bold mb-2">
                          <span className="text-slate-200">AI Credits Used</span>
                          <span className="text-white">8,402 / 10,000</span>
                        </div>
                        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                          <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 w-[84%] rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
                        </div>
                        <p className="text-xs text-slate-400">84% of your monthly capacity used. Consider upgrading.</p>
                      </div>

                      <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black hover:bg-slate-100 transition-colors shadow-lg">
                        Manage Subscription
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DatabaseIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
  )
}
