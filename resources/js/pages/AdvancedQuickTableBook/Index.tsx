import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Coffee, 
  Users, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Utensils,
  CreditCard,
  QrCode,
  Smartphone,
  Gift,
  Star,
  TrendingUp,
  PieChart,
  Settings,
  Plus,
  Minus,
  Edit,
  Trash2,
  Split,
  Download,
  Upload,
  Wifi,
  WifiOff,
  Bell,
  Search,
  Filter,
  ChevronRight,
  DollarSign,
  Percent,
  Tag,
  Package,
  ShoppingCart,
  Receipt,
  Printer,
  Share2,
  Heart,
  Award,
  Target,
  Zap,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  X,
  Menu,
  Grid,
  List,
  MoreVertical
} from 'lucide-react';

interface Table {
  id: number;
  table_number: string;
  name?: string;
  capacity: number;
  min_capacity: number;
  status: 'available' | 'reserved' | 'occupied' | 'maintenance';
  location?: string;
  table_type?: {
    id: number;
    name: string;
  };
  orders?: Order[];
  reservations?: TableReservation[];
}

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
  is_available: boolean;
  preparation_time?: number;
  dietary_info?: string[];
  modifiers?: MenuModifier[];
}

interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  menu_items: MenuItem[];
  sort_order: number;
  is_active: boolean;
}

interface MenuCombo {
  id: number;
  name: string;
  description?: string;
  combo_price: number;
  savings_amount: number;
  image_url?: string;
  is_active: boolean;
  combo_items: ComboItem[];
}

interface ComboItem {
  id: number;
  menu_item_id: number;
  quantity: number;
  is_required: boolean;
  menu_item: MenuItem;
}

interface MenuModifier {
  id: number;
  name: string;
  price_adjustment: number;
  modifier_type: 'add' | 'remove' | 'replace';
  is_active: boolean;
}

interface Order {
  id: number;
  order_number: string;
  table_id: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  discount_amount?: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  order_time: string;
  ready_time?: string;
  order_items: OrderItem[];
}

