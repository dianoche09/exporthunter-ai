
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    Globe,
    Package,
    Sparkles,
    Check,
    ArrowRight,
    MapPin,
    Target,
    User,
    Mail,
    Phone,
    Link as LinkIcon,
    Key,
    Plus,
    X,
    ChevronRight,
    ChevronDown,
    Wand2,
    CreditCard,
    Zap,
    ShieldCheck,
    Briefcase,
    Layers,
    Languages,
    Image,
    Building,
    Upload,
    Loader2,
    Search,
    Trophy,
    Factory,
    FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI, uploadAPI, aiAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const steps = [
    {
        id: 'basics',
        title: 'Business Identity',
        description: 'Tell us who you are',
        icon: Building2
    },
    {
        id: 'products',
        title: 'Your Portfolio',
        description: 'What are you exporting?',
        icon: Package
    },
    {
        id: 'api',
        title: 'AI Setup',
        description: 'Connect your AI brains',
        icon: Key
    },
    {
        id: 'markets',
        title: 'Strategy',
        description: 'AI Market Recommendations',
        icon: Globe
    },
    {
        id: 'customers',
        title: 'Ideal Buyers',
        description: 'Who are we targeting?',
        icon: Target
    },
    {
        id: 'plans',
        title: 'Choose Plan',
        description: 'Scale your export game',
        icon: CreditCard
    }
];

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        companyName: '',
        jobTitle: '',
        phone: '',
        phoneCountryCode: '+90',
        website: '',
        country: 'Turkey',
        industry: '',
        companyType: 'manufacturer' as 'manufacturer' | 'trader' | 'service_provider',
        logo: '',
        preferredLanguage: 'English',
        geminiKey: '',
        productGroups: [] as Array<{
            name: string;
            hsCode: string;
            certificates: string[];
            keywords: string[];
            capacity?: string;
            unit?: string;
            frequency?: string;
        }>,
        targetMarkets: [] as string[],
        targetCustomerProfile: [] as string[],
        subscription: 'free'
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
        capacity: '',
        unit: 'Tons',
        frequency: 'Month'
    });

    const availableCertificates = ['ISO 9001', 'ISO 14001', 'CE', 'FDA', 'Halal', 'Kosher', 'GMP', 'REACH', 'OEKO-TEX'];

    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [marketInput, setMarketInput] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

    useEffect(() => {
        const handleClickOutside = () => setShowHsDropdown(false);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleHsSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setProductSearch(val);
        setNewProduct(prev => ({ ...prev, name: val }));

        if (val.length >= 2) {
            setIsSearchingHs(true);
            try {
                const res = (await aiAPI.getHsCodeSuggestions({ product: val })) as any;
                if (res.success) {
                    setHsSuggestions(res.data);
                    setShowHsDropdown(true);
                }
            } catch (error) {
                console.error('HS Code search failed', error);
            } finally {
                setIsSearchingHs(false);
            }
        } else {
            setHsSuggestions([]);
            setShowHsDropdown(false);
        }
    };

    const handleSelectHs = (item: { code: string, description: string }) => {
        setNewProduct(prev => ({
            ...prev,
            name: item.description,
            hsCode: item.code
        }));
        setProductSearch(item.description);
        setShowHsDropdown(false);
    };

    const handleAddProduct = () => {
        if (!newProduct.name || !newProduct.hsCode) {
            toast.error('Product name and HS Code are required');
            return;
        }
        setFormData(prev => ({
            ...prev,
            productGroups: [...prev.productGroups, { ...newProduct }]
        }));
        setNewProduct({
            name: '',
            hsCode: '',
            certificates: [],
            keywords: [],
            capacity: '',
            unit: 'Tons',
            frequency: 'Month'
        });
        setProductSearch('');
        toast.success('Product added to portfolio');
    };

    const handleRemoveProduct = (index: number) => {
        setFormData(prev => ({
            ...prev,
            productGroups: prev.productGroups.filter((_, i) => i !== index)
        }));
    };
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const getLogoUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
        return `${baseUrl}${path}`;
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
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
                // We keep the relative path in state, and handle the prefix in the UI/load
                setFormData(prev => ({ ...prev, logo: res.data.url }));
                toast.success('Logo uploaded!');
                // Auto-save the logo to the profile immediately
                await authAPI.updateProfile({ logo: res.data.url });
            }
        } catch (error) {
            console.error('Logo upload error:', error);
            toast.error('Failed to upload logo');
        } finally {
            setUploadingLogo(false);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = (await authAPI.getCurrentUser()) as any;
                const user = res.data.user;
                if (user.onboardingCompleted) {
                    navigate('/dashboard');
                    return;
                }

                setFormData(prev => {
                    const newData = {
                        ...prev,
                        name: user.name || '',
                        email: user.email || '',
                        companyName: user.company || '',
                        jobTitle: user.jobTitle || '',
                        phone: user.phone || '',
                        website: user.website || '',
                        country: user.country || 'Turkey',
                        industry: user.industry || '',
                        companyType: user.companyType || 'manufacturer',
                        logo: user.logo || '',
                        preferredLanguage: user.preferredLanguage || 'English',
                        geminiKey: user.apiKeys?.gemini || '',
                        productGroups: (user.productGroups || []).map((p: any) =>
                            typeof p === 'string' ? { name: p, hsCode: '', certificates: [], keywords: [] } : p
                        ),
                        targetMarkets: user.targetMarkets || [],
                        targetCustomerProfile: user.targetCustomerProfile || [],
                        subscription: user.subscription || 'free'
                    };

                    // Auto-detect first incomplete step
                    let firstIncomplete = 0;
                    if (!newData.name || !newData.companyName) {
                        firstIncomplete = 0;
                    } else if (newData.productGroups.length === 0) {
                        firstIncomplete = 1;
                    } else if (!newData.geminiKey) {
                        firstIncomplete = 2;
                    } else if (newData.targetMarkets.length === 0) {
                        firstIncomplete = 3;
                    } else if (newData.targetCustomerProfile.length === 0) {
                        firstIncomplete = 4;
                    } else if (newData.subscription === 'free') {
                        firstIncomplete = 5;
                    }

                    if (firstIncomplete > 0) {
                        setCurrentStep(firstIncomplete);
                        toast.success(`Continuing from Step ${firstIncomplete + 1}: ${steps[firstIncomplete].title}`, {
                            icon: '🔄',
                            duration: 4000
                        });
                    }

                    return newData;
                });
            } catch (error) {
                console.error('Failed to fetch user', error);
            }
        };
        fetchUser();
    }, [navigate]);

    const savePartialProfile = async () => {
        try {
            await authAPI.updateProfile({
                name: formData.name,
                company: formData.companyName,
                jobTitle: formData.jobTitle,
                phone: formData.phone,
                phoneCountryCode: formData.phoneCountryCode,
                website: formData.website,
                country: formData.country,
                industry: formData.industry,
                companyType: formData.companyType,
                logo: formData.logo,
                preferredLanguage: formData.preferredLanguage,
                apiKeys: { gemini: formData.geminiKey },
                productGroups: formData.productGroups,
                targetMarkets: formData.targetMarkets,
                targetCustomerProfile: formData.targetCustomerProfile,
                subscription: formData.subscription as any
            });
        } catch (error) {
            console.error('Failed to save partial profile:', error);
        }
    };

    const handleNext = async () => {
        if (currentStep === 0) {
            if (!formData.companyName || !formData.name) {
                toast.error('Name and Company are required');
                return;
            }
            await savePartialProfile();
            setCurrentStep(1);
        } else if (currentStep === 1) {
            if (formData.productGroups.length === 0) {
                toast.error('Please add at least one product');
                return;
            }
            await savePartialProfile();
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!formData.geminiKey) {
                toast.error('Gemini API key is required');
                return;
            }
            await savePartialProfile();
            await analyzeMarkets();
            setCurrentStep(3);
        } else if (currentStep === 3) {
            if (formData.targetMarkets.length === 0) {
                toast.error('Please select at least one target market');
                return;
            }
            await savePartialProfile();
            setCurrentStep(4);
        } else if (currentStep === 4) {
            if (formData.targetCustomerProfile.length === 0) {
                toast.error('Please select at least one customer type');
                return;
            }
            await savePartialProfile();
            setCurrentStep(5);
        } else if (currentStep === 5) {
            await finishOnboarding();
        }
    };

    const analyzeMarkets = async () => {
        setAnalyzing(true);
        try {
            // We save the profile partially before analysis if needed, 
            // but analyzeMarkets controller uses the provided body params too.
            const res = (await authAPI.analyzeMarkets({
                companyName: formData.companyName,
                industry: formData.industry,
                productGroups: formData.productGroups,
                country: formData.country,
                // Pass key if they just entered it but didn't save yet
                apiKey: formData.geminiKey
            })) as any;

            if (res.success && res.data && res.data.markets) {
                setAiSuggestions(res.data.markets);
                // Pre-select top 3
                const topMarkets = res.data.markets.slice(0, 3).map((m: any) => m.country);
                setFormData(prev => ({ ...prev, targetMarkets: topMarkets }));
            }
        } catch (error) {
            toast.error('AI Analysis failed. You can define markets manually.');
        } finally {
            setAnalyzing(false);
        }
    };

    const finishOnboarding = async () => {
        setLoading(true);
        try {
            await authAPI.updateProfile({
                name: formData.name,
                company: formData.companyName,
                jobTitle: formData.jobTitle,
                phone: formData.phone,
                phoneCountryCode: formData.phoneCountryCode,
                website: formData.website,
                country: formData.country,
                industry: formData.industry,
                companyType: formData.companyType,
                logo: formData.logo,
                preferredLanguage: formData.preferredLanguage,
                apiKeys: { gemini: formData.geminiKey },
                productGroups: formData.productGroups,
                targetMarkets: formData.targetMarkets,
                targetCustomerProfile: formData.targetCustomerProfile,
                subscription: formData.subscription as any,
                onboardingCompleted: true
            });
            toast.success('Setup complete! Welcome to ExportHunter.');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to save profile.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMarket = (country: string) => {
        setFormData(prev => {
            if (prev.targetMarkets.includes(country)) {
                return { ...prev, targetMarkets: prev.targetMarkets.filter(c => c !== country) };
            } else {
                return { ...prev, targetMarkets: [...prev.targetMarkets, country] };
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-outfit">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[750px]"
            >
                {/* Sidebar Navigation */}
                <div className="w-full md:w-[22rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white flex flex-col">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <span className="font-black text-xl tracking-tight">ExportHunter AI</span>
                    </div>

                    <div className="flex-1 space-y-8">
                        {steps.map((step, idx) => (
                            <div key={idx} className={`flex items-start gap-4 transition-all duration-500 ${idx <= currentStep ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`mt-1 w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500
                                    ${idx < currentStep ? 'bg-white text-blue-600 border-white' :
                                        idx === currentStep ? 'bg-blue-400/30 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-white/20'}`}>
                                    {idx < currentStep ? <Check size={20} /> : <step.icon size={20} />}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold leading-tight ${idx === currentStep ? 'text-white' : 'text-blue-100'}`}>{step.title}</h3>
                                    <p className="text-xs text-blue-200/80 mt-1 font-medium">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-10 border-t border-white/10 mt-auto">
                        <p className="text-xs text-blue-200/60 font-medium">STEP {currentStep + 1} OF {steps.length}</p>
                        <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                            <motion.div
                                className="h-full bg-white"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8 md:p-12 flex flex-col">
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {/* STEP 0: BASICS */}
                            {currentStep === 0 && (
                                <motion.div
                                    key="basics"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Let's build your profile</h2>
                                        <p className="text-slate-500 mt-2 text-lg">Introduce your business to the world.</p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Business Profile Header */}
                                        <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 flex flex-col md:flex-row items-center gap-8">
                                            {/* Professional Logo Upload */}
                                            <div className="relative group flex-shrink-0 mx-auto md:mx-0">
                                                <div className="w-24 h-24 bg-white rounded-[1.75rem] shadow-xl shadow-blue-500/5 border-2 border-slate-100 flex items-center justify-center overflow-hidden relative transition-all group-hover:border-blue-300 group-hover:shadow-blue-500/10">
                                                    {uploadingLogo ? (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Loader2 size={20} className="animate-spin text-blue-500" />
                                                            <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">Wait...</span>
                                                        </div>
                                                    ) : formData.logo ? (
                                                        <img src={getLogoUrl(formData.logo)} alt="Logo" className="w-full h-full object-contain p-3" />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1.5 text-slate-300 group-hover:text-blue-500 transition-colors">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                                                <Upload size={20} className="opacity-40" />
                                                            </div>
                                                            <span className="text-[8px] font-black uppercase tracking-tighter">Add Logo</span>
                                                        </div>
                                                    )}

                                                    {/* Hover Action Layer */}
                                                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-all flex items-center justify-center">
                                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                                                            <Plus size={16} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    disabled={uploadingLogo}
                                                />

                                                {formData.logo && (
                                                    <button
                                                        onClick={() => setFormData({ ...formData, logo: '' })}
                                                        className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all z-20 hover:scale-110 active:scale-90"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Core Info - Compact Style */}
                                            <div className="flex-1 grid grid-cols-1 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Your Full Name</label>
                                                    <div className="relative group">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                                        <input
                                                            type="text"
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-transparent rounded-xl focus:border-blue-500 transition-all outline-none font-bold text-slate-700 shadow-sm text-[13px]"
                                                            placeholder="Alex Smith"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between px-2">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Email</label>
                                                        <button
                                                            onClick={() => setIsEditingEmail(!isEditingEmail)}
                                                            className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                                                        >
                                                            {isEditingEmail ? 'Lock' : 'Change'}
                                                        </button>
                                                    </div>
                                                    <div className={`relative group ${!isEditingEmail ? 'opacity-60' : ''}`}>
                                                        <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isEditingEmail ? 'text-blue-500' : 'text-slate-300'}`} size={16} />
                                                        <input
                                                            type="email"
                                                            value={formData.email}
                                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                            readOnly={!isEditingEmail}
                                                            className={`w-full pl-11 pr-4 py-3 border-2 transition-all outline-none font-bold text-[13px] rounded-xl shadow-sm ${isEditingEmail
                                                                ? 'bg-white border-blue-500 text-slate-700'
                                                                : 'bg-white/50 border-transparent text-slate-500 cursor-not-allowed italic'
                                                                }`}
                                                            placeholder="your@email.com"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                            {/* All fields below now use consistent styling */}
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 text-blue-600">Job Title</label>
                                                <div className="relative group">
                                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                                    <input
                                                        type="text"
                                                        value={formData.jobTitle}
                                                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700 shadow-sm text-[13px]"
                                                        placeholder="Export Manager / CEO"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Company Name</label>
                                                <div className="relative group">
                                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                                    <input
                                                        type="text"
                                                        value={formData.companyName}
                                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700 shadow-sm text-[13px]"
                                                        placeholder="Atlas Global Trade"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 text-blue-600">Company Type</label>
                                                <div className="relative group">
                                                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                                    <select
                                                        value={formData.companyType}
                                                        onChange={(e) => setFormData({ ...formData, companyType: e.target.value as any })}
                                                        className="w-full pl-11 pr-10 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700 appearance-none shadow-sm text-[13px]"
                                                    >
                                                        <option value="manufacturer">Manufacturer</option>
                                                        <option value="trader">Trader / Distributor</option>
                                                        <option value="service_provider">Service Provider</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 text-emerald-600">Industry</label>
                                                <div className="relative group">
                                                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                                    <select
                                                        value={formData.industry}
                                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                                        className="w-full pl-11 pr-10 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700 appearance-none shadow-sm text-[13px]"
                                                    >
                                                        <option value="">Select Sector</option>
                                                        <option value="Chemicals">Chemicals</option>
                                                        <option value="Automotive">Automotive</option>
                                                        <option value="Textile">Textile</option>
                                                        <option value="Food & Beverage">Food & Beverage</option>
                                                        <option value="Machinery">Machinery</option>
                                                        <option value="Construction">Construction</option>
                                                        <option value="Technology">Technology</option>
                                                        <option value="Healthcare">Healthcare</option>
                                                        <option value="Agriculture">Agriculture</option>
                                                        <option value="Energy">Energy</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                </div>
                                            </div>

                                            <div className="space-y-1 relative">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Website</label>
                                                <div className="relative group">
                                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                                    <input
                                                        type="url"
                                                        value={formData.website}
                                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700 shadow-sm text-[13px]"
                                                        placeholder="https://company.com"
                                                    />
                                                </div>
                                                <div className="absolute -bottom-5 left-2 flex items-center gap-1.5 whitespace-nowrap">
                                                    <div className="flex h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                                                    <span className="text-[8px] font-black uppercase tracking-tight text-blue-500/70">
                                                        AI will scan your website for products automatically
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Phone Number</label>
                                                <div className="flex gap-2">
                                                    <div className="relative group w-32 shrink-0">
                                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                                        <select
                                                            value={formData.phoneCountryCode}
                                                            onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
                                                            className="w-full pl-11 pr-8 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700 appearance-none shadow-sm text-[13px]"
                                                        >
                                                            <option value="+90">+90 🇹🇷</option>
                                                            <option value="+1">+1 🇺🇸</option>
                                                            <option value="+44">+44 🇬🇧</option>
                                                            <option value="+49">+49 🇩🇪</option>
                                                            <option value="+86">+86 🇨🇳</option>
                                                            <option value="+7">+7 🇷🇺</option>
                                                            <option value="+33">+33 🇫🇷</option>
                                                            <option value="+971">+971 🇦🇪</option>
                                                            <option value="+39">+39 🇮🇹</option>
                                                            <option value="+34">+34 🇪🇸</option>
                                                        </select>
                                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                                    </div>
                                                    <div className="relative group flex-1">
                                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                                        <input
                                                            type="tel"
                                                            value={formData.phone}
                                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700 shadow-sm text-[13px]"
                                                            placeholder="5XX XXX XX XX"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1 md:col-span-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 text-purple-600">AI Communication Language</label>
                                                <div className="relative group">
                                                    <Languages className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                                                    <select
                                                        value={formData.preferredLanguage}
                                                        onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                                                        className="w-full pl-11 pr-10 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700 appearance-none shadow-sm text-[13px]"
                                                    >
                                                        <option>English</option>
                                                        <option>Turkish</option>
                                                        <option>Russian</option>
                                                        <option>Chinese</option>
                                                        <option>Arabic</option>
                                                        <option>German</option>
                                                        <option>French</option>
                                                        <option>Spanish</option>
                                                        <option>Portuguese</option>
                                                        <option>Italian</option>
                                                        <option>Japanese</option>
                                                        <option>Korean</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 1: PRODUCTS */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="products"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Portfolio</h2>
                                        <p className="text-slate-500 mt-2 text-lg">Define your offerings with technical precision for global markets.</p>
                                    </div>

                                    {/* Product Entry Form */}
                                    <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Product Discovery & HS Code */}
                                            <div className="space-y-6 md:col-span-2">
                                                <div className="space-y-1.5 relative">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                                        <Search size={12} className="text-blue-500" />
                                                        Product Name & HS Code Finder
                                                    </label>
                                                    <div className="relative group">
                                                        <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                                                        <input
                                                            type="text"
                                                            value={productSearch}
                                                            onChange={handleHsSearch}
                                                            className="w-full pl-14 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-blue-500 transition-all outline-none font-bold text-slate-700 shadow-sm text-sm"
                                                            placeholder="e.g. Paints, Powder Polymer, Cellulose Ether..."
                                                        />
                                                        {isSearchingHs && (
                                                            <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                                                <Loader2 size={20} className="animate-spin text-blue-500" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* HS Code Suggestions Dropdown */}
                                                    <AnimatePresence>
                                                        {showHsDropdown && hsSuggestions.length > 0 && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                                className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
                                                            >
                                                                <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter px-2">AI Suggested Matches</span>
                                                                </div>
                                                                {hsSuggestions.map((item, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => handleSelectHs(item)}
                                                                        className="w-full px-5 py-4 text-left hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 flex flex-col gap-0.5"
                                                                    >
                                                                        <span className="text-blue-600 font-black text-sm">{item.code}</span>
                                                                        <span className="text-slate-600 text-xs font-medium line-clamp-1">{item.description}</span>
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            {/* Production Capacity & HS Code Row */}
                                            <div className="md:col-span-2 space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Production Capacity</label>
                                                        <div className="flex flex-wrap md:flex-nowrap gap-2">
                                                            <div className="relative group flex-1 min-w-[120px]">
                                                                <Factory className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                                                                <input
                                                                    type="text"
                                                                    value={newProduct.capacity}
                                                                    onChange={(e) => setNewProduct({ ...newProduct, capacity: e.target.value })}
                                                                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-transparent rounded-xl focus:border-blue-500 transition-all outline-none font-bold text-slate-700 shadow-sm text-sm"
                                                                    placeholder="e.g. 500"
                                                                />
                                                            </div>
                                                            <div className="flex gap-2 w-full md:w-auto">
                                                                <div className="relative flex-1 md:w-24">
                                                                    <select
                                                                        value={newProduct.unit}
                                                                        onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                                                                        className="w-full px-3 py-3 bg-white border-2 border-transparent rounded-xl focus:border-blue-500 transition-all outline-none font-bold text-slate-700 shadow-sm text-[13px] appearance-none"
                                                                    >
                                                                        <option>Tons</option>
                                                                        <option>Kg</option>
                                                                        <option>Pcs</option>
                                                                        <option>m²</option>
                                                                        <option>Litre</option>
                                                                    </select>
                                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                                                                </div>
                                                                <div className="relative flex-1 md:w-28">
                                                                    <select
                                                                        value={newProduct.frequency}
                                                                        onChange={(e) => setNewProduct({ ...newProduct, frequency: e.target.value })}
                                                                        className="w-full px-3 py-3 bg-white border-2 border-transparent rounded-xl focus:border-blue-500 transition-all outline-none font-bold text-slate-700 shadow-sm text-[13px] appearance-none"
                                                                    >
                                                                        <option value="Month">/ Month</option>
                                                                        <option value="Year">/ Year</option>
                                                                        <option value="Week">/ Week</option>
                                                                        <option value="Day">/ Day</option>
                                                                    </select>
                                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">HS Code (Manual Edit)</label>
                                                        <div className="relative group">
                                                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                                                            <input
                                                                type="text"
                                                                value={newProduct.hsCode}
                                                                onChange={(e) => setNewProduct({ ...newProduct, hsCode: e.target.value })}
                                                                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-transparent rounded-xl focus:border-blue-500 transition-all outline-none font-mono font-black text-blue-600 shadow-sm text-sm"
                                                                placeholder="e.g. 3209.10"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Certificates */}
                                            <div className="md:col-span-2 space-y-4">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                                    <Trophy size={12} className="text-amber-500" />
                                                    Compliance & Certificates
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {availableCertificates.map((cert) => (
                                                        <button
                                                            key={cert}
                                                            onClick={() => {
                                                                const exists = newProduct.certificates.includes(cert);
                                                                setNewProduct({
                                                                    ...newProduct,
                                                                    certificates: exists
                                                                        ? newProduct.certificates.filter(c => c !== cert)
                                                                        : [...newProduct.certificates, cert]
                                                                });
                                                            }}
                                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${newProduct.certificates.includes(cert)
                                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                                                : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'
                                                                }`}
                                                        >
                                                            {cert}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleAddProduct}
                                            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
                                        >
                                            <Plus size={20} />
                                            Add Product to Export Portfolio
                                        </button>
                                    </div>

                                    {/* Added Products Grid */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Added Products ({formData.productGroups.length})</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {formData.productGroups.length === 0 && (
                                                <div className="md:col-span-2 h-32 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 gap-2">
                                                    <Package size={24} className="opacity-20" />
                                                    <span className="text-xs font-bold">No products added yet</span>
                                                </div>
                                            )}
                                            {formData.productGroups.map((p, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:border-blue-200 transition-all"
                                                >
                                                    <button
                                                        onClick={() => handleRemoveProduct(i)}
                                                        className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-lg z-10"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                    <div className="flex flex-col gap-4">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-mono border border-blue-100 italic">
                                                                    HS Code: {p.hsCode || '---'}
                                                                </span>
                                                                {p.capacity && (
                                                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase border border-emerald-100">
                                                                        {p.capacity} {p.unit} / {p.frequency}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <span className="text-slate-400 font-bold text-[9px] uppercase tracking-widest block">Product Name:</span>
                                                                <h4 className="font-black text-slate-800 text-sm leading-tight">
                                                                    {p.name}
                                                                </h4>
                                                            </div>
                                                        </div>

                                                        {p.certificates && p.certificates.length > 0 && (
                                                            <div className="space-y-1.5">
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Certificates:</span>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {p.certificates.map(c => (
                                                                        <span key={c} className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-md text-[9px] font-black uppercase border border-slate-100">
                                                                            {c}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: API SETUP */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="api"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI Configuration</h2>
                                        <p className="text-slate-500 mt-2 text-lg">Connect Gemini API to power your discovery engine.</p>
                                    </div>

                                    <div className="bg-amber-50 border-2 border-amber-100 p-6 rounded-[2rem] space-y-3">
                                        <div className="flex items-center gap-3 text-amber-700 font-bold">
                                            <Key size={18} />
                                            Why do I need this?
                                        </div>
                                        <p className="text-sm text-amber-700/80 leading-relaxed font-medium">
                                            To keep ExportHunter free and private, we use your own AI keys. Your data stays Yours.
                                            You can get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" className="font-bold underline">Google AI Studio</a>.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Gemini API Key</label>
                                        <div className="relative group">
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                            <input
                                                type="password"
                                                value={formData.geminiKey}
                                                onChange={(e) => setFormData({ ...formData, geminiKey: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-blue-500 transition-all outline-none font-medium"
                                                placeholder="AIzaSy..."
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2 ml-1">🔒 Your key is encrypted and stored securely.</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: MARKETS */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="markets"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    {analyzing ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                                            <div className="relative">
                                                <div className="w-32 h-32 border-[6px] border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Wand2 size={44} className="text-blue-600 animate-pulse" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Global Analysis</h3>
                                                <p className="text-slate-500 mt-2 font-medium max-w-xs mx-auto leading-relaxed">
                                                    Scanning trade routes and market demand for <strong>{formData.productGroups.join(', ')}</strong>...
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Strategic Markets</h2>
                                                    <p className="text-slate-500 mt-2 text-lg">AI-recommended targets for growth.</p>
                                                </div>
                                                <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2 shadow-sm">
                                                    <Sparkles size={14} />
                                                    AI Recommended
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                {aiSuggestions.map((suggestion, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, y: 15 }}
                                                        animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }}
                                                        className={`p-5 rounded-[2rem] border-2 cursor-pointer transition-all group relative overflow-hidden ${formData.targetMarkets.includes(suggestion.country)
                                                            ? 'border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-500/10'
                                                            : 'border-slate-50 hover:border-blue-200 bg-slate-50/30'
                                                            }`}
                                                        onClick={() => toggleMarket(suggestion.country)}
                                                    >
                                                        {formData.targetMarkets.includes(suggestion.country) && (
                                                            <div className="absolute -right-2 -top-2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center pt-2 pr-2">
                                                                <Check size={16} className="text-white" />
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h3 className="font-black text-xl text-slate-900">{suggestion.country}</h3>
                                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${suggestion.score >= 80 ? 'bg-green-100 text-green-700' :
                                                                suggestion.score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                {suggestion.score}% Match
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 font-medium leading-relaxed italic">{suggestion.logic}</p>
                                                    </motion.div>
                                                ))}

                                                <div className="p-6 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col gap-4 bg-slate-50/20">
                                                    <div className="flex items-center gap-2 px-1">
                                                        <Plus size={16} className="text-slate-400" />
                                                        <span className="text-sm font-bold text-slate-500">Custom Markets</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={marketInput}
                                                            onChange={(e) => setMarketInput(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    if (marketInput.trim()) {
                                                                        toggleMarket(marketInput.trim());
                                                                        setMarketInput('');
                                                                    }
                                                                }
                                                            }}
                                                            placeholder="Add country..."
                                                            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm font-medium"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                if (marketInput.trim()) {
                                                                    toggleMarket(marketInput.trim());
                                                                    setMarketInput('');
                                                                }
                                                            }}
                                                            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-colors"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {formData.targetMarkets.filter(m => !aiSuggestions.find(s => s.country === m)).map(m => (
                                                            <span key={m} className="px-3 py-1 bg-white border border-blue-100 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-1">
                                                                {m}
                                                                <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => toggleMarket(m)} />
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {/* STEP 4: IDEAL CUSTOMERS */}
                            {currentStep === 4 && (
                                <motion.div
                                    key="customers"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ideal Buyer Profile</h2>
                                        <p className="text-slate-500 mt-2 text-lg">Who should we find for you?</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {[
                                            'Wholesalers', 'Distributors', 'Retailers',
                                            'Manufacturers', 'E-commerce', 'Agents',
                                            'Supply Chains', 'Boutiques', 'Corporate'
                                        ].map(type => (
                                            <div
                                                key={type}
                                                onClick={() => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        targetCustomerProfile: prev.targetCustomerProfile.includes(type)
                                                            ? prev.targetCustomerProfile.filter(t => t !== type)
                                                            : [...prev.targetCustomerProfile, type]
                                                    }))
                                                }}
                                                className={`p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 text-center
                                                    ${formData.targetCustomerProfile.includes(type)
                                                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg'
                                                        : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:border-blue-200 hover:bg-white'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.targetCustomerProfile.includes(type) ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                                    <User size={20} />
                                                </div>
                                                <span className="font-bold text-sm tracking-tight">{type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 5: PLAN SELECTION */}
                            {currentStep === 5 && (
                                <motion.div
                                    key="plans"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="text-center">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Select Your Mission Plan</h2>
                                        <p className="text-slate-500 mt-2 text-lg">Scale your global reach with AI power.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { id: 'free', name: 'Explorer', price: '$0', desc: 'Trial the AI power', icon: Globe, color: 'slate' },
                                            { id: 'pro', name: 'Hunter Pro', price: '$49', desc: 'Unlimited AI discovery', icon: Zap, color: 'blue', popular: true },
                                            { id: 'enterprise', name: 'Empire', price: '$199', desc: 'Team & custom pipelines', icon: ShieldCheck, color: 'indigo' }
                                        ].map(plan => (
                                            <div
                                                key={plan.id}
                                                onClick={() => setFormData({ ...formData, subscription: plan.id })}
                                                className={`relative p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex flex-col gap-4 overflow-hidden
                                                    ${formData.subscription === plan.id
                                                        ? `border-${plan.color}-600 bg-${plan.color}-50 shadow-2xl`
                                                        : 'border-slate-100 bg-slate-50/30 hover:border-slate-300'
                                                    }`}
                                            >
                                                {plan.popular && (
                                                    <div className="absolute top-4 right-[-30px] rotate-45 bg-blue-600 text-white px-8 py-1 text-[10px] font-black uppercase tracking-widest">Popular</div>
                                                )}
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.subscription === plan.id ? `bg-${plan.color}-600 text-white` : 'bg-white text-slate-400'}`}>
                                                    <plan.icon size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-xl text-slate-900">{plan.name}</h3>
                                                    <p className="text-xs text-slate-500 font-medium">{plan.desc}</p>
                                                </div>
                                                <div className="mt-2">
                                                    <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                                                    <span className="text-slate-400 text-xs font-bold">/mo</span>
                                                </div>
                                                <ul className="space-y-2 mt-2">
                                                    <li className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                                        <Check size={12} className="text-green-500" /> AI Market Discovery
                                                    </li>
                                                    <li className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                                        <Check size={12} className={`text-green-500 ${plan.id === 'free' ? 'opacity-20' : ''}`} /> Auto Email Campaigns
                                                    </li>
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-100">
                        <button
                            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                            className={`flex items-center gap-2 px-8 py-4 text-slate-500 font-bold hover:text-slate-900 transition-colors ${currentStep === 0 ? 'invisible' : ''}`}
                        >
                            Back
                        </button>

                        {!analyzing && (
                            <button
                                onClick={handleNext}
                                disabled={loading}
                                className="group flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black tracking-tight hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? <LoadingSpinner size="sm" color="text-white" /> : (
                                    <>
                                        {currentStep === steps.length - 1 ? 'Start Exporting' : 'Continue'}
                                        <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
