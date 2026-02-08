import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Eye, Edit, Trash2, Filter, DollarSign, Coffee, Utensils, Calendar, Users, Clock, CheckCircle, TrendingUp, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useCurrency } from '@/components/currency-switcher';
import type { BreadcrumbItem } from '@/types';

// Helper function for route generation
const route = (name: string, params?: any) => {
    const baseUrl = window.location.origin;
    const routes: Record<string, string> = {
        'orders.index': '/orders',
        'orders.create': '/orders/create',
        'orders.show': '/orders/:id',
        'orders.edit': '/orders/:id/edit',
    };
    
    let url = routes[name] || `/${name}`;
    
    if (params && name !== 'orders.index' && name !== 'orders.create') {
        // For simple parameters, replace :id if it exists, otherwise append
        if (url.includes(':id')) {
            url = url.replace(':id', params);
        } else {
            url += `/${params}`;
        }
    }
    
    return url;
};

interface Table {
    id: number;
    table_number: string;
    name: string | null;
}

interface OrderItem {
    id: number;
    menu_item_id: number;
    quantity: number;
    unit_price: string;
    total_price: string;
    menu_item?: {
        name: string;
    };
}

interface Order {
    id: number;
    order_number: string;
    status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
    priority: 'low' | 'normal' | 'high';
    subtotal: string;
    tax_amount: string;
    total_amount: string;
    order_time: string;
    ready_time?: string;
    served_time?: string;
    table?: {
        id: number;
        table_number: string;
    };
    order_items: OrderItem[];
    bill?: {
        id: number;
        payment_status: string;
    };
}

interface Props {
    orders: {
        data: Order[];
        links: any[];
        meta: any;
    };
    tables: Table[];
    filters: {
        status?: string;
        table_id?: string;
        date_from?: string;
        date_to?: string;
    };
}

const statusColors = {
    pending: 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 border-gray-400 font-bold px-3 py-1 rounded-full', // ⚪ Gray: Inactive, disabled
    preparing: 'bg-gradient-to-r from-blue-200 to-blue-300 text-blue-900 border-blue-400 font-bold px-3 py-1 rounded-full', // 🔵 Blue: Information, free tax
    ready: 'bg-gradient-to-r from-green-200 to-green-300 text-green-900 border-green-400 font-bold px-3 py-1 rounded-full', // 🟢 Green: Success, active, positive
    served: 'bg-gradient-to-r from-green-200 to-emerald-300 text-green-900 border-green-400 font-bold px-3 py-1 rounded-full', // 🟢 Green: Success, active, positive
    completed: 'bg-gradient-to-r from-green-200 to-emerald-300 text-green-900 border-green-400 font-bold px-3 py-1 rounded-full', // 🟢 Green: Success, active, positive
    cancelled: 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 border-gray-400 font-bold px-3 py-1 rounded-full', // ⚪ Gray: Inactive, disabled
};

const priorityColors = {
    low: 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 border-gray-400 font-bold px-3 py-1 rounded-full', // ⚪ Gray: Inactive, disabled
    normal: 'bg-gradient-to-r from-blue-200 to-blue-300 text-blue-900 border-blue-400 font-bold px-3 py-1 rounded-full', // 🔵 Blue: Information, free tax
    high: 'bg-gradient-to-r from-purple-200 to-purple-300 text-purple-900 border-purple-400 font-bold px-3 py-1 rounded-full', // 🟣 Purple: Custom, manual tax
};

