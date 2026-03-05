'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        // Validation
        if (!form.email || !form.password) {
            setError('⚠️ Please fill in all fields!');
            return;
        }

        if (!isLogin && !form.name) {
            setError('⚠️ Please enter your name!');
            return;
        }

        if (!isLogin && form.password !== form.confirmPassword) {
            setError('❌ Passwords do not match!');
            return;
        }

        if (!isLogin && form.password.length < 6) {
            setError('❌ Password must be at least 6 characters!');
            return;
        }

        setLoading(true);

        try {
            if (!isLogin) {
                // Register
                await API.post('/auth/register', {
                    name: form.name,
                    email: form.email,
                    password: form.password
                });
                setSuccess('✅ Account created! Please sign in now.');
                setIsLogin(true);
                setForm({ name: '', email: form.email, password: '', confirmPassword: '' });

            } else {
                // Login
                const res = await API.post('/auth/login', {
                    email: form.email,
                    password: form.password
                });

                const { token, name, email, role } = res.data;
                localStorage.setItem('token', token);
                localStorage.setItem('name', name);
                localStorage.setItem('email', email);
                localStorage.setItem('role', role);

                router.push('/');
            }

        } catch (err: any) {
            setError('❌ ' + (err.response?.data || 'Something went wrong!'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-6">
                    <p className="text-5xl mb-3">🍽️</p>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Restaurant Billing
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {isLogin ? 'Sign in to your account' : 'Create your account'}
                    </p>
                </div>

                {/* Toggle Tabs */}
                <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                    <button
                        onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                            !isLogin
                                ? 'bg-white text-orange-500 shadow'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        📝 Sign Up
                    </button>
                    <button
                        onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                            isLogin
                                ? 'bg-white text-orange-500 shadow'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        🔐 Sign In
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm font-medium">
                        {success}
                    </div>
                )}

                {/* Form */}
                <div className="space-y-4">

                    {/* Name - only for Sign Up */}
                    {!isLogin && (
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="Paramith Kavisha"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="user@example.com"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>

                    {/* Confirm Password - only for Sign Up */}
                    {!isLogin && (
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={form.confirmPassword}
                                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-orange-600 transition mt-2 disabled:opacity-50">
                        {loading
                            ? '⏳ Please wait...'
                            : isLogin
                                ? '🔐 Sign In'
                                : '✅ Create Account'}
                    </button>
                </div>

                {/* Bottom Text */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                            className="text-orange-500 font-medium hover:underline">
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>

            </div>
        </div>
    );
}
