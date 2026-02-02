import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Filter, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Star, Utensils, Clock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useCurrency } from '@/components/currency-switcher';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { router } from '@inertiajs/react';

interface OrderItem {
    id: number;
    quantity: number;
    total_price: string;
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
        table_number: string;
        name?: string;
    };
    order_items: OrderItem[];
    subtotal: string;
    tax_amount: string;
    total_amount: string;
    order_time: string;
}

interface Bill {
    id: number;
    bill_number: string;
    subtotal: string;
    tax_amount: string;
    total_amount: string;
    payment_status: string;
    payment_method: string;
    paid_amount: string;
    bill_time: string;
    order?: {
        id: number;
        order_number: string;
        status: string;
        table?: {
            table_number: string;
            name?: string;
        };
        order_items: OrderItem[];
    };
}

interface Props {
    bills: {
        data: Bill[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    tables: Array<{
        id: number;
        table_number: string;
        name?: string;
    }>;
    filters: {
        start_date: string;
        end_date: string;
        payment_status: string;
        table_id: string;
    };
    summary: {
        totalSales: number;
        totalOrders: number;
        averageOrderValue: number;
    };
}

const categoryIcons = {
    tea: '🍵',
    snack: '🍟',
    cake: '🍰',
    pizza: '🍕',
};

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    preparing: 'bg-blue-100 text-blue-800',
    ready: 'bg-purple-100 text-purple-800',
    served: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function SalesReports({ bills, tables, filters, summary }: Props) {
    const { formatCurrency } = useCurrency();
    const [localFilters, setLocalFilters] = useState({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        payment_status: filters.payment_status || 'all',
        table_id: filters.table_id || 'all',
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleFilterChange = (key: string, value: string) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const filtersToApply: any = {
            start_date: localFilters.start_date,
            end_date: localFilters.end_date,
        };
        
        // Only include payment_status if it's not 'all'
        if (localFilters.payment_status && localFilters.payment_status !== 'all') {
            filtersToApply.payment_status = localFilters.payment_status;
        }
        
        // Only include table_id if it's not 'all'
        if (localFilters.table_id && localFilters.table_id !== 'all') {
            filtersToApply.table_id = localFilters.table_id;
        }
        
        router.get('/sales/reports', filtersToApply, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        const defaultFilters = {
            start_date: '',
            end_date: '',
            payment_status: 'all',
            table_id: 'all',
        };
        setLocalFilters(defaultFilters);
        
        // Send empty parameters to backend to reset filters
        router.get('/sales/reports', {
            start_date: '',
            end_date: '',
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const exportReport = () => {
        router.get('/sales/reports/export', localFilters);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sales Reports', href: '/sales/reports' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales Reports" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Sales Reports</h1>
                        <p className="text-muted-foreground">Detailed sales analytics and reporting</p>
                    </div>
                    <Button onClick={exportReport} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export Report
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={localFilters.start_date}
                                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={localFilters.end_date}
                                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payment_status">Payment Status</Label>
                                <Select value={localFilters.payment_status} onValueChange={(value) => handleFilterChange('payment_status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="partial">Partial</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="table_id">Table</Label>
                                <Select value={localFilters.table_id} onValueChange={(value) => handleFilterChange('table_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All tables" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All tables</SelectItem>
                                        {tables.map((table) => (
                                            <SelectItem key={table.id} value={table.id.toString()}>
                                                {table.table_number} {table.name && `- ${table.name}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={applyFilters}>Apply Filters</Button>
                            <Button variant="outline" onClick={resetFilters}>Reset</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(summary.totalSales)}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>Selected period</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {summary.totalOrders}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>Selected period</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(summary.averageOrderValue)}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <span>Per order average</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {bills.total}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <span>Bills generated</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bills Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bill Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left p-3 font-semibold text-gray-700">Bill #</th>
                                        <th className="text-left p-3 font-semibold text-gray-700">Order #</th>
                                        <th className="text-left p-3 font-semibold text-gray-700">Table</th>
                                        <th className="text-left p-3 font-semibold text-gray-700">Date</th>
                                        <th className="text-left p-3 font-semibold text-gray-700">Total</th>
                                        <th className="text-left p-3 font-semibold text-gray-700">Payment Status</th>
                                        <th className="text-left p-3 font-semibold text-gray-700">Payment Method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills.data.map((bill: Bill) => (
                                        <tr key={bill.id} className="border-b transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md hover:scale-[1.01] hover:border-l-4 hover:border-l-blue-500 cursor-pointer group">
                                            <td className="p-3 font-medium group-hover:text-blue-700 transition-colors duration-200">{bill.bill_number}</td>
                                            <td className="p-3 group-hover:text-gray-700 transition-colors duration-200">{bill.order?.order_number || 'N/A'}</td>
                                            <td className="p-3 group-hover:text-gray-700 transition-colors duration-200">
                                                {bill.order?.table?.table_number} {bill.order?.table?.name && `- ${bill.order?.table?.name}`}
                                            </td>
                                            <td className="p-3 group-hover:text-gray-700 transition-colors duration-200">{formatDate(bill.bill_time)}</td>
                                            <td className="p-3 font-medium group-hover:text-blue-700 transition-colors duration-200">{formatCurrency(bill.total_amount)}</td>
                                            <td className="p-3">
                                                <Badge className={`${statusColors[bill.payment_status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'} group-hover:scale-105 transition-transform duration-200`}>
                                                    {bill.payment_status}
                                                </Badge>
                                            </td>
                                            <td className="p-3 group-hover:text-gray-700 transition-colors duration-200">{bill.payment_method || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {bills.data.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No bills found for the selected criteria
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
