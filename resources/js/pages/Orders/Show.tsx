import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, DollarSign, Users, CheckCircle, AlertCircle, XCircle, Edit } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useTax } from '@/hooks/useTax';

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
        'orders.edit': '/orders',
        'bills.show': '/bills',
    };
    
    let url = routes[name] || `/${name}`;
    
    if (params) {
        url += `/${params}`;
    }
    
    return url;
};

export default function OrdersShow({ order }: Props) {
    const { getTaxLabel, formatCurrency } = useTax();
    
    const handleStatusUpdate = (newStatus: string) => {
        router.post(`/orders/${order.id}/status`, { status: newStatus }, {
            onSuccess: () => {
                // Success message will be shown via flash message
            }
        });
    };

    const handleGenerateBill = () => {
        router.post(`/orders/${order.id}/generate-bill`, {}, {
            onSuccess: () => {
                // Success message will be shown via flash message
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/orders' },
        { title: `Order ${order.order_number}`, href: `/orders/${order.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_number}`} />

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
                            <h1 className="text-3xl font-bold">Order {order.order_number}</h1>
                            <p className="text-muted-foreground">Order details and management</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={route('orders.edit', order.id)}>
                            <Button variant="outline">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Order
                            </Button>
                        </Link>
                        {!order.bill && (
                            <Button onClick={handleGenerateBill}>
                                <DollarSign className="h-4 w-4 mr-2" />
                                Generate Bill
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Order Number</label>
                                        <p className="font-semibold">{order.order_number}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Table</label>
                                        <p className="font-semibold">
                                            {order.table?.table_number} {order.table?.name && `- ${order.table?.name}`}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                                        <div className="mt-1">
                                            <Select value={order.status} onValueChange={handleStatusUpdate}>
                                                <SelectTrigger className="w-40">
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
                                        <label className="text-sm font-medium text-muted-foreground">Priority</label>
                                        <div className="mt-1">
                                            <Badge className={priorityColors[order.priority]}>
                                                {order.priority}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Order Time</label>
                                        <p className="font-semibold flex items-center">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {new Date(order.order_time).toLocaleString()}
                                        </p>
                                    </div>
                                    {order.ready_time && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Ready Time</label>
                                            <p className="font-semibold flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                {new Date(order.ready_time).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    {order.served_time && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Served Time</label>
                                            <p className="font-semibold flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                {new Date(order.served_time).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {order.special_instructions && (
                                    <div className="mt-4">
                                        <label className="text-sm font-medium text-muted-foreground">Special Instructions</label>
                                        <p className="mt-1 p-3 bg-muted rounded-md">{order.special_instructions}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Order Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Items ({order.order_items.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.order_items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <span className="text-2xl">
                                                    {categoryIcons[item.menu_item?.category as keyof typeof categoryIcons] || '🍽️'}
                                                </span>
                                                <div>
                                                    <h4 className="font-medium">{item.menu_item?.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{item.menu_item?.description}</p>
                                                    {item.special_instructions && (
                                                        <p className="text-sm text-blue-600 mt-1">Note: {item.special_instructions}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">{item.quantity} × ${parseFloat(item.unit_price).toFixed(2)}</div>
                                                <div className="font-bold">${parseFloat(item.total_price).toFixed(2)}</div>
                                                <Badge className="mt-1" variant="outline">
                                                    {item.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>${parseFloat(order.subtotal).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{getTaxLabel()}:</span>
                                        <span>{formatCurrency(parseFloat(order.tax_amount))}</span>
                                    </div>
                                    {parseFloat(order.discount_amount) > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount:</span>
                                            <span>-${parseFloat(order.discount_amount).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bill Information */}
                        {order.bill && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <DollarSign className="h-5 w-5 mr-2" />
                                        Bill Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Bill Number:</span>
                                            <span className="font-medium">{order.bill.bill_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Payment Status:</span>
                                            <Badge className={
                                                order.bill.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                                order.bill.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }>
                                                {order.bill.payment_status}
                                            </Badge>
                                        </div>
                                        {order.bill.payment_method && (
                                            <div className="flex justify-between">
                                                <span>Payment Method:</span>
                                                <span>{order.bill.payment_method}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span>Paid Amount:</span>
                                            <span>${parseFloat(order.bill.paid_amount).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Remaining:</span>
                                            <span>${(parseFloat(order.bill.total_amount) - parseFloat(order.bill.paid_amount)).toFixed(2)}</span>
                                        </div>
                                        {order.bill.paid_time && (
                                            <div className="flex justify-between">
                                                <span>Paid Time:</span>
                                                <span className="text-sm">{new Date(order.bill.paid_time).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Link href={route('bills.show', order.bill.id)}>
                                        <Button className="w-full mt-4" variant="outline">
                                            View Bill Details
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
