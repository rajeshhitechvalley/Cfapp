import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Plus,
    Edit,
    Eye,
    Trash2,
    CheckCircle,
    Calendar,
    Users,
    Clock,
    Coffee,
    Star,
    Zap,
    Award,
    Search,
    Filter,
    Phone,
    Mail,
    MapPin,
    TrendingUp,
    AlertCircle,
    CheckSquare,
    XCircle,
    User,
    ChevronRight,
    MoreVertical
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Reservation {
    id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    party_size: number;
    reservation_date: string;
    status: string;
    table?: {
        table_number: string;
        tableType?: {
            name: string;
        };
    };
    user: {
        name: string;
    } | null;
}

interface ReservationsIndexProps {
    reservations: {
        data: Reservation[];
        links: any[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reservations', href: '/reservations' },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 transition-colors';
        case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 transition-colors';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 transition-colors';
        case 'completed': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-colors';
        case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 transition-colors';
        default: return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 transition-colors';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'pending': return <Clock className="h-3 w-3" />;
        case 'confirmed': return <CheckCircle className="h-3 w-3" />;
        case 'cancelled': return <XCircle className="h-3 w-3" />;
        case 'completed': return <CheckSquare className="h-3 w-3" />;
        case 'no_show': return <AlertCircle className="h-3 w-3" />;
        default: return <Clock className="h-3 w-3" />;
    }
};

export default function ReservationsIndex({ reservations }: ReservationsIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const handleConfirm = (id: number) => {
        router.post(`/reservations/${id}/confirm`, {}, {
            onSuccess: () => {
                // Success message will be shown via flash message
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to cancel this reservation?')) {
            router.delete(`/reservations/${id}`, {
                onSuccess: () => {
                    // Success message will be shown via flash message
                }
            });
        }
    };

    // Filter reservations based on search and status
    const filteredReservations = reservations.data.filter((reservation) => {
        const matchesSearch =
            reservation.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reservation.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reservation.customer_phone?.includes(searchTerm) ||
            reservation.table?.table_number?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Calculate statistics
    const stats = {
        total: reservations.data.length,
        pending: reservations.data.filter(r => r.status === 'pending').length,
        confirmed: reservations.data.filter(r => r.status === 'confirmed').length,
        completed: reservations.data.filter(r => r.status === 'completed').length,
        cancelled: reservations.data.filter(r => r.status === 'cancelled').length,
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            full: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reservations" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                {/* Beautiful Header */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-2xl">
                    <div className="px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Calendar className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-white">Reservations</h1>
                                    <p className="text-blue-100 text-lg mt-1">Manage restaurant bookings efficiently</p>
                                </div>
                            </div>
                            <Link href="/reservations/create">
                                <Button className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Reservation
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="px-6 -mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">Total</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Calendar className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">Pending</p>
                                        <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                                    </div>
                                    <div className="p-3 bg-amber-100 rounded-full">
                                        <Clock className="h-6 w-6 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">Confirmed</p>
                                        <p className="text-3xl font-bold text-blue-600">{stats.confirmed}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <CheckCircle className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">Completed</p>
                                        <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <CheckSquare className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium">Cancelled</p>
                                        <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
                                    </div>
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <XCircle className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="px-6 mt-8">
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search by name, email, phone, or table..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-48 bg-white  border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm hover:border-gray-400 transition-colors">
                                            <SelectValue placeholder="Filter by status" className="text-gray-700" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-200 shadow-lg text-gray-700">
                                            <SelectItem value="all" className="hover:bg-gray-50 focus:bg-gray-50">
                                                <div className="flex items-center space-x-2">
                                                    <Filter className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-700 font-medium">All Status</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="pending" className="hover:bg-amber-50 focus:bg-amber-50">
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="h-4 w-4 text-amber-600" />
                                                    <span className="text-gray-700 font-medium">Pending</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="confirmed" className="hover:bg-blue-50 focus:bg-blue-50">
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                                    <span className="text-gray-700 font-medium">Confirmed</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="completed" className="hover:bg-green-50 focus:bg-green-50">
                                                <div className="flex items-center space-x-2">
                                                    <CheckSquare className="h-4 w-4 text-green-600" />
                                                    <span className="text-gray-700 font-medium">Completed</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="cancelled" className="hover:bg-red-50 focus:bg-red-50">
                                                <div className="flex items-center space-x-2">
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                    <span className="text-gray-700 font-medium">Cancelled</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="no_show" className="hover:bg-gray-50 focus:bg-gray-50">
                                                <div className="flex items-center space-x-2">
                                                    <AlertCircle className="h-4 w-4 text-gray-600" />
                                                    <span className="text-gray-700 font-medium">No Show</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="flex items-center bg-gray-300 rounded-lg p-1">
                                        <Button
                                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                            className="h-8 w-8 p-0"
                                        >
                                            <div className="grid grid-cols-2 gap-0.5">
                                                <div className="w-1 h-1 bg-current rounded-full"></div>
                                                <div className="w-1 h-1 bg-current rounded-full"></div>
                                                <div className="w-1 h-1 bg-current rounded-full"></div>
                                                <div className="w-1 h-1 bg-current rounded-full"></div>
                                            </div>
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                            className="h-8 w-8 p-0"
                                        >
                                            <div className="space-y-0.5">
                                                <div className="w-3 h-0.5 bg-current rounded-full"></div>
                                                <div className="w-3 h-0.5 bg-current rounded-full"></div>
                                                <div className="w-3 h-0.5 bg-current rounded-full"></div>
                                            </div>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Reservations Display */}
                <div className="px-6 mt-8 pb-12">
                    {filteredReservations.length === 0 ? (
                        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                            <CardContent className="p-12 text-center">
                                <div className="max-w-md mx-auto">
                                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                        <Calendar className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No reservations found</h3>
                                    <p className="text-gray-500 mb-6">
                                        {searchTerm || statusFilter !== 'all'
                                            ? 'Try adjusting your filters or search terms'
                                            : 'Get started by creating your first reservation'
                                        }
                                    </p>
                                    <Link href="/reservations/create">
                                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Your First Reservation
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className={viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                            : 'space-y-4'
                        }>
                            {filteredReservations.map((reservation) => {
                                const formattedDate = formatDate(reservation.reservation_date);
                                return (
                                    <Card
                                        key={reservation.id}
                                        className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                                    >
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                                        <User className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg text-gray-900">{reservation.customer_name}</CardTitle>
                                                        {reservation.user && (
                                                            <p className="text-xs text-blue-600 font-medium">Registered User</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <Badge className={`${getStatusColor(reservation.status)} px-3 py-1 text-xs font-medium border`}>
                                                    <div className="flex items-center space-x-1">
                                                        {getStatusIcon(reservation.status)}
                                                        <span className="capitalize">{reservation.status}</span>
                                                    </div>
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Contact Information */}
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Mail className="h-4 w-4" />
                                                    <span className="truncate">{reservation.customer_email}</span>
                                                </div>
                                                {reservation.customer_phone && (
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <Phone className="h-4 w-4" />
                                                        <span>{reservation.customer_phone}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Reservation Details */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 font-medium">Party Size</p>
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="h-4 w-4 text-blue-600" />
                                                        <span className="font-semibold text-gray-900">{reservation.party_size} guests</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 font-medium">Table</p>
                                                    <div className="flex items-center space-x-2">
                                                        <Coffee className="h-4 w-4 text-green-600" />
                                                        <span className="font-semibold text-gray-900">
                                                            {reservation.table?.table_number || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Date and Time */}
                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium">Date & Time</p>
                                                        <p className="font-semibold text-gray-900">{formattedDate.date}</p>
                                                        <p className="text-sm text-blue-600">{formattedDate.time}</p>
                                                    </div>
                                                    <Calendar className="h-5 w-5 text-blue-600" />
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center space-x-2 pt-2">
                                                <Link href={`/reservations/${reservation.id}`}>
                                                    <Button variant="outline" size="sm" className="flex-1">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                </Link>
                                                <Link href={`/reservations/${reservation.id}/edit`}>
                                                    <Button variant="outline" size="sm" className="flex-1">
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                {reservation.status === 'pending' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleConfirm(reservation.id)}
                                                        className="flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Confirm
                                                    </Button>
                                                )}
                                                {reservation.status !== 'cancelled' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(reservation.id)}
                                                        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
