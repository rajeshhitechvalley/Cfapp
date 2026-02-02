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

interface CreateReservationProps {
    tables: Table[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reservations',
        href: '/reservations',
    },
    {
        title: 'Create',
        href: '',
    },
];

export default function CreateReservation({ tables = [] }: CreateReservationProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        table_id: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        party_size: '',
        reservation_date: '',
        duration_minutes: '120',
        special_requests: '',
        deposit_amount: '0',
        is_walk_in: false,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/reservations', {
            onSuccess: () => reset(),
        });
    };

    const filteredTables = tables.filter(table => 
        parseInt(data.party_size) >= table.min_capacity && 
        parseInt(data.party_size) <= table.capacity
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Reservation" />
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Link href="/reservations">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Create Reservation</h1>
                </div>

                {tables.length === 0 ? (
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-center">No Tables Available</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-gray-600">
                                There are no tables available for reservation. Please add tables first.
                            </p>
                            <Link href="/tables/create">
                                <Button>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Add Your First Table
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
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
                                        placeholder="John Doe"
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
                                        placeholder="john@example.com"
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
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                                                <SelectItem key={size} value={size.toString()}>
                                                    {size} {size === 1 ? 'Guest' : 'Guests'}
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
                                        min={new Date().toISOString().slice(0, 16)}
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
                                <Select value={data.table_id} onValueChange={(value) => setData('table_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a table" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {data.party_size ? (
                                            filteredTables.length > 0 ? (
                                                filteredTables.map((table) => (
                                                    <SelectItem key={table.id} value={table.id.toString()}>
                                                        {table.table_number} - {table.tableType?.name || 'N/A'} ({table.capacity} seats)
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="disabled" disabled>
                                                    No tables available for {data.party_size} guests
                                                </SelectItem>
                                            )
                                        ) : (
                                            <SelectItem value="disabled" disabled>
                                                Select party size first
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.table_id && (
                                    <p className="text-sm text-red-600">{errors.table_id}</p>
                                )}
                                {data.party_size && filteredTables.length === 0 && (
                                    <p className="text-sm text-orange-600">
                                        No tables available for {data.party_size} guests. Please adjust party size.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="special_requests">Special Requests</Label>
                                <Textarea
                                    id="special_requests"
                                    value={data.special_requests}
                                    onChange={(e) => setData('special_requests', e.target.value)}
                                    placeholder="Any special dietary requirements, occasions, or preferences..."
                                    rows={3}
                                />
                                {errors.special_requests && (
                                    <p className="text-sm text-red-600">{errors.special_requests}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="deposit_amount">Deposit Amount ($)</Label>
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

                                <div className="flex items-center space-x-2 pt-6">
                                    <input
                                        type="checkbox"
                                        id="is_walk_in"
                                        checked={data.is_walk_in}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('is_walk_in', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="is_walk_in">Walk-in reservation</Label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Link href="/reservations">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Reservation'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                )}
            </div>
        </AppLayout>
    );
}
