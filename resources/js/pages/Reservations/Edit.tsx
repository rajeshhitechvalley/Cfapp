import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Textarea from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Users, Clock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Table {
    id: number;
    table_number: string;
    name: string | null;
    capacity: number;
    min_capacity: number;
    tableType?: {
        name: string;
    };
}

interface Reservation {
    id: number;
    table_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    party_size: number;
    reservation_date: string;
    duration_minutes: number;
    special_requests: string | null;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    deposit_amount: number;
    is_walk_in: boolean;
}

interface ReservationEditProps {
    reservation: Reservation;
    tables: Table[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reservations', href: '/reservations' },
    { title: 'Edit', href: '' },
];

export default function EditReservation({ reservation, tables }: ReservationEditProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        table_id: reservation.table_id.toString(),
        customer_name: reservation.customer_name,
        customer_email: reservation.customer_email,
        customer_phone: reservation.customer_phone || '',
        party_size: reservation.party_size.toString(),
        reservation_date: new Date(reservation.reservation_date).toISOString().slice(0, 16),
        duration_minutes: reservation.duration_minutes.toString(),
        special_requests: reservation.special_requests || '',
        status: reservation.status,
        deposit_amount: reservation.deposit_amount.toString(),
        is_walk_in: reservation.is_walk_in,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/reservations/${reservation.id}`, {
            onSuccess: () => reset(),
        });
    };

    const filteredTables = tables.filter(table => 
        parseInt(data.party_size) >= table.min_capacity && 
        parseInt(data.party_size) <= table.capacity
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Reservation" />
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Link href="/reservations">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Edit Reservation #{reservation.id}</h1>
                </div>

                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Reservation Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_name">Customer Name *</Label>
                                    <Input
                                        id="customer_name"
                                        value={data.customer_name}
                                        onChange={(e) => setData('customer_name', e.target.value)}
                                        placeholder="Enter customer name"
                                        required
                                    />
                                    {errors.customer_name && (
                                        <p className="text-sm text-red-600">{errors.customer_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="customer_email">Email *</Label>
                                    <Input
                                        id="customer_email"
                                        type="email"
                                        value={data.customer_email}
                                        onChange={(e) => setData('customer_email', e.target.value)}
                                        placeholder="customer@example.com"
                                        required
                                    />
                                    {errors.customer_email && (
                                        <p className="text-sm text-red-600">{errors.customer_email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_phone">Phone</Label>
                                    <Input
                                        id="customer_phone"
                                        value={data.customer_phone}
                                        onChange={(e) => setData('customer_phone', e.target.value)}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                    {errors.customer_phone && (
                                        <p className="text-sm text-red-600">{errors.customer_phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="party_size">Party Size *</Label>
                                    <Select value={data.party_size} onValueChange={(value) => setData('party_size', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select party size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(size => (
                                                <SelectItem key={size} value={size.toString()}>
                                                    {size} {size === 1 ? 'guest' : 'guests'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.party_size && (
                                        <p className="text-sm text-red-600">{errors.party_size}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reservation_date">Date & Time *</Label>
                                    <Input
                                        id="reservation_date"
                                        type="datetime-local"
                                        value={data.reservation_date}
                                        onChange={(e) => setData('reservation_date', e.target.value)}
                                        required
                                    />
                                    {errors.reservation_date && (
                                        <p className="text-sm text-red-600">{errors.reservation_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
                                    <Select value={data.duration_minutes} onValueChange={(value) => setData('duration_minutes', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select duration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30">30 minutes</SelectItem>
                                            <SelectItem value="60">1 hour</SelectItem>
                                            <SelectItem value="90">1.5 hours</SelectItem>
                                            <SelectItem value="120">2 hours</SelectItem>
                                            <SelectItem value="150">2.5 hours</SelectItem>
                                            <SelectItem value="180">3 hours</SelectItem>
                                            <SelectItem value="240">4 hours</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.duration_minutes && (
                                        <p className="text-sm text-red-600">{errors.duration_minutes}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="table_id">Table *</Label>
                                <Select 
                                    value={data.table_id} 
                                    onValueChange={(value) => setData('table_id', value)}
                                    disabled={filteredTables.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a table" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredTables.map(table => (
                                            <SelectItem key={table.id} value={table.id.toString()}>
                                                {table.table_number} - {table.tableType?.name || 'N/A'} ({table.capacity} seats)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {filteredTables.length === 0 && (
                                    <p className="text-sm text-orange-600">
                                        No tables available for {data.party_size} guests. Please adjust party size.
                                    </p>
                                )}
                                {errors.table_id && (
                                    <p className="text-sm text-red-600">{errors.table_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select value={data.status} onValueChange={(value: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show') => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="no_show">No Show</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="special_requests">Special Requests</Label>
                                <Textarea
                                    id="special_requests"
                                    value={data.special_requests}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('special_requests', e.target.value)}
                                    placeholder="Any special requests or dietary requirements..."
                                    rows={3}
                                />
                                {errors.special_requests && (
                                    <p className="text-sm text-red-600">{errors.special_requests}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="deposit_amount">Deposit Amount</Label>
                                    <Input
                                        id="deposit_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.deposit_amount}
                                        onChange={(e) => setData('deposit_amount', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.deposit_amount && (
                                        <p className="text-sm text-red-600">{errors.deposit_amount}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_walk_in"
                                        checked={data.is_walk_in}
                                        onChange={(e) => setData('is_walk_in', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="is_walk_in">Walk-in reservation</Label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Link href={`/reservations/${reservation.id}`}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Reservation'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
