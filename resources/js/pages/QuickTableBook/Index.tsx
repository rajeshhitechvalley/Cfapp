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
    Zap, 
    Coffee, 
    Users, 
    MapPin, 
    Clock, 
    Star, 
    Plus, 
    Minus, 
    Trash2, 
    Send, 
    CheckCircle, 
    DollarSign,
    Search,
    Filter,
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
    CreditCard,
    QrCode,
    Gift,
    Percent,
    Tag,
    Receipt,
    Split,
    Wifi,
    WifiOff,
    Bell,
    Grid,
    List,
    MoreVertical,
    Download,
    Upload,
    Target,
    Shield,
    Lock,
    Unlock,
    RefreshCw,
    Save,
    Heart,
    Package,
    AlertCircle
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
    has_active_order: boolean;
    tableType?: {
        id: number;
        name: string;
        price_multiplier: number;
    };
    orders?: Order[];
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
    dietary_info?: string[];
    modifiers?: MenuModifier[];
}

interface MenuModifier {
    id: number;
    name: string;
    price_adjustment: number;
    modifier_type: 'add' | 'remove' | 'replace';
    is_active: boolean;
}

interface MenuCombo {
    id: number;
    name: string;
    description: string | null;
    combo_price: number;
    savings_amount: number;
    image_url: string | null;
    is_active: boolean;
    combo_items?: ComboItem[];
}

interface ComboItem {
    id: number;
    menu_item_id: number;
    quantity: number;
    is_required: boolean;
    menu_item?: MenuItem;
}

interface Promotion {
    id: number;
    name: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed_amount' | 'buy_one_get_one' | 'free_item';
    discount_value: number;
    minimum_order_amount?: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
    usage_limit?: number;
    usage_count: number;
}

interface TableReservation {
    id: number;
    table_id: number;
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    number_of_guests: number;
    reservation_time: string;
    estimated_duration_minutes: number;
    special_requests?: string;
    status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
    deposit_amount: number;
    payment_status: string;
    notes?: string;
}

interface Payment {
    id: number;
    order_id?: number;
    reservation_id?: number;
    amount: number;
    payment_method: 'cash' | 'card' | 'mobile' | 'qr_code' | 'bank_transfer' | 'digital_wallet';
    payment_gateway?: string;
    transaction_id?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
    payment_details?: any;
}

interface Order {
    id: number;
    order_number: string;
    status: 'pending' | 'preparing' | 'ready' | 'completed';
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    discount_amount?: number;
    order_time: string;
    orderItems?: OrderItem[];
}

interface OrderItem {
    id: number;
    menu_item_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    special_instructions: string | null;
    menuItem?: MenuItem;
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
    menuCombos?: MenuCombo[];
    promotions?: Promotion[];
    taxSetting: TaxSetting | null;
    reservations?: TableReservation[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Quick Table Book', href: '/quick-table-book' },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'available': return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg font-bold px-4 py-2 rounded-full';
        case 'reserved': return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 shadow-lg font-bold px-4 py-2 rounded-full';
        case 'occupied': return 'bg-gradient-to-r from-red-400 to-rose-500 text-white border-0 shadow-lg font-bold px-4 py-2 rounded-full';
        case 'maintenance': return 'bg-gradient-to-r from-gray-400 to-slate-500 text-white border-0 shadow-lg font-bold px-4 py-2 rounded-full';
        default: return 'bg-gradient-to-r from-gray-400 to-slate-500 text-white border-0 shadow-lg font-bold px-4 py-2 rounded-full';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'available': return <Zap className="h-4 w-4" />;
        case 'reserved': return <Clock className="h-4 w-4" />;
        case 'occupied': return <Users className="h-4 w-4" />;
        case 'maintenance': return <Settings className="h-4 w-4" />;
        default: return <Settings className="h-4 w-4" />;
    }
};

const getOrderStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white border-0 shadow-lg font-bold px-3 py-1 rounded-full text-sm';
        case 'preparing': return 'bg-gradient-to-r from-orange-400 to-amber-500 text-white border-0 shadow-lg font-bold px-3 py-1 rounded-full text-sm';
        case 'ready': return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg font-bold px-3 py-1 rounded-full text-sm';
        case 'completed': return 'bg-gradient-to-r from-gray-400 to-slate-500 text-white border-0 shadow-lg font-bold px-3 py-1 rounded-full text-sm';
        default: return 'bg-gradient-to-r from-gray-400 to-slate-500 text-white border-0 shadow-lg font-bold px-3 py-1 rounded-full text-sm';
    }
};

