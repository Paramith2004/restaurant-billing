'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getUser, logout } from '@/lib/auth';

export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        if (!isLoggedIn()) {
            router.push('/login');
        } else {
            setUser(getUser());
        }
    }, [router]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Navbar */}
            <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🍽️</span>
                    <span className="font-bold text-gray-800 text-lg">
            Restaurant Billing
          </span>
                </div>
                <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            👋 Welcome, <span className="font-medium">{user.name}</span>
          </span>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition">
                        🚪 Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center py-16">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">
                        Dashboard
                    </h1>
                    <p className="text-gray-500">
                        Manage your restaurant easily
                    </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-2 gap-6">
                    <Link href="/menu"
                          className="bg-white p-8 rounded-2xl shadow-md text-center hover:shadow-xl transition hover:-translate-y-1">
                        <div className="text-5xl mb-4">🍛</div>
                        <div className="font-bold text-xl text-gray-800">
                            Menu Management
                        </div>
                        <p className="text-gray-500 text-sm mt-2">
                            Add, edit, delete menu items
                        </p>
                    </Link>

                    <Link href="/customers"
                          className="bg-white p-8 rounded-2xl shadow-md text-center hover:shadow-xl transition hover:-translate-y-1">
                        <div className="text-5xl mb-4">👥</div>
                        <div className="font-bold text-xl text-gray-800">
                            Customers
                        </div>
                        <p className="text-gray-500 text-sm mt-2">
                            Manage customer records
                        </p>
                    </Link>

                    <Link href="/billing"
                          className="bg-white p-8 rounded-2xl shadow-md text-center hover:shadow-xl transition hover:-translate-y-1">
                        <div className="text-5xl mb-4">🧾</div>
                        <div className="font-bold text-xl text-gray-800">
                            Create Bill
                        </div>
                        <p className="text-gray-500 text-sm mt-2">
                            Generate invoices & bills
                        </p>
                    </Link>

                    <Link href="/reports"
                          className="bg-white p-8 rounded-2xl shadow-md text-center hover:shadow-xl transition hover:-translate-y-1">
                        <div className="text-5xl mb-4">📊</div>
                        <div className="font-bold text-xl text-gray-800">
                            Reports
                        </div>
                        <p className="text-gray-500 text-sm mt-2">
                            Sales analytics & insights
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}

