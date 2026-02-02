import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Settings, MapPin, Users } from 'lucide-react';
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
        case 'available': return 'bg-green-100 text-green-800';
        case 'reserved': return 'bg-yellow-100 text-yellow-800';
        case 'occupied': return 'bg-red-100 text-red-800';
        case 'maintenance': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
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
            <Head title={`Table ${table.table_number}`} />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/tables">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">Table {table.table_number}</h1>
                        {table.name && <span className="text-xl text-gray-500">({table.name})</span>}
                        <Badge className={getStatusColor(table.status)}>
                            {table.status}
                        </Badge>
                        {!table.is_active && (
                            <Badge variant="outline" className="text-gray-500">
                                Inactive
                            </Badge>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/tables/${table.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Table Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Table Number</label>
                                        <p className="text-lg font-semibold">{table.table_number}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Name</label>
                                        <p>{table.name || 'No name'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Capacity</label>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            <p>{table.min_capacity} - {table.capacity} guests</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Location</label>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            <p>{table.location || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                                {table.description && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Description</label>
                                        <p className="mt-1 p-3 bg-gray-50 rounded-lg">{table.description}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Status</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className={getStatusColor(table.status)}>
                                                {table.status}
                                            </Badge>
                                            <select 
                                                value={table.status} 
                                                onChange={(e) => handleStatusUpdate(e.target.value)}
                                                className="text-sm border rounded px-2 py-1"
                                            >
                                                <option value="available">Available</option>
                                                <option value="reserved">Reserved</option>
                                                <option value="occupied">Occupied</option>
                                                <option value="maintenance">Maintenance</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Active</label>
                                        <div className="mt-1">
                                            <Badge variant={table.is_active ? "default" : "outline"}>
                                                {table.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Reservations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {table.reservations.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No reservations found</p>
                                ) : (
                                    <div className="space-y-3">
                                        {table.reservations.map((reservation) => (
                                            <div key={reservation.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{reservation.customer_name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {reservation.party_size} guests • {new Date(reservation.reservation_date).toLocaleString()}
                                                    </p>
                                                </div>
                                                <Badge className={getStatusColor(reservation.status)}>
                                                    {reservation.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Table Type</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Type</label>
                                    <p className="text-lg font-semibold">{table.tableType?.name || 'N/A'}</p>
                                </div>
                                {table.tableType?.description && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Description</label>
                                        <p className="text-sm">{table.tableType.description}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Price Multiplier</label>
                                    <p>{table.tableType?.price_multiplier || 0}x</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Type Status</label>
                                    <Badge variant={table.tableType?.is_active ? "default" : "outline"}>
                                        {table.tableType?.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {table.position && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Position</CardTitle>
                                </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {typeof table.position === 'object' && (
                                        <>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">X Position</label>
                                                <p>{table.position.x || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Y Position</label>
                                                <p>{table.position.y || 'N/A'}</p>
                                            </div>
                                        </>
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
