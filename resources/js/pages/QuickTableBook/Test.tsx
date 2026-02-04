import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Coffee, 
    Users, 
    MapPin, 
    Clock, 
    Plus, 
    Minus, 
    Trash2, 
    Send, 
    CheckCircle, 
    DollarSign,
    Search,
    Eye,
    Edit,
    Settings,
    TrendingUp,
    ChefHat,
    Utensils,
    Award,
    Activity,
    User,
    Phone,
    Mail,
    Calendar,
    BookOpen,
    X,
    ShoppingCart,
    CreditCard
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Table {
    id: number;
    table_number: string;
    name: string | null;
    capacity: number;
    min_capacity: number;
    location: string | null;
    status: 'available' | 'reserved' | 'occupied' | 'maintenance';
    is_active: boolean;
}

interface MenuItem {
    id: number;
    name: string;
    category: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_available: boolean;
    preparation_time: number | null;
}

interface Order {
    id: number;
    order_number: string;
    table_id: number;
    status: string;
    total_amount: number;
    order_time: string;
    orderItems: OrderItem[];
}

interface OrderItem {
    id: number;
    menu_item_id: number;
    quantity: number;
    unit_price: string;
    total_price: string;
    special_instructions: string;
    status: string;
    menu_item_name: string;
}

interface TaxSetting {
    id: number;
    name: string;
    tax_rate: number;
    is_active: boolean;
}

interface QuickTableBookProps {
    tables: Table[];
    menuItems: Record<string, MenuItem[]>;
    taxSetting: TaxSetting | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Quick Table Book', href: '/quick-table-book' },
];

