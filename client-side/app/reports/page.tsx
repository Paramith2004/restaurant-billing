'use client';
import { useEffect, useState, useCallback } from 'react';
import API from '@/lib/api';

interface Summary {
    totalOrders: number;
    totalRevenue: number;
    totalTax: number;
    totalDiscount: number;
    totalMenuItems: number;
    totalCustomers: number;
}

interface Order {
    id: number;
    customer: { name: string };
    total: number;
    paymentMethod: string;
    tableNumber: number;
    status: string;
    createdAt: string;
}

interface PaymentMethods {
    cash?: number;
    card?: number;
    upi?: number;
}

export default function ReportsPage() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({});
    const [loading, setLoading] = useState(true);

    const loadReports = useCallback(() => {
        setLoading(true);
        Promise.all([
            API.get('/reports/summary'),
            API.get('/reports/recent-orders'),
            API.get('/reports/payment-methods'),
        ]).then(([summaryRes, ordersRes, paymentRes]) => {
            setSummary(summaryRes.data);
            setRecentOrders(ordersRes.data);
            setPaymentMethods(paymentRes.data);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500 text-lg">Loading reports... ⏳</p>
            </div>
        );
    }

    const totalPayments = Object.values(paymentMethods).reduce((a, b) => a + b, 0);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">📊 Reports & Analytics</h1>
                    <a href="/" className="text-sm text-blue-500 hover:underline">
                        ← Back to Dashboard
                    </a>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-xl shadow text-center">
                        <p className="text-4xl mb-2">🧾</p>
                        <p className="text-3xl font-bold text-gray-800">{summary?.totalOrders}</p>
                        <p className="text-gray-500 text-sm mt-1">Total Orders</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow text-center">
                        <p className="text-4xl mb-2">💰</p>
                        <p className="text-3xl font-bold text-green-600">
                            Rs.{summary?.totalRevenue.toFixed(2)}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">Total Revenue</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow text-center">
                        <p className="text-4xl mb-2">👥</p>
                        <p className="text-3xl font-bold text-gray-800">{summary?.totalCustomers}</p>
                        <p className="text-gray-500 text-sm mt-1">Total Customers</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow text-center">
                        <p className="text-4xl mb-2">🍛</p>
                        <p className="text-3xl font-bold text-gray-800">{summary?.totalMenuItems}</p>
                        <p className="text-gray-500 text-sm mt-1">Menu Items</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow text-center">
                        <p className="text-4xl mb-2">🏷️</p>
                        <p className="text-3xl font-bold text-blue-600">
                            Rs.{summary?.totalTax.toFixed(2)}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">Total Tax Collected</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow text-center">
                        <p className="text-4xl mb-2">🎁</p>
                        <p className="text-3xl font-bold text-red-500">
                            Rs.{summary?.totalDiscount.toFixed(2)}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">Total Discounts</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">

                    {/* Payment Methods */}
                    <div className="bg-white p-5 rounded-xl shadow">
                        <h3 className="font-semibold text-gray-700 text-lg mb-4">
                            💳 Payment Methods
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(paymentMethods).map(([method, count]) => (
                                <div key={method}>
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span className="capitalize font-medium">
                      {method === 'cash' ? '💵' : method === 'card' ? '💳' : '📱'} {method}
                    </span>
                                        <span>{count} orders ({Math.round((count / totalPayments) * 100)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full ${
                                                method === 'cash' ? 'bg-green-500' :
                                                    method === 'card' ? 'bg-blue-500' : 'bg-purple-500'
                                            }`}
                                            style={{ width: `${Math.round((count / totalPayments) * 100)}%` }}>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white p-5 rounded-xl shadow">
                        <h3 className="font-semibold text-gray-700 text-lg mb-4">
                            📈 Quick Stats
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Average Order Value</span>
                                <span className="font-bold text-gray-800">
                  Rs.{summary?.totalOrders
                                    ? (summary.totalRevenue / summary.totalOrders).toFixed(2)
                                    : '0.00'}
                </span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Average Tax per Order</span>
                                <span className="font-bold text-gray-800">
                  Rs.{summary?.totalOrders
                                    ? (summary.totalTax / summary.totalOrders).toFixed(2)
                                    : '0.00'}
                </span>
                            </div>
                            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Average Discount per Order</span>
                                <span className="font-bold text-red-500">
                  Rs.{summary?.totalOrders
                                    ? (summary.totalDiscount / summary.totalOrders).toFixed(2)
                                    : '0.00'}
                </span>
                            </div>
                            <div className="flex justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                <span className="text-sm text-gray-600">Net Revenue (after discount)</span>
                                <span className="font-bold text-green-600">
                  Rs.{((summary?.totalRevenue || 0)).toFixed(2)}
                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow mt-6 overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-700 text-lg">
                            🕒 Recent Orders
                        </h3>
                    </div>
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 text-left text-sm text-gray-600 font-medium">Bill ID</th>
                            <th className="p-4 text-left text-sm text-gray-600 font-medium">Customer</th>
                            <th className="p-4 text-left text-sm text-gray-600 font-medium">Table</th>
                            <th className="p-4 text-left text-sm text-gray-600 font-medium">Payment</th>
                            <th className="p-4 text-left text-sm text-gray-600 font-medium">Total</th>
                            <th className="p-4 text-left text-sm text-gray-600 font-medium">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {recentOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-400">
                                    No orders yet
                                </td>
                            </tr>
                        ) : (
                            recentOrders.map(order => (
                                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-800">#{order.id}</td>
                                    <td className="p-4 text-gray-700">{order.customer?.name}</td>
                                    <td className="p-4 text-gray-600">Table {order.tableNumber}</td>
                                    <td className="p-4 text-gray-600 capitalize">
                                        {order.paymentMethod === 'cash' ? '💵' :
                                            order.paymentMethod === 'card' ? '💳' : '📱'} {order.paymentMethod}
                                    </td>
                                    <td className="p-4 font-bold text-green-600">Rs.{order.total?.toFixed(2)}</td>
                                    <td className="p-4">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        {order.status}
                      </span>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}