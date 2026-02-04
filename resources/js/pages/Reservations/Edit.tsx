import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
    ArrowLeft, 
    Calendar, 
    Users, 
    Clock, 
    User,
    Phone,
    Mail,
    Coffee,
    Star,
    Zap,
    CheckCircle,
    AlertCircle,
    Info,
    Timer,
    DollarSign,
    Edit,
    Save,
    X
} from 'lucide-react';
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
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
                {/* Beautiful Header */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-2xl">
                    <div className="px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link href={`/reservations/${reservation.id}`}>
                                    <Button variant="ghost" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                </Link>
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Edit className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold text-white">Edit Reservation #{reservation.id}</h1>
                                        <p className="text-emerald-100 text-lg mt-1">Update reservation details and information</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="text-right">
                                    <p className="text-emerald-100 text-sm">Current Status</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        {data.status === 'pending' && <Clock className="h-4 w-4 text-white" />}
                                        {data.status === 'confirmed' && <CheckCircle className="h-4 w-4 text-white" />}
                                        {data.status === 'cancelled' && <X className="h-4 w-4 text-white" />}
                                        {data.status === 'completed' && <CheckCircle className="h-4 w-4 text-white" />}
                                        {data.status === 'no_show' && <AlertCircle className="h-4 w-4 text-white" />}
                                        <span className="text-white font-medium capitalize">{data.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="px-6 py-8">
                    <Card className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow">
                        <CardHeader className="pb-6">
                            <CardTitle className="flex items-center space-x-3 text-2xl">
                                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                                    <Calendar className="h-6 w-6 text-white" />
                                </div>
                                <span>Reservation Information</span>
                            </CardTitle>
                            <p className="text-gray-600 mt-2">Edit the details below to update this reservation</p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Customer Information Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                                        <User className="h-5 w-5 text-emerald-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="customer_name" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                <User className="h-4 w-4" />
                                                <span>Customer Name *</span>
                                            </Label>
                                            <Input
                                                id="customer_name"
                                                value={data.customer_name}
                                                onChange={(e) => setData('customer_name', e.target.value)}
                                                placeholder="Enter customer name"
                                                className="bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-gray-900 placeholder:text-gray-500"
                                                required
                                            />
                                            {errors.customer_name && (
                                                <p className="text-sm text-red-600 flex items-center space-x-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>{errors.customer_name}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="customer_email" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                <Mail className="h-4 w-4" />
                                                <span>Email *</span>
                                            </Label>
                                            <Input
                                                id="customer_email"
                                                type="email"
                                                value={data.customer_email}
                                                onChange={(e) => setData('customer_email', e.target.value)}
                                                placeholder="customer@example.com"
                                                className="bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-gray-900 placeholder:text-gray-500"
                                                required
                                            />
                                            {errors.customer_email && (
                                                <p className="text-sm text-red-600 flex items-center space-x-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>{errors.customer_email}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="customer_phone" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                <Phone className="h-4 w-4" />
                                                <span>Phone Number</span>
                                            </Label>
                                            <Input
                                                id="customer_phone"
                                                value={data.customer_phone}
                                                onChange={(e) => setData('customer_phone', e.target.value)}
                                                placeholder="+1 (555) 123-4567"
                                                className="bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-gray-900 placeholder:text-gray-500"
                                            />
                                            {errors.customer_phone && (
                                                <p className="text-sm text-red-600 flex items-center space-x-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>{errors.customer_phone}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="party_size" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                <Users className="h-4 w-4" />
                                                <span>Party Size *</span>
                                            </Label>
                                            <Select value={data.party_size} onValueChange={(value) => setData('party_size', value)}>
                                                <SelectTrigger className="bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                                                    <SelectValue placeholder="Select party size" className="text-gray-700" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-gray-200 shadow-lg">
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(size => (
                                                        <SelectItem key={size} value={size.toString()} className="hover:bg-emerald-50 focus:bg-emerald-50">
                                                            <div className="flex items-center space-x-2">
                                                                <Users className="h-4 w-4 text-emerald-600" />
                                                                <span className="text-gray-700 font-medium">{size} {size === 1 ? 'guest' : 'guests'}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.party_size && (
                                                <p className="text-sm text-red-600 flex items-center space-x-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>{errors.party_size}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Reservation Details Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                                        <Calendar className="h-5 w-5 text-emerald-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Reservation Details</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="reservation_date" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                <Calendar className="h-4 w-4 text-emerald-600" />
                                                <span>Date & Time *</span>
                                            </Label>
                                            <Input
                                                id="reservation_date"
                                                type="datetime-local"
                                                value={data.reservation_date}
                                                onChange={(e) => setData('reservation_date', e.target.value)}
                                                className="bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-gray-900 placeholder:text-gray-500"
                                                required
                                            />
                                            {errors.reservation_date && (
                                                <p className="text-sm text-red-600 flex items-center space-x-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>{errors.reservation_date}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="duration_minutes" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                <Timer className="h-4 w-4 text-emerald-600" />
                                                <span>Duration *</span>
                                            </Label>
                                            <Select value={data.duration_minutes} onValueChange={(value) => setData('duration_minutes', value)}>
                                                <SelectTrigger className="bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                                                    <SelectValue placeholder="Select duration" className="text-gray-700" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-gray-200 shadow-lg">
                                                    <SelectItem value="30" className="hover:bg-emerald-50 focus:bg-emerald-50">
                                                        <div className="flex items-center space-x-2">
                                                            <Clock className="h-4 w-4 text-emerald-600" />
                                                            <span className="text-gray-700 font-medium">30 minutes</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="60" className="hover:bg-emerald-50 focus:bg-emerald-50">
                                                        <div className="flex items-center space-x-2">
                                                            <Clock className="h-4 w-4 text-emerald-600" />
                                                            <span className="text-gray-700 font-medium">1 hour</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="90" className="hover:bg-emerald-50 focus:bg-emerald-50">
                                                        <div className="flex items-center space-x-2">
                                                            <Clock className="h-4 w-4 text-emerald-600" />
                                                            <span className="text-gray-700 font-medium">1.5 hours</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="120" className="hover:bg-emerald-50 focus:bg-emerald-50">
                                                        <div className="flex items-center space-x-2">
                                                            <Clock className="h-4 w-4 text-emerald-600" />
                                                            <span className="text-gray-700 font-medium">2 hours</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="150" className="hover:bg-emerald-50 focus:bg-emerald-50">
                                                        <div className="flex items-center space-x-2">
                                                            <Clock className="h-4 w-4 text-emerald-600" />
                                                            <span className="text-gray-700 font-medium">2.5 hours</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="180" className="hover:bg-emerald-50 focus:bg-emerald-50">
                                                        <div className="flex items-center space-x-2">
                                                            <Clock className="h-4 w-4 text-emerald-600" />
                                                            <span className="text-gray-700 font-medium">3 hours</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="240" className="hover:bg-emerald-50 focus:bg-emerald-50">
                                                        <div className="flex items-center space-x-2">
                                                            <Clock className="h-4 w-4 text-emerald-600" />
                                                            <span className="text-gray-700 font-medium">4 hours</span>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.duration_minutes && (
                                                <p className="text-sm text-red-600 flex items-center space-x-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>{errors.duration_minutes}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="table_id" className="flex items-center space-x-2 text-gray-700 font-medium">
                                            <Coffee className="h-4 w-4 text-emerald-600" />
                                            <span>Preferred Table *</span>
                                        </Label>
                                        <Select 
                                            value={data.table_id} 
                                            onValueChange={(value) => setData('table_id', value)}
                                            disabled={filteredTables.length === 0}
                                        >
                                            <SelectTrigger className="bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                                                <SelectValue placeholder="Select a table" className="text-gray-700" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-gray-200 shadow-lg">
                                                {filteredTables.map(table => (
                                                    <SelectItem key={table.id} value={table.id.toString()} className="hover:bg-emerald-50 focus:bg-emerald-50">
                                                        <div className="flex items-center space-x-2">
                                                            <Coffee className="h-4 w-4 text-emerald-600" />
                                                            <span className="text-gray-700 font-medium">{table.table_number} - {table.tableType?.name || 'Standard'} ({table.capacity} seats)</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {filteredTables.length === 0 && (
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                <div className="flex items-center space-x-2 text-amber-800">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span className="text-sm">
                                                        No tables available for {data.party_size} guests. Please adjust party size.
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        {errors.table_id && (
                                            <p className="text-sm text-red-600 flex items-center space-x-1">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>{errors.table_id}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status" className="flex items-center space-x-2 text-gray-700 font-medium">
                                            <Info className="h-4 w-4 text-emerald-600" />
                                            <span>Status *</span>
                                        </Label>
                                        <Select value={data.status} onValueChange={(value: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show') => setData('status', value)}>
                                            <SelectTrigger className="bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                                                <SelectValue placeholder="Select status" className="text-gray-700" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-gray-200 shadow-lg">
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
                                                <SelectItem value="cancelled" className="hover:bg-red-50 focus:bg-red-50">
                                                    <div className="flex items-center space-x-2">
                                                        <X className="h-4 w-4 text-red-600" />
                                                        <span className="text-gray-700 font-medium">Cancelled</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="completed" className="hover:bg-green-50 focus:bg-green-50">
                                                    <div className="flex items-center space-x-2">
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                        <span className="text-gray-700 font-medium">Completed</span>
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
                                        {errors.status && (
                                            <p className="text-sm text-red-600 flex items-center space-x-1">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>{errors.status}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Additional Information Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                                        <Star className="h-5 w-5 text-emerald-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="special_requests" className="flex items-center space-x-2 text-gray-700 font-medium">
                                            <Star className="h-4 w-4 text-emerald-600" />
                                            <span>Special Requests</span>
                                        </Label>
                                        <Textarea
                                            id="special_requests"
                                            value={data.special_requests}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('special_requests', e.target.value)}
                                            placeholder="Any special requests or dietary requirements... We'll do our best to accommodate! 🎉"
                                            rows={4}
                                            className="bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-gray-900 placeholder:text-gray-500"
                                        />
                                        {errors.special_requests && (
                                            <p className="text-sm text-red-600 flex items-center space-x-1">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>{errors.special_requests}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="deposit_amount" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                <DollarSign className="h-4 w-4 text-emerald-600" />
                                                <span>Deposit Amount</span>
                                            </Label>
                                            <Input
                                                id="deposit_amount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.deposit_amount}
                                                onChange={(e) => setData('deposit_amount', e.target.value)}
                                                placeholder="0.00"
                                                className="bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-gray-900 placeholder:text-gray-500"
                                            />
                                            {errors.deposit_amount && (
                                                <p className="text-sm text-red-600 flex items-center space-x-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>{errors.deposit_amount}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-3 pt-6">
                                            <input
                                                type="checkbox"
                                                id="is_walk_in"
                                                checked={data.is_walk_in}
                                                onChange={(e) => setData('is_walk_in', e.target.checked)}
                                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                            <Label htmlFor="is_walk_in" className="flex items-center space-x-2 text-gray-700 font-medium cursor-pointer">
                                                <Zap className="h-4 w-4 text-emerald-600" />
                                                <span>Walk-in reservation</span>
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between items-center pt-6 border-t">
                                    <Link href={`/reservations/${reservation.id}`}>
                                        <Button type="button" variant="outline" className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300">
                                            <X className="mr-2 h-4 w-4" />
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Update Reservation
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
