'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getUser, logout } from '@/lib/auth';
import API from '@/lib/api';

interface User { id: string; name: string; email: string; role: string; }
interface Stats { totalOrders: number; totalRevenue: number; totalCustomers: number; totalMenuItems: number; }

export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        if (!isLoggedIn()) {
            router.push('/login');
            return;
        }
        const userData = getUser();
        setUser(userData as User);
        API.get('/reports/summary').then(res => setStats(res.data));
    }, [router]);

    const handleLogout = () => { logout(); router.push('/login'); };

    if (!user) return null;

    const navLinks = [
        { href: '/menu', label: 'Menu', icon: '🍛', roles: ['admin', 'owner', 'staff'] },
        { href: '/customers', label: 'Customers', icon: '👥', roles: ['admin', 'owner', 'staff'] },
        { href: '/billing', label: 'Billing', icon: '🧾', roles: ['admin', 'owner', 'staff'] },
        { href: '/orders', label: 'Orders', icon: '📋', roles: ['admin', 'owner'] },
        { href: '/reports', label: 'Reports', icon: '📊', roles: ['admin', 'owner'] },
        { href: '/profile', label: 'Profile', icon: '👤', roles: ['admin', 'owner', 'staff'] },
    ];

    const cards = [
        { href: '/billing', icon: '🧾', label: 'Create Bill', desc: 'Generate invoices & bills', color: 'bg-orange-500', roles: ['admin', 'owner', 'staff'] },
        { href: '/menu', icon: '🍛', label: 'Menu', desc: 'Manage food items', color: 'bg-blue-500', roles: ['admin', 'owner', 'staff'] },
        { href: '/customers', icon: '👥', label: 'Customers', desc: 'Manage customer records', color: 'bg-green-500', roles: ['admin', 'owner', 'staff'] },
        { href: '/orders', icon: '📋', label: 'Order History', desc: 'View all previous bills', color: 'bg-purple-500', roles: ['admin', 'owner'] },
        { href: '/reports', icon: '📊', label: 'Reports', desc: 'Sales analytics & insights', color: 'bg-pink-500', roles: ['admin', 'owner'] },
        { href: '/profile', icon: '👤', label: 'Profile', desc: 'Staff & profile settings', color: 'bg-yellow-500', roles: ['admin', 'owner', 'staff'] },
    ];

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'text-red-300';
            case 'owner': return 'text-yellow-300';
            default: return 'text-slate-300';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return '👨‍💻';
            case 'owner': return '👑';
            default: return '👤';
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">

            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🍽️</span>
                        <div>
                            <p className="font-bold text-slate-800 text-base leading-tight">
                                Restaurant Billing
                            </p>
                            <p className="text-xs text-slate-400">🇱🇰 Sri Lankan POS</p>
                        </div>
                    </div>

                    {/* Nav Links — filtered by role */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks
                            .filter(link => link.roles.includes(user.role))
                            .map(link => (
                                <Link key={link.href} href={link.href}
                                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-500 transition">
                                    <span>{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                            <p className={`text-xs capitalize font-medium ${
                                user.role === 'admin'
                                    ? 'text-red-500'
                                    : user.role === 'owner'
                                        ? 'text-yellow-500'
                                        : 'text-slate-400'
                            }`}>
                                {getRoleIcon(user.role)} {user.role}
                            </p>
                        </div>
                        <button onClick={handleLogout}
                                className="bg-red-50 text-red-500 border border-red-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-500 hover:text-white transition">
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6">

                {/* Welcome Banner */}
                <div className={`rounded-2xl p-6 mb-6 text-white shadow-lg ${
                    user.role === 'admin'
                        ? 'bg-linear-to-r from-red-500 to-red-600'
                        : user.role === 'owner'
                            ? 'bg-linear-to-r from-yellow-500 to-yellow-600'
                            : 'bg-linear-to-r from-orange-500 to-orange-600'
                }`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">
                                Good {new Date().getHours() < 12
                                ? 'Morning'
                                : new Date().getHours() < 17
                                    ? 'Afternoon'
                                    : 'Evening'}, {user.name}! 👋
                            </h1>
                            <p className="text-white text-opacity-80 text-sm">
                                {new Date().toLocaleDateString('en-LK', {
                                    weekday: 'long', year: 'numeric',
                                    month: 'long', day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-white text-opacity-70 text-xs uppercase font-semibold">
                                Role
                            </p>
                            <p className="text-white font-bold capitalize text-lg">
                                {getRoleIcon(user.role)} {user.role}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats — Admin & Owner only */}
                {stats && user.role !== 'staff' && (
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                            <p className="text-slate-400 text-xs font-medium uppercase mb-1">
                                Total Orders
                            </p>
                            <p className="text-2xl font-bold text-slate-800">{stats.totalOrders}</p>
                            <p className="text-xs text-slate-400 mt-1">All time</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                            <p className="text-slate-400 text-xs font-medium uppercase mb-1">
                                Revenue
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                                Rs. {stats.totalRevenue?.toFixed(0)}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Total earned</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                            <p className="text-slate-400 text-xs font-medium uppercase mb-1">
                                Customers
                            </p>
                            <p className="text-2xl font-bold text-blue-600">{stats.totalCustomers}</p>
                            <p className="text-xs text-slate-400 mt-1">Registered</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                            <p className="text-slate-400 text-xs font-medium uppercase mb-1">
                                Menu Items
                            </p>
                            <p className="text-2xl font-bold text-orange-500">
                                {stats.totalMenuItems}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Available</p>
                        </div>
                    </div>
                )}

                {/* Staff Welcome Message */}
                {user.role === 'staff' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <span className="text-2xl">👋</span>
                        <div>
                            <p className="font-semibold text-blue-700">
                                Welcome, {user.name}!
                            </p>
                            <p className="text-blue-600 text-sm">
                                You can create bills and manage customers.
                            </p>
                        </div>
                    </div>
                )}

                {/* Quick Access Cards — filtered by role */}
                <h2 className="text-lg font-bold text-slate-700 mb-4">Quick Access</h2>
                <div className="grid grid-cols-3 gap-4">
                    {cards
                        .filter(card => card.roles.includes(user.role))
                        .map(card => (
                            <Link key={card.href} href={card.href}
                                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition group">
                                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition`}>
                                    {card.icon}
                                </div>
                                <p className="font-bold text-slate-800 text-base">{card.label}</p>
                                <p className="text-slate-400 text-sm mt-1">{card.desc}</p>
                            </Link>
                        ))}
                </div>

            </div>
        </div>
    );
}