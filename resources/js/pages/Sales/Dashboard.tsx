import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Clock, Users, Utensils, Star, Coffee, Zap, Award, Activity, Target, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useCurrency } from '@/components/currency-switcher';
import type { BreadcrumbItem } from '@/types';

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
}

interface TopItem {
    name: string;
    category: string;
    total_quantity: number;
    total_revenue: string;
    order_count: number;
}

interface CategorySales {
    category: string;
    total_revenue: string;
    order_count: number;
    percentage: number;
}

interface Props {
    stats: {
        todaySales: number;
        yesterdaySales: number;
        thisMonthSales: number;
        lastMonthSales: number;
        todayOrders: number;
        activeOrders: number;
        salesGrowth: number;
        monthlyGrowth: number;
    };
    topItemsToday: TopItem[];
    salesByCategoryToday: CategorySales[];
    recentOrders: Order[];
}

const categoryIcons = {
    tea: '🍵',
    snack: '🍟',
    cake: '🍰',
    pizza: '🍕',
};

const statusColors = {
    pending: 'bg-gradient-to-r from-yellow-200 to-orange-200 text-yellow-900 border-yellow-300 font-semibold px-3 py-1 rounded-full',
    preparing: 'bg-gradient-to-r from-blue-200 to-indigo-200 text-blue-900 border-blue-300 font-semibold px-3 py-1 rounded-full',
    ready: 'bg-gradient-to-r from-purple-200 to-pink-200 text-purple-900 border-purple-300 font-semibold px-3 py-1 rounded-full',
    served: 'bg-gradient-to-r from-green-200 to-emerald-200 text-green-900 border-green-300 font-semibold px-3 py-1 rounded-full',
    completed: 'bg-gradient-to-r from-gray-200 to-slate-200 text-gray-900 border-gray-300 font-semibold px-3 py-1 rounded-full',
    cancelled: 'bg-gradient-to-r from-red-200 to-rose-200 text-red-900 border-red-300 font-semibold px-3 py-1 rounded-full',
};

export default function SalesDashboard({ stats, topItemsToday, salesByCategoryToday, recentOrders }: Props) {
    const { formatCurrency } = useCurrency();

    const formatPercentage = (value: number) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sales Dashboard', href: '/sales/dashboard' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales Dashboard" />

            <div className="space-y-8">
                {/* Enhanced Header */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
                                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200">
                                    Sales Dashboard
                                </h1>
                            </div>
                            <p className="text-blue-100 text-lg font-medium">Real-time sales analytics and business insights</p>
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

                {/* Enhanced Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-green-800">Today's Sales</CardTitle>
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl shadow-lg">
                                <DollarSign className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-900 mb-2">{formatCurrency(stats.todaySales)}</div>
                            <div className="flex items-center text-sm">
                                {stats.salesGrowth >= 0 ? (
                                    <ArrowUpRight className="h-4 w-4 mr-1 text-green-600" />
                                ) : (
                                    <ArrowDownRight className="h-4 w-4 mr-1 text-red-600" />
                                )}
                                <span className={`font-semibold ${stats.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatPercentage(stats.salesGrowth)} from yesterday
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-blue-800">Today's Orders</CardTitle>
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-xl shadow-lg">
                                <ShoppingCart className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-900 mb-2">{stats.todayOrders}</div>
                            <div className="flex items-center text-sm text-blue-700">
                                <Clock className="h-4 w-4 mr-1" />
                                <span className="font-medium">Avg: {stats.todayOrders > 0 ? formatCurrency(stats.todaySales / stats.todayOrders) : '$0.00'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-purple-800">Active Orders</CardTitle>
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl shadow-lg">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-900 mb-2">{stats.activeOrders}</div>
                            <div className="flex items-center text-sm text-purple-700">
                                <Activity className="h-4 w-4 mr-1 animate-pulse" />
                                <span className="font-medium">Currently being processed</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-orange-50 to-amber-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-orange-800">Monthly Growth</CardTitle>
                            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-2 rounded-xl shadow-lg">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-900 mb-2">{formatCurrency(stats.thisMonthSales)}</div>
                            <div className="flex items-center text-sm">
                                {stats.monthlyGrowth >= 0 ? (
                                    <ArrowUpRight className="h-4 w-4 mr-1 text-green-600" />
                                ) : (
                                    <ArrowDownRight className="h-4 w-4 mr-1 text-red-600" />
                                )}
                                <span className={`font-semibold ${stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatPercentage(stats.monthlyGrowth)} from last month
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Enhanced Top Items Today */}
                    <Card className="border-0 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 rounded-2xl">
                        <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-2xl">
                            <CardTitle className="flex items-center text-white font-bold">
                                <Award className="h-6 w-6 mr-2" />
                                Top Items Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {topItemsToday.map((item, index) => (
                                    <div key={item.name} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-orange-100">
                                        <div className="flex items-center space-x-3">
                                            <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-lg shadow-lg ${
                                                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-400' :
                                                index === 1 ? 'bg-gradient-to-r from-gray-400 to-slate-400' :
                                                index === 2 ? 'bg-gradient-to-r from-orange-400 to-amber-400' :
                                                'bg-gradient-to-r from-blue-400 to-indigo-400'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-2xl">{categoryIcons[item.category as keyof typeof categoryIcons]}</span>
                                                    <span className="font-bold text-gray-800">{item.name}</span>
                                                </div>
                                                <div className="text-sm text-gray-600 font-medium">
                                                    {item.order_count} orders • {item.total_quantity} items
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-green-600">{formatCurrency(parseFloat(item.total_revenue))}</div>
                                            <div className="text-sm text-gray-600 font-medium">
                                                {formatCurrency(parseFloat(item.total_revenue) / item.order_count)} avg
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {topItemsToday.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <Coffee className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                        <div className="text-lg font-medium">No sales data available for today</div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Enhanced Sales by Category */}
                    <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 rounded-2xl">
                        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-2xl">
                            <CardTitle className="flex items-center text-white font-bold">
                                <DollarSign className="h-6 w-6 mr-2" />
                                Sales by Category Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {salesByCategoryToday.map((category) => (
                                    <div key={category.category} className="space-y-3 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-2 rounded-lg">
                                                    <span className="text-2xl">{categoryIcons[category.category as keyof typeof categoryIcons]}</span>
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-800 capitalize">{category.category}</span>
                                                    <div className="text-sm text-gray-600 font-medium">{category.order_count} orders</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg text-green-600">{formatCurrency(parseFloat(category.total_revenue))}</div>
                                                <div className="text-sm text-gray-600 font-medium">{category.percentage.toFixed(1)}% of total</div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                                                style={{ width: `${category.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {salesByCategoryToday.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <PieChart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                        <div className="text-lg font-medium">No sales data available for today</div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Enhanced Recent Orders */}
                <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-2xl">
                        <CardTitle className="flex items-center text-white font-bold">
                            <Clock className="h-6 w-6 mr-2" />
                            Recent Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-purple-100">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-xl">
                                            <ShoppingCart className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800 text-lg">{order.order_number}</div>
                                            <div className="text-sm text-gray-600 font-medium">
                                                {order.table?.table_number} {order.table?.name && `- ${order.table?.name}`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-green-600">
                                                {formatCurrency(order.order_items.reduce((sum, item) => sum + parseFloat(item.total_price), 0))}
                                            </div>
                                            <div className="text-sm text-gray-600 font-medium">
                                                {order.order_items.length} items
                                            </div>
                                        </div>
                                        <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            {recentOrders.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                    <div className="text-lg font-medium">No recent orders</div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
