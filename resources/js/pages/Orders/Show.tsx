import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, DollarSign, Users, CheckCircle, AlertCircle, XCircle, Edit } from 'lucide-react';
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
    status: string;
    menu_item?: {
        name: string;
        category: string;
        description: string;
    };
}

interface Bill {
    id: number;
    bill_number: string;
    subtotal: string;
    tax_amount: string;
    service_charge: string;
    discount_amount: string;
    total_amount: string;
    payment_status: string;
    payment_method?: string;
    paid_amount: string;
    bill_time: string;
    paid_time?: string;
}

interface Order {
    id: number;
    order_number: string;
    status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
    priority: 'low' | 'normal' | 'high';
    special_instructions: string;
    subtotal: string;
    tax_amount: string;
    total_amount: string;
    discount_amount: string;
    order_time: string;
    ready_time?: string;
    served_time?: string;
    table?: {
        id: number;
        table_number: string;
        name?: string;
    };
    order_items: OrderItem[];
    bill?: Bill;
}

interface Props {
    order: Order;
}

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    preparing: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    served: 'bg-purple-100 text-purple-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
};

const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-red-100 text-red-800',
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
        'orders.index': '/orders',
        'orders.show': '/orders/:id',
        'orders.edit': '/orders/:id/edit',
        'bills.show': '/bills/:id',
    };
    
    let url = routes[name] || `/${name}`;
    
    if (params) {
        if (typeof params === 'object') {
            Object.keys(params).forEach(key => {
                url = url.replace(`:${key}`, params[key]);
            });
        } else {
            // For simple parameters, replace :id if it exists, otherwise append
            if (url.includes(':id')) {
                url = url.replace(':id', params);
            } else {
                url += `/${params}`;
            }
        }
    }
    
    return url;
};

