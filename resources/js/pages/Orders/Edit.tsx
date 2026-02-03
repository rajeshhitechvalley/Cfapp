import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Save, Clock, DollarSign, Users, Minus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import Textarea from '@/components/ui/textarea';
import type { BreadcrumbItem } from '@/types';

interface OrderItem {
    id: number;
    menu_item_id: number;
    quantity: number;
    unit_price: string;
    total_price: string;
    special_instructions: string;
    status: string;
    menu_item?: {
        id: number;
        name: string;
        category: string;
        price: string;
    };
}

interface Order {
    id: number;
    table_id: number;
    order_number: string;
    status: string;
    priority: string;
    special_instructions: string;
    subtotal: string;
    tax_amount: string;
    total_amount: string;
    discount_amount: string;
    order_time: string;
    ready_time: string;
    served_time: string;
    created_at: string;
    updated_at: string;
    table?: {
        id: number;
        table_number: string;
        name: string;
        location: string;
        capacity: number;
    };
    order_items: OrderItem[];
}

interface Table {
    id: number;
    table_number: string;
    name: string;
    location: string;
    capacity: number;
}

interface MenuItem {
    id: number;
    name: string;
    category: string;
    price: string;
    is_available: boolean;
}

interface Props {
    order: Order;
    tables: Table[];
    menuItemsByCategory: Record<string, MenuItem[]>;
}

interface OrderItemForm {
    id?: number;
    menu_item_id: number;
    quantity: number;
    special_instructions: string;
}

const route = (name: string, params?: any) => {
    const baseUrl = window.location.origin;
    if (name === 'orders.update') {
        return `${baseUrl}/orders/${params.id}`;
    }
    if (name === 'orders.show') {
        return `${baseUrl}/orders/${params.id}`;
    }
    return '#';
};

const formatCurrency = (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(num);
};

