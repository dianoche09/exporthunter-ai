import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Building, ArrowRight, Sparkles, Check, Globe, Zap, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        company: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    company: formData.company,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('refreshToken', data.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.data.user));
                toast.success('Account created! Welcome.');
                navigate('/onboarding');
            } else {
                toast.error(data.error || 'Registration failed');
            }
        } catch (err) {
            toast.error('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 font-outfit">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-[20%] -left-[10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-3xl opacity-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row relative z-10"
            >
                {/* Left Side: Onboarding Content */}
                <div className="w-full md:w-[40%] bg-gradient-to-br from-indigo-700 to-blue-600 p-12 text-white flex flex-col justify-between relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-16">
                            <Logo size={48} />
                            <span className="font-black text-2xl tracking-tight">ExportHunter</span>
                        </div>

                        <div className="space-y-10">
                            <h2 className="text-4xl font-black leading-tight tracking-tight">
                                Your journey to <br />
                                <span className="text-blue-200">global success</span> starts here.
                            </h2>

                            <div className="space-y-6">
                                {[
                                    { icon: Globe, text: "Discover high-potential markets" },
                                    { icon: Zap, text: "AI-powered lead qualification" },
                                    { icon: ShieldCheck, text: "Enterprise-grade data security" }
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (idx * 0.1) }}
                                        className="flex items-center gap-4 group"
                                    >
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-colors">
                                            <item.icon size={22} className="text-blue-100" />
                                        </div>
                                        <span className="font-bold text-base tracking-wide text-white/90">{item.text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-12">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3 text-white">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-slate-200 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Joined by 2,000+ exporters</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex-1 p-10 md:p-16">
                    <div className="max-w-md mx-auto">
                        <div className="mb-10 text-center md:text-left">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h1>
                            <p className="text-slate-500 mt-2 font-medium">Join the next generation of global traders.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                    <div className="relative group transition-all duration-300">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                                            placeholder="Alex Smith"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                                    <div className="relative group transition-all duration-300">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Company Name</label>
                                    <div className="relative group transition-all duration-300">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Building className="text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                                            placeholder="Atlas Global Trade"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Password</label>
                                        <div className="relative group transition-all duration-300">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Confirm</label>
                                        <div className="relative group transition-all duration-300">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 px-1 py-1">
                                <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center border border-blue-200">
                                    <Check size={12} className="text-blue-600" />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                    I agree to the <a href="#" className="underline text-blue-500 leading-none">Terms</a> and <a href="#" className="underline text-blue-500 leading-none">Privacy Policy</a>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group bg-blue-600 text-white py-4 px-6 rounded-2xl font-black tracking-tight hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Get Started
                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-slate-500 font-medium tracking-tight">
                            Already global?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold decoration-2 underline-offset-4 hover:underline transition-all">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
