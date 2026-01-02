import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles, Building2, Globe, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

export default function LoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response: any = await authAPI.login(formData);

            if (response.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                toast.success('Welcome back!');

                const user = response.data.user;
                if (!user.productGroups || user.productGroups.length === 0 || !user.targetMarkets || user.targetMarkets.length === 0) {
                    navigate('/onboarding');
                } else {
                    navigate('/dashboard');
                }
            } else {
                toast.error(response.error || 'Login failed');
            }
        } catch (err: any) {
            const message = err.response?.data?.error || 'Connection error. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-outfit">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl opacity-50 animate-pulse" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-3xl opacity-50 animate-pulse" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[600px] relative z-10"
            >
                {/* Left Side: Branding/Visuals */}
                <div className="w-full md:w-[45%] bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-12">
                            <Logo size={48} />
                            <span className="font-black text-2xl tracking-tight">ExportHunter</span>
                        </div>

                        <div className="space-y-8">
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl font-black leading-tight tracking-tight"
                            >
                                Supercharge your <br />
                                <span className="text-blue-200">global trade</span> with AI.
                            </motion.h2>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-white/80">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                        <Globe size={20} />
                                    </div>
                                    <p className="font-bold text-sm tracking-wide">Find markets instantly</p>
                                </div>
                                <div className="flex items-center gap-4 text-white/80">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                        <Building2 size={20} />
                                    </div>
                                    <p className="font-bold text-sm tracking-wide">Reach premium buyers</p>
                                </div>
                                <div className="flex items-center gap-4 text-white/80">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <p className="font-bold text-sm tracking-wide">AI-driven data security</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 pt-12">
                        <div className="p-6 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/10">
                            <p className="text-sm font-medium italic opacity-90 leading-relaxed">
                                "The fastest way to discover global trade opportunities and build lasting business relationships."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex-1 p-12 md:p-16 flex flex-col justify-center">
                    <div className="mb-10 text-center md:text-left">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
                        <p className="text-slate-500 mt-2 font-medium">Log in to your global command center.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                            <div className="relative group transition-all duration-300">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700 shadow-sm shadow-inner"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                                <a href="#" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider transition-colors">Forgot?</a>
                            </div>
                            <div className="relative group transition-all duration-300">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700 shadow-sm shadow-inner"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group bg-blue-600 text-white py-5 px-6 rounded-2xl font-black tracking-tight hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-500 font-medium">
                        New to ExportHunter?{' '}
                        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold decoration-2 underline-offset-4 hover:underline transition-all">
                            Create Account
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