const Edit: React.FC<Props> = ({ order, tables, menuItemsByCategory }) => {
    const [formData, setFormData] = useState({
        table_id: order?.table_id?.toString() || '',
        status: order?.status || 'pending',
        priority: order?.priority || 'normal',
        special_instructions: order?.special_instructions || '',
    });

    const [items, setItems] = useState<OrderItemForm[]>(
        order?.order_items?.map(item => ({
            id: item.id,
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            special_instructions: item.special_instructions || '',
        })) || []
    );

    const addItem = () => {
        const newItem: OrderItemForm = {
            menu_item_id: 0,
            quantity: 1,
            special_instructions: '',
        };
        setItems([...items, newItem]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof OrderItemForm, value: any) => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setItems(updatedItems);
    };

    const calculateTotal = (): number => {
        return items.reduce((total, item) => {
            const menuItem = Object.values(menuItemsByCategory)
                .flat()
                .find(mi => mi.id === item.menu_item_id);
            if (!menuItem) return total;
            return total + (parseFloat(menuItem.price) * item.quantity);
        }, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const data = {
            ...formData,
            table_id: parseInt(formData.table_id),
            items: items.map(item => ({
                id: item.id,
                menu_item_id: item.menu_item_id,
                quantity: item.quantity,
                special_instructions: item.special_instructions,
            })),
        };

        router.put(route('orders.update', { id: order?.id }), data, {
            onSuccess: () => {
                // Success message will be shown via flash message
            },
            onError: (errors) => {
                console.error('Error updating order:', errors);
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/orders' },
        { title: `Order ${order?.order_number}`, href: route('orders.show', { id: order?.id }) },
        { title: 'Edit', href: '' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Order ${order?.order_number || 'Unknown'}`} />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href={route('orders.show', { id: order?.id })}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300 text-gray-700 hover:text-gray-900 font-medium shadow-sm hover:shadow-md"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Order
                                </Link>
                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                                        Edit Order {order?.order_number}
                                    </h1>
                                    <p className="text-gray-600 mt-2 text-lg">Modify order details and items</p>
                                </div>
                            </div>
                            <Badge 
                                variant={order?.status === 'pending' ? 'default' : 'secondary'}
                                className={`px-6 py-3 font-bold text-sm rounded-full shadow-md ${
                                    order?.status === 'pending' 
                                        ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white border-0 shadow-emerald-200' 
                                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-gray-200'
                                }`}
                            >
                                {order?.status}
                            </Badge>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                            Table
                                        </label>
                                        <Select
                                            value={formData.table_id}
                                            onValueChange={(value) => setFormData({ ...formData, table_id: value })}
                                        >
                                            <SelectTrigger className="bg-white border-2 border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 h-12 font-medium">
                                                <SelectValue placeholder="Select table" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tables.map((table) => (
                                                    <SelectItem key={table.id} value={table.id.toString()}>
                                                        {table.table_number} - {table.name} ({table.location})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                            <span className="w-1 h-4 bg-green-500 rounded-full mr-2"></span>
                                            Status
                                        </label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                                        >
                                            <SelectTrigger className="bg-white border-2 border-gray-200 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-xl px-4 py-3 h-12 font-medium">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="preparing">Preparing</SelectItem>
                                                <SelectItem value="ready">Ready</SelectItem>
                                                <SelectItem value="served">Served</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                            <span className="w-1 h-4 bg-orange-500 rounded-full mr-2"></span>
                                            Priority
                                        </label>
                                        <Select
                                            value={formData.priority}
                                            onValueChange={(value) => setFormData({ ...formData, priority: value })}
                                        >
                                            <SelectTrigger className="bg-white border-2 border-gray-200 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl px-4 py-3 h-12 font-medium">
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="normal">Normal</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                        <span className="w-1 h-4 bg-purple-500 rounded-full mr-2"></span>
                                        Special Instructions
                                    </label>
                                    <Textarea
                                        value={formData.special_instructions}
                                        onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                                        placeholder="Add any special instructions for this order..."
                                        className="bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none rounded-xl px-4 py-3 font-medium"
                                        rows={3} />
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-5 border-b border-gray-200/50">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                        <div className="p-2 bg-emerald-500 rounded-lg mr-3">
                                            <DollarSign className="h-5 w-5 text-white" />
                                        </div>
                                        Order Items
                                    </h2>
                                    <Button
                                        type="button"
                                        onClick={addItem}
                                        className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                    >
                                        <Plus className="h-5 w-5 mr-2" />
                                        Add Item
                                    </Button>
                                </div>
                            </div>
                            <div className="p-6 bg-gradient-to-b from-white to-emerald-50/20">
                                {items.length === 0 ? (
                                    <div className="text-center py-16 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-dashed border-emerald-200">
                                        <div className="text-8xl mb-6">🍽️</div>
                                        <p className="text-xl font-bold text-gray-800">No items in order</p>
                                        <p className="text-gray-600 mt-3 text-lg">Add items to get started</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {items.map((item, index) => (
                                            <div key={index} className="flex items-center space-x-4 p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300">
                                                <div className="flex-1">
                                                    <Select
                                                        value={item.menu_item_id.toString()}
                                                        onValueChange={(value) => updateItem(index, 'menu_item_id', parseInt(value))}
                                                    >
                                                        <SelectTrigger className="bg-white border-2 border-emerald-200 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 h-12 font-medium">
                                                            <SelectValue placeholder="Select menu item" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.entries(menuItemsByCategory).map(([category, menuItems]) => (
                                                                <div key={category}>
                                                                    <div className="px-4 py-3 text-sm font-bold text-gray-700 bg-emerald-100 border-b border-emerald-200">
                                                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                                                    </div>
                                                                    {menuItems.map((menuItem) => (
                                                                        <SelectItem key={menuItem.id} value={menuItem.id.toString()}>
                                                                            {menuItem.name} - {formatCurrency(menuItem.price)}
                                                                        </SelectItem>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="w-32">
                                                    <div className="flex items-center bg-white border-2 border-emerald-200 rounded-xl overflow-hidden">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                                                            className="px-3 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 font-bold transition-colors duration-200"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </button>
                                                        <div className="px-4 py-3 bg-white text-center font-bold text-gray-900 min-w-[3rem]">
                                                            {item.quantity}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateItem(index, 'quantity', item.quantity + 1)}
                                                            className="px-3 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 font-bold transition-colors duration-200"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={item.special_instructions}
                                                        onChange={(e) => updateItem(index, 'special_instructions', e.target.value)}
                                                        placeholder="Special instructions..."
                                                        className="w-full px-4 py-3 bg-white border-2 border-emerald-200 text-gray-900 placeholder-gray-500 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeItem(index)}
                                                    className="bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 border-2 border-red-200 rounded-xl p-3 hover:shadow-md transition-all duration-300"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Total */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl border-0 overflow-hidden">
                            <div className="bg-white/10 backdrop-blur-sm px-6 py-5 border-b border-white/20">
                                <h2 className="text-xl font-bold text-white flex items-center">
                                    <div className="p-2 bg-white/20 rounded-lg mr-3">
                                        <DollarSign className="h-5 w-5 text-white" />
                                    </div>
                                    Order Total
                                </h2>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-white/10 to-white/5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Total Amount</h3>
                                        <p className="text-white/80 text-sm mt-2">Including all items and taxes</p>
                                    </div>
                                    <div className="text-4xl font-bold text-white">
                                        {formatCurrency(calculateTotal())}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-4">
                            <Link
                                href={route('orders.show', { id: order?.id })}
                                className="px-2 py-2 bg-white border-2 bg-gradient-to-r from-red-600 to-red-600 border-gray-200  rounded-xl hover:bg-gray-50 transition-all duration-300 font-bold shadow-md hover:shadow-lg"
                            >
                                Cancel
                            </Link>
                            <Button
                                type="submit"
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                            >
                                <Save className="h-5 w-5 mr-2" />
                                Update Order
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
};

export default Edit;