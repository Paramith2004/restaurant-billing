'use client';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import API from '@/lib/api';

interface OrderItem {
    id: number;
    menuItem: { name: string; price: number };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

interface Order {
    id: number;
    customer: { name: string; phone: string };
    tableNumber: number;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [search, setSearch] = useState('');

    const loadOrders = useCallback(async () => {
        try {
            const res = await API.get('/orders');
            setOrders(res.data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadOrders(); }, [loadOrders]);

    const filteredOrders = orders.filter(order =>
        order.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toString().includes(search) ||
        order.paymentMethod.toLowerCase().includes(search.toLowerCase())
    );

    const handlePrint = (order: Order) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const date = new Date(order.createdAt);
        const dateStr = date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        const itemsHTML = order.items?.map(item => `
      <tr>
        <td style="padding:8px 5px;border-bottom:1px solid #eee;">${item.menuItem?.name}</td>
        <td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:right;">Rs.${item.unitPrice?.toFixed(2)}</td>
        <td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:right;">Rs.${item.totalPrice?.toFixed(2)}</td>
      </tr>`).join('') || '';

        printWindow.document.write(`
      <html lang="en"><head><title>Invoice #${order.id}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'Courier New',monospace;max-width:380px;margin:0 auto;padding:20px;color:#222;font-size:13px;}
        .center{text-align:center;}.dashed{border-top:2px dashed #999;margin:10px 0;}
        .solid{border-top:2px solid #222;margin:10px 0;}
        .restaurant-name{font-size:22px;font-weight:bold;letter-spacing:2px;}
        table{width:100%;border-collapse:collapse;}
        th{padding:8px 5px;border-bottom:2px solid #222;border-top:2px solid #222;font-size:12px;}
        .row{display:flex;justify-content:space-between;padding:5px 0;}
        .total-row{display:flex;justify-content:space-between;padding:8px 0;font-size:18px;font-weight:bold;}
        .highlight{background:#f9f9f9;padding:10px;border-radius:5px;}
        .footer{text-align:center;margin-top:15px;font-size:12px;color:#666;}
        @media print{body{padding:5px;}}
      </style></head><body>
      <div class="center" style="margin-bottom:15px;">
        <p class="restaurant-name">🍽️ RESTAURANT</p>
        <p class="restaurant-name">BILLING SYSTEM</p>
        <div class="dashed"></div>
        <p style="font-size:11px;color:#666;">Tax Invoice / Receipt</p>
        <p style="font-size:11px;color:#666;margin-top:3px;">📅 ${dateStr} | 🕐 ${timeStr}</p>
      </div>
      <div class="highlight" style="margin-bottom:12px;">
        <div class="row"><span>Bill No.</span><span><b>#${order.id}</b></span></div>
        <div class="row"><span>Customer</span><span><b>${order.customer?.name}</b></span></div>
        <div class="row"><span>Table</span><span><b>${order.tableNumber || 'Take Away'}</b></span></div>
        <div class="row"><span>Payment</span><span><b>${
            order.paymentMethod === 'cash' ? '💵 Cash' :
                order.paymentMethod === 'card' ? '💳 Card' : '📱 UPI'
        }</b></span></div>
      </div>
      <table><thead><tr>
        <th style="text-align:left;">Item</th><th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Price</th><th style="text-align:right;">Total</th>
      </tr></thead><tbody>${itemsHTML}</tbody></table>
      <div class="dashed"></div>
      <div class="row"><span>Subtotal</span><span>Rs.${order.subtotal?.toFixed(2)}</span></div>
      <div class="row"><span>Tax (5%)</span><span>Rs.${order.tax?.toFixed(2)}</span></div>
      ${order.discount > 0 ? `<div class="row" style="color:red;"><span>Discount</span><span>- Rs.${order.discount?.toFixed(2)}</span></div>` : ''}
      <div class="solid"></div>
      <div class="total-row"><span>TOTAL</span><span style="color:#16a34a;">Rs.${order.total?.toFixed(2)}</span></div>
      <div class="solid"></div>
      <div class="footer">
        <p style="font-size:16px;margin-bottom:5px;">🙏 Thank You!</p>
        <p>Please Visit Again ⭐</p>
        <div class="dashed"></div>
        <p style="font-size:10px;color:#999;">Powered by Restaurant Billing System</p>
      </div></body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <p className="text-slate-500 text-lg">⏳ Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">

            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">📋 Order History</h1>
                        <p className="text-slate-400 text-sm mt-0.5">View all previous bills</p>
                    </div>
                    <Link href="/" className="text-sm text-slate-500 hover:text-orange-500 transition font-medium">
                        ← Dashboard
                    </Link>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-6">

                {/* Search */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-5">
                    <input placeholder="🔍 Search by customer, bill no, payment method..."
                           value={search} onChange={e => setSearch(e.target.value)}
                           className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                        <p className="text-2xl font-bold text-slate-800">{orders.length}</p>
                        <p className="text-slate-400 text-sm">Total Orders</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                        <p className="text-2xl font-bold text-green-600">
                            Rs.{orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)}
                        </p>
                        <p className="text-slate-400 text-sm">Total Revenue</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                        <p className="text-2xl font-bold text-orange-500">
                            Rs.{orders.length > 0
                            ? (orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length).toFixed(2)
                            : '0.00'}
                        </p>
                        <p className="text-slate-400 text-sm">Average Bill</p>
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-slate-100">
                        <p className="text-4xl mb-3">📭</p>
                        <p className="text-slate-400">No orders found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredOrders.map(order => (
                            <div key={order.id}
                                 className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition">
                                <div className="p-5">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="font-bold text-slate-800 text-lg">#{order.id}</span>
                                                <span className="text-sm font-semibold text-slate-700">{order.customer?.name}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                    order.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                                                        order.paymentMethod === 'card' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-purple-100 text-purple-700'
                                                }`}>
                          {order.paymentMethod === 'cash' ? '💵 Cash' :
                              order.paymentMethod === 'card' ? '💳 Card' : '📱 UPI'}
                        </span>
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                    order.tableNumber === 0
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}>
                          {order.tableNumber === 0 ? '🛍️ Take Away' : `🪑 Table ${order.tableNumber}`}
                        </span>
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                📅 {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit', hour12: true
                                            })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600 text-xl">Rs.{order.total?.toFixed(2)}</p>
                                            <p className="text-xs text-slate-400 mt-1">{order.items?.length || 0} items</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100">
                                        <button onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                                                className="text-sm text-blue-500 hover:text-blue-700 font-medium">
                                            {selectedOrder?.id === order.id ? '▲ Hide Details' : '▼ View Details'}
                                        </button>
                                        <button onClick={() => handlePrint(order)}
                                                className="text-sm text-slate-500 hover:text-slate-700 font-medium ml-4">
                                            🖨️ Reprint
                                        </button>
                                    </div>
                                </div>