export default function OrdersIndex({ orders, tables, filters }: Props) {
    const { formatCurrency } = useCurrency();
    const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
    const [localOrders, setLocalOrders] = useState(orders.data);
    
    // Sync localOrders with orders.data when filters change
    useEffect(() => {
        setLocalOrders(orders.data);
    }, [orders.data]);
    
    const handleFilterChange = (key: string, value: string) => {
        const newFilters = {
            ...filters,
            [key]: value === 'all' ? '' : value,
        };
        
        // Remove empty filters to keep URL clean
        const cleanFilters = Object.fromEntries(
            Object.entries(newFilters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
        );
        
        router.get('/orders', cleanFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusUpdate = (id: number, newStatus: string) => {
        setUpdatingStatus(id);
        
        // Use fetch instead of router.post to handle JSON response
        fetch(`/orders/${id}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        })
        .then(response => response.json())
        .then(data => {
            setUpdatingStatus(null);
            if (data.success) {
                // Show success toast
                Swal.fire({
                    icon: 'success',
                    title: 'Status Updated!',
                    text: `Order status has been updated to ${newStatus}`,
                    timer: 2000,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true,
                });
                
                // Update local orders state instead of reloading
                setLocalOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === id 
                            ? { ...order, status: newStatus as Order['status'] }
                            : order
                    )
                );
            } else {
                throw new Error(data.message || 'Update failed');
            }
        })
        .catch(error => {
            setUpdatingStatus(null);
            console.error('Error updating status:', error);
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'Failed to update order status. Please try again.',
                confirmButtonColor: '#3B82F6',
            });
        });
    };

    const handleGenerateBill = (id: number) => {
        router.post(`/orders/${id}/generate-bill`, {}, {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Bill Generated!',
                    text: 'Bill has been generated successfully.',
                    timer: 2000,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true,
                });
            },
            onError: (errors) => {
                console.error('Error generating bill:', errors);
                Swal.fire({
                    icon: 'error',
                    title: 'Generation Failed',
                    text: 'Failed to generate bill. Please try again.',
                    confirmButtonColor: '#3B82F6',
                });
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/orders' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />

            <div className="space-y-8 p-6">
                {/* Beautiful Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <Utensils className="h-8 w-8" />
                                <h1 className="text-4xl font-bold">Orders Management</h1>
                            </div>
                            <p className="text-indigo-100 text-lg">Manage and track all restaurant orders</p>
                        </div>
                        <Link href={route('orders.create')}>
                            <Button className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                                <Plus className="h-4 w-4 mr-2" />
                                New Order
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Enhanced Filters */}
                <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg rounded-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
                        <CardTitle className="flex items-center">
                            <Filter className="h-5 w-5 mr-2" />
                            Filter Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
                                    <SelectTrigger className="border-2 border-gray-300 text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                                        <SelectValue placeholder="All Status" className="text-gray-900 font-semibold" />
                                    </SelectTrigger>
                                    <SelectContent className="text-gray-700 bg-white border-2 border-gray-200 shadow-lg">
                                        <SelectItem value="all" className="text-gray-900 font-semibold hover:bg-gray-50 cursor-pointer capitalize">
                                            All Status
                                        </SelectItem>
                                        <SelectItem value="pending" className="text-gray-900 font-semibold hover:bg-gray-50 cursor-pointer capitalize">
                                            Pending
                                        </SelectItem>
                                        <SelectItem value="preparing" className="text-blue-900 font-semibold hover:bg-blue-50 cursor-pointer capitalize">
                                            Preparing
                                        </SelectItem>
                                        <SelectItem value="ready" className="text-green-900 font-semibold hover:bg-green-50 cursor-pointer capitalize">
                                            Ready
                                        </SelectItem>
                                        <SelectItem value="served" className="text-green-900 font-semibold hover:bg-green-50 cursor-pointer capitalize">
                                            Served
                                        </SelectItem>
                                        <SelectItem value="completed" className="text-green-900 font-semibold hover:bg-green-50 cursor-pointer capitalize">
                                            Completed
                                        </SelectItem>
                                        <SelectItem value="cancelled" className="text-gray-900 font-semibold hover:bg-gray-50 cursor-pointer capitalize">
                                            Cancelled
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Table</label>
                                <Select value={filters.table_id || 'all'} onValueChange={(value) => handleFilterChange('table_id', value)}>
                                    <SelectTrigger className="border-2 border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                                        <SelectValue placeholder="All Tables" className="text-gray-900 font-semibold" />
                                    </SelectTrigger>
                                    <SelectContent className="text-gray-700 bg-white border-2 border-gray-200 shadow-lg">
                                        <SelectItem value="all" className="text-gray-900 font-semibold hover:bg-gray-50 cursor-pointer capitalize">
                                            All Tables
                                        </SelectItem>
                                        {tables.map((table) => (
                                            <SelectItem key={table.id} value={table.id.toString()} className="text-gray-900 font-semibold hover:bg-gray-50 cursor-pointer">
                                                {table.table_number} {table.name && `- ${table.name}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Date From</label>
                                <Input
                                    type="date"
                                    value={filters.date_from || ''}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                    className="border-2 border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 h-10 font-medium"
                                    placeholder="Select start date"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Date To</label>
                                <Input
                                    type="date"
                                    value={filters.date_to || ''}
                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                    className="border-2 border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 h-10 font-medium"
                                    placeholder="Select end date"
                                />
                            </div>

                            <div className="flex items-end">
                                <Button 
                                    onClick={() => {
                                        // Clean current filters and apply them
                                        const cleanFilters = Object.fromEntries(
                                            Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
                                        );
                                        router.get('/orders', cleanFilters, { preserveState: true, preserveScroll: true });
                                    }}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Apply Filters
                                </Button>
                            </div>

                            <div className="flex items-end">
                                <Button 
                                    onClick={() => router.get('/orders', {}, { preserveState: true, preserveScroll: true })}
                                    variant="outline"
                                    className="border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 font-bold px-6 py-2 rounded-lg transition-all duration-200 flex items-center"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Orders Section (Excluding Completed) */}
                <Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg rounded-xl mb-8">
                    <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-xl">
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="bg-white/20 p-2 rounded-xl mr-3">
                                    <Clock className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Active Orders</h3>
                                    <p className="text-orange-100 text-sm">Orders currently in progress (excluding completed)</p>
                                </div>
                            </div>
                            <Badge className="bg-white text-orange-600 font-bold px-4 py-2 rounded-full">
                                {localOrders.filter(order => order.status !== 'completed' && order.status !== 'cancelled').length} Active
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {localOrders.filter(order => order.status !== 'completed' && order.status !== 'cancelled').length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {localOrders.filter(order => order.status !== 'completed' && order.status !== 'cancelled').map((order) => (
                                    <div key={order.id} className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <div className="bg-gradient-to-br from-orange-100 to-red-100 border border-orange-300 rounded-xl px-4 py-2">
                                                        <span className="text-xl font-bold text-orange-700">#{order.order_number}</span>
                                                    </div>
                                                    <Badge className={`px-3 py-1 rounded-full text-xs font-bold border-0 ${statusColors[order.status]}`}>
                                                        {order.status.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                    <div className="bg-gray-50 rounded-xl p-3">
                                                        <div className="flex items-center space-x-2 text-gray-600 text-sm mb-1">
                                                            <Coffee className="h-4 w-4" />
                                                            <span>Table</span>
                                                        </div>
                                                        <p className="font-semibold text-gray-900">{order.table?.table_number || 'N/A'}</p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-xl p-3">
                                                        <div className="flex items-center space-x-2 text-gray-600 text-sm mb-1">
                                                            <Users className="h-4 w-4" />
                                                            <span>Items</span>
                                                        </div>
                                                        <p className="font-semibold text-gray-900">{order.order_items.length}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Badge className={priorityColors[order.priority]}>
                                                        {order.priority.toUpperCase()}
                                                    </Badge>
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(order.order_time).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-green-600">
                                                    {formatCurrency(order.total_amount)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Order Items Preview */}
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4">
                                            <p className="text-sm font-semibold text-gray-700 mb-3">Order Items:</p>
                                            <div className="space-y-2">
                                                {order.order_items.slice(0, 2).map((item) => (
                                                    <div key={item.id} className="flex justify-between items-center bg-white rounded-lg px-3 py-2 shadow-sm">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium text-gray-900">{item.menu_item?.name}</span>
                                                            <div className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                                                                x{item.quantity}
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-700">{formatCurrency(item.total_price)}</span>
                                                    </div>
                                                ))}
                                                {order.order_items.length > 2 && (
                                                    <p className="text-xs text-center text-gray-500 font-medium pt-1">
                                                        +{order.order_items.length - 2} more items
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                {order.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleStatusUpdate(order.id, 'preparing')}
                                                        disabled={updatingStatus === order.id}
                                                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 font-semibold"
                                                    >
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        Start Preparing
                                                    </Button>
                                                )}
                                                {order.status === 'preparing' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleStatusUpdate(order.id, 'ready')}
                                                        disabled={updatingStatus === order.id}
                                                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 font-semibold"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Mark Ready
                                                    </Button>
                                                )}
                                                {order.status === 'ready' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleStatusUpdate(order.id, 'served')}
                                                        disabled={updatingStatus === order.id}
                                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 font-semibold"
                                                    >
                                                        <Users className="h-4 w-4 mr-2" />
                                                        Mark Served
                                                    </Button>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <Link href={route('orders.show', order.id)}>
                                                    <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Details
                                                    </Button>
                                                </Link>
                                                {!order.bill && (order.status === 'served' || order.status === 'ready') && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleGenerateBill(order.id)}
                                                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 font-semibold"
                                                    >
                                                        <DollarSign className="h-4 w-4 mr-2" />
                                                        Generate Bill
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="bg-gray-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Clock className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-700 mb-2">No Active Orders</h3>
                                <p className="text-gray-500 text-lg mb-6">All orders have been completed or there are no orders in progress</p>
                                <Link href={route('orders.create')}>
                                    <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 font-semibold px-8 py-3">
                                        <Plus className="h-5 w-5 mr-2" />
                                        Create New Order
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Enhanced Orders Table */}
                <Card className="border-0 bg-gradient-to-r from-slate-50 to-blue-50 shadow-lg rounded-xl">
                    <CardHeader className="bg-gradient-to-r from-slate-600 to-blue-600 text-white rounded-t-xl">
                        <CardTitle className="flex items-center">
                            <DollarSign className="h-5 w-5 mr-2" />
                            Orders List
                            <Badge className="ml-2 bg-white text-slate-600">
                                {localOrders.length} Orders
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-slate-100 to-blue-100 border-b-2 border-slate-200">
                                    <tr className="text-left">
                                        <th className="p-4 font-bold text-slate-700">Order #</th>
                                        <th className="p-4 font-bold text-slate-700">Table</th>
                                        <th className="p-4 font-bold text-slate-700">Status</th>
                                        <th className="p-4 font-bold text-slate-700">Priority</th>
                                        <th className="p-4 font-bold text-slate-700">Items</th>
                                        <th className="p-4 font-bold text-slate-700">Total</th>
                                        <th className="p-4 font-bold text-slate-700">Order Time</th>
                                        <th className="p-4 font-bold text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {localOrders.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-accent/50 transition-colors duration-150">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-900">{order.order_number}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-gray-700 font-medium">{order.table?.table_number || 'N/A'}</span>
                                            </td>
                                            <td className="p-4 relative">
                                                <Select 
                                                    value={order.status} 
                                                    onValueChange={(value) => handleStatusUpdate(order.id, value)}
                                                    disabled={updatingStatus === order.id}
                                                >
                                                    <SelectTrigger className={`w-32 h-10 border-2 border-gray-300 text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${updatingStatus === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        <SelectValue placeholder="Status" className="text-gray-900 font-semibold" />
                                                    </SelectTrigger>
                                                    <SelectContent className="text-gray-700 bg-white border-2 border-gray-200 shadow-lg">
                                                        <SelectItem value="pending" className="text-gray-900 font-semibold hover:bg-gray-50 cursor-pointer capitalize">
                                                            Pending
                                                        </SelectItem>
                                                        <SelectItem value="preparing" className="text-blue-900 font-semibold hover:bg-blue-50 cursor-pointer capitalize">
                                                            Preparing
                                                        </SelectItem>
                                                        <SelectItem value="ready" className="text-green-900 font-semibold hover:bg-green-50 cursor-pointer capitalize">
                                                            Ready
                                                        </SelectItem>
                                                        <SelectItem value="served" className="text-green-900 font-semibold hover:bg-green-50 cursor-pointer capitalize">
                                                            Served
                                                        </SelectItem>
                                                        <SelectItem value="completed" className="text-green-900 font-semibold hover:bg-green-50 cursor-pointer capitalize">
                                                            Completed
                                                        </SelectItem>
                                                        <SelectItem value="cancelled" className="text-gray-900 font-semibold hover:bg-gray-50 cursor-pointer capitalize">
                                                            Cancelled
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {updatingStatus === order.id && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded">
                                                        <div className="text-blue-600 text-sm font-semibold">Updating...</div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <Badge className={priorityColors[order.priority]}>
                                                    {order.priority}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-gray-700 font-medium">
                                                {order.order_items.length} items
                                            </td>
                                            <td className="p-4 font-bold text-gray-900">
                                                {formatCurrency(order.total_amount)}
                                            </td>
                                            <td className="p-4 text-sm text-gray-700 font-medium">
                                                {new Date(order.order_time).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center space-x-2">
                                                    <Link href={route('orders.show', order.id)}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={route('orders.edit', order.id)}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {!order.bill && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleGenerateBill(order.id)}
                                                        >
                                                            <DollarSign className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {orders.links && (
                    <div className="flex items-center justify-center space-x-2">
                        {orders.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-2 rounded-md text-sm ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