export default function OrdersShow({ order }: Props) {
    const { getTaxLabel } = useTax();
    const { formatCurrency } = useCurrency();
    const [currentOrder, setCurrentOrder] = useState(order);
    
    const handleStatusUpdate = (newStatus: string) => {
        // Use fetch to avoid Inertia JSON response issues
        fetch(`/orders/${currentOrder?.id}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ status: newStatus }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update local state with new order data
                setCurrentOrder(data.order);
                console.log('Order status updated successfully');
            } else {
                console.error('Error updating order status');
            }
        })
        .catch(error => {
            console.error('Error updating order status:', error);
        });
    };

    const handleGenerateBill = () => {
        router.post(`/orders/${currentOrder?.id}/generate-bill`, {}, {
            onSuccess: () => {
                // Success message will be shown via flash message
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/orders' },
        { title: `Order ${order?.order_number || 'Unknown'}`, href: `/orders/${order?.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order?.order_number || 'Unknown'}`} />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link href={route('orders.index')}>
                                    <Button variant="outline" size="sm" className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300 text-gray-700 hover:text-gray-900 font-medium shadow-sm hover:shadow-md">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Orders
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                                        Order {order?.order_number || 'Unknown'}
                                    </h1>
                                    <p className="text-gray-600 mt-2 text-lg">Order details and management</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Link href={route('orders.edit', order?.id)}>
                                    <Button variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Order
                                    </Button>
                                </Link>
                                {!order.bill ? (
                                    <Button onClick={handleGenerateBill} className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Generate Bill
                                    </Button>
                                ) : (
                                    <Link href={route('bills.show', order.bill.id)}>
                                        <Button className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            View Bill
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Order Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Information */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200/50">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                        <div className="p-2 bg-blue-500 rounded-lg mr-3">
                                            <Users className="h-5 w-5 text-white" />
                                        </div>
                                        Order Information
                                    </h2>
                                </div>
                                <div className="p-6 bg-gradient-to-b from-white to-gray-50/30">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
                                                Order Number
                                            </label>
                                            <p className="font-bold text-gray-900 text-lg">{order?.order_number || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-green-500 rounded-full mr-2"></span>
                                                Table
                                            </label>
                                            <p className="font-bold text-gray-900 text-lg">
                                                {order.table?.table_number} {order.table?.name && `- ${order.table?.name}`}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-purple-500 rounded-full mr-2"></span>
                                                Status
                                            </label>
                                            <div className="mt-1">
                                                <Select value={currentOrder?.status || 'pending'} onValueChange={handleStatusUpdate}>
                                                    <SelectTrigger className="w-48 bg-white border-2 border-gray-200 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-3 h-12 font-medium">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="preparing">Preparing</SelectItem>
                                                        <SelectItem value="ready">Ready</SelectItem>
                                                        <SelectItem value="served">Served</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-orange-500 rounded-full mr-2"></span>
                                                Priority
                                            </label>
                                            <div className="mt-1">
                                                <Badge className={`px-4 py-2 font-bold text-sm rounded-full shadow-md ${
                                                    order?.priority === 'high' ? 'bg-gradient-to-r from-red-400 to-red-500 text-white border-0' :
                                                    order?.priority === 'normal' ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white border-0' :
                                                    'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0'
                                                }`}>
                                                    {order?.priority || 'normal'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-indigo-500 rounded-full mr-2"></span>
                                                Order Time
                                            </label>
                                            <p className="font-bold text-gray-900 flex items-center text-lg">
                                                <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                                                {new Date(order?.order_time || new Date()).toLocaleString()}
                                            </p>
                                        </div>
                                        {order.ready_time && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                    <span className="w-1 h-4 bg-green-500 rounded-full mr-2"></span>
                                                    Ready Time
                                                </label>
                                                <p className="font-bold text-gray-900 flex items-center text-lg">
                                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                                    {new Date(order.ready_time).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                        {order.served_time && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                    <span className="w-1 h-4 bg-emerald-500 rounded-full mr-2"></span>
                                                    Served Time
                                                </label>
                                                <p className="font-bold text-gray-900 flex items-center text-lg">
                                                    <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                                                    {new Date(order.served_time).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {order.special_instructions && (
                                        <div className="mt-6">
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-pink-500 rounded-full mr-2"></span>
                                                Special Instructions
                                            </label>
                                            <p className="mt-2 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200 text-gray-900 font-medium">
                                                {order.special_instructions}
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
                                        Order Items ({order?.order_items?.length || 0})
                                    </h2>
                                </div>
                                <div className="p-6 bg-gradient-to-b from-white to-emerald-50/20">
                                    <div className="space-y-4">
                                        {(order?.order_items || []).map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300">
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-3xl bg-white p-3 rounded-xl shadow-sm">
                                                        {categoryIcons[item.menu_item?.category as keyof typeof categoryIcons] || '🍽️'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-lg">{item.menu_item?.name}</h4>
                                                        <p className="text-gray-600 text-sm mt-1">{item.menu_item?.description}</p>
                                                        {item.special_instructions && (
                                                            <p className="text-sm text-blue-600 mt-2 font-medium">📝 {item.special_instructions}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-gray-900 text-lg">{item.quantity} × {formatCurrency(parseFloat(item.unit_price))}</div>
                                                    <div className="font-bold text-xl text-emerald-600">{formatCurrency(parseFloat(item.total_price))}</div>
                                                    <Badge className="mt-2 text-gray-900" variant="outline">
                                                        {item.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl border-0 overflow-hidden">
                                <div className="bg-white/10 backdrop-blur-sm px-6 py-5 border-b border-white/20">
                                    <h2 className="text-xl font-bold text-white flex items-center">
                                        <div className="p-2 bg-white/20 rounded-lg mr-3">
                                            <DollarSign className="h-5 w-5 text-white" />
                                        </div>
                                        Order Summary
                                    </h2>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-white/10 to-white/5">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-white/90">
                                            <span>Subtotal:</span>
                                            <span className="font-medium">{formatCurrency(parseFloat(order?.subtotal || '0'))}</span>
                                        </div>
                                        <div className="flex justify-between text-white/90">
                                            <span>{getTaxLabel()}:</span>
                                            <span className="font-medium">{formatCurrency(parseFloat(order?.tax_amount || '0'))}</span>
                                        </div>
                                        {parseFloat(order.discount_amount) > 0 && (
                                            <div className="flex justify-between text-green-300">
                                                <span>Discount:</span>
                                                <span className="font-medium">-{formatCurrency(parseFloat(order.discount_amount))}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-xl text-white border-t border-white/20 pt-3">
                                            <span>Total:</span>
                                            <span>{formatCurrency(parseFloat(order?.total_amount || '0'))}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bill Information */}
                            {order.bill && (
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
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="font-bold text-gray-900">Bill Number:</span>
                                                <span className="font-bold text-gray-900">{order.bill.bill_number}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-bold text-gray-900">Payment Status:</span>
                                                <Badge className={`px-4 py-2 font-bold text-sm rounded-full shadow-md ${
                                                    order.bill.payment_status === 'paid' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white border-0' :
                                                    order.bill.payment_status === 'partial' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0' :
                                                    'bg-gradient-to-r from-red-400 to-red-500 text-white border-0'
                                                }`}>
                                                    {order.bill.payment_status}
                                                </Badge>
                                            </div>
                                            {order.bill.payment_method && (
                                                <div className="flex justify-between">
                                                    <span className="font-bold text-gray-900">Payment Method:</span>
                                                    <span className="font-medium text-gray-900">{order.bill.payment_method}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="font-bold text-gray-900">Paid Amount:</span>
                                                <span className="font-bold text-emerald-600">{formatCurrency(parseFloat(order.bill.paid_amount))}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-bold text-gray-900">Remaining:</span>
                                                <span className="font-bold text-red-600">{formatCurrency(parseFloat(order.bill.total_amount) - parseFloat(order.bill.paid_amount))}</span>
                                            </div>
                                            {order.bill.paid_time && (
                                                <div className="flex justify-between">
                                                    <span className="font-bold text-gray-900">Paid Time:</span>
                                                    <span className="text-sm text-gray-600">{new Date(order.bill.paid_time).toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <Link href={route('bills.show', order.bill.id)}>
                                            <Button className="w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                                                View Bill Details
                                            </Button>
                                        </Link>
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