export default function QuickTableBook({ tables, menuItems, menuCombos = [], promotions = [], taxSetting, reservations = [] }: QuickTableBookProps) {
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
        deposit_amount: 0,
        reservation_time: '',
    });
    const [showBulkAddModal, setShowBulkAddModal] = useState<boolean>(false);
    const [bulkItems, setBulkItems] = useState<{ [key: number]: boolean }>({});
    const [bulkQuantities, setBulkQuantities] = useState<{ [key: number]: number }>({});
    
    // Advanced features state
    const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'menu' | 'reservations' | 'orders' | 'payments'>('overview');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showOfflineMode, setShowOfflineMode] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSplitPaymentModal, setShowSplitPaymentModal] = useState(false);
    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [showQRCodeModal, setShowQRCodeModal] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    const [paymentForm, setPaymentForm] = useState({
        amount: 0,
        payment_method: 'cash',
        transaction_id: '',
        notes: ''
    });
    const [splitPaymentForm, setSplitPaymentForm] = useState({
        splits: [
            { amount: 0, payment_method: 'cash', customer_name: '' }
        ]
    });

    const categories = ['all', ...Object.keys(menuItems)];
    const filteredMenuItems = selectedCategory === 'all' 
        ? Object.values(menuItems).flat()
        : menuItems[selectedCategory] || [];

    const searchedMenuItems = filteredMenuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const availableTables = tables.filter(table => table.is_active);
    const occupiedTables = availableTables.filter(table => table.status === 'occupied' || table.has_active_order);
    const availableTablesCount = availableTables.filter(table => table.status === 'available' && !table.has_active_order).length;

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
                    deposit_amount: 0,
                    reservation_time: '',
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

    const handleReleaseTable = async () => {
        if (!selectedTable || !confirm('Are you sure you want to release this table?')) return;

        try {
            setLoading(true);
            const response = await fetch(`/quick-table-book/tables/${selectedTable.id}/release`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            
            if (data.success) {
                setSelectedTable(data.table);
                setCurrentOrder(null);
                alert('Table released successfully!');
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

    const handleBulkAddItems = async () => {
        if (!selectedTable) return;

        const itemsToAdd = Object.keys(bulkItems)
            .filter(itemId => bulkItems[Number(itemId)])
            .map(itemId => ({
                menu_item_id: Number(itemId),
                quantity: bulkQuantities[Number(itemId)] || 1,
                special_instructions: '',
            }));

        if (itemsToAdd.length === 0) {
            alert('Please select at least one item');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/quick-table-book/tables/${selectedTable.id}/add-multiple-items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ items: itemsToAdd }),
            });

            const data = await response.json();
            
            if (data.success) {
                setCurrentOrder(data.order);
                setShowBulkAddModal(false);
                setBulkItems({});
                setBulkQuantities({});
                
                alert(`${itemsToAdd.length} items added successfully!`);
            } else {
                alert('Failed to add items: ' + data.message);
            }
        } catch (error) {
            console.error('Failed to add items:', error);
            alert('Failed to add items');
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
                    special_instructions: specialInstructions,
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                setCurrentOrder(data.order);
                setQuantity({ ...quantity, [menuItem.id]: 1 });
                setSpecialInstructions('');
                
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

    const handleRemoveItem = async (orderItem: OrderItem) => {
        if (!confirm('Are you sure you want to remove this item?')) return;

        try {
            setLoading(true);
            const response = await fetch(`/quick-table-book/order-items/${orderItem.id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            
            if (data.success) {
                setCurrentOrder(data.order);
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

    const handleUpdateQuantity = async (orderItem: OrderItem, newQuantity: number) => {
        if (newQuantity < 1) return;

        try {
            setLoading(true);
            const response = await fetch(`/quick-table-book/order-items/${orderItem.id}/quantity`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    quantity: newQuantity,
                }),
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

    const handleSubmitOrder = async () => {
        if (!currentOrder) return;

        try {
            setLoading(true);
            const response = await fetch(`/quick-table-book/orders/${currentOrder.id}/submit`, {
                method: 'POST',
                headers: {
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

        if (!confirm('Are you sure you want to complete this order?')) return;

        try {
            setLoading(true);
            const response = await fetch(`/quick-table-book/orders/${currentOrder.id}/complete`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            
            if (data.success) {
                setCurrentOrder(null);
                setSelectedTable(null);
                alert('Order completed successfully!');
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

    // Advanced features helper functions
    const getPaymentMethodIcon = (method: string) => {
        const icons = {
            cash: <DollarSign className="h-4 w-4" />,
            card: <CreditCard className="h-4 w-4" />,
            mobile: <Phone className="h-4 w-4" />,
            qr_code: <QrCode className="h-4 w-4" />,
            bank_transfer: <Receipt className="h-4 w-4" />,
            digital_wallet: <CreditCard className="h-4 w-4" />
        };
        return icons[method as keyof typeof icons] || <CreditCard className="h-4 w-4" />;
    };

    const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };
        setNotifications(prev => [notification, ...prev]);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
    };

    const handleCreateReservation = async () => {
        if (!selectedTable) return;
        
        try {
            setLoading(true);
            const response = await fetch(`/advanced-quick-table-book/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    table_id: selectedTable.id,
                    ...bookingForm
                }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                setShowBookingModal(false);
                setBookingForm({
                    customer_name: '',
                    customer_phone: '',
                    customer_email: '',
                    number_of_guests: 1,
                    special_requests: '',
                    estimated_duration: 120,
                    deposit_amount: 0,
                    reservation_time: '',
                });
                addNotification('Reservation created successfully', 'success');
            } else {
                addNotification('Failed to create reservation', 'error');
            }
        } catch (error) {
            addNotification('Failed to create reservation', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayment = async () => {
        if (!currentOrder) return;
        
        try {
            setLoading(true);
            const response = await fetch(`/advanced-quick-table-book/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    order_id: currentOrder.id,
                    ...paymentForm
                }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                setShowPaymentModal(false);
                addNotification('Payment processed successfully', 'success');
            } else {
                addNotification('Failed to process payment', 'error');
            }
        } catch (error) {
            addNotification('Failed to process payment', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyPromotion = async (promotion: Promotion) => {
        if (!currentOrder) return;
        
        try {
            setLoading(true);
            const response = await fetch(`/advanced-quick-table-book/orders/${currentOrder.id}/promotion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    promotion_code: promotion.name
                }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                setShowPromotionModal(false);
                setSelectedPromotion(null);
                addNotification('Promotion applied successfully', 'success');
            } else {
                addNotification('Failed to apply promotion', 'error');
            }
        } catch (error) {
            addNotification('Failed to apply promotion', 'error');
        } finally {
            setLoading(false);
        }
    };

    const calculateOrderTotal = (order: Order) => {
        const subtotal = order.orderItems?.reduce((sum: number, item: OrderItem) => sum + item.total_price, 0) || 0;
        const tax = subtotal * (taxSetting?.tax_rate || 0) / 100;
        const discount = order.discount_amount || 0;
        return subtotal + tax - discount;
    };

    const calculateTableRevenue = (table: Table) => {
        return table.orders?.reduce((sum, order) => sum + calculateOrderTotal(order), 0) || 0;
    };

    const getActivePromotions = () => {
        return promotions.filter(promo => 
            promo.is_active && 
            new Date(promo.start_time) <= new Date() && 
            new Date(promo.end_time) >= new Date()
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Quick Table Book" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
                {/* Enhanced Header with Tabs */}
                <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl">
                    <div className="p-8 text-white">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Zap className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold">Quick Table Book</h1>
                                    <p className="text-indigo-100 text-lg">Advanced restaurant management system</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-indigo-100 text-sm">Available Tables</p>
                                    <p className="text-2xl font-bold">{availableTablesCount}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-indigo-100 text-sm">Occupied Tables</p>
                                    <p className="text-2xl font-bold">{occupiedTables.length}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-indigo-100 text-sm">Today's Revenue</p>
                                    <p className="text-2xl font-bold">Rs {tables.reduce((sum, table) => sum + calculateTableRevenue(table), 0).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Navigation Tabs */}
                        <div className="flex space-x-1 bg-white/10 rounded-xl p-1">
                            {[
                                { id: 'overview', label: 'Overview', icon: <Grid className="h-4 w-4" /> },
                                { id: 'tables', label: 'Tables', icon: <Coffee className="h-4 w-4" /> },
                                { id: 'menu', label: 'Menu', icon: <Utensils className="h-4 w-4" /> },
                                { id: 'reservations', label: 'Reservations', icon: <Calendar className="h-4 w-4" /> },
                                { id: 'orders', label: 'Orders', icon: <ShoppingCart className="h-4 w-4" /> },
                                { id: 'payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-white text-indigo-600 shadow-lg'
                                            : 'text-white hover:bg-white/20'
                                    }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions Bar */}
                <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search tables, menu items, reservations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-80"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowOfflineMode(!showOfflineMode)}
                            >
                                {showOfflineMode ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
                                {showOfflineMode ? 'Offline' : 'Online'}
                            </Button>
                            <Button variant="outline" size="sm">
                                <Bell className="h-4 w-4" />
                                {notifications.length > 0 && (
                                    <Badge className="ml-1 bg-red-500 text-white" variant="destructive">
                                        {notifications.length}
                                    </Badge>
                                )}
                            </Button>
                            <Button variant="outline" size="sm">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="fixed top-4 right-4 z-50 space-y-2">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-lg shadow-lg text-white ${
                                notification.type === 'success' ? 'bg-green-500' :
                                notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                {notification.type === 'success' && <CheckCircle className="h-4 w-4" />}
                                {notification.type === 'error' && <AlertCircle className="h-4 w-4" />}
                                {notification.type === 'info' && <AlertCircle className="h-4 w-4" />}
                                <span>{notification.message}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100">Total Tables</p>
                                            <p className="text-3xl font-bold">{tables.length}</p>
                                        </div>
                                        <Grid className="h-8 w-8 text-blue-200" />
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-100">Available</p>
                                            <p className="text-3xl font-bold">{availableTablesCount}</p>
                                        </div>
                                        <CheckCircle className="h-8 w-8 text-green-200" />
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-orange-100">Occupied</p>
                                            <p className="text-3xl font-bold">{occupiedTables.length}</p>
                                        </div>
                                        <Users className="h-8 w-8 text-orange-200" />
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-100">Revenue Today</p>
                                            <p className="text-3xl font-bold">Rs {tables.reduce((sum, table) => sum + calculateTableRevenue(table), 0).toFixed(2)}</p>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-purple-200" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'tables' && (
                        <div className="space-y-6">
                            {/* Table Stats Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-emerald-600 text-sm font-medium">Available</p>
                                            <p className="text-3xl font-bold text-emerald-700">{availableTablesCount}</p>
                                        </div>
                                        <div className="bg-emerald-500 bg-opacity-20 p-3 rounded-xl">
                                            <CheckCircle className="h-8 w-8 text-emerald-600" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-600 text-sm font-medium">Total Tables</p>
                                            <p className="text-3xl font-bold text-blue-700">{tables.length}</p>
                                        </div>
                                        <div className="bg-blue-500 bg-opacity-20 p-3 rounded-xl">
                                            <Grid className="h-8 w-8 text-blue-600" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-orange-600 text-sm font-medium">Occupied</p>
                                            <p className="text-3xl font-bold text-orange-700">{occupiedTables.length}</p>
                                        </div>
                                        <div className="bg-orange-500 bg-opacity-20 p-3 rounded-xl">
                                            <Users className="h-8 w-8 text-orange-600" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-600 text-sm font-medium">Revenue</p>
                                            <p className="text-3xl font-bold text-purple-700">Rs {tables.reduce((sum, table) => sum + calculateTableRevenue(table), 0).toFixed(0)}</p>
                                        </div>
                                        <div className="bg-purple-500 bg-opacity-20 p-3 rounded-xl">
                                            <TrendingUp className="h-8 w-8 text-purple-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tables Grid */}
                            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                                {availableTables.map((table) => (
                                    <Card 
                                        key={table.id} 
                                        className={`group relative overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer border-0 ${
                                            table.status === 'available' && !table.has_active_order 
                                                ? 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50 hover:from-emerald-100 hover:via-white hover:to-emerald-100' 
                                                : table.status === 'occupied' || table.has_active_order 
                                                ? 'bg-gradient-to-br from-red-50 via-white to-red-50 hover:from-red-100 hover:via-white hover:to-red-100' 
                                                : 'bg-gradient-to-br from-amber-50 via-white to-amber-50 hover:from-amber-100 hover:via-white hover:to-amber-100'
                                        }`}
                                        onClick={() => setSelectedTable(table)}
                                    >
                                        {/* Decorative corner accent */}
                                        <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10 ${
                                            table.status === 'available' && !table.has_active_order 
                                                ? 'bg-emerald-500' 
                                                : table.status === 'occupied' || table.has_active_order 
                                                ? 'bg-red-500' 
                                                : 'bg-amber-500'
                                        }`} />
                                        
                                        <CardHeader className="pb-4 relative">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-3 rounded-xl shadow-sm ${
                                                        table.status === 'available' && !table.has_active_order 
                                                            ? 'bg-emerald-500 text-white' 
                                                            : table.status === 'occupied' || table.has_active_order 
                                                            ? 'bg-red-500 text-white' 
                                                            : 'bg-amber-500 text-white'
                                                    }`}>
                                                        <Coffee className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-xl font-bold text-gray-800">Table {table.table_number}</CardTitle>
                                                        {table.name && <p className="text-sm text-gray-500 font-medium">{table.name}</p>}
                                                    </div>
                                                </div>
                                                <Badge className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm border-0 ${
                                                    table.status === 'available' && !table.has_active_order 
                                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' 
                                                        : table.status === 'occupied' || table.has_active_order 
                                                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                                                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                                                }`}>
                                                    <div className="flex items-center space-x-1">
                                                        {getStatusIcon(table.status)}
                                                        <span>{table.status.toUpperCase()}</span>
                                                    </div>
                                                </Badge>
                                            </div>
                                            
                                            {table.has_active_order && (
                                                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 px-3 py-1.5 rounded-full text-xs font-semibold border border-orange-300">
                                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                                    <Users className="h-3 w-3" />
                                                    <span>ACTIVE ORDER</span>
                                                </div>
                                            )}
                                        </CardHeader>
                                        
                                        <CardContent className="space-y-4">
                                            {/* Table Info */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                                    <Users className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                                                    <p className="text-xs text-gray-500 font-medium">Capacity</p>
                                                    <p className="text-sm font-bold text-gray-800">{table.min_capacity}-{table.capacity}</p>
                                                </div>
                                                {table.location && (
                                                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                                                        <MapPin className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                                                        <p className="text-xs text-gray-500 font-medium">Location</p>
                                                        <p className="text-sm font-bold text-gray-800 truncate">{table.location}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Orders Section */}
                                            {table.orders && table.orders.length > 0 && (
                                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3">
                                                    <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                                                        <Receipt className="h-3 w-3 mr-1" />
                                                        CURRENT ORDERS ({table.orders.length})
                                                    </p>
                                                    <div className="space-y-1.5">
                                                        {table.orders.slice(0, 2).map((order) => (
                                                            <div key={order.id} className="flex justify-between items-center bg-white rounded-lg px-2 py-1.5 shadow-sm">
                                                                <span className="text-xs font-mono font-bold text-gray-700">#{order.order_number}</span>
                                                                <Badge className={`text-xs px-2 py-0.5 rounded-full border-0 ${getOrderStatusColor(order.status)}`}>
                                                                    {order.status}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                        {table.orders.length > 2 && (
                                                            <p className="text-xs text-center text-gray-500 font-medium pt-1">
                                                                +{table.orders.length - 2} more orders
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTable(table);
                                                        setShowBookingModal(true);
                                                    }}
                                                    disabled={table.status !== 'available' || table.has_active_order}
                                                    className="flex-1 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                                >
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    Reserve
                                                </Button>
                                                {table.status === 'available' && !table.has_active_order && (
                                                    <Button
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedTable(table);
                                                            setShowMenu(true);
                                                        }}
                                                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform transition-all duration-200"
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Start
                                                    </Button>
                                                )}
                                                {table.has_active_order && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedTable(table);
                                                        }}
                                                        className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 border-0"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'menu' && (
                        <div className="space-y-8">
                            {/* Menu Stats Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-orange-600 text-sm font-medium">Total Items</p>
                                            <p className="text-3xl font-bold text-orange-700">{menuItems.length}</p>
                                        </div>
                                        <div className="bg-orange-500 bg-opacity-20 p-3 rounded-xl">
                                            <Utensils className="h-8 w-8 text-orange-600" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-600 text-sm font-medium">Categories</p>
                                            <p className="text-3xl font-bold text-purple-700">{categories.length - 1}</p>
                                        </div>
                                        <div className="bg-purple-500 bg-opacity-20 p-3 rounded-xl">
                                            <Grid className="h-8 w-8 text-purple-600" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-600 text-sm font-medium">Combos</p>
                                            <p className="text-3xl font-bold text-green-700">{menuCombos.length}</p>
                                        </div>
                                        <div className="bg-green-500 bg-opacity-20 p-3 rounded-xl">
                                            <Gift className="h-8 w-8 text-green-600" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-red-600 text-sm font-medium">Active Deals</p>
                                            <p className="text-3xl font-bold text-red-700">{getActivePromotions().length}</p>
                                        </div>
                                        <div className="bg-red-500 bg-opacity-20 p-3 rounded-xl">
                                            <Tag className="h-8 w-8 text-red-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Main Menu Items Section */}
                                <div className="lg:col-span-2 space-y-6">
                                    <Card className="bg-gradient-to-br from-white via-gray-50 to-white border-0 shadow-lg">
                                        <CardHeader className="pb-6 border-b border-gray-100">
                                            <CardTitle className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-md">
                                                        <Utensils className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900">Menu Items</h3>
                                                        <p className="text-sm text-gray-500">Browse our delicious menu</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="relative">
                                                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <select
                                                            value={selectedCategory}
                                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                                            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-sm"
                                                        >
                                                            {categories.map(cat => (
                                                                <option key={cat} value={cat}>
                                                                    {cat === 'all' ? '🍽️ All Categories' : `📂 ${cat}`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {searchedMenuItems.map((item) => (
                                                    <div key={item.id} className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2 mb-2">
                                                                    <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"></div>
                                                                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                                                        {item.name}
                                                                    </h4>
                                                                </div>
                                                                <p className="text-gray-600 text-sm leading-relaxed mb-3">{item.description}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                                    Rs {Number(item.price).toFixed(2)}
                                                                </span>
                                                                {item.is_available ? (
                                                                    <div className="flex items-center space-x-1 text-green-600 text-sm font-medium mt-1">
                                                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                        <span>Available</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center space-x-1 text-red-600 text-sm font-medium mt-1">
                                                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                                        <span>Unavailable</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="text-sm text-gray-500">
                                                                    <span className="font-medium">Category:</span>
                                                                    <span className="ml-1 text-orange-600 font-semibold">{item.category}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedTable(null);
                                                                        setShowMenu(true);
                                                                    }}
                                                                    disabled={!item.is_available}
                                                                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 font-semibold px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <Plus className="h-4 w-4 mr-2" />
                                                                    Add to Order
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Combos & Promotions Sidebar */}
                                <div className="space-y-6">
                                    {/* Combos Section */}
                                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-xl font-bold text-green-900 flex items-center space-x-2">
                                                <div className="bg-green-500 p-2 rounded-xl">
                                                    <Gift className="h-5 w-5 text-white" />
                                                </div>
                                                <span>Combos & Deals</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {menuCombos.slice(0, 3).map((combo) => (
                                                <div key={combo.id} className="group bg-gradient-to-br from-white to-green-50 border border-green-200 rounded-2xl p-5 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                                                                <h4 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                                                    {combo.name}
                                                                </h4>
                                                            </div>
                                                            <p className="text-gray-600 text-sm leading-relaxed">{combo.description}</p>
                                                        </div>
                                                        <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                                                            COMBO
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <span className="text-2xl font-bold text-green-600">
                                                                Rs {Number(combo.combo_price).toFixed(2)}
                                                            </span>
                                                            <div className="flex items-center space-x-1 mt-1">
                                                                <span className="text-sm text-gray-500 line-through">Rs {Number(combo.original_price).toFixed(2)}</span>
                                                                <span className="text-sm font-bold text-red-600">Save Rs {Number(combo.savings_amount).toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 font-semibold"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {menuCombos.length === 0 && (
                                                <div className="text-center py-8">
                                                    <div className="bg-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                        <Gift className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium">No combos available</p>
                                                    <p className="text-gray-400 text-sm">Check back later for special deals</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Promotions Section */}
                                    <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-0 shadow-lg">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-xl font-bold text-red-900 flex items-center space-x-2">
                                                <div className="bg-red-500 p-2 rounded-xl">
                                                    <Tag className="h-5 w-5 text-white" />
                                                </div>
                                                <span>Hot Promotions</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {getActivePromotions().slice(0, 2).map((promo) => (
                                                <div key={promo.id} className="group bg-gradient-to-br from-white to-red-50 border border-red-200 rounded-2xl p-5 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full animate-pulse"></div>
                                                                <h4 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                                                                    {promo.name}
                                                                </h4>
                                                            </div>
                                                            <p className="text-gray-600 text-sm leading-relaxed">{promo.description}</p>
                                                        </div>
                                                        <div className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                                                            HOT
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center">
                                                        <div className="bg-gradient-to-r from-red-100 to-orange-100 rounded-xl px-4 py-2">
                                                            <span className="text-lg font-bold text-red-700">
                                                                {promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : 
                                                                 promo.discount_type === 'fixed_amount' ? `Rs ${promo.discount_value} OFF` : 
                                                                 'Special Offer'}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 font-semibold"
                                                        >
                                                            <Tag className="h-4 w-4 mr-1" />
                                                            Apply
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {getActivePromotions().length === 0 && (
                                                <div className="text-center py-8">
                                                    <div className="bg-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                        <Tag className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium">No active promotions</p>
                                                    <p className="text-gray-400 text-sm">Check back for special offers</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reservations' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-5 w-5" />
                                        <span>Reservations</span>
                                    </div>
                                    <Button onClick={() => setShowBookingModal(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Reservation
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {reservations.length > 0 ? (
                                        reservations.map((reservation) => (
                                            <div key={reservation.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold">{reservation.customer_name}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {reservation.number_of_guests} guests • {new Date(reservation.reservation_time).toLocaleString()}
                                                        </p>
                                                        {reservation.special_requests && (
                                                            <p className="text-sm text-gray-500 mt-1">{reservation.special_requests}</p>
                                                        )}
                                                    </div>
                                                    <Badge className={getStatusColor(reservation.status)}>
                                                        {reservation.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No reservations found
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'orders' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    <span>Active Orders</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {tables.filter(table => table.orders && table.orders.length > 0).map((table) => (
                                        table.orders?.map((order) => (
                                            <div key={order.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold">Order #{order.order_number}</h4>
                                                        <p className="text-sm text-gray-600">Table {table.table_number} • {new Date(order.order_time).toLocaleString()}</p>
                                                        <p className="text-lg font-bold text-green-600 mt-2">Rs {Number(order.total_amount).toFixed(2)}</p>
                                                    </div>
                                                    <div className="flex flex-col space-y-2">
                                                        <Badge className={getOrderStatusColor(order.status)}>
                                                            {order.status}
                                                        </Badge>
                                                        <div className="flex space-x-2">
                                                            {order.status === 'pending' && (
                                                                <Button size="sm" onClick={() => {/* Submit to kitchen */}}>
                                                                    <Send className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button size="sm" onClick={() => {/* Complete order */}}>
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'payments' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <CreditCard className="h-5 w-5" />
                                    <span>Payment Processing</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-4">Payment processing interface</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <Button variant="outline" className="h-20 flex flex-col space-y-2">
                                            <CreditCard className="h-6 w-6" />
                                            <span>Card Payment</span>
                                        </Button>
                                        <Button variant="outline" className="h-20 flex flex-col space-y-2">
                                            <QrCode className="h-6 w-6" />
                                            <span>QR Code</span>
                                        </Button>
                                        <Button variant="outline" className="h-20 flex flex-col space-y-2">
                                            <Split className="h-6 w-6" />
                                            <span>Split Payment</span>
                                        </Button>
                                        <Button variant="outline" className="h-20 flex flex-col space-y-2">
                                            <Gift className="h-6 w-6" />
                                            <span>Apply Promo</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Menu Modal */}
                {showMenu && selectedTable && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl p-8 max-w-7xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-hidden border border-gray-100">
                            {/* Modal Header */}
                            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                                        <Utensils className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                            Start Order - Table {selectedTable.table_number}
                                        </h2>
                                        <p className="text-gray-600 font-medium mt-1">Select delicious items to add to the order</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setShowMenu(false)}
                                    variant="outline"
                                    size="sm"
                                    className="h-12 w-12 p-0 rounded-2xl hover:bg-gray-100 transition-all duration-200 border-gray-200"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Menu Items Section */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Filters */}
                                    <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <select
                                                    value={selectedCategory}
                                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                                    className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-medium"
                                                >
                                                    {categories.map(cat => (
                                                        <option key={cat} value={cat} className="py-2">
                                                            {cat === 'all' ? '🍽️ All Categories' : `📂 ${cat}`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                placeholder="🔍 Search menu items..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-12 pr-4 py-3 w-80 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            />
                                        </div>
                                    </div>

                                    {/* Menu Items Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                        {searchedMenuItems.map((item) => (
                                            <div key={item.id} className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                                                            <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                {item.name}
                                                            </h4>
                                                        </div>
                                                        <p className="text-gray-600 text-sm leading-relaxed mb-3">{item.description}</p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                                Rs {Number(item.price).toFixed(2)}
                                                            </span>
                                                            {item.is_available ? (
                                                                <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                    <span>Available</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center space-x-1 text-red-600 text-sm font-medium">
                                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                                    <span>Unavailable</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Quantity Controls */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-3">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setQuantity({ ...quantity, [item.id]: Math.max(1, (quantity[item.id] || 1) - 1) })}
                                                            className="h-10 w-10 p-0 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all duration-200"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-6 py-2 min-w-[60px] text-center">
                                                            <span className="text-xl font-bold text-blue-700">{quantity[item.id] || 1}</span>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setQuantity({ ...quantity, [item.id]: (quantity[item.id] || 1) + 1 })}
                                                            className="h-10 w-10 p-0 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all duration-200"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    
                                                    <Button
                                                        size="lg"
                                                        onClick={() => handleAddItemToTable(item)}
                                                        disabled={loading || !item.is_available}
                                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Plus className="h-5 w-5 mr-2" />
                                                        Add to Order
                                                    </Button>
                                                    
                                                    <Textarea
                                                        placeholder="📝 Special instructions (optional)..."
                                                        value={specialInstructions}
                                                        onChange={(e) => setSpecialInstructions(e.target.value)}
                                                        className="mt-3 bg-gray-50 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Summary Sidebar */}
                                <div className="space-y-6">
                                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-xl font-bold text-blue-900 flex items-center space-x-2">
                                                <div className="bg-blue-500 p-2 rounded-xl">
                                                    <ShoppingCart className="h-5 w-5 text-white" />
                                                </div>
                                                <span>Current Order</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {currentOrder ? (
                                                <>
                                                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-600">Order Number</span>
                                                            <span className="text-lg font-bold text-blue-600">#{currentOrder.order_number}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                                        {currentOrder.orderItems?.map((item) => (
                                                            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center space-x-2 mb-1">
                                                                            <span className="font-bold text-gray-900">{item.menuItem?.name}</span>
                                                                            <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">
                                                                                x{item.quantity}
                                                                            </div>
                                                                        </div>
                                                                        <span className="text-sm text-gray-600">
                                                                            Rs {Number(item.unit_price).toFixed(2)} each
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="text-lg font-bold text-green-600">
                                                                            Rs {Number(item.total_price).toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="border-t border-blue-200 pt-4 space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600 font-medium">Subtotal</span>
                                                            <span className="text-xl font-bold text-gray-900">
                                                                Rs {Number(currentOrder.subtotal).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600 font-medium">Tax</span>
                                                            <span className="text-xl font-bold text-gray-900">
                                                                Rs {Number(currentOrder.tax_amount).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        {currentOrder.discount_amount && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-green-600 font-medium">Discount</span>
                                                                <span className="text-xl font-bold text-green-600">
                                                                    -Rs {Number(currentOrder.discount_amount).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                                                            <span className="text-lg font-bold text-green-800">Total</span>
                                                            <span className="text-2xl font-bold text-green-700">
                                                                Rs {Number(currentOrder.total_amount).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <Button
                                                            onClick={handleSubmitOrder}
                                                            disabled={loading || !currentOrder.orderItems || currentOrder.orderItems.length === 0}
                                                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 font-semibold py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <Send className="h-5 w-5 mr-2" />
                                                            Submit Order to Kitchen
                                                        </Button>
                                                        <Button
                                                            onClick={() => setShowMenu(false)}
                                                            variant="outline"
                                                            className="w-full bg-white border-gray-200 hover:bg-gray-50 transition-all duration-200 font-semibold py-3"
                                                        >
                                                            Close Menu
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <div className="bg-gray-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                        <ShoppingCart className="h-10 w-10 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium text-lg mb-2">No items added yet</p>
                                                    <p className="text-gray-400 text-sm">Add items from the menu to start the order</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Add Modal */}
                {showBulkAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Bulk Add Items</h2>
                                <Button
                                    onClick={() => setShowBulkAddModal(false)}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-lg"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                                {searchedMenuItems.map((item) => (
                                    <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
                                        <div className="flex items-start space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={bulkItems[item.id] || false}
                                                onChange={(e) => setBulkItems({ ...bulkItems, [item.id]: e.target.checked })}
                                                className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                <p className="text-sm text-gray-600">{item.description}</p>
                                                <p className="text-lg font-bold text-green-600">Rs {Number(item.price).toFixed(2)}</p>
                                                {bulkItems[item.id] && (
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setBulkQuantities({ ...bulkQuantities, [item.id]: Math.max(1, (bulkQuantities[item.id] || 1) - 1) })}
                                                            className="h-8 w-8 p-0 rounded-lg"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="w-8 text-center font-bold">{bulkQuantities[item.id] || 1}</span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setBulkQuantities({ ...bulkQuantities, [item.id]: (bulkQuantities[item.id] || 1) + 1 })}
                                                            className="h-8 w-8 p-0 rounded-lg"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex space-x-4 mt-6">
                                <Button
                                    onClick={() => setShowBulkAddModal(false)}
                                    variant="outline"
                                    className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleBulkAddItems}
                                    disabled={loading || Object.keys(bulkItems).filter(key => bulkItems[Number(key)]).length === 0}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg"
                                >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Add {Object.keys(bulkItems).filter(key => bulkItems[Number(key)]).length} Items
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
