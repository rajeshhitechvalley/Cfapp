import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, Trash2, CheckCircle, Calendar, Users, Clock, Coffee, Star, Zap, Award } from 'lucide-react';
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
        case 'pending': return 'bg-orange-100 text-orange-800';
        case 'confirmed': return 'bg-blue-100 text-blue-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        case 'completed': return 'bg-green-100 text-green-800';
        case 'no_show': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default function ReservationsIndex({ reservations }: ReservationsIndexProps) {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reservations" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Reservations</h1>
                    <Link href="/reservations/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Reservation
                        </Button>
                    </Link>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>All Reservations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4">Customer</th>
                                        <th className="text-left p-4">Contact</th>
                                        <th className="text-left p-4">Party Size</th>
                                        <th className="text-left p-4">Date & Time</th>
                                        <th className="text-left p-4">Table</th>
                                        <th className="text-left p-4">Status</th>
                                        <th className="text-left p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations.data.map((reservation) => (
                                        <tr key={reservation.id} className="border-b hover:bg-accent/50 transition-colors duration-150">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">{reservation.customer_name}</p>
                                                    {reservation.user && (
                                                        <p className="text-sm text-gray-500">Registered user</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="text-sm">{reservation.customer_email}</p>
                                                    {reservation.customer_phone && (
                                                        <p className="text-xs text-gray-500">{reservation.customer_phone}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p>{reservation.party_size} guests</p>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="text-sm">{new Date(reservation.reservation_date).toLocaleDateString()}</p>
                                                    <p className="text-xs text-gray-500">{new Date(reservation.reservation_date).toLocaleTimeString()}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">{reservation.table?.table_number || 'N/A'}</p>
                                                    <p className="text-xs text-gray-500">{reservation.table?.tableType?.name || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={getStatusColor(reservation.status)}>
                                                    {reservation.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/reservations/${reservation.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/reservations/${reservation.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {reservation.status === 'pending' && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleConfirm(reservation.id)}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {reservation.status !== 'cancelled' && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleDelete(reservation.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {reservations.data.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">No reservations found</p>
                                <Link href="/reservations/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Your First Reservation
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
