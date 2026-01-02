import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    Globe,
    ArrowRight,
    BarChart3,
    CheckCircle2,
    Menu,
    X,
    Sparkles,
    Target,
    Rocket,
    ShieldCheck,
    Zap,
    Building,
    User,
    Search,
    Globe2,
    Briefcase,
    TrendingUp,
    Shield,
    ChevronDown
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    // Asset paths
    const logoPath = '/logo.png';
    const heroImagePath = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000'; // Fallback if generated not available or use generated one
    const generatedHeroPath = '/hero_global_trade_1767340340260.png'; // Assuming it was moved or accessible

    const features = [
        {
            icon: <Target className="w-8 h-8 text-blue-400" />,
            title: "AI Lead Discovery",
            description: "Proprietary autonomous agents scan 1.2B data points to identify your next high-value buyer.",
            color: "blue"
        },
        {
            icon: <Globe2 className="w-8 h-8 text-indigo-400" />,
            title: "Market Analysis",
            description: "Real-time trade flow visualization from 150+ countries with hyper-accurate prediction.",
            color: "indigo"
        },
        {
            icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
            title: "Verified Intelligence",
            description: "Enterprise-grade accuracy with 99.9% data reliability for critical trade decisions.",
            color: "emerald"
        },
        {
            icon: <Zap className="w-8 h-8 text-amber-400" />,
            title: "Autonomous Outreach",
            description: "Scale your global presence with AI-driven communication that feels human.",
            color: "amber"
        }
    ];

    const pricing = [
        {
            name: "Starter",
            price: "49",
            features: ["1,000 AI Credits", "Targeted Leads", "Standard Analytics", "Email Support"],
            popular: false
        },
        {
            name: "Professional",
            price: "199",
            features: ["5,000 AI Credits", "Verified Decision Makers", "Advanced Market Insights", "Priority 24/7 Support", "Custom Outreach Funnels"],
            popular: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            features: ["Unlimited AI Credits", "Full API Access", "Dedicated Account Manager", "Custom Data Integrations", "On-premise Options"],
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 font-outfit selection:bg-blue-500/30 text-slate-200">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-3 transition-all hover:opacity-80 cursor-pointer" onClick={() => navigate('/')}>
                            <Logo size={48} />
                            <span className="font-black text-3xl tracking-tighter text-white">ExportHunter</span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-slate-400 hover:text-white font-bold text-sm transition-colors tracking-wide uppercase italic">Features</a>
                            <a href="#solutions" className="text-slate-400 hover:text-white font-bold text-sm transition-colors tracking-wide uppercase italic">Solutions</a>
                            <a href="#pricing" className="text-slate-400 hover:text-white font-bold text-sm transition-colors tracking-wide uppercase italic">Pricing</a>
                            <div className="h-4 w-px bg-slate-800"></div>
                            <Link to="/login" className="text-slate-200 font-bold text-sm hover:text-blue-400 transition-colors uppercase tracking-widest">Sign In</Link>
                            <button
                                onClick={() => navigate('/register')}
                                className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95 text-sm uppercase tracking-tighter"
                            >
                                Start Hunting
                            </button>
                        </div>

                        {/* Mobile Toggle */}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-400">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-slate-900 border-b border-slate-800 px-6 py-8 flex flex-col gap-6"
                        >
                            <a href="#features" className="text-white text-lg font-bold" onClick={() => setIsMenuOpen(false)}>Features</a>
                            <a href="#solutions" className="text-white text-lg font-bold" onClick={() => setIsMenuOpen(false)}>Solutions</a>
                            <Link to="/login" className="text-white text-lg font-bold">Sign In</Link>
                            <button
                                onClick={() => navigate('/register')}
                                className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-center text-lg"
                            >
                                Start Now
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <header className="relative min-h-screen flex items-center pt-20 overflow-hidden">
                {/* Visual Background */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=2000"
                        className="w-full h-full object-cover opacity-20"
                        alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/40 to-slate-950"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10">
                                <Sparkles size={14} className="animate-pulse" /> The Export Revolution is AI
                            </div>

                            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.9] tracking-tighter mb-10">
                                Global Scale <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
                                    Redefined.
                                </span>
                            </h1>

                            <p className="text-xl md:text-2xl text-slate-400 mb-12 leading-relaxed max-w-xl font-medium">
                                The most powerful AI engine ever built for global exporters. Locate, analyze, and convert high-value buyers across 150+ countries.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-6 rounded-full font-black text-xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-600/40 hover:-translate-y-1 active:scale-95"
                                >
                                    Start Hunting <ArrowRight size={24} />
                                </button>
                                <button className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-white px-10 py-6 rounded-full font-black text-xl transition-all backdrop-blur-md">
                                    Watch Deep Dive
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="relative lg:h-[600px] flex items-center justify-center p-4"
                        >
                            <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full animate-pulse opacity-50"></div>
                            <div className="relative group perspective-1000 w-full max-w-[600px]">
                                <div className="rounded-[3rem] overflow-hidden border-4 border-slate-800/50 shadow-[0_0_100px_rgba(37,99,235,0.2)]">
                                    <img
                                        src="/hero_global_trade_1767340340260.png"
                                        alt="Global Trade Dashboard"
                                        className="w-full h-auto object-cover transform transition-transform group-hover:scale-105 duration-700"
                                    />
                                </div>

                                {/* Floating Stats Overlay */}
                                <motion.div
                                    animate={{ y: [0, -20, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -top-10 -right-5 bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                            <TrendingUp className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase">Success Rate</p>
                                            <p className="text-2xl font-black text-white">94.2%</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 20, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute -bottom-10 -left-5 bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                                            <Globe className="text-blue-400 animate-spin-slow" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase">Active Markets</p>
                                            <p className="text-2xl font-black text-white">154</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="mt-24 text-center"
                    >
                        <p className="text-xs font-black text-slate-600 uppercase tracking-[0.5em] mb-8">Trusted by global market leaders</p>
                        <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                            {['LogiChain', 'GlobalCargo', 'SwiftTrade', 'ZenithExp'].map(brand => (
                                <span key={brand} className="text-2xl font-black italic">{brand}</span>
                            ))}
                        </div>
                    </motion.div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer opacity-20">
                        <ChevronDown size={32} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} />
                    </div>
                </div>
            </header>

            {/* Features Grid - Bento Style */}
            <section id="features" className="py-40 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-32">
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8">
                            High Fidelity <br />
                            Trade Intelligence.
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                            Stop guessing. Start knowing. Our AI provides deep insights that traditional databases can't see.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Featured Feature */}
                        <motion.div
                            whileHover={{ y: -10 }}
                            className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 rounded-[3.5rem] relative overflow-hidden group shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                            <div className="relative z-10 space-y-8">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                                    <Target className="text-white w-8 h-8" />
                                </div>
                                <h3 className="text-4xl font-black text-white leading-tight">Advanced Lead <br />Discovery Logic.</h3>
                                <p className="text-blue-100 text-xl font-medium max-w-sm">Scan millions of shipping records and corporate signals to find buyers ready for your products.</p>
                                <button className="bg-white text-blue-700 px-8 py-3 rounded-full font-black text-sm uppercase tracking-tighter hover:bg-blue-50 transition-colors">Learn More</button>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -10 }}
                            className="bg-slate-800/50 p-12 rounded-[3.5rem] border border-slate-700/50 backdrop-blur-md space-y-8 flex flex-col justify-between"
                        >
                            <div className="space-y-8">
                                <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                                    <Globe2 className="text-indigo-400 w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-black text-white leading-tight">Global Market <br />Visualization.</h3>
                                <p className="text-slate-400 font-medium">Map every trade route, competitor move, and emerging demand in interactive 3D.</p>
                            </div>
                            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full w-2/3 bg-indigo-500 animate-pulse"></div>
                            </div>
                        </motion.div>

                        {/* More features */}
                        {features.slice(2).map((f, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="bg-slate-800/30 p-12 rounded-[3.5rem] border border-slate-700/30 backdrop-blur-sm space-y-6"
                            >
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                    {f.icon}
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tight">{f.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed italic">"{f.description}"</p>
                            </motion.div>
                        ))}

                        <motion.div
                            whileHover={{ y: -10 }}
                            className="bg-gradient-to-br from-slate-800 to-slate-900 p-12 rounded-[3.5rem] border border-slate-700/50 flex flex-col items-center justify-center text-center space-y-6"
                        >
                            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                                <Sparkles className="text-blue-400 w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-white">Full API Integration</h3>
                            <p className="text-slate-500 text-sm">Connect ExportHunter directly to your CRM, ERP, or custom tools.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-40">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">Simple, Transparent <br />Investment.</h2>
                        <p className="text-slate-400 font-medium">Choose the plan that matches your global ambitions.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {pricing.map((p, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-10 rounded-[3rem] border relative overflow-hidden transition-all duration-500 ${p.popular ? 'bg-white text-slate-900 border-white shadow-[0_0_80px_rgba(255,255,255,0.1)]' : 'bg-slate-900 text-white border-slate-800'}`}
                            >
                                {p.popular && (
                                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-bl-3xl">Popular</div>
                                )}
                                <div className="mb-10">
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${p.popular ? 'text-blue-600' : 'text-slate-500'}`}>{p.name}</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black">${p.price}</span>
                                        {p.price !== 'Custom' && <span className="text-sm font-bold opacity-50">/mo</span>}
                                    </div>
                                </div>
                                <div className="space-y-4 mb-12 flex-1">
                                    {p.features.map((f, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <CheckCircle2 size={18} className={p.popular ? 'text-blue-600' : 'text-emerald-500'} />
                                            <span className="text-sm font-bold tracking-tight">{f}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className={`w-full py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all ${p.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                                    Choose {p.name}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="solutions" className="py-40 relative">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-[4rem] p-16 md:p-32 text-center relative overflow-hidden shadow-3xl group"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/20 blur-[150px] animate-pulse"></div>
                        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
                            <h2 className="text-5xl md:text-8xl font-black text-white mb-10 leading-[0.9] tracking-tighter">
                                The world is <br />
                                yours to conquer.
                            </h2>
                            <p className="text-blue-100 text-xl md:text-2xl font-medium mb-16 max-w-xl">Join 2,000+ top exporters who use ExportHunter to dominate global markets.</p>
                            <button
                                onClick={() => navigate('/register')}
                                className="group relative bg-white text-blue-700 px-12 py-6 rounded-full font-black text-2xl transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-4"
                            >
                                Start Hunting Now
                                <ArrowRight size={28} className="transition-transform group-hover:translate-x-2" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto py-20 bg-slate-950 border-t border-slate-900">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                        <div className="col-span-1 md:col-span-2 space-y-8">
                            <div className="flex items-center gap-3">
                                <Logo size={40} />
                                <span className="text-3xl font-black text-white tracking-tighter">ExportHunter</span>
                            </div>
                            <p className="text-slate-500 max-w-sm text-lg font-medium leading-relaxed">The most advanced AI operating system for the world's most ambitious exporters.</p>
                            <div className="flex gap-6">
                                {['Twitter', 'LinkedIn', 'Instagram'].map(social => (
                                    <a key={social} href="#" className="text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs">{social}</a>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">Solutions</h4>
                            <ul className="space-y-4 text-slate-500 font-bold text-sm">
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Lead Discovery</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Market Flow</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Competitor Intel</a></li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">Company</h4>
                            <ul className="space-y-4 text-slate-500 font-bold text-sm">
                                <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-slate-900">
                        <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.5em]">© 2026 ExportHunter AI • Built for high performance exporters.</p>
                        <div className="flex gap-8 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                            <span>ISO 27001 Certified</span>
                            <span>Enterprise Ready</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
