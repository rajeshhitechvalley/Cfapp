import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, DollarSign, CheckCircle, AlertCircle, XCircle, Edit } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useTax } from '@/hooks/useTax';
import { useCurrency } from '@/components/currency-switcher';

interface OrderItem {
    id: number;
    quantity: number;
    unit_price: string;
    total_price: string;
    special_instructions: string;
    menu_item?: {
        name: string;
        category: string;
    };
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    table?: {
        id: number;
        table_number: string;
        name?: string;
    };
    order_items: OrderItem[];
}

interface Bill {
    id: number;
    bill_number: string;
    subtotal: string;
    tax_amount: string;
    service_charge: string;
    discount_amount: string;
    total_amount: string;
    payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
    payment_method?: 'cash' | 'card' | 'upi' | 'other';
    paid_amount: string;
    bill_time: string;
    paid_time?: string;
    notes?: string;
    order?: Order;
    table?: {
        id: number;
        table_number: string;
        name?: string;
    };
}

interface Props {
    bill: Bill;
}

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-blue-100 text-blue-800',
    refunded: 'bg-red-100 text-red-800',
};

const paymentMethodIcons = {
    cash: '💵',
    card: '💳',
    upi: '📱',
    other: '🔄',
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
        'bills.index': '/bills',
        'orders.show': '/orders',
    };
    
    let url = routes[name] || `/${name}`;
    
    if (params) {
        url += `/${params}`;
    }
    
    return url;
};

export default function BillsShow({ bill }: Props) {
    const { formatCurrency, getTaxLabel } = useTax();
    const { formatCurrency: formatCurrencyWithSwitcher } = useCurrency();
    
    const handlePaymentUpdate = (paymentMethod: string, amount: number) => {
        router.post(`/bills/${bill.id}/payment`, {
            payment_method: paymentMethod,
            amount: amount,
        }, {
            onSuccess: () => {
                // Success message will be shown via flash message
            }
        });
    };

    const handleStatusUpdate = (status: string) => {
        router.put(`/bills/${bill.id}`, {
            payment_status: status,
        }, {
            onSuccess: () => {
                // Success message will be shown via flash message
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Bills', href: '/bills' },
        { title: `Bill ${bill.bill_number}`, href: `/bills/${bill.id}` },
    ];

    const remainingAmount = (parseFloat(bill.total_amount) - parseFloat(bill.paid_amount)).toFixed(2);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Bill ${bill.bill_number}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('bills.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Bills
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Bill {bill.bill_number}</h1>
                            <p className="text-muted-foreground">Bill details and payment management</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={route('orders.show', bill.order?.id)}>
                            <Button variant="outline">
                                <Edit className="h-4 w-4 mr-2" />
                                View Order
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bill Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Bill Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Bill Number</label>
                                        <p className="font-semibold">{bill.bill_number}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Table</label>
                                        <p className="font-semibold">
                                            {bill.table?.table_number} {bill.table?.name && `- ${bill.table?.name}`}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Order</label>
                                        <p className="font-semibold">{bill.order?.order_number}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                                        <div className="mt-1">
                                            <Badge className={statusColors[bill.payment_status]}>
                                                {bill.payment_status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Bill Time</label>
                                        <p className="font-semibold flex items-center">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {new Date(bill.bill_time).toLocaleString()}
                                        </p>
                                    </div>
                                    {bill.paid_time && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Paid Time</label>
                                            <p className="font-semibold flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                {new Date(bill.paid_time).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    {bill.payment_method && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                                            <p className="font-semibold">
                                                <span className="mr-2">{paymentMethodIcons[bill.payment_method as keyof typeof paymentMethodIcons]}</span>
                                                {bill.payment_method.charAt(0).toUpperCase() + bill.payment_method.slice(1)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {bill.notes && (
                                    <div className="mt-4">
                                        <label className="text-sm font-medium text-muted-foreground">Notes</label>
                                        <p className="mt-1 p-3 bg-muted rounded-md">{bill.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Order Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Items ({bill.order?.order_items.length || 0})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {bill.order?.order_items?.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <span className="text-2xl">
                                                    {categoryIcons[item.menu_item?.category as keyof typeof categoryIcons] || '🍽️'}
                                                </span>
                                                <div>
                                                    <h4 className="font-medium">{item.menu_item?.name}</h4>
                                                    {item.special_instructions && (
                                                        <p className="text-sm text-blue-600 mt-1">Note: {item.special_instructions}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">{item.quantity} × {formatCurrency(item.unit_price)}</div>
                                                <div className="font-bold">{formatCurrency(item.total_price)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <DollarSign className="h-5 w-5 mr-2" />
                                    Payment Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>{formatCurrency(bill.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{getTaxLabel()}:</span>
                                        <span>{formatCurrency(parseFloat(bill.tax_amount))}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Service Charge:</span>
                                        <span>{formatCurrency(bill.service_charge)}</span>
                                    </div>
                                    {parseFloat(bill.discount_amount) > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount:</span>
                                            <span>-{formatCurrency(bill.discount_amount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>{formatCurrency(bill.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Paid Amount:</span>
                                        <span>{formatCurrency(bill.paid_amount)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Remaining:</span>
                                        <span className={parseFloat(remainingAmount) > 0 ? 'text-red-600' : 'text-green-600'}>
                                            {formatCurrency(remainingAmount)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Actions */}
                        {bill.payment_status !== 'paid' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <CreditCard className="h-5 w-5 mr-2" />
                                        Payment Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Payment Method</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.keys(paymentMethodIcons).map((method) => (
                                                <Button
                                                    key={method}
                                                    variant="outline"
                                                    onClick={() => handlePaymentUpdate(method, parseFloat(remainingAmount))}
                                                    className="flex items-center justify-center"
                                                >
                                                    <span className="mr-2">{paymentMethodIcons[method as keyof typeof paymentMethodIcons]}</span>
                                                    {method.charAt(0).toUpperCase() + method.slice(1)}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Quick Payment</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => handlePaymentUpdate('cash', parseFloat(remainingAmount))}
                                                disabled={parseFloat(remainingAmount) <= 0}
                                            >
                                                Pay Full Amount
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handlePaymentUpdate('cash', Math.ceil(parseFloat(remainingAmount) / 2))}
                                                disabled={parseFloat(remainingAmount) <= 0}
                                            >
                                                Pay Half
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Update Status</label>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleStatusUpdate('paid')}
                                                disabled={bill.payment_status === 'paid'}
                                            >
                                                Mark Paid
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleStatusUpdate('refunded')}
                                                disabled={bill.payment_status === 'refunded'}
                                            >
                                                Refund
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
