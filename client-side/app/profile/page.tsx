'use client';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, logout, isLoggedIn, isAdmin, isAdminOrOwner } from '@/lib/auth';
import API from '@/lib/api';

interface UserProfile { id: string; name: string; email: string; role: string; }
interface StaffMember { id: number; name: string; email: string; role: string; }

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [showAddStaff, setShowAddStaff] = useState(false);
    const [newStaff, setNewStaff] = useState({
        name: '', email: '', password: '', role: 'staff'
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const loadStaff = useCallback(async () => {
        try {
            const res = await API.get('/auth/staff');
            setStaffList(res.data);
        } catch {
            console.error('Failed to load staff');
        }
    }, []);

    useEffect(() => {
        if (!isLoggedIn()) {
            router.push('/login');
            return;
        }
        const userData = getUser();
        setUser(userData as UserProfile);
        if (isAdminOrOwner()) loadStaff();
    }, [router, loadStaff]);

    const handleAddStaff = async () => {
        if (!newStaff.name || !newStaff.email || !newStaff.password) {
            setMessage('⚠️ Please fill all fields!'); return;
        }
        setLoading(true);
        try {
            await API.post('/auth/register', newStaff);
            setMessage('✅ Staff added successfully!');
            setNewStaff({ name: '', email: '', password: '', role: 'staff' });
            setShowAddStaff(false);
            loadStaff();
        } catch (err: unknown) {
            const error = err as { response?: { data?: string } };
            setMessage('❌ ' + (error.response?.data || 'Failed!'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStaff = async (id: number, name: string) => {
        if (!confirm(`Delete ${name}?`)) return;
        try {
            await API.delete(`/auth/staff/${id}`);
            setMessage('🗑️ Staff deleted!');
            loadStaff();
        } catch {
            setMessage('❌ Failed to delete!');
        }
    };

    const handleUpdateRole = async (id: number, role: string) => {
        try {
            await API.put(`/auth/staff/${id}/role`, { role });
            setMessage('✅ Role updated!');
            loadStaff();
        } catch {
            setMessage('❌ Failed to update role!');
        }
    };

    const handleLogout = () => { logout(); router.push('/login'); };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-700';
            case 'owner': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return '👨‍💻';
            case 'owner': return '👑';
            default: return '👤';
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-100">

            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {getRoleIcon(user.role)} Profile
                        </h1>
                        <p className="text-slate-400 text-sm mt-0.5">
                            Manage your account & users
                        </p>
                    </div>
                    <Link href="/"
                          className="text-sm text-slate-500 hover:text-orange-500 transition font-medium">
                        ← Dashboard
                    </Link>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-6 space-y-5">

                {message && (
                    <div className={`p-4 rounded-xl font-medium text-sm ${
                        message.includes('⚠️') || message.includes('❌')
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-green-50 text-green-600 border border-green-200'
                    }`}>
                        {message}
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className={`px-5 py-3 ${
                        user.role === 'admin'
                            ? 'bg-red-600'
                            : user.role === 'owner'
                                ? 'bg-yellow-600'
                                : 'bg-slate-800'
                    }`}>
                        <h3 className="font-semibold text-white text-sm uppercase tracking-wider">
                            My Profile
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center gap-5 mb-6">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
                                user.role === 'admin'
                                    ? 'bg-red-100'
                                    : user.role === 'owner'
                                        ? 'bg-yellow-100'
                                        : 'bg-blue-100'
                            }`}>
                                {getRoleIcon(user.role)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
                                <p className="text-slate-400 text-sm">{user.email}</p>
                                <span className={`mt-2 inline-block text-xs font-bold px-3 py-1 rounded-full uppercase ${getRoleBadge(user.role)}`}>
                  {getRoleIcon(user.role)} {user.role}
                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Full Name', value: user.name },
                                { label: 'Email', value: user.email },
                                { label: 'Role', value: user.role },
                                { label: 'Status', value: '✅ Active' },
                            ].map(item => (
                                <div key={item.label} className="bg-slate-50 p-3 rounded-xl">
                                    <p className="text-xs text-slate-400">{item.label}</p>
                                    <p className="font-semibold text-slate-800 capitalize">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Admin Info Banner */}
                {isAdmin() && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <span className="text-2xl">👨‍💻</span>
                        <div>
                            <p className="font-bold text-red-700 text-sm">Admin Access</p>
                            <p className="text-red-600 text-xs mt-0.5">
                                You have full system access — can manage all users and roles
                            </p>
                        </div>
                    </div>
                )}

                {/* User Management — Admin & Owner */}
                {isAdminOrOwner() && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="bg-slate-800 px-5 py-3 flex items-center justify-between">
                            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">
                                👥 User Management
                            </h3>
                            <button onClick={() => setShowAddStaff(!showAddStaff)}
                                    className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-600 transition">
                                + Add User
                            </button>
                        </div>
                        <div className="p-5">

                            {/* Add User Form */}
                            {showAddStaff && (
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 space-y-3">
                                    <p className="font-semibold text-orange-700 text-sm">
                                        ➕ Add New User
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input placeholder="Full Name *" value={newStaff.name}
                                               onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                               className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                                        <input placeholder="Email *" type="email" value={newStaff.email}
                                               onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                                               className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                                    </div>
                                    <input placeholder="Password *" type="password" value={newStaff.password}
                                           onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                                           className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                                    <select value={newStaff.role}
                                            onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                                        <option value="staff">👤 Staff</option>
                                        <option value="owner">👑 Owner</option>
                                        {isAdmin() && <option value="admin">👨‍💻 Admin</option>}
                                    </select>
                                    <div className="flex gap-2">
                                        <button onClick={handleAddStaff} disabled={loading}
                                                className="flex-1 bg-orange-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50">
                                            {loading ? '⏳ Adding...' : '✅ Add User'}
                                        </button>
                                        <button onClick={() => setShowAddStaff(false)}
                                                className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm hover:bg-slate-300">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* User List */}
                            {staffList.length === 0 ? (
                                <p className="text-slate-400 text-sm text-center py-6">
                                    No users yet
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {staffList.map(staff => (
                                        <div key={staff.id}
                                             className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                                                    staff.role === 'admin'
                                                        ? 'bg-red-100'
                                                        : staff.role === 'owner'
                                                            ? 'bg-yellow-100'
                                                            : 'bg-blue-100'
                                                }`}>
                                                    {getRoleIcon(staff.role)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-sm">
                                                        {staff.name}
                                                        {staff.email === user.email && (
                                                            <span className="ml-2 text-xs text-orange-500">(You)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-slate-400 text-xs">{staff.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getRoleBadge(staff.role)}`}>
                          {getRoleIcon(staff.role)} {staff.role}
                        </span>

                                                {/* Admin can change roles */}
                                                {isAdmin() && staff.email !== user.email && (
                                                    <select
                                                        value={staff.role}
                                                        onChange={e => handleUpdateRole(staff.id, e.target.value)}
                                                        className="border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400">
                                                        <option value="staff">👤 Staff</option>
                                                        <option value="owner">👑 Owner</option>
                                                        <option value="admin">👨‍💻 Admin</option>
                                                    </select>
                                                )}

                                                {/* Delete — not yourself */}
                                                {staff.email !== user.email && (
                                                    <button
                                                        onClick={() => handleDeleteStaff(staff.id, staff.name)}
                                                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600 transition">
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Staff Only View */}
                {!isAdminOrOwner() && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="bg-slate-800 px-5 py-3">
                            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">
                                🍽️ System Info
                            </h3>
                        </div>
                        <div className="p-5 space-y-3">
                            {[
                                { label: 'System', value: 'Restaurant Billing' },
                                { label: 'Your Role', value: '👤 Staff Member' },
                                { label: 'Access Level', value: 'Standard' },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between text-sm">
                                    <span className="text-slate-400">{item.label}</span>
                                    <span className="font-medium text-slate-700">{item.value}</span>
                                </div>
                            ))}
                            <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-sm text-blue-700 mt-2">
                                💡 Contact your owner to update your account details.
                            </div>
                        </div>
                    </div>
                )}

                {/* Logout */}
                <button onClick={handleLogout}
                        className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-600 transition shadow-md">
                    🚪 Logout
                </button>

            </div>
        </div>
    );
}