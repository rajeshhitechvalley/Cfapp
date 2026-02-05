import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, ArrowLeft, Clock, DollarSign } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { useTax } from '@/hooks/useTax';
import { useCurrency } from '@/components/currency-switcher';

// Helper function for route generation
const route = (name: string, params?: any) => {
    const baseUrl = window.location.origin;
    const routes: Record<string, string> = {
        'orders.index': '/orders',
        'orders.create': '/orders/create',
        'orders.store': '/orders',
    };
    
    let url = routes[name] || `/${name}`;
    
    if (params && name !== 'orders.index' && name !== 'orders.create') {
        url += `/${params}`;
    }
    
    return url;
};

interface MenuItem {
    id: number;
    name: string;
    category: string;
    description: string;
    price: string;
    preparation_time: number;
    is_available: boolean;
}

interface Table {
    id: number;
    table_number: string;
    name: string | null;
    capacity: number;
    status: string;
    has_active_order: boolean;
    active_order: {
        id: number;
        order_number: string;
        status: string;
    } | null;
}

interface Props {
    tables: Table[];
    menuItemsByCategory: Record<string, MenuItem[]>;
}

interface OrderItem {
    menu_item_id: number;
    quantity: number;
    special_instructions: string | null;
}

const categoryColors = {
    tea: 'bg-green-100 text-green-800',
    snack: 'bg-yellow-100 text-yellow-800',
    cake: 'bg-pink-100 text-pink-800',
    pizza: 'bg-red-100 text-red-800',
};

const categoryIcons = {
    tea: '🍵',
    snack: '🍟',
    cake: '🍰',
    pizza: '🍕',
};