interface OrderItem {
  id: number;
  menu_item_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  subtotal: number;
  special_instructions?: string;
  menu_item?: MenuItem;
  modifiers?: MenuModifier[];
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

interface Promotion {
  id: number;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount' | 'buy_one_get_one' | 'free_item';
  discount_value: number;
  minimum_order_amount?: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  usage_limit?: number;
  usage_count: number;
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

interface TaxSetting {
  id: number;
  name: string;
  tax_rate: number;
  is_active: boolean;
}

interface Props {
  tables: Table[];
  menuCategories: MenuCategory[];
  menuCombos: MenuCombo[];
  promotions: Promotion[];
  taxSetting: TaxSetting;
}

const AdvancedQuickTableBook: React.FC<Props> = ({
  tables,
  menuCategories,
  menuCombos,
  promotions,
  taxSetting
}) => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSplitPaymentModal, setShowSplitPaymentModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOfflineMode, setShowOfflineMode] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Form states
  const [reservationForm, setReservationForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    number_of_guests: 2,
    reservation_time: '',
    estimated_duration_minutes: 120,
    special_requests: '',
    deposit_amount: 0
  });

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

  // Helper functions
  const getStatusColor = (status: string) => {
    const colors = {
      available: 'bg-green-100 text-green-800 border-green-200',
      reserved: 'bg-blue-100 text-blue-800 border-blue-200',
      occupied: 'bg-red-100 text-red-800 border-red-200',
      maintenance: 'bg-gray-100 text-gray-800 border-gray-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      preparing: 'bg-orange-100 text-orange-800 border-orange-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      available: <CheckCircle className="h-3 w-3" />,
      reserved: <Calendar className="h-3 w-3" />,
      occupied: <Users className="h-3 w-3" />,
      maintenance: <AlertCircle className="h-3 w-3" />,
      pending: <Clock className="h-3 w-3" />,
      preparing: <Zap className="h-3 w-3" />,
      ready: <CheckCircle className="h-3 w-3" />,
      completed: <CheckCircle className="h-3 w-3" />
    };
    return icons[status as keyof typeof icons] || <AlertCircle className="h-3 w-3" />;
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons = {
      cash: <DollarSign className="h-4 w-4" />,
      card: <CreditCard className="h-4 w-4" />,
      mobile: <Smartphone className="h-4 w-4" />,
      qr_code: <QrCode className="h-4 w-4" />,
      bank_transfer: <Receipt className="h-4 w-4" />,
      digital_wallet: <Wallet className="h-4 w-4" />
    };
    return icons[method as keyof typeof icons] || <CreditCard className="h-4 w-4" />;
  };

  // Filter functions
  const filteredTables = tables.filter(table => 
    table.table_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMenuItems = selectedCategory === 'all' 
    ? menuCategories.flatMap(cat => cat.menu_items)
    : menuCategories.find(cat => cat.id.toString() === selectedCategory)?.menu_items || [];

  // API handlers
  const handleCreateReservation = async () => {
    if (!selectedTable) return;
    
    try {
      const response = await router.post('/advanced-quick-table-book/reservations', {
        table_id: selectedTable.id,
        ...reservationForm
      });
      
      if (response) {
        setShowReservationModal(false);
        setReservationForm({
          customer_name: '',
          customer_phone: '',
          customer_email: '',
          number_of_guests: 2,
          reservation_time: '',
          estimated_duration_minutes: 120,
          special_requests: '',
          deposit_amount: 0
        });
        addNotification('Reservation created successfully', 'success');
      }
    } catch (error) {
      addNotification('Failed to create reservation', 'error');
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedOrder) return;
    
    try {
      const response = await router.post('/advanced-quick-table-book/payments', {
        order_id: selectedOrder.id,
        ...paymentForm
      });
      
      if (response) {
        setShowPaymentModal(false);
        addNotification('Payment processed successfully', 'success');
      }
    } catch (error) {
      addNotification('Failed to process payment', 'error');
    }
  };

  const handleApplyPromotion = async (promotionCode: string) => {
    if (!selectedOrder) return;
    
    try {
      const response = await router.post(`/advanced-quick-table-book/orders/${selectedOrder.id}/promotion`, {
        promotion_code: promotionCode
      });
      
      if (response) {
        setShowPromotionModal(false);
        addNotification('Promotion applied successfully', 'success');
      }
    } catch (error) {
      addNotification('Failed to apply promotion', 'error');
    }
  };

  const handleSplitPayment = async () => {
    if (!selectedOrder) return;
    
    try {
      const response = await router.post(`/advanced-quick-table-book/orders/${selectedOrder.id}/split-payment`, {
        splits: splitPaymentForm.splits
      });
      
      if (response) {
        setShowSplitPaymentModal(false);
        addNotification('Payment split successfully', 'success');
      }
    } catch (error) {
      addNotification('Failed to split payment', 'error');
    }
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

  // Calculate totals
  const calculateOrderTotal = (order: Order) => {
    const subtotal = order.order_items.reduce((sum, item) => sum + item.total_price, 0);
    const tax = subtotal * (taxSetting?.tax_rate || 0) / 100;
    const discount = order.discount_amount || 0;
    return subtotal + tax - discount;
  };

  const calculateTableRevenue = (table: Table) => {
    return table.orders?.reduce((sum, order) => sum + calculateOrderTotal(order), 0) || 0;
  };

  return (
    <>
      <Head title="Advanced Quick Table Book" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">Advanced Quick Table Book</h1>
                <Badge variant="outline" className="flex items-center space-x-1">
                  {showOfflineMode ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
                  <span>{showOfflineMode ? 'Offline Mode' : 'Online'}</span>
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tables..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
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
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOfflineMode(!showOfflineMode)}
                >
                  {showOfflineMode ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                </Button>
                
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <Badge className="ml-1 bg-red-500 text-white" variant="destructive">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </div>
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
                {notification.type === 'error' && <XCircle className="h-4 w-4" />}
                {notification.type === 'info' && <AlertCircle className="h-4 w-4" />}
                <span>{notification.message}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tables">Tables</TabsTrigger>
              <TabsTrigger value="reservations">Reservations</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
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
                        <p className="text-3xl font-bold">
                          {tables.filter(t => t.status === 'available').length}
                        </p>
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
                        <p className="text-3xl font-bold">
                          {tables.filter(t => t.status === 'occupied').length}
                        </p>
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
                        <p className="text-3xl font-bold">
                          Rs {tables.reduce((sum, table) => sum + calculateTableRevenue(table), 0).toFixed(2)}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col space-y-2">
                      <Calendar className="h-6 w-6" />
                      <span>New Reservation</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col space-y-2">
                      <QrCode className="h-6 w-6" />
                      <span>QR Code Menu</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col space-y-2">
                      <Gift className="h-6 w-6" />
                      <span>Apply Promotion</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col space-y-2">
                      <Split className="h-6 w-6" />
                      <span>Split Payment</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tables Tab */}
            <TabsContent value="tables" className="space-y-6">
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredTables.map((table) => (
                  <Card key={table.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Coffee className="h-5 w-5" />
                          <span>Table {table.table_number}</span>
                          {table.name && <span className="text-gray-500">- {table.name}</span>}
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
                        
                        {table.orders && table.orders.length > 0 && (
                          <div className="border-t pt-3">
                            <p className="text-sm font-medium text-gray-900 mb-2">Current Orders</p>
                            {table.orders.map((order) => (
                              <div key={order.id} className="flex items-center justify-between text-sm py-1">
                                <span className="text-gray-600">{order.order_number}</span>
                                <Badge className={getStatusColor(order.status)} variant="outline">
                                  {order.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {table.reservations && table.reservations.length > 0 && (
                          <div className="border-t pt-3">
                            <p className="text-sm font-medium text-gray-900 mb-2">Upcoming Reservations</p>
                            {table.reservations.map((reservation) => (
                              <div key={reservation.id} className="flex items-center justify-between text-sm py-1">
                                <span className="text-gray-600">{reservation.customer_name}</span>
                                <span className="text-gray-500">
                                  {new Date(reservation.reservation_time).toLocaleTimeString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex space-x-2 pt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTable(table);
                              setShowReservationModal(true);
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
                                // Create new order logic
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Start Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Other tabs would be implemented similarly... */}
          </Tabs>
        </div>

        {/* Reservation Modal */}
        <Dialog open={showReservationModal} onOpenChange={setShowReservationModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Reservation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Customer Name *</Label>
                  <Input
                    id="customer_name"
                    value={reservationForm.customer_name}
                    onChange={(e) => setReservationForm(prev => ({ ...prev, customer_name: e.target.value }))}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_phone">Phone Number</Label>
                  <Input
                    id="customer_phone"
                    value={reservationForm.customer_phone}
                    onChange={(e) => setReservationForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_email">Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={reservationForm.customer_email}
                    onChange={(e) => setReservationForm(prev => ({ ...prev, customer_email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="number_of_guests">Number of Guests *</Label>
                  <Input
                    id="number_of_guests"
                    type="number"
                    min="1"
                    max={selectedTable?.capacity || 10}
                    value={reservationForm.number_of_guests}
                    onChange={(e) => setReservationForm(prev => ({ ...prev, number_of_guests: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reservation_time">Reservation Time *</Label>
                  <Input
                    id="reservation_time"
                    type="datetime-local"
                    value={reservationForm.reservation_time}
                    onChange={(e) => setReservationForm(prev => ({ ...prev, reservation_time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="estimated_duration_minutes">Duration (minutes)</Label>
                  <Input
                    id="estimated_duration_minutes"
                    type="number"
                    min="30"
                    max="240"
                    value={reservationForm.estimated_duration_minutes}
                    onChange={(e) => setReservationForm(prev => ({ ...prev, estimated_duration_minutes: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="special_requests">Special Requests</Label>
                <Textarea
                  id="special_requests"
                  value={reservationForm.special_requests}
                  onChange={(e) => setReservationForm(prev => ({ ...prev, special_requests: e.target.value }))}
                  placeholder="Any special requests or notes..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowReservationModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReservation}>
                  Create Reservation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdvancedQuickTableBook;
