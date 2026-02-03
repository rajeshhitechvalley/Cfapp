import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Filter, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Star, Utensils, Clock, BarChart3, PieChart, Sparkles, Trophy, Target, Zap } from 'lucide-react';
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

            <div className="space-y-8 p-8">
                {/* Enhanced Header */}
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <BarChart3 className="h-8 w-8 text-yellow-300 animate-pulse" />
                                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200">
                                    Menu Analytics
                                </h1>
                            </div>
                            <p className="text-purple-100 text-lg font-medium">Detailed menu performance insights and trends</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                <PieChart className="h-8 w-8 text-white" />
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                <Trophy className="h-8 w-8 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Filters */}
                <Card className="border-0 bg-gradient-to-br from-white to-purple-50 shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300 rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-2xl">
                        <CardTitle className="flex items-center text-white font-bold text-lg">
                            <Filter className="h-5 w-5 mr-2" />
                            Date Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="date_from" className="text-sm font-bold text-gray-700 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                                    Start Date
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-600 pointer-events-none" />
                                    <Input
                                        id="date_from"
                                        type="date"
                                        value={localFilters.date_from}
                                        onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                        className="border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-200 h-10 text-gray-900 font-medium pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_to" className="text-sm font-bold text-gray-700 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                                    End Date
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-600 pointer-events-none" />
                                    <Input
                                        id="date_to"
                                        type="date"
                                        value={localFilters.date_to}
                                        onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                        className="border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-200 h-10 text-gray-900 font-medium pl-10"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button 
                                onClick={applyFilters} 
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 py-2 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
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
                                onClick={exportAnalytics} 
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-2 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2 ml-auto"
                            >
                                <Download className="h-4 w-4" />
                                Export Analytics
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Enhanced Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-orange-800">Total Items</CardTitle>
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl shadow-lg">
                                <Utensils className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-900 mb-2">{totalItems}</div>
                            <div className="flex items-center text-sm text-orange-700 font-medium">
                                <Zap className="h-4 w-4 mr-1" />
                                <span>Items sold</span>
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
                            <div className="text-3xl font-bold text-blue-900 mb-2">{totalOrders}</div>
                            <div className="flex items-center text-sm text-blue-700 font-medium">
                                <Target className="h-4 w-4 mr-1" />
                                <span>Orders</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-green-800">Total Revenue</CardTitle>
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl shadow-lg">
                                <DollarSign className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-900 mb-2">{formatCurrency(totalRevenue)}</div>
                            <div className="flex items-center text-sm text-green-700 font-medium">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                <span>Menu revenue</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-purple-800">Avg Order Value</CardTitle>
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl shadow-lg">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-900 mb-2">
                                {totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : '$0.00'}
                            </div>
                            <div className="flex items-center text-sm text-purple-700 font-medium">
                                <Sparkles className="h-4 w-4 mr-1" />
                                <span>Per order</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Enhanced Top Items */}
                    <Card className="border-0 bg-gradient-to-br from-white to-yellow-50 shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300 rounded-2xl">
                        <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-2xl">
                            <CardTitle className="flex items-center text-white font-bold text-lg">
                                <Trophy className="h-5 w-5 mr-2" />
                                Top Selling Items
                                <Badge className="ml-2 bg-white text-yellow-600">
                                    {topItems.length} Items
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {topItems.map((item: TopItem, index: number) => (
                                    <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer group">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-200">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">{categoryIcons[item.category as keyof typeof categoryIcons]}</span>
                                                    <span className="font-semibold text-gray-800 group-hover:text-orange-700 transition-colors duration-200">{item.name}</span>
                                                </div>
                                                <div className="text-sm text-gray-600 font-medium">
                                                    {item.total_quantity} items sold
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-orange-700 group-hover:text-orange-800 transition-colors duration-200">{formatCurrency(item.total_revenue)}</div>
                                            <div className="text-sm text-gray-600">
                                                {formatCurrency(parseFloat(item.total_revenue) / parseInt(item.total_quantity))} avg
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {topItems.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p className="text-lg font-medium">No top items data available</p>
                                        <p className="text-sm">Try adjusting your date filters</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Enhanced Category Sales */}
                    <Card className="border-0 bg-gradient-to-br from-white to-green-50 shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300 rounded-2xl">
                        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-2xl">
                            <CardTitle className="flex items-center text-white font-bold text-lg">
                                <PieChart className="h-5 w-5 mr-2" />
                                Sales by Category
                                <Badge className="ml-2 bg-white text-green-600">
                                    {salesByCategory.length} Categories
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {salesByCategory.map((category: CategorySales) => (
                                    <div key={category.category} className="space-y-3 p-3 rounded-lg bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg group-hover:scale-110 transition-transform duration-200">{categoryIcons[category.category as keyof typeof categoryIcons]}</span>
                                                <span className="font-semibold text-gray-800 capitalize group-hover:text-green-700 transition-colors duration-200">{category.category}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg text-green-700 group-hover:text-green-800 transition-colors duration-200">{formatCurrency(category.total_revenue)}</div>
                                                <div className="text-sm text-gray-600">
                                                    {category.total_orders} orders • {category.total_quantity} items
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500 group-hover:from-green-500 group-hover:to-emerald-600"
                                                style={{ width: `${totalRevenue > 0 ? (parseFloat(category.total_revenue) / totalRevenue) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-600 text-right font-medium">
                                            {totalRevenue > 0 ? ((parseFloat(category.total_revenue) / totalRevenue) * 100).toFixed(1) : '0'}% of total sales
                                        </div>
                                    </div>
                                ))}
                                {salesByCategory.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p className="text-lg font-medium">No category data available</p>
                                        <p className="text-sm">Try adjusting your date filters</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Enhanced Hourly Sales Pattern */}
                <Card className="border-0 bg-gradient-to-br from-white to-blue-50 shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300 rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-2xl">
                        <CardTitle className="flex items-center text-white font-bold text-lg">
                            <Clock className="h-5 w-5 mr-2" />
                            Hourly Sales Pattern
                            <Badge className="ml-2 bg-white text-blue-600">
                                {hourlySales.length} Hours
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-3">
                            {hourlySales.map((hour: HourlySale, index: number) => {
                                const maxSales = Math.max(...hourlySales.map(h => parseFloat(h.total_sales)));
                                const currentSales = parseFloat(hour.total_sales);
                                const intensity = maxSales > 0 ? currentSales / maxSales : 0;
                                
                                // Enhanced color based on sales intensity
                                let bgColor = 'bg-gray-100';
                                let textColor = 'text-gray-700';
                                let borderColor = 'border-gray-200';
                                let iconEmoji = '🕐';
                                
                                if (intensity > 0.7) {
                                    bgColor = 'bg-gradient-to-r from-green-50 to-emerald-50';
                                    textColor = 'text-green-800';
                                    borderColor = 'border-green-300';
                                    iconEmoji = '🔥';
                                } else if (intensity > 0.4) {
                                    bgColor = 'bg-gradient-to-r from-blue-50 to-indigo-50';
                                    textColor = 'text-blue-800';
                                    borderColor = 'border-blue-300';
                                    iconEmoji = '📈';
                                } else if (intensity > 0.2) {
                                    bgColor = 'bg-gradient-to-r from-yellow-50 to-amber-50';
                                    textColor = 'text-yellow-800';
                                    borderColor = 'border-yellow-300';
                                    iconEmoji = '📊';
                                }
                                
                                return (
                                    <div 
                                        key={hour.hour} 
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 ${borderColor} ${bgColor} transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer group`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`flex items-center justify-center w-16 h-12 rounded-xl ${bgColor} border-2 ${borderColor} ${textColor} text-sm font-bold shadow-md group-hover:scale-110 transition-transform duration-200`}>
                                                <Clock className="h-5 w-5 mr-1" />
                                                {hour.hour}:00
                                            </div>
                                            <div>
                                                <span className={`font-bold text-lg ${textColor} group-hover:scale-105 transition-transform duration-200`}>{hour.total_orders} orders</span>
                                                <div className="text-sm text-gray-600 font-medium">
                                                    {iconEmoji} {intensity > 0.7 ? 'Peak hour' : intensity > 0.4 ? 'Busy' : intensity > 0.2 ? 'Moderate' : 'Quiet'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-bold text-xl ${textColor} group-hover:scale-105 transition-transform duration-200`}>{formatCurrency(hour.total_sales)}</div>
                                            <div className="text-sm text-gray-600">
                                                {hour.total_orders > 0 ? formatCurrency(parseFloat(hour.total_sales) / hour.total_orders) : '$0.00'} avg
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {hourlySales.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">No hourly sales data available</p>
                                    <p className="text-sm">Try adjusting your date filters</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
