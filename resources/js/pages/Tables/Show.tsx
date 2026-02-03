import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit, Trash2, Settings, MapPin, Users, Clock, Zap, Activity, Star, Award, Coffee } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Table {
    id: number;
    table_number: string;
    name: string | null;
    capacity: number;
    min_capacity: number;
    location: string | null;
    description: string | null;
    position: any;
    status: 'available' | 'reserved' | 'occupied' | 'maintenance';
    is_active: boolean;
    tableType?: {
        id: number;
        name: string;
        description: string | null;
        price_multiplier: number;
        is_active: boolean;
    };
    reservations: Array<{
        id: number;
        customer_name: string;
        party_size: number;
        reservation_date: string;
        status: string;
    }>;
}

interface TableShowProps {
    table: Table;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tables', href: '/tables' },
    { title: 'Table Details', href: '' },
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

export default function TableShow({ table }: TableShowProps) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this table? This action cannot be undone.')) {
            router.delete(`/tables/${table.id}`, {
                onSuccess: () => {
                    // Success message will be shown via flash message
                }
            });
        }
    };

    const handleStatusUpdate = (newStatus: string) => {
        router.post(`/tables/${table.id}/status`, { status: newStatus }, {
            onSuccess: () => {
                // Success message will be shown via flash message
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Table ${table.table_number} Details`} />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
                {/* Beautiful Header */}
                <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/tables">
                                <Button className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30 font-semibold px-4 py-2 rounded-xl shadow-lg transition-all duration-300">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="p-3 bg-white/20 rounded-xl">
                                        <Coffee className="h-6 w-6 text-white" />
                                    </div>
                                    <h1 className="text-4xl font-bold">Table {table.table_number}</h1>
                                </div>
                                {table.name && <p className="text-indigo-100 text-lg">({table.name})</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(table.status)}>
                                <div className="flex items-center space-x-1 text-gray-800 font-semibold bg-white/20 rounded-full px-1 py-1">
                                    {getStatusIcon(table.status)}
                                    <span>{table.status}</span>
                                </div>
                            </Badge>
                            {!table.is_active && (
                                <Badge variant="outline" className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                                    Inactive
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mb-8">
                    <Link href={`/tables/${table.id}/edit`}>
                        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Table
                        </Button>
                    </Link>
                    <Button 
                        onClick={handleDelete}
                        className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Table
                    </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Enhanced Table Information Card */}
                        <Card className="border-0 bg-gradient-to-r from-slate-50 to-blue-50 shadow-lg rounded-xl">
                            <CardHeader className="bg-gradient-to-r from-slate-600 to-blue-600 text-white rounded-t-xl">
                                <CardTitle className="flex items-center">
                                    <Settings className="h-5 w-5 mr-2" />
                                    Table Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <label className="text-sm font-bold text-gray-500 mb-2 block">Table Number</label>
                                        <div className="flex items-center space-x-2">
                                            <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                                                <Coffee className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <p className="text-xl font-bold text-gray-900">{table.table_number}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <label className="text-sm font-bold text-gray-500 mb-2 block">Name</label>
                                        <p className="text-lg font-semibold text-gray-700">{table.name || 'No name'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <label className="text-sm font-bold text-gray-500 mb-2 block">Capacity</label>
                                        <div className="flex items-center space-x-2">
                                            <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                                                <Users className="h-4 w-4 text-green-600" />
                                            </div>
                                            <p className="text-lg font-semibold text-gray-700">{table.min_capacity} - {table.capacity} guests</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <label className="text-sm font-bold text-gray-500 mb-2 block">Location</label>
                                        <div className="flex items-center space-x-2">
                                            <div className="p-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
                                                <MapPin className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <p className="text-lg font-semibold text-gray-700">{table.location || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                                {table.description && (
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <label className="text-sm font-bold text-gray-500 mb-2 block">Description</label>
                                        <p className="mt-1 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg text-gray-700">{table.description}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <label className="text-sm font-bold text-gray-500 mb-2 block">Status</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className={getStatusColor(table.status)}>
                                                <div className="flex items-center space-x-1">
                                                    {getStatusIcon(table.status)}
                                                    <span>{table.status}</span>
                                                </div>
                                            </Badge>
                                            <Select value={table.status} onValueChange={handleStatusUpdate}>
                                                <SelectTrigger className="text-gray-700 w-40 h-9 text-sm border-2 border-gray-200 hover:border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent className="border-2 border-gray-200 shadow-lg text-gray-900 bg-white">
                                                    <SelectItem value="available" className="font-medium">Available</SelectItem>
                                                    <SelectItem value="reserved" className="font-medium">Reserved</SelectItem>
                                                    <SelectItem value="occupied" className="font-medium">Occupied</SelectItem>
                                                    <SelectItem value="maintenance" className="font-medium">Maintenance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <label className="text-sm font-bold text-gray-500 mb-2 block">Active Status</label>
                                        <div className="mt-1">
                                            <Badge variant={table.is_active ? "default" : "outline"} className={table.is_active ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0" : "text-gray-500 border-gray-300"}>
                                                {table.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Enhanced Reservations Card */}
                        <Card className="border-0 bg-gradient-to-r from-slate-50 to-purple-50 shadow-lg rounded-xl">
                            <CardHeader className="bg-gradient-to-r from-slate-600 to-purple-600 text-white rounded-t-xl">
                                <CardTitle className="flex items-center">
                                    <Clock className="h-5 w-5 mr-2" />
                                    Recent Reservations
                                    <Badge className="ml-2 bg-white text-slate-600">
                                        {table.reservations.length} Reservations
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {table.reservations.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl border-2 border-gray-300 max-w-sm mx-auto">
                                            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <h3 className="text-lg font-bold text-gray-700 mb-1">No Reservations</h3>
                                            <p className="text-gray-600 text-sm">This table has no reservation history yet.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {table.reservations.map((reservation) => (
                                            <div key={reservation.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg">{reservation.customer_name}</p>
                                                    <p className="text-sm text-gray-600 flex items-center space-x-2 mt-1">
                                                        <Users className="h-3 w-3" />
                                                        <span>{reservation.party_size} guests</span>
                                                        <span>•</span>
                                                        <Clock className="h-3 w-3" />
                                                        <span>{new Date(reservation.reservation_date).toLocaleString()}</span>
                                                    </p>
                                                </div>
                                                <Badge className={getStatusColor(reservation.status)}>
                                                    <div className="flex items-center space-x-1">
                                                        {getStatusIcon(reservation.status)}
                                                        <span>{reservation.status}</span>
                                                    </div>
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Enhanced Table Type Card */}
                        <Card className="border-0 bg-gradient-to-r from-slate-50 to-green-50 shadow-lg rounded-xl">
                            <CardHeader className="bg-gradient-to-r from-slate-600 to-green-600 text-white rounded-t-xl">
                                <CardTitle className="flex items-center">
                                    <Star className="h-5 w-5 mr-2" />
                                    Table Type
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <label className="text-sm font-bold text-gray-500 mb-2 block">Type</label>
                                    <p className="text-xl font-bold text-gray-900">{table.tableType?.name || 'N/A'}</p>
                                </div>
                                {table.tableType?.description && (
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <label className="text-sm font-bold text-gray-500 mb-2 block">Description</label>
                                        <p className="text-gray-700">{table.tableType.description}</p>
                                    </div>
                                )}
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <label className="text-sm font-bold text-gray-500 mb-2 block">Price Multiplier</label>
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                                            <Award className="h-4 w-4 text-green-600" />
                                        </div>
                                        <p className="text-xl font-bold text-gray-900">{table.tableType?.price_multiplier || 0}x</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <label className="text-sm font-bold text-gray-500 mb-2 block">Type Status</label>
                                    <Badge variant={table.tableType?.is_active ? "default" : "outline"} className={table.tableType?.is_active ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0" : "text-gray-500 border-gray-300"}>
                                        {table.tableType?.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {table.position && (
                            <Card className="border-0 bg-gradient-to-r from-slate-50 to-orange-50 shadow-lg rounded-xl">
                                <CardHeader className="bg-gradient-to-r from-slate-600 to-orange-600 text-white rounded-t-xl">
                                    <CardTitle className="flex items-center">
                                        <MapPin className="h-5 w-5 mr-2" />
                                        Position
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {typeof table.position === 'object' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                                    <label className="text-sm font-bold text-gray-500 mb-2 block">X Position</label>
                                                    <p className="text-xl font-bold text-gray-900">{table.position.x || 'N/A'}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                                    <label className="text-sm font-bold text-gray-500 mb-2 block">Y Position</label>
                                                    <p className="text-xl font-bold text-gray-900">{table.position.y || 'N/A'}</p>
                                                </div>
                                            </div>
                                        )}
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
