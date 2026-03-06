'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError(''); setSuccess('');
        if (!form.email || !form.password) { setError('Please fill in all fields!'); return; }
        if (!isLogin && !form.name) { setError('Please enter your name!'); return; }
        if (!isLogin && form.password !== form.confirmPassword) { setError('Passwords do not match!'); return; }
        if (!isLogin && form.password.length < 6) { setError('Password must be at least 6 characters!'); return; }

        setLoading(true);
        try {
            if (!isLogin) {
                await API.post('/auth/register', {
                    name: form.name, email: form.email, password: form.password
                });
                setSuccess('Account created! Please sign in now.');
                setIsLogin(true);
                setForm({ name: '', email: form.email, password: '', confirmPassword: '' });
            } else {
                const res = await API.post('/auth/login', {
                    email: form.email, password: form.password
                });
                const { id, token, name, email, role } = res.data;
                localStorage.setItem('id', id);
                localStorage.setItem('token', token);
                localStorage.setItem('name', name);
                localStorage.setItem('email', email);
                localStorage.setItem('role', role);
                router.push('/');
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: string } };
            setError(error.response?.data || 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">

            {/* Left — Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-orange-500 p-12">
                <div className="text-center text-white">
                    <p className="text-8xl mb-6">🍽️</p>
                    <h1 className="text-4xl font-bold mb-4">Restaurant Billing</h1>
                    <p className="text-orange-100 text-lg mb-8">Professional POS & Billing System</p>
                    <div className="space-y-3 text-left">
                        {['Fast & Easy Billing', 'Customer Management', 'Real-time Reports', 'Print Invoices'].map(f => (
                            <div key={f} className="flex items-center gap-3">
                                <span className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xs">✓</span>
                                <span className="text-orange-100">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="lg:hidden text-5xl mb-4">🍽️</div>
                        <h2 className="text-3xl font-bold text-slate-800">
                            {isLogin ? 'Welcome Back!' : 'Create Account'}
                        </h2>
                        <p className="text-slate-500 mt-2">
                            {isLogin ? 'Sign in to continue' : 'Register to get started'}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-slate-200 rounded-xl p-1 mb-6">
                        <button onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${!isLogin ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500'}`}>
                            Sign Up
                        </button>
                        <button onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${isLogin ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500'}`}>
                            Sign In
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                            <span>✅</span> {success}
                        </div>
                    )}

                    <div className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Full Name</label>
                                <input type="text" placeholder="Paramith Kavisha" value={form.name}
                                       onChange={e => setForm({ ...form, name: e.target.value })}
                                       className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm" />
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email Address</label>
                            <input type="email" placeholder="user@example.com" value={form.email}
                                   onChange={e => setForm({ ...form, email: e.target.value })}
                                   className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Password</label>
                            <input type="password" placeholder="••••••••" value={form.password}
                                   onChange={e => setForm({ ...form, password: e.target.value })}
                                   className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm" />
                        </div>
                        {!isLogin && (
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Confirm Password</label>
                                <input type="password" placeholder="••••••••" value={form.confirmPassword}
                                       onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                       className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm" />
                            </div>
                        )}
                        <button onClick={handleSubmit} disabled={loading}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold text-base transition shadow-md disabled:opacity-50 mt-2">
                            {loading ? '⏳ Please wait...' : isLogin ? '🔐 Sign In' : '✅ Create Account'}
                        </button>
                    </div>

                    <div className="text-center mt-6">
                        <p className="text-sm text-slate-500">
                            {isLogin ? "Don't have an account? " : 'Already have an account? '}
                            <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                                    className="text-orange-500 font-semibold hover:underline">
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}