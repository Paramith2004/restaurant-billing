'use client';
import { useEffect, useState, useCallback } from 'react';
import API from '@/lib/api';

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    available: boolean;
}

export default function MenuPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [form, setForm] = useState({
        name: '', description: '', price: '', category: ''
    });
    const [message, setMessage] = useState('');

    const loadMenu = useCallback(() => {
        API.get('/menu').then(res => setItems(res.data));
    }, []);

    useEffect(() => {
        loadMenu();
    }, [loadMenu]);

    const handleAdd = async () => {
        await API.post('/menu', { ...form, available: true });
        setMessage('✅ Item added!');
        setForm({ name: '', description: '', price: '', category: '' });
        loadMenu();
    };

    const handleDelete = async (id: number) => {
        await API.delete(`/menu/${id}`);
        setMessage('🗑️ Item deleted!');
        loadMenu();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    🍛 Menu Management
                </h1>

                {/* Add Form */}
                <div className="bg-white p-6 rounded-xl shadow mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        Add New Item
                    </h3>
                    {message && (
                        <p className="text-green-600 mb-3 font-medium">{message}</p>
                    )}
                    <div className="flex flex-wrap gap-3">
                        <input
                            placeholder="Name"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <input
                            placeholder="Description"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <input
                            placeholder="Price"
                            value={form.price}
                            type="number"
                            onChange={e => setForm({ ...form, price: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 w-28 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <input
                            placeholder="Category"
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <button
                            onClick={handleAdd}
                            className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition">
                            + Add Item
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-orange-500 text-white">
                        <tr>
                            <th className="p-4 text-left font-semibold">Name</th>
                            <th className="p-4 text-left font-semibold">Category</th>
                            <th className="p-4 text-left font-semibold">Price</th>
                            <th className="p-4 text-left font-semibold">Available</th>
                            <th className="p-4 text-left font-semibold">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map((item) => (
                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-4 text-gray-800 font-medium">{item.name}</td>
                                <td className="p-4 text-gray-600">{item.category}</td>
                                <td className="p-4 text-gray-600">Rs.{item.price}</td>
                                <td className="p-4 text-gray-600">{item.available ? '✅' : '❌'}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleDelete(item.id)}
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