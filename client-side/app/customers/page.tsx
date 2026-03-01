'use client';
import { useEffect, useState, useCallback } from 'react';
import API from '@/lib/api';

interface Customer {
    id: number;
    name: string;
    phone: string;
    email: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [form, setForm] = useState({ name: '', phone: '', email: '' });
    const [message, setMessage] = useState('');

    const loadCustomers = useCallback(() => {
        API.get('/customers').then(res => setCustomers(res.data));
    }, []);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    const handleAdd = async () => {
        await API.post('/customers', form);
        setMessage('✅ Customer added!');
        setForm({ name: '', phone: '', email: '' });
        loadCustomers();
    };

    const handleDelete = async (id: number) => {
        await API.delete(`/customers/${id}`);
        setMessage('🗑️ Customer deleted!');
        loadCustomers();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    👥 Customer Management
                </h1>

                {/* Add Form */}
                <div className="bg-white p-6 rounded-xl shadow mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        Add New Customer
                    </h3>
                    {message && (
                        <p className="text-green-600 mb-3 font-medium">{message}</p>
                    )}
                    <div className="flex flex-wrap gap-3">
                        <input
                            placeholder="Name"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                            placeholder="Phone"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                            placeholder="Email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                            onClick={handleAdd}
                            className="bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition">
                            + Add Customer
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-blue-500 text-white">
                        <tr>
                            <th className="p-4 text-left font-semibold">Name</th>
                            <th className="p-4 text-left font-semibold">Phone</th>
                            <th className="p-4 text-left font-semibold">Email</th>
                            <th className="p-4 text-left font-semibold">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {customers.map((c) => (
                            <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-4 text-gray-800 font-medium">{c.name}</td>
                                <td className="p-4 text-gray-600">{c.phone}</td>
                                <td className="p-4 text-gray-600">{c.email}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}