export default function QuickTableBookTest({ tables, menuItems, taxSetting }: QuickTableBookProps) {
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const [quantity, setQuantity] = useState<{ [key: number]: number }>({});
    const [specialInstructions, setSpecialInstructions] = useState<string>('');
    const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
    const [bookingForm, setBookingForm] = useState({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        number_of_guests: 1,
        special_requests: '',
        estimated_duration: 120,
    });

    const categories = ['all', ...Object.keys(menuItems)];
    const filteredMenuItems = selectedCategory === 'all' 
        ? Object.values(menuItems).flat() 
        : menuItems[selectedCategory] || [];
    
    const searchedMenuItems = filteredMenuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const availableTables = tables.filter(table => table.status === 'available');
    const occupiedTables = tables.filter(table => table.status === 'occupied');
    const availableTablesCount = availableTables.length;

    useEffect(() => {
        if (selectedTable) {
            loadTableDetails(selectedTable.id);
        }
    }, [selectedTable]);

    const loadTableDetails = async (tableId: number) => {
        try {
            setLoading(true);
            const response = await fetch(`/quick-table-book/tables/${tableId}`);
            const data = await response.json();
            
            if (data.currentOrder) {
                setCurrentOrder(data.currentOrder);
            } else {
                setCurrentOrder(null);
            }
        } catch (error) {
            console.error('Failed to load table details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookTable = async () => {
        if (!selectedTable) return;

        try {
            setLoading(true);
            const response = await fetch(`/quick-table-book/tables/${selectedTable.id}/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(bookingForm),
            });

            const data = await response.json();
            
            if (data.success) {
                setSelectedTable(data.table);
                setCurrentOrder(data.order);
                setShowBookingModal(false);
                setBookingForm({
                    customer_name: '',
                    customer_phone: '',
                    customer_email: '',
                    number_of_guests: 1,
                    special_requests: '',
                    estimated_duration: 120,
                });
                alert('Table booked successfully!');
            } else {
                alert('Failed to book table: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to book table:', error);
            alert('Failed to book table');
        } finally {
            setLoading(false);
        }
    };

    const handleReleaseTable = async (table: Table) => {
        if (!confirm(`Are you sure you want to release Table ${table.table_number}?`)) return;

        try {
            setLoading(true);
            const response = await fetch(`/quick-table-book/tables/${table.id}/release`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            
            if (data.success) {
                setSelectedTable(null);
                setCurrentOrder(null);
                alert('Table released successfully!');
                router.reload();
            } else {
                alert('Failed to release table: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to release table:', error);
            alert('Failed to release table');
        } finally {
            setLoading(false);
        }
    };

    const handleAddItemToTable = async (menuItem: MenuItem) => {
        if (!selectedTable) return;

        try {
            setLoading(true);
            const response = await fetch(`/quick-table-book/tables/${selectedTable.id}/add-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    menu_item_id: menuItem.id,
                    quantity: quantity[menuItem.id] || 1,
                    special_instructions: '',
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                setCurrentOrder(data.order);
                setQuantity({ ...quantity, [menuItem.id]: 0 });
                alert('Item added successfully!');
            } else {
                alert('Failed to add item: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to add item:', error);
            alert('Failed to add item');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (orderItem: OrderItem, newQuantity: number) => {
        if (!selectedTable || newQuantity < 1) return;

        try {
            setLoading(true);
            const response = await fetch(`/quick-table-book/order-items/${orderItem.id}/quantity`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ quantity: newQuantity }),
            });

            const data = await response.json();
            
            if (data.success) {
                setCurrentOrder(data.order);
            } else {
                alert('Failed to update quantity: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
            alert('Failed to update quantity');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async (orderItem: OrderItem) => {
        if (!confirm('Are you sure you want to remove this item?')) return;

        try {
            setLoading(true);
            const response = await fetch(`/quick-table-book/order-items/${orderItem.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            
            if (data.success) {
                setCurrentOrder(data.order);
                alert('Item removed successfully!');
            } else {
                alert('Failed to remove item: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
            alert('Failed to remove item');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitOrder = async () => {
        if (!currentOrder) return;

        try {
            setLoading(true);
            const response = await fetch(`/quick-table-book/orders/${currentOrder.id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            
            if (data.success) {
                setCurrentOrder(data.order);
                alert('Order submitted to kitchen successfully!');
            } else {
                alert('Failed to submit order: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to submit order:', error);
            alert('Failed to submit order');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteOrder = async () => {
        if (!currentOrder) return;

        try {
            setLoading(true);
            const response = await fetch(`/quick-table-book/orders/${currentOrder.id}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            
            if (data.success) {
                setCurrentOrder(null);
                setSelectedTable(null);
                alert('Order completed successfully!');
                router.reload();
            } else {
                alert('Failed to complete order: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to complete order:', error);
            alert('Failed to complete order');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'reserved':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'occupied':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'maintenance':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available':
                return <CheckCircle className="h-4 w-4" />;
            case 'reserved':
                return <Clock className="h-4 w-4" />;
            case 'occupied':
                return <Users className="h-4 w-4" />;
            case 'maintenance':
                return <Settings className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Quick Table Book Test" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Table Book (Test)</h1>
                    <p className="text-gray-600">Simple test version to debug functionality</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Total Tables</p>
                                    <p className="text-2xl font-bold">{tables.length}</p>
                                </div>
                                <Coffee className="h-8 w-8 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Available</p>
                                    <p className="text-2xl font-bold">{availableTablesCount}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Occupied</p>
                                    <p className="text-2xl font-bold">{occupiedTables.length}</p>
                                </div>
                                <Users className="h-8 w-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Active Orders</p>
                                    <p className="text-2xl font-bold">{currentOrder ? 1 : 0}</p>
                                </div>
                                <ShoppingCart className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tables Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Tables</h2>
                        <div className="space-y-4">
                            {tables.map((table) => (
                                <Card key={table.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">
                                                Table {table.table_number}
                                                {table.name && <span className="text-gray-500 ml-2">- {table.name}</span>}
                                            </CardTitle>
                                            <Badge className={getStatusColor(table.status)}>
                                                <div className="flex items-center space-x-1">
                                                    {getStatusIcon(table.status)}
                                                    <span>{table.status}</span>
                                                </div>
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <Users className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-700">
                                                        {table.min_capacity}-{table.capacity} guests
                                                    </span>
                                                </div>
                                                {table.location && (
                                                    <div className="flex items-center space-x-2">
                                                        <MapPin className="h-4 w-4 text-gray-500" />
                                                        <span className="text-gray-700">{table.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedTable(table);
                                                        setShowBookingModal(true);
                                                    }}
                                                >
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    Reserve
                                                </Button>
                                                {table.status === 'available' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedTable(table);
                                                            setShowMenu(true);
                                                        }}
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Start Order
                                                    </Button>
                                                )}
                                                {(table.status === 'reserved' || table.status === 'occupied') && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleReleaseTable(table)}
                                                    >
                                                        Release
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Order Section */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            Current Order {selectedTable && `- Table ${selectedTable.table_number}`}
                        </h2>
                        {currentOrder ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Order #{currentOrder.order_number}</span>
                                        <Badge>{currentOrder.status}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {currentOrder.orderItems.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.menu_item_name}</p>
                                                    <p className="text-sm text-gray-500">Rs {parseFloat(item.unit_price).toFixed(2)} x {item.quantity}</p>
                                                    {item.special_instructions && (
                                                        <p className="text-sm text-gray-600 italic">{item.special_instructions}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-8 text-center">{item.quantity}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleRemoveItem(item)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <div className="border-t pt-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="font-semibold">Total:</span>
                                                <span className="font-bold text-lg">Rs {parseFloat(currentOrder.total_amount).toFixed(2)}</span>
                                            </div>
                                            
                                            <div className="flex space-x-2">
                                                {currentOrder.status === 'pending' && (
                                                    <Button onClick={handleSubmitOrder} className="flex-1">
                                                        <Send className="h-4 w-4 mr-2" />
                                                        Submit to Kitchen
                                                    </Button>
                                                )}
                                                <Button 
                                                    variant="destructive" 
                                                    onClick={handleCompleteOrder}
                                                    className="flex-1"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Complete Order
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No active order</p>
                                    <p className="text-sm text-gray-400 mt-2">Select a table and start an order</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Booking Modal */}
                {showBookingModal && selectedTable && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">
                                Book Table {selectedTable.table_number}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <Label>Customer Name</Label>
                                    <Input
                                        value={bookingForm.customer_name}
                                        onChange={(e) => setBookingForm({...bookingForm, customer_name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label>Phone Number</Label>
                                    <Input
                                        value={bookingForm.customer_phone}
                                        onChange={(e) => setBookingForm({...bookingForm, customer_phone: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={bookingForm.customer_email}
                                        onChange={(e) => setBookingForm({...bookingForm, customer_email: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label>Number of Guests</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max={selectedTable.capacity}
                                        value={bookingForm.number_of_guests}
                                        onChange={(e) => setBookingForm({...bookingForm, number_of_guests: parseInt(e.target.value) || 1})}
                                    />
                                </div>
                                <div>
                                    <Label>Special Requests</Label>
                                    <Textarea
                                        value={bookingForm.special_requests}
                                        onChange={(e) => setBookingForm({...bookingForm, special_requests: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-2 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowBookingModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleBookTable}
                                    disabled={loading}
                                    className="flex-1"
                                >
                                    Book Table
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Menu Modal */}
                {showMenu && selectedTable && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">
                                    Add Items - Table {selectedTable.table_number}
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <div className="mb-4">
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category === 'all' ? 'All Items' : category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="mb-4">
                                <Input
                                    placeholder="Search menu items..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {searchedMenuItems.map((item) => (
                                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold">{item.name}</h4>
                                                    <p className="text-sm text-gray-600">{item.description}</p>
                                                    <p className="font-bold text-green-600">Rs {item.price.toFixed(2)}</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setQuantity({...quantity, [item.id]: Math.max(1, (quantity[item.id] || 0) - 1)})}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-8 text-center">{quantity[item.id] || 0}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setQuantity({...quantity, [item.id]: (quantity[item.id] || 0) + 1})}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => handleAddItemToTable(item)}
                                                disabled={!quantity[item.id]}
                                                className="w-full"
                                            >
                                                Add to Order
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
