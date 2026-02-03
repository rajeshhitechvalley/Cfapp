import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, DollarSign, CheckCircle, AlertCircle, XCircle, Edit, CreditCard } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useTax } from '@/hooks/useTax';
import { useCurrency } from '@/components/currency-switcher';

interface OrderItem {
    id: number;
    quantity: number;
    unit_price: string;
    total_price: string;
    special_instructions: string;
    menu_item?: {
        name: string;
        category: string;
    };
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    table?: {
        id: number;
        table_number: string;
        name?: string;
    };
    order_items: OrderItem[];
}

interface Bill {
    id: number;
    bill_number: string;
    subtotal: string;
    tax_amount: string;
    service_charge: string;
    discount_amount: string;
    total_amount: string;
    payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
    payment_method?: 'cash' | 'card' | 'upi' | 'other';
    paid_amount: string;
    bill_time: string;
    paid_time?: string;
    notes?: string;
    order?: Order;
    table?: {
        id: number;
        table_number: string;
        name?: string;
    };
}

interface Props {
    bill: Bill;
}

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-blue-100 text-blue-800',
    refunded: 'bg-red-100 text-red-800',
};

const paymentMethodIcons = {
    cash: '💵',
    card: '💳',
    upi: '📱',
    other: '🔄',
};

const categoryIcons = {
    tea: '🍵',
    snack: '🍟',
    cake: '🍰',
    pizza: '🍕',
};

// Helper function for route generation
const route = (name: string, params?: any) => {
    const baseUrl = window.location.origin;
    const routes: Record<string, string> = {
        'bills.index': '/bills',
        'orders.show': '/orders',
    };
    
    let url = routes[name] || `/${name}`;
    
    if (params) {
        url += `/${params}`;
    }
    
    return url;
};

