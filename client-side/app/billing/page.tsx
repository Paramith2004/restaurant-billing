'use client';
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

export default function BillingPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [discount, setDiscount] = useState('0');
    const [billItems, setBillItems] = useState<BillItem[]>([]);
    const [selectedMenuItem, setSelectedMenuItem] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [bill, setBill] = useState<any>(null);
    const [message, setMessage] = useState('');

    const loadData = useCallback(() => {
        API.get('/customers').then(res => setCustomers(res.data));
        API.get('/menu').then(res => setMenuItems(res.data));
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
                menuItemId: menuItem.id,
                name: menuItem.name,
                quantity: qty,
                unitPrice: menuItem.price,
                totalPrice: menuItem.price * qty
            }]);
        }
        setSelectedMenuItem('');
        setQuantity('1');
    };

    const handleRemoveItem = (menuItemId: number) => {
        setBillItems(billItems.filter(b => b.menuItemId !== menuItemId));
    };

    const subtotal = billItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax - parseFloat(discount || '0');

    const handleSubmit = async () => {
        if (!selectedCustomer || billItems.length === 0) {
            setMessage('⚠️ Please select a customer and add items!');
            return;
        }

        const orderData = {
            customerId: parseInt(selectedCustomer),
            tableNumber: parseInt(tableNumber || '0'),
            paymentMethod,
            discount: parseFloat(discount || '0'),
            items: billItems.map(b => ({
                menuItemId: b.menuItemId,
                quantity: b.quantity
            }))
        };

        const res = await API.post('/orders', orderData);
        setBill(res.data);
        setMessage('✅ Bill created successfully!');
        setBillItems([]);
        setSelectedCustomer('');
        setTableNumber('');
        setDiscount('0');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">🧾 Create Bill</h1>
                    <a href="/" className="text-sm text-blue-500 hover:underline">
                        ← Back to Dashboard
                    </a>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg mb-4 font-medium ${
                        message.includes('⚠️') ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                        {message}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6">

                    {/* Left — Form */}
                    <div className="space-y-4">

                        {/* Order Details */}
                        <div className="bg-white p-5 rounded-xl shadow">
                            <h3 className="font-semibold text-gray-700 mb-3 text-lg">
                                📋 Order Details
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">
                                        Customer
                                    </label>
                                    <select value={selectedCustomer}
                                            onChange={e => setSelectedCustomer(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-orange-400">
                                        <option value="">Select Customer</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} - {c.phone}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">
                                        Table Number
                                    </label>
                                    <input placeholder="e.g. 5" value={tableNumber}
                                           onChange={e => setTableNumber(e.target.value)}
                                           className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">
                                        Payment Method
                                    </label>
                                    <select value={paymentMethod}
                                            onChange={e => setPaymentMethod(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-orange-400">
                                        <option value="cash">💵 Cash</option>
                                        <option value="card">💳 Card</option>
                                        <option value="upi">📱 UPI</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">
                                        Discount (₹)
                                    </label>
                                    <input placeholder="0" value={discount} type="number"
                                           onChange={e => setDiscount(e.target.value)}
                                           className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                                </div>
                            </div>
                        </div>

                        {/* Add Items */}
                        <div className="bg-white p-5 rounded-xl shadow">
                            <h3 className="font-semibold text-gray-700 mb-3 text-lg">
                                🍛 Add Items
                            </h3>
                            <div className="space-y-3">
                                <select value={selectedMenuItem}
                                        onChange={e => setSelectedMenuItem(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400">
                                    <option value="">Select Menu Item</option>
                                    {menuItems.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} — ₹{m.price}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex gap-2">
                                    <input placeholder="Qty" value={quantity}
                                           type="number" min="1"
                                           onChange={e => setQuantity(e.target.value)}
                                           className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                                    <button onClick={handleAddItem}
                                            className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition">
                                        + Add to Bill
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right — Bill Preview */}
                    <div className="bg-white p-5 rounded-xl shadow">
                        <h3 className="font-semibold text-gray-700 mb-4 text-lg">
                            🧾 Bill Preview
                        </h3>

                        {billItems.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-4xl mb-3">🛒</p>
                                <p className="text-gray-400 text-sm">No items added yet</p>
                                <p className="text-gray-300 text-xs mt-1">
                                    Select items from the left
                                </p>
                            </div>
                        ) : (
                            <>
                                <table className="w-full mb-4">
                                    <thead>
                                    <tr className="bg-gray-50">
                                        <th className="p-2 text-left text-xs text-gray-600 font-medium">Item</th>
                                        <th className="p-2 text-left text-xs text-gray-600 font-medium">Qty</th>
                                        <th className="p-2 text-left text-xs text-gray-600 font-medium">Price</th>
                                        <th className="p-2"></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {billItems.map(item => (
                                        <tr key={item.menuItemId} className="border-b border-gray-100">
                                            <td className="p-2 text-sm text-gray-800 font-medium">{item.name}</td>
                                            <td className="p-2 text-sm text-gray-600">{item.quantity}</td>
                                            <td className="p-2 text-sm text-gray-600">
                                                ₹{item.totalPrice.toFixed(2)}
                                            </td>
                                            <td className="p-2">
                                                <button onClick={() => handleRemoveItem(item.menuItemId)}
                                                        className="text-red-400 hover:text-red-600 text-xs font-bold">
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>

                                {/* Totals */}
                                <div className="border-t border-gray-200 pt-3 space-y-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Tax (5%)</span>
                                        <span>₹{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-red-500">
                                        <span>Discount</span>
                                        <span>- ₹{parseFloat(discount || '0').toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-gray-800 text-xl border-t border-gray-200 pt-3">
                                        <span>Total</span>
                                        <span className="text-green-600">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button onClick={handleSubmit}
                                        className="w-full mt-5 bg-green-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-600 transition shadow-md">
                                    ✅ Generate Bill
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Success Bill Receipt */}
                {bill && (
                    <div className="mt-6 bg-white p-6 rounded-xl shadow border-2 border-green-400">
                        <div className="text-center mb-4">
                            <h3 className="font-bold text-2xl text-gray-800">
                                ✅ Bill Generated!
                            </h3>
                            <p className="text-gray-500 text-sm">Thank you for your order</p>
                        </div>

                        <div className="border-t border-dashed border-gray-300 pt-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-500 text-xs">Bill ID</p>
                                    <p className="font-bold text-gray-800">#{bill.id}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-500 text-xs">Customer</p>
                                    <p className="font-bold text-gray-800">{bill.customer?.name}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-500 text-xs">Table</p>
                                    <p className="font-bold text-gray-800">{bill.tableNumber}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-500 text-xs">Payment</p>
                                    <p className="font-bold text-gray-800 capitalize">{bill.paymentMethod}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-500 text-xs">Subtotal</p>
                                    <p className="font-bold text-gray-800">₹{bill.subtotal?.toFixed(2)}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-500 text-xs">Tax (5%)</p>
                                    <p className="font-bold text-gray-800">₹{bill.tax?.toFixed(2)}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-500 text-xs">Discount</p>
                                    <p className="font-bold text-red-500">- ₹{bill.discount?.toFixed(2)}</p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                    <p className="text-gray-500 text-xs">Total Amount</p>
                                    <p className="font-bold text-green-600 text-xl">
                                        ₹{bill.total?.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => { setBill(null); setMessage(''); }}
                                className="w-full mt-4 bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition">
                            + Create New Bill
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
