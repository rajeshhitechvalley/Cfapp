import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Edit, 
    Trash2, 
    CheckCircle, 
    XCircle, 
    Calendar, 
    Users, 
    Clock, 
    Phone, 
    Mail,
    Coffee,
    Star,
    Heart,
    Zap,
    AlertCircle,
    CheckSquare,
    Timer,
    DollarSign,
    User,
    MapPin,
    CreditCard,
    Sparkles,
    Info
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Reservation {
    id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    party_size: number;
    reservation_date: string;
    end_time: string;
    duration_minutes: number;
    special_requests: string | null;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    deposit_amount: number;
    is_walk_in: boolean;
    confirmation_code: string | null;
    confirmed_at: string | null;
    cancelled_at: string | null;
    table?: {
        id: number;
        table_number: string;
        name: string | null;
        capacity: number;
        tableType?: {
            name: string;
        };
    };
    user: {
        name: string;
        email: string;
    } | null;
}

interface ReservationShowProps {
    reservation: Reservation;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reservations', href: '/reservations' },
    { title: 'Reservation Details', href: '' },
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

export default function ReservationShow({ reservation }: ReservationShowProps) {
    const handleConfirm = () => {
        router.post(`/reservations/${reservation.id}/confirm`, {}, {
            onSuccess: () => {
                // Success message will be shown via flash message
            }
        });
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this reservation?')) {
            router.delete(`/reservations/${reservation.id}`, {
                onSuccess: () => {
                    // Success message will be shown via flash message
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Reservation #${reservation.id}`} />
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                {/* Beautiful Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
                    <div className="px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link href="/reservations">
                                    <Button variant="ghost" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                </Link>
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Calendar className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold text-white">Reservation #{reservation.id}</h1>
                                        <p className="text-indigo-100 text-lg mt-1">Reservation details and management</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Badge className={`${getStatusColor(reservation.status)} px-4 py-2 text-sm font-medium border`}>
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(reservation.status)}
                                        <span className="capitalize">{reservation.status}</span>
                                    </div>
                                </Badge>
                                <div className="flex items-center space-x-2">
                                    {reservation.status === 'pending' && (
                                        <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700 text-white">
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Confirm
                                        </Button>
                                    )}
                                    <Link href={`/reservations/${reservation.id}/edit`}>
                                        <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                    </Link>
                                    {reservation.status !== 'cancelled' && (
                                        <Button variant="destructive" onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Customer Information Card */}
                            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center space-x-3 text-xl">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                            <User className="h-5 w-5 text-white" />
                                        </div>
                                        <span>Customer Information</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                                                <User className="h-4 w-4" />
                                                <span>Name</span>
                                            </label>
                                            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                                                <p className="text-lg font-semibold text-gray-900">{reservation.customer_name}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                                                <Mail className="h-4 w-4" />
                                                <span>Email</span>
                                            </label>
                                            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <Mail className="h-4 w-4 text-purple-600" />
                                                    <p className="text-gray-900">{reservation.customer_email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {reservation.customer_phone && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                                                <Phone className="h-4 w-4" />
                                                <span>Phone</span>
                                            </label>
                                            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <Phone className="h-4 w-4 text-green-600" />
                                                    <p className="text-gray-900">{reservation.customer_phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {reservation.user && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                                                <Star className="h-4 w-4" />
                                                <span>Registered User</span>
                                            </label>
                                            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <User className="h-4 w-4 text-amber-600" />
                                                    <p className="text-gray-900">{reservation.user.name}</p>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{reservation.user.email}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Reservation Details Card */}
                            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center space-x-3 text-xl">
                                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                            <Calendar className="h-5 w-5 text-white" />
                                        </div>
                                        <span>Reservation Details</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                                                <Clock className="h-4 w-4" />
                                                <span>Date & Time</span>
                                            </label>
                                            <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                                                <p className="font-semibold text-gray-900">
                                                    {new Date(reservation.reservation_date).toLocaleDateString('en-US', { 
                                                        weekday: 'long', 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    })}
                                                </p>
                                                <p className="text-sm text-indigo-600 mt-1">
                                                    {new Date(reservation.reservation_date).toLocaleTimeString('en-US', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                                                <Timer className="h-4 w-4" />
                                                <span>End Time</span>
                                            </label>
                                            <div className="p-3 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg">
                                                <p className="font-semibold text-gray-900">
                                                    {new Date(reservation.end_time).toLocaleDateString('en-US', { 
                                                        weekday: 'short', 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </p>
                                                <p className="text-sm text-pink-600 mt-1">
                                                    {new Date(reservation.end_time).toLocaleTimeString('en-US', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                                                <Users className="h-4 w-4" />
                                                <span>Party Size</span>
                                            </label>
                                            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <Users className="h-4 w-4 text-green-600" />
                                                    <p className="text-lg font-semibold text-gray-900">{reservation.party_size} guests</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                                                <Clock className="h-4 w-4" />
                                                <span>Duration</span>
                                            </label>
                                            <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <Timer className="h-4 w-4 text-blue-600" />
                                                    <p className="text-lg font-semibold text-gray-900">{reservation.duration_minutes} minutes</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {reservation.special_requests && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                                                <Star className="h-4 w-4" />
                                                <span>Special Requests</span>
                                            </label>
                                            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                                                <div className="flex items-start space-x-2">
                                                    <Heart className="h-4 w-4 text-amber-600 mt-1" />
                                                    <p className="text-gray-900 whitespace-pre-wrap">{reservation.special_requests}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                                                <Zap className="h-4 w-4" />
                                                <span>Walk-in</span>
                                            </label>
                                            <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                                                <Badge variant={reservation.is_walk_in ? "default" : "outline"} className="px-3 py-1 text-gray-900">
                                                    <div className="flex items-center space-x-1">
                                                        <Zap className="h-3 w-3" />
                                                        <span className="text-gray-700 font-medium">{reservation.is_walk_in ? 'Yes' : 'No'}</span>
                                                    </div>
                                                </Badge>
                                            </div>
                                        </div>
                                        {reservation.deposit_amount > 0 && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span>Deposit</span>
                                                </label>
                                                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                                    <div className="flex items-center space-x-2">
                                                        <DollarSign className="h-4 w-4 text-green-600" />
                                                        <p className="text-lg font-semibold text-gray-900">${parseFloat(reservation.deposit_amount || '0').toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">
                            {/* Table Information Card */}
                            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center space-x-3 text-xl">
                                        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                                            <Coffee className="h-5 w-5 text-white" />
                                        </div>
                                        <span>Table Information</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                                            <Coffee className="h-4 w-4" />
                                            <span>Table</span>
                                        </label>
                                        <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <Coffee className="h-4 w-4 text-amber-600" />
                                                <p className="text-lg font-semibold text-gray-900">{reservation.table?.table_number || 'N/A'}</p>
                                            </div>
                                            {reservation.table?.name && (
                                                <p className="text-sm text-gray-600 mt-1">{reservation.table.name}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">{reservation.table?.tableType?.name || 'N/A'}</p>
                                            <p className="text-xs text-gray-500">{reservation.table?.capacity || 0} seats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Reservation Status Card */}
                            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center space-x-3 text-xl">
                                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                                            <CheckCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <span>Status & Confirmation</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-600">Current Status</span>
                                        <Badge className={`${getStatusColor(reservation.status)} px-3 py-1 text-sm font-medium border`}>
                                            <div className="flex items-center space-x-1">
                                                {getStatusIcon(reservation.status)}
                                                <span className="capitalize">{reservation.status}</span>
                                            </div>
                                        </Badge>
                                    </div>
                                    {reservation.confirmation_code && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                                                <Info className="h-4 w-4" />
                                                <span>Confirmation Code</span>
                                            </label>
                                            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                                <p className="font-mono text-lg font-bold text-blue-800 text-center">{reservation.confirmation_code}</p>
                                            </div>
                                        </div>
                                    )}
                                    {reservation.confirmed_at && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                                                <CheckCircle className="h-4 w-4" />
                                                <span>Confirmed At</span>
                                            </label>
                                            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                                <p className="text-sm text-gray-900">
                                                    {new Date(reservation.confirmed_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {reservation.cancelled_at && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                                                <XCircle className="h-4 w-4" />
                                                <span>Cancelled At</span>
                                            </label>
                                            <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                                                <p className="text-sm text-gray-900">
                                                    {new Date(reservation.cancelled_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Actions Card */}
                            <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0 shadow-xl">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center space-x-3 text-xl">
                                        <Sparkles className="h-5 w-5" />
                                        <span>Quick Actions</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-purple-100 text-sm">
                                        Manage this reservation quickly with the actions below.
                                    </p>
                                    <div className="space-y-2">
                                        {reservation.status === 'pending' && (
                                            <Button onClick={handleConfirm} className="w-full bg-white text-purple-600 hover:bg-purple-50">
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Confirm Reservation
                                            </Button>
                                        )}
                                        <Link href={`/reservations/${reservation.id}/edit`} className="block">
                                            <Button variant="outline" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Details
                                            </Button>
                                        </Link>
                                        {reservation.status !== 'cancelled' && (
                                            <Button variant="outline" onClick={handleCancel} className="w-full bg-red-500 hover:bg-red-600 text-white border-red-400">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Cancel Reservation
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