export default function OrdersCreate({ tables, menuItemsByCategory }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        table_id: '',
        priority: 'normal',
        specialInstructions: '',
        special_instructions: '', // Add snake_case version for backend compatibility
        items: [] as OrderItem[],
    });

    const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
    const { getTaxLabel, calculateTax, calculateTotal: calculateTotalWithTax, getTaxRatePercentage } = useTax();
    const { formatCurrency } = useCurrency();

    // Filter available tables
    const availableTables = tables.filter(table => 
        table.status === 'available' && !table.has_active_order
    );

    const unavailableTables = tables.filter(table => 
        table.status !== 'available' || table.has_active_order
    );

    const handleAddItem = (menuItem: MenuItem) => {
        const existingItem = selectedItems.find(item => item.menu_item_id === menuItem.id);
        
        if (existingItem) {
            setSelectedItems(prev => 
                prev.map(item => 
                    item.menu_item_id === menuItem.id 
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            setSelectedItems(prev => [...prev, {
                menu_item_id: menuItem.id,
                quantity: 1,
                special_instructions: '',
            }]);
        }
    };

    const handleRemoveItem = (menuItemId: number) => {
        setSelectedItems(prev => prev.filter(item => item.menu_item_id !== menuItemId));
    };

    const handleUpdateQuantity = (menuItemId: number, quantity: number) => {
        if (quantity <= 0) {
            handleRemoveItem(menuItemId);
        } else {
            setSelectedItems(prev => 
                prev.map(item => 
                    item.menu_item_id === menuItemId 
                        ? { ...item, quantity }
                        : item
                )
            );
        }
    };

    const handleUpdateSpecialInstructions = (menuItemId: number, special_instructions: string) => {
        setSelectedItems(prev => 
            prev.map(item => 
                item.menu_item_id === menuItemId 
                    ? { ...item, special_instructions: special_instructions }
                    : item
            )
        );
    };

    const calculateTotal = () => {
        return selectedItems.reduce((total, item) => {
            const menuItem = Object.values(menuItemsByCategory)
                .flat()
                .find(mi => mi.id === item.menu_item_id);
            return total + (parseFloat(menuItem?.price || '0') * item.quantity);
        }, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (processing) {
            return; // Prevent double submission
        }
        
        if (selectedItems.length === 0) {
            alert('Please add at least one item to the order');
            return;
        }

        // Validate table selection
        if (!data.table_id) {
            alert('Please select a table for the order');
            return;
        }

        // Check if there are any available tables
        if (availableTables.length === 0) {
            alert('No tables are currently available. Please wait for existing orders to be completed.');
            return;
        }

        // Convert selectedItems to the format expected by the backend
        const itemsData = selectedItems.map(item => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            special_instructions: item.special_instructions || null,
        }));

        // Prepare all form data
        const formData = {
            table_id: data.table_id,
            priority: data.priority,
            special_instructions: data.specialInstructions,
            items: itemsData
        };

        // Submit directly with data using router instead of form helper
        router.post(route('orders.store'), formData, {
            onSuccess: () => {
                reset();
                setSelectedItems([]);
            },
            onError: (errors: any) => {
                console.error('Order creation failed:', errors);
                alert('Failed to create order. Please try again.');
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/orders' },
        { title: 'Create Order', href: '/orders/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Order" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
                <div className="max-w-7xl mx-auto">
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
                                        Create Order
                                    </h1>
                                    <p className="text-gray-600 mt-2 text-lg">Add new restaurant order</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Order Details */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Order Information */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200/50">
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                            <div className="p-2 bg-blue-500 rounded-lg mr-3">
                                                <Clock className="h-5 w-5 text-white" />
                                            </div>
                                            Order Details
                                        </h2>
                                    </div>
                                    <div className="p-6 bg-gradient-to-b from-white to-gray-50/30 space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
                                                Table *
                                            </label>
                                            <Select value={data.table_id} onValueChange={(value) => setData('table_id', value)}>
                                                <SelectTrigger className="bg-white border-2 border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 h-12 font-medium">
                                                    <SelectValue placeholder="Select table" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableTables.map((table) => (
                                                        <SelectItem key={table.id} value={table.id.toString()}>
                                                            {table.table_number} {table.name && `- ${table.name}`} ({table.capacity} seats)
                                                        </SelectItem>
                                                    ))}
                                                    {availableTables.length === 0 && (
                                                        <div className="px-2 py-2 text-sm text-gray-500">
                                                            No available tables
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors.table_id && (
                                                <p className="text-sm text-red-600 mt-1">{errors.table_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-orange-500 rounded-full mr-2"></span>
                                                Priority
                                            </label>
                                            <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                                <SelectTrigger className="bg-white border-2 border-gray-200 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl px-4 py-3 h-12 font-medium">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="normal">Normal</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                                                <span className="w-1 h-4 bg-purple-500 rounded-full mr-2"></span>
                                                Special Instructions
                                            </label>
                                            <Textarea
                                                value={data.specialInstructions}
                                                onChange={(e) => setData('specialInstructions', e.target.value)}
                                                placeholder="Any special instructions for the order..."
                                                className="bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none rounded-xl px-4 py-3 font-medium"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Unavailable Tables Warning */}
                                {unavailableTables.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                                        <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-5 border-b border-gray-200/50">
                                            <h2 className="text-xl font-bold text-orange-600 flex items-center">
                                                <span className="mr-3 text-2xl">⚠️</span>
                                                Tables Currently Unavailable
                                            </h2>
                                        </div>
                                        <div className="p-6 bg-gradient-to-b from-white to-orange-50/30">
                                            <div className="space-y-4">
                                                {unavailableTables.map((table) => (
                                                    <div key={table.id} className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                                    <div>
                                                                        <div className="font-bold text-gray-900">
                                                                            Table {table.table_number}
                                                                            {table.name && <span className="text-gray-600"> - {table.name}</span>}
                                                                        </div>
                                                                        <div className="text-sm text-gray-600">
                                                                            Capacity: {table.capacity} seats
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                {table.has_active_order ? (
                                                                    <div className="text-right">
                                                                        <Badge className="bg-gradient-to-r from-red-400 to-red-500 text-white border-0 mb-2">
                                                                            🍽️ Active Order
                                                                        </Badge>
                                                                        <div className="text-xs text-gray-600 space-y-1">
                                                                            <div><strong>Order:</strong> #{table.active_order?.order_number}</div>
                                                                            <div><strong>Status:</strong> {table.active_order?.status}</div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0">
                                                                        📅 {table.status}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                                <div className="flex items-start space-x-3">
                                                    <span className="text-blue-600 text-xl">ℹ️</span>
                                                    <div>
                                                        <h4 className="font-bold text-blue-900 mb-2">
                                                            Why are these tables unavailable?
                                                        </h4>
                                                        <ul className="text-sm text-blue-800 space-y-1">
                                                            <li>• Tables with <strong>active orders</strong> are currently being served</li>
                                                            <li>• <strong>Reserved</strong> tables are booked for future use</li>
                                                            <li>• <strong>Occupied</strong> tables are not available for new orders</li>
                                                        </ul>
                                                        <p className="text-sm text-blue-800 mt-2">
                                                            <strong>Solution:</strong> Wait for the current order to be completed or the reservation to be cleared, then the table will become available for new orders.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Order Summary */}
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
                                                <span className="font-medium">{formatCurrency(calculateTotal())}</span>
                                            </div>
                                            <div className="flex justify-between text-white/90">
                                                <span>{getTaxLabel()}:</span>
                                                <span className="font-medium">{formatCurrency(calculateTax(calculateTotal()))}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-xl text-white border-t border-white/20 pt-3">
                                                <span>Total:</span>
                                                <span>{formatCurrency(calculateTotalWithTax(calculateTotal()))}</span>
                                            </div>
                                        </div>
                                        <Button 
                                            type="submit" 
                                            className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
                                            disabled={processing || selectedItems.length === 0 || availableTables.length === 0}
                                            onClick={(e) => {
                                                // Ensure single click works by preventing double submission
                                                if (processing || selectedItems.length === 0 || availableTables.length === 0) {
                                                    e.preventDefault();
                                                    return;
                                                }
                                            }}
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Create Order
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                        </div>

                            {/* Menu Items */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-5 border-b border-gray-200/50">
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                            <div className="p-2 bg-emerald-500 rounded-lg mr-3">
                                                <DollarSign className="h-5 w-5 text-white" />
                                            </div>
                                            Menu Items
                                        </h2>
                                    </div>
                                    <div className="p-6 bg-gradient-to-b from-white to-emerald-50/20">
                                        {Object.entries(menuItemsByCategory).map(([category, items]) => (
                                            <div key={category} className="mb-8">
                                                <div className="flex items-center mb-4">
                                                    <div className="text-3xl mr-3 bg-white p-2 rounded-xl shadow-sm">
                                                        {categoryIcons[category as keyof typeof categoryIcons]}
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-gray-900 capitalize">{category}</h3>
                                                    <Badge className={`ml-3 px-4 py-2 font-bold text-sm rounded-full shadow-md ${
                                                        category === 'tea' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white border-0' :
                                                        category === 'snack' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0' :
                                                        category === 'cake' ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white border-0' :
                                                        'bg-gradient-to-r from-red-400 to-red-500 text-white border-0'
                                                    }`}>
                                                        {items.length} items
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {items.map((item) => (
                                                        <div key={item.id} className="bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                                                            <div className="p-4">
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div>
                                                                        <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                                                                        <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="font-bold text-xl text-emerald-600">{formatCurrency(parseFloat(item.price))}</div>
                                                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                                                            <Clock className="h-3 w-3 mr-1" />
                                                                            {item.preparation_time} min
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={() => handleAddItem(item)}
                                                                    className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                                                >
                                                                    <Plus className="h-4 w-4 mr-2" />
                                                                    Add to Order
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Selected Items */}
                        {selectedItems.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-5 border-b border-gray-200/50">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                        <div className="p-2 bg-purple-500 rounded-lg mr-3">
                                            <DollarSign className="h-5 w-5 text-white" />
                                        </div>
                                        Selected Items ({selectedItems.length})
                                    </h2>
                                </div>
                                <div className="p-6 bg-gradient-to-b from-white to-purple-50/30">
                                    <div className="space-y-4">
                                        {selectedItems.map((item) => {
                                            const menuItem = Object.values(menuItemsByCategory)
                                                .flat()
                                                .find(mi => mi.id === item.menu_item_id);
                                            
                                            return (
                                                <div key={item.menu_item_id} className="flex items-center space-x-4 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 text-lg">{menuItem?.name}</h4>
                                                        <p className="text-gray-600 text-sm mt-1">{formatCurrency(parseFloat(menuItem?.price || '0'))} each</p>
                                                        <Input
                                                            placeholder="Special instructions for this item..."
                                                            value={item.special_instructions || ''}
                                                            onChange={(e) => handleUpdateSpecialInstructions(item.menu_item_id, e.target.value)}
                                                            className="mt-3 bg-white border-2 border-purple-200 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-3 font-medium"
                                                        />
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleUpdateQuantity(item.menu_item_id, item.quantity - 1)}
                                                            className="bg-white border-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl p-3 hover:shadow-md transition-all duration-300"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <span className="w-12 text-center font-bold text-gray-900 text-lg">{item.quantity}</span>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleUpdateQuantity(item.menu_item_id, item.quantity + 1)}
                                                            className="bg-white border-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl p-3 hover:shadow-md transition-all duration-300"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="text-right font-bold text-xl text-emerald-600">
                                                        {formatCurrency(parseFloat(menuItem?.price || '0') * item.quantity)}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRemoveItem(item.menu_item_id)}
                                                        className="bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 border-2 border-red-200 rounded-xl p-3 hover:shadow-md transition-all duration-300"
                                                    >
                                                        ×
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
