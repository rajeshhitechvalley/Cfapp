import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Table, TrendingUp, Clock, CheckCircle, Coffee, Utensils, Star, Zap, Award, Activity } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface DashboardProps {
    stats: {
        total_tables: number;
        available_tables: number;
        today_reservations: number;
        active_reservations: number;
    };
    todayReservations: Array<{
        id: number;
        customer_name: string;
        party_size: number;
        reservation_date: string;
        status: string;
        table: {
            table_number: string;
            tableType: {
                name: string;
            };
        };
    }>;
    recentReservations: Array<{
        id: number;
        customer_name: string;
        party_size: number;
        reservation_date: string;
        status: string;
        table: {
            table_number: string;
        };
    }>;
    tableStatuses: Array<{
        id: number;
        table_number: string;
        name: string | null;
        capacity: number;
        status: string;
        type: string;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'available': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-900 border-green-300 font-semibold';
        case 'reserved': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-900 border-yellow-300 font-semibold';
        case 'occupied': return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-900 border-red-300 font-semibold';
        case 'maintenance': return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-900 border-gray-300 font-semibold';
        case 'confirmed': return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-900 border-blue-300 font-semibold';
        case 'pending': return 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-900 border-orange-300 font-semibold';
        default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-900 border-gray-300 font-semibold';
    }
};

export default function Dashboard({ stats, todayReservations, recentReservations, tableStatuses }: DashboardProps) {
    // Provide default values if data is missing
    const safeStats = stats || {
        total_tables: 0,
        available_tables: 0,
        today_reservations: 0,
        active_reservations: 0,
    };
    
    const safeTodayReservations = todayReservations || [];
    const safeRecentReservations = recentReservations || [];
    const safeTableStatuses = tableStatuses || [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-8 p-6">
                {/* Beautiful Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <Coffee className="h-8 w-8" />
                                <h1 className="text-4xl font-bold">Cafe Dashboard</h1>
                            </div>
                            <p className="text-indigo-100 text-lg">Welcome back! Here's your restaurant overview</p>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/calendar">
                                <Button className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Calendar
                                </Button>
                            </Link>
                            <Link href="/analytics">
                                <Button className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    Analytics
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-100">Total Tables</CardTitle>
                            <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition-transform duration-300">
                                <Table className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{safeStats.total_tables}</div>
                            <p className="text-xs text-blue-200">
                                {safeStats.available_tables} available
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-100">Today's Reservations</CardTitle>
                            <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition-transform duration-300">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{safeStats.today_reservations}</div>
                            <p className="text-xs text-purple-200">
                                {safeStats.active_reservations} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-100">Available Tables</CardTitle>
                            <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{safeStats.available_tables}</div>
                            <p className="text-xs text-green-200">
                                Ready for booking
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-orange-100">Quick Actions</CardTitle>
                            <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition-transform duration-300">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Link href="/reservations">
                                    <Button size="sm" className="w-full bg-white text-orange-600 hover:bg-orange-50 font-semibold rounded-lg">
                                        <Utensils className="mr-2 h-4 w-4" />
                                        New Reservation
                                    </Button>
                                </Link>
                                <Link href="/tables">
                                    <Button size="sm" variant="outline" className="w-full border-white/20 text-white hover:bg-white/20 backdrop-blur-sm rounded-lg">
                                        Manage Tables
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Enhanced Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl rounded-2xl">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Today's Reservations
                                <Badge className="ml-2 bg-white text-blue-600">
                                    {safeTodayReservations.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-3">
                                {safeTodayReservations.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No reservations for today</h3>
                                        <p className="text-gray-600">Time to relax or plan for tomorrow!</p>
                                    </div>
                                ) : (
                                    safeTodayReservations.map((reservation) => (
                                        <div key={reservation.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100">
                                            <div>
                                                <p className="font-semibold text-gray-900">{reservation.customer_name}</p>
                                                <p className="text-sm text-gray-600">
                                                    Table {reservation.table?.table_number || 'N/A'} • {reservation.party_size} guests
                                                </p>
                                                <p className="text-xs text-gray-500 flex items-center mt-1">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {new Date(reservation.reservation_date).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <Badge className={`${getStatusColor(reservation.status)} font-semibold px-3 py-1 rounded-full`}>
                                                {reservation.status}
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl rounded-2xl">
                        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-2xl">
                            <CardTitle className="flex items-center gap-2">
                                <Table className="h-5 w-5" />
                                Table Status
                                <Badge className="ml-2 bg-white text-green-600">
                                    {safeTableStatuses.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                {safeTableStatuses.length === 0 ? (
                                    <div className="text-center py-8 col-span-2">
                                        <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Table className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tables found</h3>
                                        <p className="text-gray-600">Add some tables to get started!</p>
                                    </div>
                                ) : (
                                    safeTableStatuses.map((table) => (
                                        <div key={table.id} className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-green-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-gray-900">{table.table_number}</span>
                                                <Badge className={`${getStatusColor(table.status)} font-semibold px-2 py-1 rounded-full`}>
                                                    {table.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {table.capacity} seats • {table.type}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
