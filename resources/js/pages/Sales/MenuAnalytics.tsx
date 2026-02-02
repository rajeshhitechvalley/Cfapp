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

interface TopItem {
    name: string;
    category: string;
    total_quantity: string;
    total_revenue: string;
}

interface CategorySales {
    category: string;
    total_quantity: string;
    total_revenue: string;
    total_orders: number;
}

interface HourlySale {
    hour: number;
    total_sales: string;
    total_orders: number;
}

interface Props {
    topItems: TopItem[];
    salesByCategory: CategorySales[];
    hourlySales: HourlySale[];
    filters: {
        date_from: string;
        date_to: string;
    };
}

const categoryIcons = {
    tea: '🍵',
    snack: '🍟',
    cake: '🍰',
    pizza: '🍕',
};

const performanceColors = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-red-100 text-red-800',
};

export default function SalesMenuAnalytics({ topItems, salesByCategory, hourlySales, filters }: Props) {
    const { formatCurrency } = useCurrency();
    const [localFilters, setLocalFilters] = useState({
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });

    const handleFilterChange = (key: string, value: string) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        router.get('/sales/menu-analytics', localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        const defaultFilters = {
            date_from: '',
            date_to: '',
        };
        setLocalFilters(defaultFilters);
        router.get('/sales/menu-analytics', defaultFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const exportAnalytics = () => {
        router.get('/sales/menu-analytics/export', localFilters);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Menu Analytics', href: '/sales/menu-analytics' },
    ];

    // Calculate summary statistics
    const totalRevenue = salesByCategory.reduce((sum, cat) => sum + parseFloat(cat.total_revenue), 0);
    const totalOrders = salesByCategory.reduce((sum, cat) => sum + cat.total_orders, 0);
    const totalItems = topItems.reduce((sum, item) => sum + parseInt(item.total_quantity), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu Analytics" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Menu Analytics</h1>
                        <p className="text-muted-foreground">Detailed menu performance insights and trends</p>
                    </div>
                    <Button onClick={exportAnalytics} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export Analytics
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date_from">Start Date</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={localFilters.date_from}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_to">End Date</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={localFilters.date_to}
                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                />
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
                            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                            <Utensils className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalItems}</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <span>Items sold</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalOrders}</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <span>Orders</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <span>Menu revenue</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : '$0.00'}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <span>Per order</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Star className="h-5 w-5 mr-2" />
                                Top Selling Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topItems.map((item: TopItem, index: number) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-lg">{categoryIcons[item.category as keyof typeof categoryIcons]}</span>
                                                    <span className="font-medium">{item.name}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {item.total_quantity} items sold
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">{formatCurrency(item.total_revenue)}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {formatCurrency(parseFloat(item.total_revenue) / parseInt(item.total_quantity))} avg
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {topItems.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No top items data available
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category Sales */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {salesByCategory.map((category: CategorySales) => (
                                    <div key={category.category} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg">{categoryIcons[category.category as keyof typeof categoryIcons]}</span>
                                                <span className="font-medium capitalize">{category.category}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">{formatCurrency(category.total_revenue)}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {category.total_orders} orders • {category.total_quantity} items
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${totalRevenue > 0 ? (parseFloat(category.total_revenue) / totalRevenue) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-muted-foreground text-right">
                                            {totalRevenue > 0 ? ((parseFloat(category.total_revenue) / totalRevenue) * 100).toFixed(1) : '0'}% of total sales
                                        </div>
                                    </div>
                                ))}
                                {salesByCategory.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No category data available
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Hourly Sales Pattern */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Hourly Sales Pattern
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {hourlySales.map((hour: HourlySale, index: number) => {
                                const maxSales = Math.max(...hourlySales.map(h => parseFloat(h.total_sales)));
                                const currentSales = parseFloat(hour.total_sales);
                                const intensity = maxSales > 0 ? currentSales / maxSales : 0;
                                
                                // Determine color based on sales intensity
                                let bgColor = 'bg-gray-100';
                                let textColor = 'text-gray-700';
                                let borderColor = 'border-gray-200';
                                
                                if (intensity > 0.7) {
                                    bgColor = 'bg-gradient-to-r from-green-50 to-emerald-50';
                                    textColor = 'text-green-800';
                                    borderColor = 'border-green-200';
                                } else if (intensity > 0.4) {
                                    bgColor = 'bg-gradient-to-r from-blue-50 to-indigo-50';
                                    textColor = 'text-blue-800';
                                    borderColor = 'border-blue-200';
                                } else if (intensity > 0.2) {
                                    bgColor = 'bg-gradient-to-r from-yellow-50 to-amber-50';
                                    textColor = 'text-yellow-800';
                                    borderColor = 'border-yellow-200';
                                }
                                
                                return (
                                    <div 
                                        key={hour.hour} 
                                        className={`flex items-center justify-between p-3 rounded-lg border ${borderColor} ${bgColor} transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`flex items-center justify-center w-14 h-10 rounded-lg ${bgColor} border ${borderColor} ${textColor} text-sm font-bold shadow-sm`}>
                                                <Clock className="h-4 w-4 mr-1" />
                                                {hour.hour}:00
                                            </div>
                                            <div>
                                                <span className={`font-semibold ${textColor}`}>{hour.total_orders} orders</span>
                                                <div className="text-xs text-muted-foreground">
                                                    {intensity > 0.7 ? '🔥 Peak hour' : intensity > 0.4 ? '📈 Busy' : intensity > 0.2 ? '📊 Moderate' : '🕐 Quiet'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-bold text-lg ${textColor}`}>{formatCurrency(hour.total_sales)}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {hour.total_orders > 0 ? formatCurrency(parseFloat(hour.total_sales) / hour.total_orders) : '$0.00'} avg
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {hourlySales.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No hourly sales data available
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
