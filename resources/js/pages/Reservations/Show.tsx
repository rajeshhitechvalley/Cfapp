import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, Calendar, Users, Clock, Phone, Mail } from 'lucide-react';
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
        case 'pending': return 'bg-orange-100 text-orange-800';
        case 'confirmed': return 'bg-blue-100 text-blue-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        case 'completed': return 'bg-green-100 text-green-800';
        case 'no_show': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
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
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/reservations">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">Reservation #{reservation.id}</h1>
                        <Badge className={getStatusColor(reservation.status)}>
                            {reservation.status}
                        </Badge>
                    </div>
                    <div className="flex gap-2">
                        {reservation.status === 'pending' && (
                            <Button onClick={handleConfirm}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm
                            </Button>
                        )}
                        <Link href={`/reservations/${reservation.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                        {reservation.status !== 'cancelled' && (
                            <Button variant="destructive" onClick={handleCancel}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Name</label>
                                        <p className="text-lg">{reservation.customer_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            <p>{reservation.customer_email}</p>
                                        </div>
                                    </div>
                                </div>
                                {reservation.customer_phone && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Phone</label>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            <p>{reservation.customer_phone}</p>
                                        </div>
                                    </div>
                                )}
                                {reservation.user && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Registered User</label>
                                        <p>{reservation.user.name} ({reservation.user.email})</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Reservation Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Date & Time</label>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <p>{new Date(reservation.reservation_date).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">End Time</label>
                                        <p>{new Date(reservation.end_time).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Party Size</label>
                                        <p>{reservation.party_size} guests</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Duration</label>
                                        <p>{reservation.duration_minutes} minutes</p>
                                    </div>
                                </div>
                                {reservation.special_requests && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Special Requests</label>
                                        <p className="mt-1 p-3 bg-gray-50 rounded-lg">{reservation.special_requests}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Walk-in</label>
                                        <Badge variant={reservation.is_walk_in ? "default" : "outline"}>
                                            {reservation.is_walk_in ? 'Yes' : 'No'}
                                        </Badge>
                                    </div>
                                    {reservation.deposit_amount > 0 && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Deposit</label>
                                            <p>${reservation.deposit_amount.toFixed(2)}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Table Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Table</label>
                                    <p>{reservation.table?.table_number || 'N/A'}</p>
                                    {reservation.table?.name && <p className="text-sm text-gray-500">{reservation.table.name}</p>}
                                    <p className="text-xs text-gray-500">{reservation.table?.tableType?.name || 'N/A'}</p>
                                    <p className="text-xs text-gray-500">{reservation.table?.capacity || 0} seats</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Reservation Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Current Status</span>
                                    <Badge className={getStatusColor(reservation.status)}>
                                        {reservation.status}
                                    </Badge>
                                </div>
                                {reservation.confirmation_code && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Confirmation Code</label>
                                        <p className="font-mono">{reservation.confirmation_code}</p>
                                    </div>
                                )}
                                {reservation.confirmed_at && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Confirmed At</label>
                                        <p>{new Date(reservation.confirmed_at).toLocaleString()}</p>
                                    </div>
                                )}
                                {reservation.cancelled_at && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Cancelled At</label>
                                        <p>{new Date(reservation.cancelled_at).toLocaleString()}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
