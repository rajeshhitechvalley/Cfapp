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
    MapPin,
    CreditCard,
    Coffee,
    Star,
    Zap,
    CheckCircle,
    AlertCircle,
    Info,
    Timer,
    DollarSign,
    ChefHat,
    Sparkles,
    Heart,
    ChevronRight
} from 'lucide-react';
import { useState } from 'react';
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
    const [currentStep, setCurrentStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

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
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    reset();
                    setCurrentStep(1);
                }, 3000);
            },
        });
    };

    const filteredTables = tables.filter(table => 
        parseInt(data.party_size) >= table.min_capacity && 
        parseInt(data.party_size) <= table.capacity
    );

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const isStepValid = (step: number) => {
        switch (step) {
            case 1:
                return data.customer_name && data.customer_email && data.customer_phone && data.party_size;
            case 2:
                return data.reservation_date && data.duration_minutes && data.table_id;
            case 3:
                return true; // Optional fields
            default:
                return false;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Reservation" />
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
                {/* Beautiful Header */}
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 shadow-2xl">
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
                                        <h1 className="text-4xl font-bold text-white">Create Reservation</h1>
                                        <p className="text-purple-100 text-lg mt-1">Book your perfect dining experience</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {[1, 2, 3].map((step) => (
                                    <div key={step} className="flex items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                                            currentStep >= step 
                                                ? 'bg-white text-purple-600 shadow-lg' 
                                                : 'bg-white/20 text-white border-2 border-white/30'
                                        }`}>
                                            {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
                                        </div>
                                        {step < 3 && (
                                            <div className={`w-16 h-1 mx-2 transition-all ${
                                                currentStep > step ? 'bg-white' : 'bg-white/30'
                                            }`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div className="fixed top-4 right-4 z-50 animate-pulse">
                        <Card className="bg-green-50 border-green-200 shadow-lg">
                            <CardContent className="p-4 flex items-center space-x-3">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                                <div>
                                    <p className="font-semibold text-green-800">Reservation Created!</p>
                                    <p className="text-sm text-green-600">Your reservation has been successfully created.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="px-6 py-8">
                    {tables.length === 0 ? (
                        <Card className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                            <CardContent className="p-12 text-center">
                                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <Coffee className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tables Available</h3>
                                <p className="text-gray-500 mb-6">
                                    There are no tables available for reservation. Please add tables first.
                                </p>
                                <Link href="/tables/create">
                                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                                        <Coffee className="mr-2 h-4 w-4" />
                                        Add Your First Table
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                            <CardHeader className="pb-6">
                                <div className="text-center">
                                    <CardTitle className="text-2xl text-gray-900 mb-2">
                                        {currentStep === 1 && 'Customer Information'}
                                        {currentStep === 2 && 'Reservation Details'}
                                        {currentStep === 3 && 'Special Requests'}
                                    </CardTitle>
                                    <p className="text-gray-600">
                                        {currentStep === 1 && 'Tell us about yourself'}
                                        {currentStep === 2 && 'When would you like to dine?'}
                                        {currentStep === 3 && 'Any special preferences?'}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Step 1: Customer Information */}
                                    {currentStep === 1 && (
                                        <div className="space-y-6">
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
                                                        placeholder="John Doe"
                                                        className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
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
                                                        placeholder="john@example.com"
                                                        className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
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
                                                        className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-gray-900 placeholder:text-gray-500"
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
                                                        <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white">
                                                            <SelectValue placeholder="Select party size" className="text-gray-700" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white border-gray-200 shadow-lg">
                                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                                                                <SelectItem key={size} value={size.toString()} className="hover:bg-purple-50 focus:bg-purple-50">
                                                                    <div className="flex items-center space-x-2">
                                                                        <Users className="h-4 w-4 text-purple-600" />
                                                                        <span className="text-gray-700 font-medium">{size} {size === 1 ? 'Guest' : 'Guests'}</span>
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
                                    )}

                                    {/* Step 2: Reservation Details */}
                                    {currentStep === 2 && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="reservation_date" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                        <Calendar className="h-4 w-4 text-purple-600" />
                                                        <span>Date & Time *</span>
                                                    </Label>
                                                    <Input
                                                        id="reservation_date"
                                                        type="datetime-local"
                                                        value={data.reservation_date}
                                                        onChange={(e) => setData('reservation_date', e.target.value)}
                                                        min={new Date().toISOString().slice(0, 16)}
                                                        className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white text-gray-700 placeholder:text-gray-500"
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
                                                        <Timer className="h-4 w-4 text-purple-600" />
                                                        <span>Duration *</span>
                                                    </Label>
                                                    <Select value={data.duration_minutes} onValueChange={(value) => setData('duration_minutes', value)}>
                                                        <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white">
                                                            <SelectValue placeholder="Select duration" className="text-gray-700" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white border-gray-200 shadow-lg">
                                                            <SelectItem value="60" className="hover:bg-purple-50 focus:bg-purple-50">
                                                                <div className="flex items-center space-x-2">
                                                                    <Clock className="h-4 w-4 text-purple-600" />
                                                                    <span className="text-gray-700 font-medium">1 hour</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="90" className="hover:bg-purple-50 focus:bg-purple-50">
                                                                <div className="flex items-center space-x-2">
                                                                    <Clock className="h-4 w-4 text-purple-600" />
                                                                    <span className="text-gray-700 font-medium">1.5 hours</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="120" className="hover:bg-purple-50 focus:bg-purple-50">
                                                                <div className="flex items-center space-x-2">
                                                                    <Clock className="h-4 w-4 text-purple-600" />
                                                                    <span className="text-gray-700 font-medium">2 hours</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="150" className="hover:bg-purple-50 focus:bg-purple-50">
                                                                <div className="flex items-center space-x-2">
                                                                    <Clock className="h-4 w-4 text-purple-600" />
                                                                    <span className="text-gray-700 font-medium">2.5 hours</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="180" className="hover:bg-purple-50 focus:bg-purple-50">
                                                                <div className="flex items-center space-x-2">
                                                                    <Clock className="h-4 w-4 text-purple-600" />
                                                                    <span className="text-gray-700 font-medium">3 hours</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="240" className="hover:bg-purple-50 focus:bg-purple-50">
                                                                <div className="flex items-center space-x-2">
                                                                    <Clock className="h-4 w-4 text-purple-600" />
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
                                                    <Coffee className="h-4 w-4" />
                                                    <span>Preferred Table *</span>
                                                </Label>
                                                <Select value={data.table_id} onValueChange={(value) => setData('table_id', value)}>
                                                    <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 bg-white">
                                                        <SelectValue placeholder="Select a table" className="text-gray-700" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-gray-200 shadow-lg">
                                                        {data.party_size ? (
                                                            filteredTables.length > 0 ? (
                                                                filteredTables.map((table) => (
                                                                    <SelectItem key={table.id} value={table.id.toString()} className="hover:bg-purple-50 focus:bg-purple-50">
                                                                        <div className="flex items-center space-x-2">
                                                                            <Coffee className="h-4 w-4 text-purple-600" />
                                                                            <span className="text-gray-700 font-medium">{table.table_number} - {table.tableType?.name || 'Standard'} ({table.capacity} seats)</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem value="disabled" disabled className="text-gray-500">
                                                                    <div className="flex items-center space-x-2">
                                                                        <AlertCircle className="h-4 w-4 text-orange-600" />
                                                                        <span className="text-gray-700 font-medium">No tables available for {data.party_size} guests</span>
                                                                    </div>
                                                                </SelectItem>
                                                            )
                                                        ) : (
                                                            <SelectItem value="disabled" disabled className="text-gray-500">
                                                                <div className="flex items-center space-x-2">
                                                                    <Info className="h-4 w-4 text-gray-600" />
                                                                    <span className="text-gray-700 font-medium">Select party size first</span>
                                                                </div>
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {errors.table_id && (
                                                    <p className="text-sm text-red-600 flex items-center space-x-1">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{errors.table_id}</span>
                                                    </p>
                                                )}
                                                {data.party_size && filteredTables.length === 0 && (
                                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                        <div className="flex items-center space-x-2 text-amber-800">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <span className="text-sm">
                                                                No tables available for {data.party_size} guests. Please adjust party size.
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Special Requests */}
                                    {currentStep === 3 && (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="special_requests" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                    <Star className="h-4 w-4" />
                                                    <span>Special Requests</span>
                                                </Label>
                                                <Textarea
                                                    id="special_requests"
                                                    value={data.special_requests}
                                                    onChange={(e) => setData('special_requests', e.target.value)}
                                                    placeholder="Any special dietary requirements, occasions (birthday, anniversary), or preferences... We'll do our best to accommodate! 🎉"
                                                    rows={4}
                                                    className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-gray-700 placeholder:text-gray-500"
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
                                                        <DollarSign className="h-4 w-4" />
                                                        <span>Deposit Amount ($)</span>
                                                    </Label>
                                                    <Input
                                                        id="deposit_amount"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={data.deposit_amount}
                                                        onChange={(e) => setData('deposit_amount', e.target.value)}
                                                        placeholder="0.00"
                                                        className="text-gray-700 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
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
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('is_walk_in', e.target.checked)}
                                                        className="bg-white w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                    />
                                                    <Label htmlFor="is_walk_in" className="flex items-center space-x-2 text-gray-700 font-medium cursor-pointer">
                                                        <Zap className="h-4 w-4" />
                                                        <span>Walk-in reservation</span>
                                                    </Label>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <Heart className="h-5 w-5 text-purple-600" />
                                                    <h3 className="font-semibold text-gray-900">Special Touches</h3>
                                                </div>
                                                <p className="text-gray-600 text-sm">
                                                    Let us know if you're celebrating a special occasion! Whether it's a birthday, anniversary, 
                                                    or just a special night out, we'd love to make it extra memorable for you.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="flex justify-between items-center pt-6 border-t">
                                        <div>
                                            {currentStep > 1 && (
                                                <Button type="button" variant="outline" onClick={prevStep}>
                                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                                    Previous
                                                </Button>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center space-x-4">
                                            {currentStep < 3 ? (
                                                <Button 
                                                    type="button" 
                                                    onClick={nextStep}
                                                    disabled={!isStepValid(currentStep)}
                                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                                >
                                                    Next Step
                                                    <ChevronRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <div className="flex items-center space-x-4">
                                                    <Link href="/reservations">
                                                        <Button type="button" variant="outline">
                                                            Cancel
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        type="submit" 
                                                        disabled={processing}
                                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                                    >
                                                        {processing ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                                Creating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Create Reservation
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
