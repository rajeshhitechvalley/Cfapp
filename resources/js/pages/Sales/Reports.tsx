import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Filter, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Star, Utensils, Clock, FileText, BarChart3, PieChart, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
        // Build export URL with current filters
        const exportParams = new URLSearchParams();
        
        if (localFilters.start_date) {
            exportParams.append('start_date', localFilters.start_date);
        }
        if (localFilters.end_date) {
            exportParams.append('end_date', localFilters.end_date);
        }
        if (localFilters.payment_status && localFilters.payment_status !== 'all') {
            exportParams.append('payment_status', localFilters.payment_status);
        }
        if (localFilters.table_id && localFilters.table_id !== 'all') {
            exportParams.append('table_id', localFilters.table_id);
        }
        
        // Open export in new window to avoid navigation
        const exportUrl = `/sales/reports/export?${exportParams.toString()}`;
        window.open(exportUrl, '_blank');
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sales Reports', href: '/sales/reports' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales Reports" />

            <div className="space-y-8 p-8">
                {/* Enhanced Header */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <FileText className="h-8 w-8 text-yellow-300 animate-pulse" />
                                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200">
                                    Sales Reports
                                </h1>
                            </div>
                            <p className="text-emerald-100 text-lg font-medium">Comprehensive sales analytics and detailed reporting</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                <BarChart3 className="h-8 w-8 text-white" />
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                <PieChart className="h-8 w-8 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Filters */}
                <Card className="border-0 bg-gradient-to-br from-white to-emerald-50 shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300 rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-2xl">
                        <CardTitle className="flex items-center text-white font-bold text-lg">
                            <Filter className="h-5 w-5 mr-2" />
                            Report Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="start_date" className="text-sm font-bold text-gray-700 flex items-center">
                                    <Calendar className="h-5 w-5 mr-2 text-emerald-700" />
                                    Start Date
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-700 pointer-events-none" />
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={localFilters.start_date}
                                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                        className="border-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-200 h-10 text-gray-900 font-medium pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date" className="text-sm font-bold text-gray-700 flex items-center">
                                    <Calendar className="h-5 w-5 mr-2 text-emerald-700" />
                                    End Date
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-700 pointer-events-none" />
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={localFilters.end_date}
                                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                        className="border-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-200 h-10 text-gray-900 font-medium pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payment_status" className="text-sm font-bold text-gray-700 flex items-center">
                                    <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
                                    Payment Status
                                </Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-600 pointer-events-none" />
                                    <Select value={localFilters.payment_status} onValueChange={(value) => handleFilterChange('payment_status', value)}>
                                        <SelectTrigger className="border-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-200 h-10 text-gray-900 font-medium pl-10">
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                    <SelectContent className="text-gray-700 bg-white border-2 border-gray-200 shadow-lg">
                                        <SelectItem value="all" className="text-gray-900 font-semibold hover:bg-emerald-50 cursor-pointer">All statuses</SelectItem>
                                        <SelectItem value="pending" className="text-gray-900 font-semibold hover:bg-emerald-50 cursor-pointer">Pending</SelectItem>
                                        <SelectItem value="paid" className="text-gray-900 font-semibold hover:bg-emerald-50 cursor-pointer">Paid</SelectItem>
                                        <SelectItem value="partial" className="text-gray-900 font-semibold hover:bg-emerald-50 cursor-pointer">Partial</SelectItem>
                                        <SelectItem value="refunded" className="text-gray-900 font-semibold hover:bg-emerald-50 cursor-pointer">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="table_id" className="text-sm font-bold text-gray-700 flex items-center">
                                    <Utensils className="h-5 w-5 mr-2 text-emerald-600" />
                                    Table
                                </Label>
                                <div className="relative">
                                    <Utensils className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-600 pointer-events-none" />
                                    <Select value={localFilters.table_id} onValueChange={(value) => handleFilterChange('table_id', value)}>
                                        <SelectTrigger className="border-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-200 h-10 text-gray-900 font-medium pl-10">
                                            <SelectValue placeholder="All tables" />
                                        </SelectTrigger>
                                    <SelectContent className="text-gray-700 bg-white border-2 border-gray-200 shadow-lg">
                                        <SelectItem value="all" className="text-gray-900 font-semibold hover:bg-emerald-50 cursor-pointer">All tables</SelectItem>
                                        {tables.map((table) => (
                                            <SelectItem key={table.id} value={table.id.toString()} className="text-gray-900 font-semibold hover:bg-emerald-50 cursor-pointer">
                                                {table.table_number} {table.name && `- ${table.name}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button 
                                onClick={applyFilters} 
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-6 py-2 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                            >
                                <Filter className="h-4 w-4" />
                                Apply Filters
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={resetFilters}
                                className="border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 font-bold px-6 py-2 rounded-lg transition-all duration-300"
                            >
                                Reset
                            </Button>
                            <Button 
                                onClick={exportReport} 
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-2 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2 ml-auto"
                            >
                                <Download className="h-4 w-4" />
                                Export Report
                            </Button>
                        </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Enhanced Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-green-800">Total Sales</CardTitle>
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl shadow-lg">
                                <DollarSign className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-900 mb-2">
                                {formatCurrency(summary.totalSales)}
                            </div>
                            <div className="flex items-center text-sm text-green-700 font-medium">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Selected period</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-blue-800">Total Orders</CardTitle>
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-xl shadow-lg">
                                <ShoppingCart className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-900 mb-2">
                                {summary.totalOrders}
                            </div>
                            <div className="flex items-center text-sm text-blue-700 font-medium">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>Selected period</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-purple-800">Average Order Value</CardTitle>
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl shadow-lg">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-900 mb-2">
                                {formatCurrency(summary.averageOrderValue)}
                            </div>
                            <div className="flex items-center text-sm text-purple-700 font-medium">
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                                <span>Per order average</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-orange-800">Total Bills</CardTitle>
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl shadow-lg">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-900 mb-2">
                                {bills.total}
                            </div>
                            <div className="flex items-center text-sm text-orange-700 font-medium">
                                <Sparkles className="h-4 w-4 mr-1" />
                                <span>Bills generated</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Enhanced Bills Table */}
                <Card className="border-0 bg-gradient-to-br from-white to-slate-50 shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300 rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-t-2xl">
                        <CardTitle className="flex items-center text-white font-bold text-lg">
                            <FileText className="h-5 w-5 mr-2" />
                            Bill Details
                            <Badge className="ml-2 bg-white text-slate-600">
                                {bills.total} Bills
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-slate-100 to-gray-100 border-b-2 border-slate-200">
                                    <tr className="text-left">
                                        <th className="p-4 font-bold text-slate-800">Bill #</th>
                                        <th className="p-4 font-bold text-slate-800">Order #</th>
                                        <th className="p-4 font-bold text-slate-800">Table</th>
                                        <th className="p-4 font-bold text-slate-800">Date</th>
                                        <th className="p-4 font-bold text-slate-800">Total</th>
                                        <th className="p-4 font-bold text-slate-800">Payment Status</th>
                                        <th className="p-4 font-bold text-slate-800">Payment Method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills.data.map((bill: Bill) => (
                                        <tr key={bill.id} className="border-b transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:shadow-md hover:scale-[1.01] hover:border-l-4 hover:border-l-emerald-500 cursor-pointer group">
                                            <td className="p-4 font-medium text-gray-900 group-hover:text-emerald-700 transition-colors duration-200">{bill.bill_number}</td>
                                            <td className="p-4 text-gray-800 group-hover:text-gray-900 transition-colors duration-200">{bill.order?.order_number || 'N/A'}</td>
                                            <td className="p-4 text-gray-800 group-hover:text-gray-900 transition-colors duration-200">
                                                {bill.order?.table?.table_number} {bill.order?.table?.name && `- ${bill.order?.table?.name}`}
                                            </td>
                                            <td className="p-4 text-gray-800 group-hover:text-gray-900 transition-colors duration-200">{formatDate(bill.bill_time)}</td>
                                            <td className="p-4 font-medium text-gray-900 group-hover:text-emerald-700 transition-colors duration-200">{formatCurrency(bill.total_amount)}</td>
                                            <td className="p-4">
                                                <Badge className={`${statusColors[bill.payment_status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'} group-hover:scale-105 transition-transform duration-200 font-medium`}>
                                                    {bill.payment_status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-gray-800 group-hover:text-gray-900 transition-colors duration-200">{bill.payment_method || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {bills.data.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">No bills found</p>
                                    <p className="text-sm">Try adjusting your filters to see more results</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
