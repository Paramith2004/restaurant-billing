import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">

            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-5xl font-bold text-gray-800 mb-3">
                    🍽️ Restaurant Billing
                </h1>
                <p className="text-gray-500 text-lg">
                    Manage your restaurant easily
                </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 gap-6">
                <Link href="/menu"
                      className="bg-white p-8 rounded-2xl shadow-md text-center hover:shadow-xl transition hover:-translate-y-1">
                    <div className="text-5xl mb-4">🍛</div>
                    <div className="font-bold text-xl text-gray-800">Menu Management</div>
                    <p className="text-gray-500 text-sm mt-2">Add, edit, delete menu items</p>
                </Link>

                <Link href="/customers"
                      className="bg-white p-8 rounded-2xl shadow-md text-center hover:shadow-xl transition hover:-translate-y-1">
                    <div className="text-5xl mb-4">👥</div>
                    <div className="font-bold text-xl text-gray-800">Customers</div>
                    <p className="text-gray-500 text-sm mt-2">Manage customer records</p>
                </Link>

                <Link href="/billing"
                      className="bg-white p-8 rounded-2xl shadow-md text-center hover:shadow-xl transition hover:-translate-y-1">
                    <div className="text-5xl mb-4">🧾</div>
                    <div className="font-bold text-xl text-gray-800">Create Bill</div>
                    <p className="text-gray-500 text-sm mt-2">Generate invoices & bills</p>
                </Link>

                <Link href="/reports"
                      className="bg-white p-8 rounded-2xl shadow-md text-center hover:shadow-xl transition hover:-translate-y-1">
                    <div className="text-5xl mb-4">📊</div>
                    <div className="font-bold text-xl text-gray-800">Reports</div>
                    <p className="text-gray-500 text-sm mt-2">Sales analytics & insights</p>
                </Link>
            </div>

        </div>
    );
}