'use client';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import API from '@/lib/api';

interface MenuItem {
    id: number;
    name: string;
    price: number;
    category: string;
}

interface Customer {
    id: number;
    name: string;
    phone: string;
}

interface BillItem {
    menuItemId: number;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

interface Bill {
    id: number;
    customer: { name: string };
    tableNumber: number;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: string;
    orderType: string;
}

export default function BillingPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [orderType, setOrderType] = useState('dine-in');
    const [tableNumber, setTableNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [discount, setDiscount] = useState('0');
    const [serviceCharge, setServiceCharge] = useState('0');
    const [billItems, setBillItems] = useState<BillItem[]>([]);
    const [selectedMenuItem, setSelectedMenuItem] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [bill, setBill] = useState<Bill | null>(null);
    const [message, setMessage] = useState('');
    const [givenMoney, setGivenMoney] = useState('0');
    const [showAddCustomer, setShowAddCustomer] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
    const [addingCustomer, setAddingCustomer] = useState(false);

    const loadData = useCallback(() => {
        API.get('/customers').then(res => setCustomers(res.data));
        API.get('/menu').then(res => setMenuItems(res.data));
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAddCustomer = async () => {
        if (!newCustomer.name || !newCustomer.phone) {
            alert('Please enter name and phone!'); return;
        }
        setAddingCustomer(true);
        try {
            const res = await API.post('/customers', newCustomer);
            await loadData();
            setSelectedCustomer(res.data.id.toString());
            setShowAddCustomer(false);
            setNewCustomer({ name: '', phone: '', email: '' });
        } finally { setAddingCustomer(false); }
    };

    const handleAddItem = () => {
        const menuItem = menuItems.find(m => m.id === parseInt(selectedMenuItem));
        if (!menuItem) return;
        const qty = parseInt(quantity);
        const existing = billItems.find(b => b.menuItemId === menuItem.id);
        if (existing) {
            setBillItems(billItems.map(b =>
                b.menuItemId === menuItem.id
                    ? { ...b, quantity: b.quantity + qty, totalPrice: (b.quantity + qty) * b.unitPrice }
                    : b
            ));
        } else {
            setBillItems([...billItems, {
                menuItemId: menuItem.id, name: menuItem.name,
                quantity: qty, unitPrice: menuItem.price,
                totalPrice: menuItem.price * qty
            }]);
        }
        setSelectedMenuItem(''); setQuantity('1');
    };

    const handleRemoveItem = (menuItemId: number) => {
        setBillItems(billItems.filter(b => b.menuItemId !== menuItemId));
    };

    const updateQuantity = (menuItemId: number, qty: number) => {
        if (qty <= 0) { handleRemoveItem(menuItemId); return; }
        setBillItems(billItems.map(b =>
            b.menuItemId === menuItemId
                ? { ...b, quantity: qty, totalPrice: qty * b.unitPrice }
                : b
        ));
    };

    const subtotal = billItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const serviceChargeAmount = orderType === 'dine-in' ? parseFloat(serviceCharge || '0') : 0;
    const discountAmount = parseFloat(discount || '0');
    const total = subtotal + serviceChargeAmount - discountAmount;

    const handleSubmit = async () => {
        if (!selectedCustomer || billItems.length === 0) {
            setMessage('⚠️ Please select a customer and add items!'); return;
        }
        const orderData = {
            customerId: parseInt(selectedCustomer),
            tableNumber: orderType === 'takeaway' ? 0 : parseInt(tableNumber || '0'),
            paymentMethod,
            orderType,
            discount: discountAmount,
            serviceCharge: serviceChargeAmount,
            items: billItems.map(b => ({ menuItemId: b.menuItemId, quantity: b.quantity }))
        };
        const res = await API.post('/orders', orderData);
        setBill({ ...res.data, orderType });
        setMessage('✅ Bill created successfully!');
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        const itemsHTML = billItems.map(item => `
      <tr>
        <td style="padding:8px 5px;border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:right;">Rs. ${item.unitPrice.toFixed(2)}</td>
        <td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:right;">Rs. ${item.totalPrice.toFixed(2)}</td>
      </tr>`).join('');

        const givenAmount = parseFloat(givenMoney || '0');
        const changeAmount = givenAmount - (bill?.total || 0);

        printWindow.document.write(`
      <html lang="en"><head><title>Invoice #${bill?.id}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'Courier New',monospace;max-width:380px;margin:0 auto;padding:20px;color:#222;font-size:13px;}
        .center{text-align:center;}.dashed{border-top:2px dashed #999;margin:10px 0;}
        .solid{border-top:2px solid #222;margin:10px 0;}
        .restaurant-name{font-size:20px;font-weight:bold;letter-spacing:2px;}
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
        <p class="restaurant-name">🇱🇰 SRI LANKA</p>
        <div class="dashed"></div>
        <p style="font-size:11px;color:#666;">Invoice / Receipt</p>
        <p style="font-size:11px;color:#666;margin-top:3px;">📅 ${dateStr} | 🕐 ${timeStr}</p>
        <p style="margin-top:5px;font-weight:bold;">
          ${bill?.orderType === 'takeaway' ? '🛍️ TAKE AWAY' : '🪑 DINE IN'}
        </p>
      </div>
      <div class="highlight" style="margin-bottom:12px;">
        <div class="row"><span>Bill No.</span><span><b>#${bill?.id}</b></span></div>
        <div class="row"><span>Customer</span><span><b>${bill?.customer?.name}</b></span></div>
        ${bill?.orderType === 'takeaway'
            ? `<div class="row"><span>Order Type</span><span><b>🛍️ Take Away</b></span></div>`
            : `<div class="row"><span>Table No.</span><span><b>${bill?.tableNumber}</b></span></div>`}
        <div class="row"><span>Payment</span><span><b>${
            bill?.paymentMethod === 'cash' ? '💵 Cash' :
                bill?.paymentMethod === 'card' ? '💳 Card' : '📱 UPI'
        }</b></span></div>
      </div>
      <table><thead><tr>
        <th style="text-align:left;">Item</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Price</th>
        <th style="text-align:right;">Total</th>
      </tr></thead><tbody>${itemsHTML}</tbody></table>
      <div class="dashed"></div>
      <div class="row"><span>Subtotal</span><span>Rs. ${bill?.subtotal?.toFixed(2)}</span></div>
      ${serviceChargeAmount > 0 ? `
        <div class="row" style="color:#d97706;">
          <span>Service Charge</span>
          <span>Rs. ${serviceChargeAmount.toFixed(2)}</span>
        </div>` : ''}
      ${discountAmount > 0 ? `
        <div class="row" style="color:red;">
          <span>Discount</span>
          <span>- Rs. ${discountAmount.toFixed(2)}</span>
        </div>` : ''}
      <div class="solid"></div>
      <div class="total-row">
        <span>TOTAL</span>
        <span style="color:#16a34a;">Rs. ${bill?.total?.toFixed(2)}</span>
      </div>
      <div class="solid"></div>
      ${bill?.paymentMethod === 'cash' ? `
        <div style="margin:10px 0;">
          <div class="row" style="font-size:16px;font-weight:bold;">
            <span>Given Amount</span><span>Rs. ${givenAmount.toFixed(2)}</span>
          </div>
          <div class="row" style="font-size:16px;font-weight:bold;color:#2563eb;">
            <span>Change</span><span>Rs. ${changeAmount.toFixed(2)}</span>
          </div>
        </div>
        <div class="dashed"></div>` : ''}
      <div class="footer">
        <p style="font-size:16px;margin-bottom:5px;">🙏 Thank You!</p>
        <p>Please Visit Again</p>
        <p style="margin-top:5px;">⭐ We Hope You Enjoyed Your Meal ⭐</p>
        <div class="dashed"></div>
        <p style="font-size:10px;color:#999;">Powered by Restaurant Billing System 🇱🇰</p>
      </div></body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <div className="min-h-screen bg-slate-100">

            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">🧾 Create Bill</h1>
                        <p className="text-slate-400 text-sm mt-0.5">🇱🇰 Sri Lankan Restaurant POS</p>
                    </div>
                    <Link href="/" className="text-sm text-slate-500 hover:text-orange-500 transition font-medium">
                        ← Dashboard
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">

                {message && (
                    <div className={`p-4 rounded-xl mb-5 font-medium flex items-center gap-2 ${
                        message.includes('⚠️')
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                        {message}
                    </div>
                )}

                <div className="grid grid-cols-5 gap-6">

                    {/* Left — Order Form */}
                    <div className="col-span-3 space-y-5">

                        {/* Order Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="bg-slate-800 px-5 py-3">
                                <h3 className="font-semibold text-white text-sm uppercase tracking-wider">
                                    📋 Order Details
                                </h3>
                            </div>
                            <div className="p-5 space-y-4">

                                {/* Customer */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                                        Customer
                                    </label>
                                    <div className="flex gap-2">
                                        <select value={selectedCustomer}
                                                onChange={e => setSelectedCustomer(e.target.value)}
                                                className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm">
                                            <option value="">Select Customer</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => setShowAddCustomer(!showAddCustomer)}
                                                className="bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition shadow-sm">
                                            + New
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Add Customer */}
                                {showAddCustomer && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
                                        <p className="text-sm font-semibold text-orange-700">➕ New Customer</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input placeholder="Full Name *" value={newCustomer.name}
                                                   onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                                   className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                                            <input placeholder="Phone *" value={newCustomer.phone}
                                                   onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                                   className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                                        </div>
                                        <input placeholder="Email (optional)" value={newCustomer.email}
                                               onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                               className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                                        <div className="flex gap-2">
                                            <button onClick={handleAddCustomer} disabled={addingCustomer}
                                                    className="flex-1 bg-orange-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50">
                                                {addingCustomer ? '⏳ Adding...' : '✅ Add Customer'}
                                            </button>
                                            <button onClick={() => setShowAddCustomer(false)}
                                                    className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm hover:bg-slate-300">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Order Type */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                                        Order Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => setOrderType('dine-in')}
                                                className={`py-3 rounded-xl text-sm font-semibold transition border-2 ${
                                                    orderType === 'dine-in'
                                                        ? 'bg-green-500 text-white border-green-500 shadow-md'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-green-300'
                                                }`}>
                                            🪑 Dine In
                                        </button>
                                        <button onClick={() => { setOrderType('takeaway'); setServiceCharge('0'); }}
                                                className={`py-3 rounded-xl text-sm font-semibold transition border-2 ${
                                                    orderType === 'takeaway'
                                                        ? 'bg-yellow-500 text-white border-yellow-500 shadow-md'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-yellow-300'
                                                }`}>
                                            🛍️ Take Away
                                        </button>
                                    </div>

                                    {/* Take Away Info */}
                                    {orderType === 'takeaway' && (
                                        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                                            <p className="text-xs text-yellow-700 font-medium">
                                                🛍️ Take Away — No service charge applied
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Table Number */}
                                    {orderType === 'dine-in' && (
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                                                Table Number
                                            </label>
                                            <input placeholder="e.g. 5" value={tableNumber}
                                                   onChange={e => setTableNumber(e.target.value)}
                                                   className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm" />
                                        </div>
                                    )}

                                    {/* Payment Method */}
                                    <div className={orderType === 'dine-in' ? '' : 'col-span-2'}>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                                            Payment Method
                                        </label>
                                        <select value={paymentMethod}
                                                onChange={e => setPaymentMethod(e.target.value)}
                                                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm">
                                            <option value="cash">💵 Cash</option>
                                            <option value="card">💳 Card</option>
                                            <option value="upi">📱 Online</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Service Charge — Dine In only */}
                                {orderType === 'dine-in' && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                        <label className="text-xs font-semibold text-green-700 uppercase tracking-wider block mb-2">
                                            🪑 Service Charge (Rs.)
                                        </label>
                                        <input
                                            placeholder="Enter service charge amount"
                                            value={serviceCharge}
                                            type="number"
                                            onChange={e => setServiceCharge(e.target.value)}
                                            className="w-full border border-green-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white shadow-sm"
                                        />
                                        <p className="text-xs text-green-600 mt-2">
                                            💡 Enter the service charge amount for dine-in orders
                                        </p>
                                    </div>
                                )}

                                {/* Discount */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                                        Discount (Rs.)
                                    </label>
                                    <input placeholder="0" value={discount} type="number"
                                           onChange={e => setDiscount(e.target.value)}
                                           className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Add Items */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="bg-slate-800 px-5 py-3">
                                <h3 className="font-semibold text-white text-sm uppercase tracking-wider">
                                    🍛 Add Menu Items
                                </h3>
                            </div>
                            <div className="p-5">
                                <div className="flex gap-3">
                                    <select value={selectedMenuItem}
                                            onChange={e => setSelectedMenuItem(e.target.value)}
                                            className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm">
                                        <option value="">Select Menu Item</option>
                                        {menuItems.map(m => (
                                            <option key={m.id} value={m.id}>{m.name} — Rs. {m.price}</option>
                                        ))}
                                    </select>
                                    <input placeholder="Qty" value={quantity} type="number" min="1"
                                           onChange={e => setQuantity(e.target.value)}
                                           className="w-20 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm" />
                                    <button onClick={handleAddItem}
                                            className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition shadow-sm">
                                        + Add
                                    </button>
                                </div>

                                {/* Quick Menu Buttons */}
                                {menuItems.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mt-4">
                                        {menuItems.map(m => (
                                            <button key={m.id}
                                                    onClick={() => {
                                                        setBillItems(prev => {
                                                            const existing = prev.find(b => b.menuItemId === m.id);
                                                            if (existing) {
                                                                return prev.map(b => b.menuItemId === m.id
                                                                    ? { ...b, quantity: b.quantity + 1, totalPrice: (b.quantity + 1) * b.unitPrice }
                                                                    : b);
                                                            }
                                                            return [...prev, {
                                                                menuItemId: m.id, name: m.name,
                                                                quantity: 1, unitPrice: m.price, totalPrice: m.price
                                                            }];
                                                        });
                                                    }}
                                                    className="bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-xl p-3 text-left transition">
                                                <p className="text-xs font-semibold text-slate-700 truncate">{m.name}</p>
                                                <p className="text-orange-500 font-bold text-sm mt-1">Rs. {m.price}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right — Bill Preview */}
                    <div className="col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
                            <div className="bg-orange-500 px-5 py-3">
                                <h3 className="font-semibold text-white text-sm uppercase tracking-wider">
                                    🧾 Bill Preview
                                </h3>
                            </div>

                            {billItems.length === 0 ? (
                                <div className="text-center py-16 px-5">
                                    <p className="text-5xl mb-3">🛒</p>
                                    <p className="text-slate-400 text-sm font-medium">No items added yet</p>
                                    <p className="text-slate-300 text-xs mt-1">Click menu items to add</p>
                                </div>
                            ) : (
                                <div className="p-5">

                                    {/* Order Badge */}
                                    <div className="mb-4">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                        orderType === 'takeaway'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                    }`}>
                      {orderType === 'takeaway' ? '🛍️ Take Away' : `🪑 Table ${tableNumber || '?'}`}
                    </span>
                                    </div>

                                    {/* Items */}
                                    <div className="space-y-2 mb-4">
                                        {billItems.map(item => (
                                            <div key={item.menuItemId}
                                                 className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                                                    <p className="text-xs text-slate-400">Rs. {item.unitPrice} each</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                                            className="w-7 h-7 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg text-sm font-bold transition">
                                                        −
                                                    </button>
                                                    <span className="text-sm font-bold text-slate-800 w-6 text-center">
                            {item.quantity}
                          </span>
                                                    <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                                            className="w-7 h-7 bg-slate-200 hover:bg-green-100 text-slate-600 hover:text-green-600 rounded-lg text-sm font-bold transition">
                                                        +
                                                    </button>
                                                    <span className="text-sm font-bold text-orange-500 w-20 text-right">
                            Rs. {item.totalPrice.toFixed(2)}
                          </span>
                                                    <button onClick={() => handleRemoveItem(item.menuItemId)}
                                                            className="text-red-400 hover:text-red-600 ml-1">✕</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Totals */}
                                    <div className="border-t border-slate-100 pt-4 space-y-2">
                                        <div className="flex justify-between text-sm text-slate-500">
                                            <span>Subtotal</span>
                                            <span>Rs. {subtotal.toFixed(2)}</span>
                                        </div>

                                        {/* Service Charge — Dine In only */}
                                        {orderType === 'dine-in' && serviceChargeAmount > 0 && (
                                            <div className="flex justify-between text-sm text-amber-600 font-medium">
                                                <span>🪑 Service Charge</span>
                                                <span>Rs. {serviceChargeAmount.toFixed(2)}</span>
                                            </div>
                                        )}

                                        {/* Take Away — No extra charge */}
                                        {orderType === 'takeaway' && (
                                            <div className="flex justify-between text-sm text-yellow-600">
                                                <span>🛍️ Service Charge</span>
                                                <span className="font-medium">None</span>
                                            </div>
                                        )}

                                        {discountAmount > 0 && (
                                            <div className="flex justify-between text-sm text-red-400">
                                                <span>Discount</span>
                                                <span>- Rs. {discountAmount.toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between font-bold text-slate-800 text-xl border-t border-slate-200 pt-3 mt-2">
                                            <span>Total</span>
                                            <span className="text-green-600">Rs. {total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Given Money */}
                                    {paymentMethod === 'cash' && (
                                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                                            <label className="text-xs font-semibold text-blue-600 uppercase block mb-2">
                                                💵 Given Amount (Rs.)
                                            </label>
                                            <input placeholder="0" value={givenMoney} type="number"
                                                   onChange={e => setGivenMoney(e.target.value)}
                                                   className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                                            {parseFloat(givenMoney) > 0 && (
                                                <div className="flex justify-between font-bold text-blue-600 text-lg mt-3">
                                                    <span>Change</span>
                                                    <span>Rs. {(parseFloat(givenMoney) - total).toFixed(2)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button onClick={handleSubmit}
                                            className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg transition shadow-md">
                                        ✅ Generate Bill
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Success Bill Receipt */}
                {bill && (
                    <div className="mt-6 bg-white rounded-2xl shadow-sm border-2 border-green-400 overflow-hidden">
                        <div className="bg-green-500 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-xl text-white">✅ Bill Generated!</h3>
                                <p className="text-green-100 text-sm">Bill #{bill.id} created successfully</p>
                            </div>
                            <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${
                                bill.orderType === 'takeaway'
                                    ? 'bg-yellow-400 text-yellow-900'
                                    : 'bg-green-400 text-green-900'
                            }`}>
                {bill.orderType === 'takeaway' ? '🛍️ Take Away' : '🪑 Dine In'}
              </span>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-6">

                                {/* Invoice Preview */}
                                <div className="border border-slate-200 rounded-xl p-5 font-mono bg-slate-50">
                                    <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
                                        <h2 className="text-lg font-bold text-slate-800 tracking-widest">🍽️ RESTAURANT</h2>
                                        <h2 className="text-lg font-bold text-slate-800 tracking-widest">🇱🇰 SRI LANKA</h2>
                                        <p className="text-slate-400 text-xs mt-2">Invoice / Receipt</p>
                                        <p className="text-slate-400 text-xs mt-1">
                                            📅 {new Date().toLocaleDateString('en-IN', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })} | 🕐 {new Date().toLocaleTimeString('en-IN', {
                                            hour: '2-digit', minute: '2-digit', hour12: true
                                        })}
                                        </p>
                                    </div>

                                    <div className="space-y-1.5 mb-4 text-sm">
                                        {[
                                            ['Bill No.', `#${bill.id}`],
                                            ['Customer', bill.customer?.name],
                                            [bill.orderType === 'takeaway' ? 'Order Type' : 'Table No.',
                                                bill.orderType === 'takeaway' ? '🛍️ Take Away' : String(bill.tableNumber)],
                                            ['Payment', bill.paymentMethod === 'cash' ? '💵 Cash' :
                                                bill.paymentMethod === 'card' ? '💳 Card' : '📱 Online'],
                                        ].map(([label, value]) => (
                                            <div key={label} className="flex justify-between">
                                                <span className="text-slate-400">{label}</span>
                                                <span className="font-bold text-slate-700">{value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <table className="w-full mb-3 text-xs">
                                        <thead>
                                        <tr className="border-y-2 border-slate-800">
                                            <th className="py-1.5 text-left">Item</th>
                                            <th className="py-1.5 text-center">Qty</th>
                                            <th className="py-1.5 text-right">Total</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {billItems.map(item => (
                                            <tr key={item.menuItemId} className="border-b border-slate-100">
                                                <td className="py-1.5 text-slate-700">{item.name}</td>
                                                <td className="py-1.5 text-center text-slate-500">{item.quantity}</td>
                                                <td className="py-1.5 text-right text-slate-700">
                                                    Rs. {item.totalPrice.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>

                                    <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-xs">
                                        <div className="flex justify-between text-slate-500">
                                            <span>Subtotal</span>
                                            <span>Rs. {bill.subtotal?.toFixed(2)}</span>
                                        </div>
                                        {bill.tax > 0 && (
                                            <div className="flex justify-between text-amber-600">
                                                <span>Service Charge</span>
                                                <span>Rs. {bill.tax?.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {bill.orderType === 'takeaway' && (
                                            <div className="flex justify-between text-yellow-600">
                                                <span>Service Charge</span>
                                                <span>None</span>
                                            </div>
                                        )}
                                        {bill.discount > 0 && (
                                            <div className="flex justify-between text-red-400">
                                                <span>Discount</span>
                                                <span>- Rs. {bill.discount?.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-slate-800 text-base border-t-2 border-slate-800 pt-1.5">
                                            <span>TOTAL</span>
                                            <span className="text-green-600">Rs. {bill.total?.toFixed(2)}</span>
                                        </div>
                                        {bill.paymentMethod === 'cash' && parseFloat(givenMoney) > 0 && (
                                            <>
                                                <div className="flex justify-between font-bold text-slate-700">
                                                    <span>Given</span>
                                                    <span>Rs. {parseFloat(givenMoney).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between font-bold text-blue-600">
                                                    <span>Change</span>
                                                    <span>Rs. {(parseFloat(givenMoney) - bill.total).toFixed(2)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="text-center border-t-2 border-dashed border-slate-300 mt-3 pt-3">
                                        <p className="text-base">🙏 Thank You!</p>
                                        <p className="text-slate-400 text-xs mt-1">Please Visit Again ⭐</p>
                                        <p className="text-slate-300 text-xs">🇱🇰 Restaurant Billing System</p>
                                    </div>
                                </div>

                                {/* Bill Summary */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-700 text-lg">📋 Summary</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Bill ID', value: `#${bill.id}`, color: 'text-slate-800' },
                                            { label: 'Customer', value: bill.customer?.name, color: 'text-slate-800' },
                                            { label: 'Subtotal', value: `Rs. ${bill.subtotal?.toFixed(2)}`, color: 'text-slate-800' },
                                            { label: 'Service Charge', value: bill.tax > 0 ? `Rs. ${bill.tax?.toFixed(2)}` : 'None', color: bill.tax > 0 ? 'text-amber-600' : 'text-slate-400' },
                                            { label: 'Discount', value: `Rs. ${bill.discount?.toFixed(2)}`, color: 'text-red-500' },
                                            { label: 'Total', value: `Rs. ${bill.total?.toFixed(2)}`, color: 'text-green-600' },
                                        ].map(item => (
                                            <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                                                <p className="text-xs text-slate-400">{item.label}</p>
                                                <p className={`font-bold text-base ${item.color}`}>{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3 mt-4">
                                        <button onClick={handlePrint}
                                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold transition shadow-md">
                                            🖨️ Print Invoice
                                        </button>
                                        <button onClick={() => {
                                            setBill(null); setMessage(''); setBillItems([]);
                                            setSelectedCustomer(''); setTableNumber('');
                                            setDiscount('0'); setGivenMoney('0');
                                            setServiceCharge('0'); setOrderType('dine-in');
                                        }}
                                                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold transition shadow-md">
                                            + New Bill
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}