                                {/* Order Details */}
                                {selectedOrder?.id === order.id && (
                                    <div className="bg-slate-50 border-t border-slate-100 p-5">
                                        <table className="w-full">
                                            <thead>
                                            <tr className="border-b border-slate-200">
                                                <th className="text-left text-xs text-slate-500 pb-2">Item</th>
                                                <th className="text-center text-xs text-slate-500 pb-2">Qty</th>
                                                <th className="text-right text-xs text-slate-500 pb-2">Price</th>
                                                <th className="text-right text-xs text-slate-500 pb-2">Total</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {order.items?.map(item => (
                                                <tr key={item.id} className="border-b border-slate-100">
                                                    <td className="py-2 text-sm text-slate-800">{item.menuItem?.name}</td>
                                                    <td className="py-2 text-sm text-slate-500 text-center">{item.quantity}</td>
                                                    <td className="py-2 text-sm text-slate-500 text-right">Rs.{item.unitPrice?.toFixed(2)}</td>
                                                    <td className="py-2 text-sm text-slate-500 text-right">Rs.{item.totalPrice?.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                        <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
                                            <div className="flex justify-between text-sm text-slate-500">
                                                <span>Subtotal</span><span>Rs.{order.subtotal?.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-slate-500">
                                                <span>Tax</span><span>Rs.{order.tax?.toFixed(2)}</span>
                                            </div>
                                            {order.discount > 0 && (
                                                <div className="flex justify-between text-sm text-red-400">
                                                    <span>Discount</span><span>- Rs.{order.discount?.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between font-bold text-slate-800">
                                                <span>Total</span>
                                                <span className="text-green-600">Rs.{order.total?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