export default function BillsShow({ bill }: Props) {
    const { formatCurrency, getTaxLabel } = useTax();
    const { formatCurrency: formatCurrencyWithSwitcher } = useCurrency();
    
    const handlePaymentUpdate = (paymentMethod: string, amount: number) => {
        router.post(`/bills/${bill.id}/payment`, {
            payment_method: paymentMethod,
            amount: amount,
        }, {
            onSuccess: () => {
                // Success message will be shown via flash message
            }
        });
    };

    const handleStatusUpdate = (status: string) => {
        router.put(`/bills/${bill.id}`, {
            payment_status: status,
        }, {
            onSuccess: () => {
                // Success message will be shown via flash message
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Bills', href: '/bills' },
        { title: `Bill ${bill.bill_number}`, href: `/bills/${bill.id}` },
    ];

    const remainingAmount = (parseFloat(bill.total_amount) - parseFloat(bill.paid_amount)).toFixed(2);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Bill ${bill.bill_number}`} />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link href={route('bills.index')}>
                                    <Button variant="outline" size="sm" className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300 text-gray-700 hover:text-gray-900 font-medium shadow-sm hover:shadow-md">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Bills
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                                        Bill {bill.bill_number}
                                    </h1>
                                    <p className="text-gray-600 mt-2 text-lg">Bill details and payment management</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Link href={route('orders.show', bill.order?.id)}>
                                    <Button variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300">
                                        <Edit className="h-4 w-4 mr-2" />
                                        View Order
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Bill Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Bill Information */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-5 border-b border-gray-200/50">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                        <div className="p-2 bg-purple-500 rounded-lg mr-3">
                                            <DollarSign className="h-5 w-5 text-white" />
                                        </div>
                                        Bill Information
                                    </h2>
                                </div>
                                <div className="p-6 bg-gradient-to-b from-white to-purple-50/30">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-purple-500 rounded-full mr-2"></span>
                                                Bill Number
                                            </label>
                                            <p className="font-bold text-gray-900 text-lg">{bill.bill_number}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-green-500 rounded-full mr-2"></span>
                                                Table
                                            </label>
                                            <p className="font-bold text-gray-900 text-lg">
                                                {bill.table?.table_number} {bill.table?.name && `- ${bill.table?.name}`}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
                                                Order
                                            </label>
                                            <p className="font-bold text-gray-900 text-lg">{bill.order?.order_number}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-orange-500 rounded-full mr-2"></span>
                                                Payment Status
                                            </label>
                                            <div className="mt-1">
                                                <Badge className={`px-4 py-2 font-bold text-sm rounded-full shadow-md ${
                                                    bill.payment_status === 'paid' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white border-0' :
                                                    bill.payment_status === 'partial' ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white border-0' :
                                                    bill.payment_status === 'refunded' ? 'bg-gradient-to-r from-red-400 to-red-500 text-white border-0' :
                                                    'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0'
                                                }`}>
                                                    {bill.payment_status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-indigo-500 rounded-full mr-2"></span>
                                                Bill Time
                                            </label>
                                            <p className="font-bold text-gray-900 flex items-center text-lg">
                                                <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                                                {new Date(bill.bill_time).toLocaleString()}
                                            </p>
                                        </div>
                                        {bill.paid_time && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                    <span className="w-1 h-4 bg-green-500 rounded-full mr-2"></span>
                                                    Paid Time
                                                </label>
                                                <p className="font-bold text-gray-900 flex items-center text-lg">
                                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                                    {new Date(bill.paid_time).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                        {bill.payment_method && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                    <span className="w-1 h-4 bg-pink-500 rounded-full mr-2"></span>
                                                    Payment Method
                                                </label>
                                                <p className="font-bold text-gray-900 text-lg flex items-center">
                                                    <span className="mr-3 text-2xl">{paymentMethodIcons[bill.payment_method as keyof typeof paymentMethodIcons]}</span>
                                                    {bill.payment_method.charAt(0).toUpperCase() + bill.payment_method.slice(1)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {bill.notes && (
                                        <div className="mt-6">
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-pink-500 rounded-full mr-2"></span>
                                                Notes
                                            </label>
                                            <p className="mt-2 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200 text-gray-900 font-medium">
                                                {bill.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                                <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-5 border-b border-gray-200/50">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                        <div className="p-2 bg-emerald-500 rounded-lg mr-3">
                                            <DollarSign className="h-5 w-5 text-white" />
                                        </div>
                                        Order Items ({bill.order?.order_items.length || 0})
                                    </h2>
                                </div>
                                <div className="p-6 bg-gradient-to-b from-white to-emerald-50/20">
                                    <div className="space-y-4">
                                        {bill.order?.order_items?.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300">
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-3xl bg-white p-3 rounded-xl shadow-sm">
                                                        {categoryIcons[item.menu_item?.category as keyof typeof categoryIcons] || '🍽️'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-lg">{item.menu_item?.name}</h4>
                                                        {item.special_instructions && (
                                                            <p className="text-sm text-blue-600 mt-2 font-medium">📝 {item.special_instructions}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-gray-900 text-lg">{item.quantity} × {formatCurrency(item.unit_price)}</div>
                                                    <div className="font-bold text-xl text-emerald-600">{formatCurrency(item.total_price)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl border-0 overflow-hidden">
                                <div className="bg-white/10 backdrop-blur-sm px-6 py-5 border-b border-white/20">
                                    <h2 className="text-xl font-bold text-white flex items-center">
                                        <div className="p-2 bg-white/20 rounded-lg mr-3">
                                            <DollarSign className="h-5 w-5 text-white" />
                                        </div>
                                        Payment Summary
                                    </h2>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-white/10 to-white/5">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-white/90">
                                            <span>Subtotal:</span>
                                            <span className="font-medium">{formatCurrency(bill.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-white/90">
                                            <span>{getTaxLabel()}:</span>
                                            <span className="font-medium">{formatCurrency(parseFloat(bill.tax_amount))}</span>
                                        </div>
                                        <div className="flex justify-between text-white/90">
                                            <span>Service Charge:</span>
                                            <span className="font-medium">{formatCurrency(bill.service_charge)}</span>
                                        </div>
                                        {parseFloat(bill.discount_amount) > 0 && (
                                            <div className="flex justify-between text-green-300">
                                                <span>Discount:</span>
                                                <span className="font-medium">-{formatCurrency(bill.discount_amount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-xl text-white border-t border-white/20 pt-3">
                                            <span>Total:</span>
                                            <span>{formatCurrency(bill.total_amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-white/90">
                                            <span>Paid Amount:</span>
                                            <span className="font-medium">{formatCurrency(bill.paid_amount)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-xl text-white">
                                            <span>Remaining:</span>
                                            <span className={parseFloat(remainingAmount) > 0 ? 'text-red-300' : 'text-green-300'}>
                                                {formatCurrency(remainingAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Actions */}
                            {bill.payment_status !== 'paid' && (
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                                    <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-5 border-b border-gray-200/50">
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                            <div className="p-2 bg-orange-500 rounded-lg mr-3">
                                                <CreditCard className="h-5 w-5 text-white" />
                                            </div>
                                            Payment Actions
                                        </h2>
                                    </div>
                                    <div className="p-6 bg-gradient-to-b from-white to-orange-50/30 space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-orange-500 rounded-full mr-2"></span>
                                                Payment Method
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {Object.keys(paymentMethodIcons).map((method) => (
                                                    <Button
                                                        key={method}
                                                        variant="outline"
                                                        onClick={() => handlePaymentUpdate(method, parseFloat(remainingAmount))}
                                                        className="flex items-center justify-center bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 text-orange-700 hover:from-orange-100 hover:to-red-100 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300"
                                                    >
                                                        <span className="mr-2 text-xl">{paymentMethodIcons[method as keyof typeof paymentMethodIcons]}</span>
                                                        {method.charAt(0).toUpperCase() + method.slice(1)}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-green-500 rounded-full mr-2"></span>
                                                Quick Payment
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handlePaymentUpdate('cash', parseFloat(remainingAmount))}
                                                    disabled={parseFloat(remainingAmount) <= 0}
                                                    className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Pay Full Amount
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handlePaymentUpdate('cash', Math.ceil(parseFloat(remainingAmount) / 2))}
                                                    disabled={parseFloat(remainingAmount) <= 0}
                                                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Pay Half
                                                </Button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-purple-500 rounded-full mr-2"></span>
                                                Update Status
                                            </label>
                                            <div className="flex gap-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate('paid')}
                                                    disabled={bill.payment_status === 'paid'}
                                                    className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Mark Paid
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate('refunded')}
                                                    disabled={bill.payment_status === 'refunded'}
                                                    className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 hover:from-red-100 hover:to-pink-100 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Refund
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
