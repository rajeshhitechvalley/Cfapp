import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, ArrowLeft, Clock, DollarSign } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { useTax } from '@/hooks/useTax';

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
    const { getTaxLabel, calculateTax, calculateTotal: calculateTotalWithTax, formatCurrency, getTaxRatePercentage } = useTax();

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

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('orders.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Orders
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Create Order</h1>
                            <p className="text-muted-foreground">Add new restaurant order</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Order Details */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Table *</label>
                                        <Select value={data.table_id} onValueChange={(value) => setData('table_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select table" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableTables.map((table) => (
                                                    <SelectItem key={table.id} value={table.id.toString()}>
                                                        {table.table_number} {table.name && `- ${table.name}`} ({table.capacity} seats)
                                                    </SelectItem>
                                                ))}
                                                {availableTables.length === 0 && (
                                                    <div className="px-2 py-2 text-sm text-muted-foreground">
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
                                        <label className="block text-sm font-medium mb-2">Priority</label>
                                        <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                            <SelectTrigger>
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
                                        <label className="block text-sm font-medium mb-2">Special Instructions</label>
                                        <Textarea
                                            value={data.specialInstructions}
                                            onChange={(e) => setData('specialInstructions', e.target.value)}
                                            placeholder="Any special instructions for the order..."
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Unavailable Tables Warning */}
                            {unavailableTables.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-orange-600 flex items-center">
                                            <span className="mr-2">⚠️</span>
                                            Tables Currently Unavailable
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {unavailableTables.map((table) => (
                                                <div key={table.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                                <div>
                                                                    <div className="font-semibold text-gray-800">
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
                                                                    <Badge className="bg-red-100 text-red-800 mb-2">
                                                                        🍽️ Active Order
                                                                    </Badge>
                                                                    <div className="text-xs text-gray-600 space-y-1">
                                                                        <div><strong>Order:</strong> #{table.active_order?.order_number}</div>
                                                                        <div><strong>Status:</strong> {table.active_order?.status}</div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <Badge className="bg-yellow-100 text-yellow-800">
                                                                    📅 {table.status}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-start space-x-3">
                                                <span className="text-blue-600 text-lg">ℹ️</span>
                                                <div>
                                                    <h4 className="font-semibold text-blue-800 mb-2">
                                                        Why are these tables unavailable?
                                                    </h4>
                                                    <ul className="text-sm text-blue-700 space-y-1">
                                                        <li>• Tables with <strong>active orders</strong> are currently being served</li>
                                                        <li>• <strong>Reserved</strong> tables are booked for future use</li>
                                                        <li>• <strong>Occupied</strong> tables are not available for new orders</li>
                                                    </ul>
                                                    <p className="text-sm text-blue-700 mt-2">
                                                        <strong>Solution:</strong> Wait for the current order to be completed or the reservation to be cleared, then the table will become available for new orders.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Order Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <DollarSign className="h-5 w-5 mr-2" />
                                        Order Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>{formatCurrency(calculateTotal())}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{getTaxLabel()}:</span>
                                            <span>{formatCurrency(calculateTax(calculateTotal()))}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total:</span>
                                            <span>{formatCurrency(calculateTotalWithTax(calculateTotal()))}</span>
                                        </div>
                                    </div>
                                    <Button 
                                        type="submit" 
                                        className="w-full mt-4" 
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
                                </CardContent>
                            </Card>
                        </div>

                        {/* Menu Items */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Menu Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {Object.entries(menuItemsByCategory).map(([category, items]) => (
                                        <div key={category} className="mb-6">
                                            <div className="flex items-center mb-3">
                                                <span className="text-2xl mr-2">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                                                <h3 className="text-lg font-semibold capitalize">{category}</h3>
                                                <Badge className={`ml-2 ${categoryColors[category as keyof typeof categoryColors]}`}>
                                                    {items.length} items
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {items.map((item) => (
                                                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                                                        <CardContent className="p-4">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h4 className="font-medium">{item.name}</h4>
                                                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-bold">${parseFloat(item.price).toFixed(2)}</div>
                                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                                        <Clock className="h-3 w-3 mr-1" />
                                                                        {item.preparation_time} min
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                onClick={() => handleAddItem(item)}
                                                                className="w-full"
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Add to Order
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Selected Items */}
                    {selectedItems.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Selected Items ({selectedItems.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {selectedItems.map((item) => {
                                        const menuItem = Object.values(menuItemsByCategory)
                                            .flat()
                                            .find(mi => mi.id === item.menu_item_id);
                                        
                                        return (
                                            <div key={item.menu_item_id} className="flex items-center space-x-4 p-4 border rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{menuItem?.name}</h4>
                                                    <p className="text-sm text-muted-foreground">${parseFloat(menuItem?.price || '0').toFixed(2)} each</p>
                                                    <Input
                                                        placeholder="Special instructions for this item..."
                                                        value={item.special_instructions || ''}
                                                        onChange={(e) => handleUpdateSpecialInstructions(item.menu_item_id, e.target.value)}
                                                        className="mt-2"
                                                    />
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleUpdateQuantity(item.menu_item_id, item.quantity - 1)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleUpdateQuantity(item.menu_item_id, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="text-right font-medium">
                                                    ${(parseFloat(menuItem?.price || '0') * item.quantity).toFixed(2)}
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRemoveItem(item.menu_item_id)}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}
