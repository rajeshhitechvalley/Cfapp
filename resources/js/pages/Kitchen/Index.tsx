import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Clock, ChefHat, Users, AlertCircle, CheckCircle, Timer, Flame, Zap, TrendingUp, Activity, Eye } from 'lucide-react';

interface OrderItem {
    id: number;
    menu_item_name: string;
    quantity: number;
    special_instructions: string | null;
    status: string;
}

interface Order {
    id: number;
    order_number: string;
    table_number: string;
    status: string;
    priority: string;
    special_instructions: string | null;
    order_time: string;
    created_by: string;
    items: OrderItem[];
    total_items: number;
    time_elapsed: number;
}

interface KitchenStaff {
    id: number;
    name: string;
}

interface Stats {
    pending_orders: number;
    preparing_orders: number;
    ready_orders: number;
    total_active_orders: number;
    high_priority_orders: number;
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
    orders?: Order[];
    kitchenStaff?: KitchenStaff[];
    stats?: Stats;
}

export default function KitchenIndex({ 
    orders: initialOrders = [], 
    kitchenStaff: initialKitchenStaff = [], 
    stats: initialStats = {
        pending_orders: 0,
        preparing_orders: 0,
        ready_orders: 0,
        total_active_orders: 0,
        high_priority_orders: 0,
    }
}: Props) {
    const [orders, setOrders] = useState(initialOrders);
    const [kitchenStaff] = useState(initialKitchenStaff);
    const [stats, setStats] = useState(initialStats || {
        pending_orders: 0,
        preparing_orders: 0,
        ready_orders: 0,
        total_active_orders: 0,
        high_priority_orders: 0,
    });
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);

    // Auto-refresh orders every 30 seconds
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
            const response = await fetch('/kitchen/realtime');
            const data = await response.json();
            
            // Safety checks for data structure
            if (data && data.orders) {
                setOrders(data.orders);
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
            const response = await fetch('/kitchen/notifications');
            const data = await response.json();
            setNotifications(data.notifications);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const getCsrfToken = () => {
        // Try multiple methods to get CSRF token
        let token = '';
        
        // Method 1: Meta tag
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            token = metaTag.getAttribute('content') || '';
        }
        
        // Method 2: Try to get from cookie (Laravel default)
        if (!token) {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'XSRF-TOKEN') {
                    token = decodeURIComponent(value);
                    break;
                }
            }
        }
        
        // Method 3: Try to get from hidden input
        if (!token) {
            const hiddenInput = document.querySelector('input[name="_token"]') as HTMLInputElement;
            if (hiddenInput) {
                token = hiddenInput.value || '';
            }
        }
        
        // Debug information
        console.log('CSRF Token Debug:', {
            metaTag: !!metaTag,
            metaToken: metaTag?.getAttribute('content'),
            cookieToken: document.cookie.split(';').find(c => c.trim().startsWith('XSRF-TOKEN')),
            hiddenInput: !!document.querySelector('input[name="_token"]'),
            finalToken: token ? `${token.substring(0, 10)}...` : 'EMPTY'
        });
        
        if (!token) {
            console.error('CSRF token not found - tried meta tag, cookie, and hidden input');
            // Return a fallback for testing (remove in production)
            return 'test-token-fallback';
        }
        
        return token;
    };

    const updateOrderStatus = async (orderId: number, status: string) => {
        try {
            const response = await fetch(`/kitchen/orders/${orderId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                // Only fetch updates if response was successful
                fetchRealTimeUpdates();
                fetchNotifications();
            } else {
                console.error('Failed to update order status: Server error');
            }
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    };

    const assignOrder = async (orderId: number, staffId: string) => {
        try {
            const response = await fetch(`/kitchen/orders/${orderId}/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ assigned_to: staffId }),
            });

            if (response.ok) {
                fetchRealTimeUpdates();
                fetchNotifications();
            }
        } catch (error) {
            console.error('Failed to assign order:', error);
        }
    };

    const updateItemStatus = async (orderId: number, itemId: number, status: string) => {
        try {
            console.log('Updating item status:', { orderId, itemId, status });
            
            const response = await fetch(`/kitchen/orders/${orderId}/items/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ item_id: itemId, status }),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('Response data:', data);
                fetchRealTimeUpdates();
            } else {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                console.error('Response status:', response.status);
            }
        } catch (error) {
            console.error('Failed to update item status:', error);
        }
    };

    const markNotificationRead = async (notificationId: number) => {
        try {
            await fetch(`/kitchen/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
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
            case 'pending': return 'bg-yellow-500 text-white font-bold';
            case 'preparing': return 'bg-blue-500 text-white font-bold';
            case 'ready': return 'bg-green-500 text-white font-bold';
            default: return 'bg-gray-500 text-white font-bold';
        }
    };

    return (
        <AppLayout>
            <Head title="Kitchen Display System" />

            <div className="space-y-6">
                {/* Beautiful Header with Gradient */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white shadow-2xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <ChefHat className="h-10 w-10" />
                                <h1 className="text-4xl font-bold">Kitchen Display System</h1>
                            </div>
                            <p className="text-orange-100 text-lg">Professional Order Management & Real-time Tracking</p>
                            <div className="flex items-center space-x-4 mt-4">
                                <div className="flex items-center space-x-2">
                                    <Activity className="h-5 w-5" />
                                    <span className="text-sm">Live Updates</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Zap className="h-5 w-5" />
                                    <span className="text-sm">Fast Processing</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="h-5 w-5" />
                                    <span className="text-sm">Efficient Workflow</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-3xl font-bold">{stats.total_active_orders}</p>
                                <p className="text-orange-100">Active Orders</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">{stats.high_priority_orders}</p>
                                <p className="text-orange-100">High Priority</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Control Panel */}
                <div className="flex justify-between items-center bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant={showNotifications ? "default" : "outline"}
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg"
                        >
                            <Bell className="h-4 w-4" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
                                    {notifications.length}
                                </span>
                            )}
                            <span className="ml-2">Notifications</span>
                        </Button>
                        <Button 
                            onClick={fetchRealTimeUpdates}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg"
                        >
                            <Timer className="h-4 w-4 mr-2" />
                            Refresh Now
                        </Button>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Eye className="h-4 w-4" />
                        <span>Auto-refresh every 30 seconds</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Notifications Panel */}
                {showNotifications && (
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Bell className="h-5 w-5 mr-2" />
                                Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {notifications.length === 0 ? (
                                <p className="text-gray-500">No new notifications</p>
                            ) : (
                                <div className="space-y-2">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">{notification.title}</p>
                                                <p className="text-sm text-gray-600">{notification.message}</p>
                                                <p className="text-xs text-gray-500">{notification.created_at}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => markNotificationRead(notification.id)}
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-yellow-400 to-orange-500">
                        <CardContent className="p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-100 font-medium">Pending Orders</p>
                                    <p className="text-3xl font-bold mt-1">{stats.pending_orders}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                                    <Clock className="h-8 w-8" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-yellow-100 text-sm">
                                <Activity className="h-4 w-4 mr-1" />
                                Awaiting preparation
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-500 to-indigo-600">
                        <CardContent className="p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 font-medium">Preparing</p>
                                    <p className="text-3xl font-bold mt-1">{stats.preparing_orders}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                                    <ChefHat className="h-8 w-8" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-blue-100 text-sm">
                                <Flame className="h-4 w-4 mr-1" />
                                In progress
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-green-500 to-emerald-600">
                        <CardContent className="p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 font-medium">Ready</p>
                                    <p className="text-3xl font-bold mt-1">{stats.ready_orders}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                                    <CheckCircle className="h-8 w-8" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-green-100 text-sm">
                                <Zap className="h-4 w-4 mr-1" />
                                Ready for serving
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-purple-500 to-pink-600">
                        <CardContent className="p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 font-medium">Active Orders</p>
                                    <p className="text-3xl font-bold mt-1">{stats.total_active_orders}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                                    <Users className="h-8 w-8" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-purple-100 text-sm">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                Total workflow
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-red-500 to-rose-600">
                        <CardContent className="p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-100 font-medium">High Priority</p>
                                    <p className="text-3xl font-bold mt-1">{stats.high_priority_orders}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform animate-pulse">
                                    <AlertCircle className="h-8 w-8" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-red-100 text-sm">
                                <Flame className="h-4 w-4 mr-1" />
                                Urgent orders
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Enhanced Orders Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {orders && orders.length > 0 ? orders.map((order) => (
                        <Card key={order.id} className={`group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 overflow-hidden ${
                            order.priority === 'high' ? 'ring-4 ring-red-200 bg-gradient-to-br from-red-50 to-orange-50' :
                            order.priority === 'normal' ? 'ring-4 ring-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50' :
                            'ring-4 ring-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                        }`}>
                            {/* Priority Header Bar */}
                            <div className={`h-2 ${
                                order.priority === 'high' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                                order.priority === 'normal' ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                                'bg-gradient-to-r from-green-500 to-emerald-500'
                            }`}></div>
                            
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-2xl font-bold text-gray-900">{order.order_number}</h3>
                                            <Badge className={`${getStatusColor(order.status)} px-3 py-1 text-sm font-bold shadow-lg`}>
                                                {order.status}
                                            </Badge>
                                            <Badge className={`px-3 py-1 text-sm font-bold shadow-lg ${
                                                order.priority === 'high' ? 'bg-red-500 text-white' :
                                                order.priority === 'normal' ? 'bg-yellow-500 text-white' :
                                                'bg-green-500 text-white'
                                            }`}>
                                                {order.priority}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm font-medium text-gray-700">
                                            <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full shadow-sm">
                                                <ChefHat className="h-4 w-4 text-orange-600" />
                                                <span className="text-gray-900 font-semibold">Table {order.table_number}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full shadow-sm">
                                                <Clock className="h-4 w-4 text-blue-600" />
                                                <span className="text-gray-900 font-semibold">{order.time_elapsed} min</span>
                                            </div>
                                            <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full shadow-sm">
                                                <Users className="h-4 w-4 text-purple-600" />
                                                <span className="text-gray-900 font-semibold">{order.total_items} items</span>
                                            </div>
                                        </div>
                                    </div>
                                    {order.priority === 'high' && (
                                        <div className="animate-pulse">
                                            <Flame className="h-6 w-6 text-red-500" />
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Special Instructions */}
                                {order.special_instructions && (
                                    <div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border border-yellow-200">
                                        <div className="flex items-start space-x-2">
                                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-yellow-800">Special Instructions:</p>
                                                <p className="text-yellow-700">{order.special_instructions}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Items List */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-900 flex items-center">
                                        <ChefHat className="h-4 w-4 mr-2" />
                                        Order Items
                                    </h4>
                                    <div className="space-y-2">
                                        {order.items && order.items.length > 0 ? order.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between text-gray-900 p-3  rounded-lg border border-gray-200 hover:border-gray-300 ">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <p className="font-medium text-gray-900">{item.menu_item_name}</p>
                                                        <Badge className="bg-gray-800 text-white text-xs font-bold shadow-md">
                                                            x{item.quantity}
                                                        </Badge>
                                                        <Badge className={`${
                                                            item.status === 'ready' ? 'bg-green-500 text-white font-bold' :
                                                            item.status === 'preparing' ? 'bg-blue-500 text-white font-bold' :
                                                            'bg-yellow-500 text-white font-bold'
                                                        } text-xs shadow-md`}>
                                                            {item.status}
                                                        </Badge>
                                                    </div>
                                                    {item.special_instructions && (
                                                        <p className="text-sm text-gray-700 mt-1 italic bg-yellow-50 px-2 py-1 rounded border border-yellow-200">{item.special_instructions}</p>
                                                    )}
                                                </div>
                                                <Select
                                                    value={item.status}
                                                    onValueChange={(value) => updateItemStatus(order.id, item.id, value)}
                                                >
                                                    <SelectTrigger className="w-40 border-2 border-gray-800 bg-white hover:border-gray-900 hover:bg-gray-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all shadow-md">
                                                        <SelectValue placeholder="Select status" className="text-black font-semibold capitalize" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-2 border-gray-800 shadow-lg">
                                                        <SelectItem value="pending" className="text-black font-semibold hover:bg-yellow-50 hover:text-black focus:bg-yellow-50 focus:text-black cursor-pointer capitalize">
                                                            Pending
                                                        </SelectItem>
                                                        <SelectItem value="preparing" className="text-black font-semibold hover:bg-blue-50 hover:text-black focus:bg-blue-50 focus:text-black cursor-pointer capitalize">
                                                            Preparing
                                                        </SelectItem>
                                                        <SelectItem value="ready" className="text-black font-semibold hover:bg-green-50 hover:text-black focus:bg-green-50 focus:text-black cursor-pointer capitalize">
                                                            Ready
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )) : (
                                            <div className="text-center py-4 text-gray-500">
                                                <p>No items available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <Select onValueChange={(value) => assignOrder(order.id, value)}>
                                            <SelectTrigger className="w-52 border-2 border-gray-800 text-black hover:border-gray-900 hover:bg-gray-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all shadow-md">
                                                <SelectValue placeholder="Assign to staff..." className="text-black font-semibold" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-2 border-gray-800 shadow-lg">
                                                {kitchenStaff && kitchenStaff.length > 0 ? kitchenStaff.map((staff) => (
                                                    <SelectItem key={staff.id} value={staff.id.toString()} className="text-black font-semibold hover:bg-blue-50 hover:text-black focus:bg-blue-50 focus:text-black cursor-pointer">
                                                        {staff.name}
                                                    </SelectItem>
                                                )) : (
                                                    <SelectItem value="" disabled className="text-gray-500 font-semibold">
                                                        No staff available
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex space-x-2">
                                        {order.status === 'pending' && (
                                            <Button
                                                size="lg"
                                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                                                className="bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white border-2 border-blue-900 shadow-2xl transform hover:scale-110 transition-all duration-300 font-black px-8 py-4 text-lg"
                                            >
                                                <Flame className="h-6 w-6 mr-3" />
                                                Start Preparing
                                            </Button>
                                        )}
                                        {order.status === 'preparing' && (
                                            <Button
                                                size="lg"
                                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                                className="bg-gradient-to-r from-green-700 to-emerald-800 hover:from-green-800 hover:to-emerald-900 text-white border-2 border-green-900 shadow-2xl transform hover:scale-110 transition-all duration-300 font-black px-8 py-4 text-lg"
                                            >
                                                <CheckCircle className="h-6 w-6 mr-3" />
                                                Mark Ready
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="col-span-2 text-center py-8">
                            <p className="text-gray-500">No orders available</p>
                        </div>
                    )}
                </div>

                {(!orders || orders.length === 0) && (
                    <Card className="border-0 bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl">
                        <CardContent className="text-center py-16">
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                    <div className="relative bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-full shadow-2xl">
                                        <ChefHat className="h-16 w-16 text-white" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">All Orders Completed!</h3>
                            <p className="text-gray-600 text-lg mb-6">Great job! All orders have been prepared and are ready for serving.</p>
                            <div className="flex justify-center space-x-4">
                                <div className="flex items-center space-x-2 text-green-600">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="font-medium">Kitchen Clear</span>
                                </div>
                                <div className="flex items-center space-x-2 text-blue-600">
                                    <Clock className="h-5 w-5" />
                                    <span className="font-medium">Ready for New Orders</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
