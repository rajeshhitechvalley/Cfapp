import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Clock, Users, AlertCircle, CheckCircle, Timer, DollarSign, Table as TableIcon, ChefHat, TrendingUp, Coffee, Utensils, Star, Zap, Award } from 'lucide-react';

interface Order {
    id: number;
    order_number: string;
    table_number: string;
    table_name: string;
    status: string;
    priority: string;
    special_instructions: string | null;
    order_time: string;
    ready_time?: string;
    waiting_time?: string;
    created_by: string;
    assigned_to?: string;
    total_amount: string;
    items_count: number;
    time_elapsed: string;
    estimated_time: string;
}

interface Table {
    id: number;
    table_number: string;
    name: string;
    capacity: number;
    status: string;
    has_active_order: boolean;
    active_order?: string;
}

interface Stats {
    total_active_orders: number;
    pending_orders: number;
    preparing_orders: number;
    ready_orders: number;
    total_tables: number;
    occupied_tables: number;
    available_tables: number;
    high_priority_orders: number;
    daily_revenue: string;
}

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    order_number: string;
    table_number: string;
    created_at: string;
}

interface Props {
    activeOrders?: Order[];
    readyOrders?: Order[];
    tables?: Table[];
    stats?: Stats;
}

export default function ReceptionIndex({ 
    activeOrders: initialActiveOrders = [], 
    readyOrders: initialReadyOrders = [], 
    tables: initialTables = [], 
    stats: initialStats = {
        total_active_orders: 0,
        pending_orders: 0,
        preparing_orders: 0,
        ready_orders: 0,
        total_tables: 0,
        occupied_tables: 0,
        available_tables: 0,
        high_priority_orders: 0,
        daily_revenue: '0.00',
    }
}: Props) {
    const [activeOrders, setActiveOrders] = useState(initialActiveOrders);
    const [readyOrders, setReadyOrders] = useState(initialReadyOrders);
    const [tables, setTables] = useState(initialTables);
    const [stats, setStats] = useState(initialStats || {
        total_active_orders: 0,
        pending_orders: 0,
        preparing_orders: 0,
        ready_orders: 0,
        total_tables: 0,
        occupied_tables: 0,
        available_tables: 0,
        high_priority_orders: 0,
        daily_revenue: '0.00',
    });
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // Auto-refresh data every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchRealTimeUpdates();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Fetch notifications on mount
    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchRealTimeUpdates = async () => {
        try {
            const response = await fetch('/reception/realtime');
            const data = await response.json();
            
            // Safety checks for data structure
            if (data && data.orders) {
                // Update orders based on the response
                // This would need more sophisticated logic to merge updates
            }
            
            if (data && data.stats) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch real-time updates:', error);
            // Don't update state on error to prevent undefined issues
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/reception/notifications');
            const data = await response.json();
            setNotifications(data.notifications);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markOrderServed = async (orderId: number) => {
        console.log('Marking order as served:', orderId);
        
        try {
            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log('CSRF Token:', csrfToken ? 'Found' : 'Not found');
            
            const response = await fetch(`/reception/orders/${orderId}/serve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                },
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok && data.success) {
                console.log('Order marked as served successfully');
                
                // Update local state
                setReadyOrders(readyOrders.filter(order => order.id !== orderId));
                setStats({
                    ...stats,
                    ready_orders: Math.max(0, stats.ready_orders - 1),
                    total_active_orders: Math.max(0, stats.total_active_orders - 1),
                });
                fetchNotifications();
                
                // Show success message
                alert('Order marked as served successfully!');
            } else {
                console.error('Failed to mark order as served:', data);
                alert(data.message || 'Failed to mark order as served');
            }
        } catch (error) {
            console.error('Failed to mark order as served:', error);
            alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    };

    const updateOrderPriority = async (orderId: number, priority: string) => {
        try {
            const response = await fetch(`/reception/orders/${orderId}/priority`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ priority }),
            });

            if (response.ok) {
                fetchRealTimeUpdates();
                fetchNotifications();
            }
        } catch (error) {
            console.error('Failed to update order priority:', error);
        }
    };

    const markNotificationRead = async (notificationId: number) => {
        try {
            await fetch(`/reception/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500';
            case 'normal': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-900 border-yellow-300 font-semibold';
            case 'preparing': return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-900 border-blue-300 font-semibold';
            case 'ready': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-900 border-green-300 font-semibold';
            default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-900 border-gray-300 font-semibold';
        }
    };

    const getTableStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-900 border-green-300 font-semibold';
            case 'occupied': return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-900 border-red-300 font-semibold';
            case 'reserved': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-900 border-yellow-300 font-semibold';
            default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-900 border-gray-300 font-semibold';
        }
    };

    return (
        <AppLayout>
            <Head title="Reception Dashboard" />

            <div className="space-y-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <Coffee className="h-8 w-8" />
                                <h1 className="text-4xl font-bold">Reception Dashboard</h1>
                            </div>
                            <p className="text-indigo-100 text-lg">Manage orders and restaurant operations with style</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
                            >
                                <Bell className="h-4 w-4" />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
                                        {notifications.length}
                                    </span>
                                )}
                            </Button>
                            <Button asChild className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                                <Link href="/orders/create">
                                    <Utensils className="h-4 w-4 mr-2" />
                                    New Order
                                </Link>
                            </Button>
                            <Button onClick={fetchRealTimeUpdates} className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300">
                                <Timer className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Notifications Panel */}
                {showNotifications && (
                    <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl rounded-2xl">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
                            <CardTitle className="flex items-center">
                                <Bell className="h-5 w-5 mr-2" />
                                Notifications
                                <Badge className="ml-2 bg-white text-blue-600">
                                    {notifications.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {notifications.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
                                    <p className="text-gray-600">No new notifications</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className="flex items-start justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100"
                                        >
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 mb-1">{notification.title}</p>
                                                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                                                <p className="text-xs text-gray-500 flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {notification.created_at}
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => markNotificationRead(notification.id)}
                                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-300"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl">
                        <CardContent className="p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-100 font-semibold mb-1">Pending Orders</p>
                                    <p className="text-4xl font-bold">{stats.pending_orders}</p>
                                    <p className="text-yellow-200 text-sm mt-1">Awaiting preparation</p>
                                </div>
                                <div className="bg-white/20 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
                                    <Clock className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                        <CardContent className="p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 font-semibold mb-1">Preparing</p>
                                    <p className="text-4xl font-bold">{stats.preparing_orders}</p>
                                    <p className="text-blue-200 text-sm mt-1">In kitchen</p>
                                </div>
                                <div className="bg-white/20 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
                                    <ChefHat className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl">
                        <CardContent className="p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 font-semibold mb-1">Ready to Serve</p>
                                    <p className="text-4xl font-bold">{stats.ready_orders}</p>
                                    <p className="text-green-200 text-sm mt-1">Completed</p>
                                </div>
                                <div className="bg-white/20 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
                                    <CheckCircle className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
                        <CardContent className="p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 font-semibold mb-1">Daily Revenue</p>
                                    <p className="text-4xl font-bold">${parseFloat(stats.daily_revenue).toFixed(2)}</p>
                                    <p className="text-purple-200 text-sm mt-1 flex items-center">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        Today's earnings
                                    </p>
                                </div>
                                <div className="bg-white/20 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
                                    <DollarSign className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-0 bg-gradient-to-r from-gray-50 to-gray-100 shadow-lg rounded-xl">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 font-medium">Total Tables</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total_tables}</p>
                                </div>
                                <TableIcon className="h-8 w-8 text-gray-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-gradient-to-r from-red-50 to-pink-50 shadow-lg rounded-xl">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-600 font-medium">Occupied</p>
                                    <p className="text-2xl font-bold text-red-900">{stats.occupied_tables}</p>
                                </div>
                                <Users className="h-8 w-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg rounded-xl">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-600 font-medium">Available</p>
                                    <p className="text-2xl font-bold text-green-900">{stats.available_tables}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-lg rounded-xl">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-indigo-600 font-medium">Active Orders</p>
                                    <p className="text-2xl font-bold text-indigo-900">{stats.total_active_orders}</p>
                                </div>
                                <Zap className="h-8 w-8 text-indigo-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tables Status */}
                <Card className="border-0 bg-gradient-to-r from-slate-50 to-blue-50 shadow-xl rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-slate-600 to-blue-600 text-white rounded-t-2xl">
                        <CardTitle className="flex items-center">
                            <TableIcon className="h-5 w-5 mr-2" />
                            Table Status Overview
                            <Badge className="ml-2 bg-white text-slate-600">
                                {tables.length} Tables
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {tables.map((table) => (
                                <div
                                    key={table.id}
                                    className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                                        table.status === 'available'
                                            ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100'
                                            : table.status === 'occupied'
                                            ? 'border-red-300 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100'
                                            : 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100'
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                                            table.status === 'available' ? 'bg-green-500' :
                                            table.status === 'occupied' ? 'bg-red-500' :
                                            'bg-yellow-500'
                                        }`}>
                                            <TableIcon className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900">{table.table_number}</h3>
                                        <p className="text-sm text-gray-600 font-medium">{table.name}</p>
                                        <p className="text-xs text-gray-500 mb-2">Capacity: {table.capacity}</p>
                                        <Badge className={`${
                                            table.status === 'available' ? 'bg-green-100 text-green-800' :
                                            table.status === 'occupied' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        } font-semibold`}>
                                            {table.status}
                                        </Badge>
                                        {table.active_order && (
                                            <p className="text-xs text-gray-600 mt-2 font-medium bg-white/50 px-2 py-1 rounded">
                                                {table.active_order}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Ready Orders */}
                {readyOrders.length > 0 && (
                    <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl rounded-2xl">
                        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-2xl">
                            <CardTitle className="flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Ready to Serve
                                <Badge className="ml-2 bg-white text-green-600 animate-pulse">
                                    {readyOrders.length} Orders
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {readyOrders.map((order) => (
                                    <Card key={order.id} className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-xl text-gray-900 flex items-center">
                                                            <Award className="h-5 w-5 mr-2 text-green-600" />
                                                            {order.order_number}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 font-medium">Table {order.table_number}</p>
                                                    </div>
                                                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-3 py-1 rounded-full">
                                                        Ready
                                                    </Badge>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Ready Time:</span>
                                                        <span className="font-semibold text-gray-900">{order.ready_time}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Waiting:</span>
                                                        <span className="font-semibold text-orange-600">{order.waiting_time}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Created by:</span>
                                                        <span className="font-semibold text-gray-900">{order.created_by}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t border-green-200">
                                                        <span className="text-gray-600">Total:</span>
                                                        <span className="font-bold text-lg text-green-600">${parseFloat(order.total_amount).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                                                    onClick={() => markOrderServed(order.id)}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Mark as Served
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Active Orders */}
                <Card className="border-0 bg-gradient-to-r from-orange-50 to-red-50 shadow-xl rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-2xl">
                        <CardTitle className="flex items-center">
                            <Clock className="h-5 w-5 mr-2" />
                            Active Orders
                            <Badge className="ml-2 bg-white text-orange-600">
                                {activeOrders.length} Orders
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {activeOrders.map((order) => (
                                <Card key={order.id} className={`border-2 text-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102 ${
                                    order.priority === 'high' 
                                        ? 'border-red-300 bg-gradient-to-br from-red-50 to-pink-50' 
                                        : order.priority === 'normal'
                                        ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50'
                                        : 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'
                                }`}>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-4">
                                                    <h4 className="font-bold text-2xl text-gray-900">{order.order_number}</h4>
                                                    <Badge className={`${
                                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'
                                                    } font-semibold px-3 py-1 rounded-full`}>
                                                        {order.status}
                                                    </Badge>
                                                    <Badge className={`${
                                                        order.priority === 'high' ? 'bg-red-100 text-red-800 border-red-300' :
                                                        order.priority === 'normal' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                                        'bg-green-100 text-green-800 border-green-300'
                                                    } border font-semibold px-3 py-1 rounded-full`}>
                                                        {order.priority}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <div className="bg-white/50 p-3 rounded-lg">
                                                        <p className="text-gray-600 text-sm font-medium">Table</p>
                                                        <p className="font-bold text-gray-900">{order.table_number} - {order.table_name}</p>
                                                    </div>
                                                    <div className="bg-white/50 p-3 rounded-lg">
                                                        <p className="text-gray-600 text-sm font-medium">Time</p>
                                                        <p className="font-bold text-gray-900">{order.order_time}</p>
                                                    </div>
                                                    <div className="bg-white/50 p-3 rounded-lg">
                                                        <p className="text-gray-600 text-sm font-medium">Items</p>
                                                        <p className="font-bold text-gray-900">{order.items_count}</p>
                                                    </div>
                                                    <div className="bg-white/50 p-3 rounded-lg">
                                                        <p className="text-gray-600 text-sm font-medium">Total</p>
                                                        <p className="font-bold text-lg text-orange-600">${parseFloat(order.total_amount).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                {order.special_instructions && (
                                                    <div className="mb-4 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-300">
                                                        <p className="text-sm font-semibold text-yellow-800 mb-1 flex items-center">
                                                            <AlertCircle className="h-4 w-4 mr-1" />
                                                            Special Instructions:
                                                        </p>
                                                        <p className="text-sm text-yellow-700">{order.special_instructions}</p>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div className="flex items-center text-gray-600">
                                                        <Users className="h-4 w-4 mr-2" />
                                                        <span>Created by: <span className="font-semibold text-gray-900">{order.created_by}</span></span>
                                                    </div>
                                                    {order.assigned_to && (
                                                        <div className="flex items-center text-gray-600">
                                                            <ChefHat className="h-4 w-4 mr-2" />
                                                            <span>Assigned to: <span className="font-semibold text-gray-900">{order.assigned_to}</span></span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center text-gray-600">
                                                        <Timer className="h-4 w-4 mr-2" />
                                                        <span>Est. ready: <span className="font-semibold text-gray-900">{order.estimated_time}</span></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-6">
                                                <Select
                                                    value={order.priority}
                                                    onValueChange={(value) => updateOrderPriority(order.id, value)}
                                                >
                                                    <SelectTrigger className="w-36 border-2 border-gray-300 bg-white hover:border-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300">
                                                        <SelectValue className="text-gray-900 font-semibold" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-2 border-gray-200 shadow-lg">
                                                        <SelectItem value="low" className="text-green-700 font-semibold hover:bg-green-50 cursor-pointer">
                                                            Low
                                                        </SelectItem>
                                                        <SelectItem value="normal" className="text-yellow-700 font-semibold hover:bg-yellow-50 cursor-pointer">
                                                            Normal
                                                        </SelectItem>
                                                        <SelectItem value="high" className="text-red-700 font-semibold hover:bg-red-50 cursor-pointer">
                                                            High
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {activeOrders.length === 0 && (
                            <div className="text-center py-12">
                                <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Clock className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">No active orders</h3>
                                <p className="text-gray-600 text-lg">All orders have been completed! Time to celebrate! 🎉</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
