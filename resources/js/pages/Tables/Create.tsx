import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
    ArrowLeft, 
    Settings, 
    Table, 
    MapPin, 
    Users, 
    UserCheck, 
    CheckCircle, 
    AlertCircle, 
    Info, 
    Hash,
    Map,
    Power,
    Star,
    Crown,
    Sparkles
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface TableType {
    id: number;
    name: string;
    description: string | null;
    price_multiplier: number;
    is_active: boolean;
}

interface CreateTableProps {
    tableTypes: TableType[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tables', href: '/tables' },
    { title: 'Create', href: '/tables/create' },
];

export default function CreateTable({ tableTypes = [] }: CreateTableProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        table_number: '',
        name: '',
        table_type_id: '',
        capacity: '',
        min_capacity: '1',
        location: '',
        description: '',
        position: null,
        status: 'available',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/tables');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Table" />
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
                {/* Beautiful Header */}
                <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 shadow-2xl">
                    <div className="px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Table className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold text-white">Create New Table</h1>
                                        <p className="text-amber-100 text-lg mt-1">Add a new table to your restaurant layout</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Link href="/tables">
                                    <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Tables
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="px-6 py-8">
                    {tableTypes.length === 0 ? (
                        <Card className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="text-center space-y-6">
                                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                                        <AlertCircle className="h-10 w-10 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Table Types Available</h3>
                                        <p className="text-gray-600 mb-4">
                                            There are no table types available. Please add table types first.
                                        </p>
                                        <p className="text-sm text-gray-500 mb-6">
                                            Table types define categories like "Standard", "VIP", "Outdoor" etc.
                                        </p>
                                        <Link href="/table-types/create">
                                            <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg">
                                                <Settings className="mr-2 h-4 w-4" />
                                                Create Table Type
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                    <CardTitle className="flex items-center gap-3 text-2xl">
                                        <div className="p-2 bg-white/20 rounded-xl">
                                            <Settings className="h-6 w-6 text-white" />
                                        </div>
                                        Table Information
                                        <Sparkles className="h-5 w-5 text-yellow-300" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        {/* Basic Information Section */}
                                        <div className="space-y-6">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="p-2 bg-amber-100 rounded-lg">
                                                    <Hash className="h-5 w-5 text-amber-600" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <Label htmlFor="table_number" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                        <Hash className="h-4 w-4 text-amber-600" />
                                                        <span>Table Number *</span>
                                                    </Label>
                                                    <Input
                                                        id="table_number"
                                                        value={data.table_number}
                                                        onChange={(e) => setData('table_number', e.target.value)}
                                                        placeholder="T1, A1, etc."
                                                        required
                                                        className="bg-white border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-gray-900 placeholder:text-gray-500"
                                                    />
                                                    {errors.table_number && (
                                                        <p className="text-sm text-red-600 flex items-center space-x-1">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <span>{errors.table_number}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <Label htmlFor="name" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                        <Star className="h-4 w-4 text-amber-600" />
                                                        <span>Table Name</span>
                                                    </Label>
                                                    <Input
                                                        id="name"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        placeholder="Window Table, Corner Booth, etc."
                                                        className="bg-white border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-gray-900 placeholder:text-gray-500"
                                                    />
                                                    {errors.name && (
                                                        <p className="text-sm text-red-600 flex items-center space-x-1">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <span>{errors.name}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="table_type_id" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                    <Crown className="h-4 w-4 text-amber-600" />
                                                    <span>Table Type *</span>
                                                </Label>
                                                <Select value={data.table_type_id} onValueChange={(value) => setData('table_type_id', value)}>
                                                    <SelectTrigger className="bg-white border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-gray-900">
                                                        <SelectValue placeholder="Select table type" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-amber-200">
                                                        {tableTypes.map(type => (
                                                            <SelectItem key={type.id} value={type.id.toString()} className="text-gray-900">
                                                                {type.name} ({type.price_multiplier}x)
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.table_type_id && (
                                                    <p className="text-sm text-red-600 flex items-center space-x-1">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{errors.table_type_id}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Capacity Section */}
                                        <div className="space-y-6 border-t pt-6">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Users className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">Capacity Settings</h3>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <Label htmlFor="capacity" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                        <Users className="h-4 w-4 text-blue-600" />
                                                        <span>Maximum Capacity *</span>
                                                    </Label>
                                                    <Input
                                                        id="capacity"
                                                        type="number"
                                                        min="1"
                                                        max="20"
                                                        value={data.capacity}
                                                        onChange={(e) => setData('capacity', e.target.value)}
                                                        placeholder="4"
                                                        required
                                                        className="bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                                                    />
                                                    {errors.capacity && (
                                                        <p className="text-sm text-red-600 flex items-center space-x-1">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <span>{errors.capacity}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <Label htmlFor="min_capacity" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                        <UserCheck className="h-4 w-4 text-blue-600" />
                                                        <span>Minimum Capacity *</span>
                                                    </Label>
                                                    <Input
                                                        id="min_capacity"
                                                        type="number"
                                                        min="1"
                                                        max="20"
                                                        value={data.min_capacity}
                                                        onChange={(e) => setData('min_capacity', e.target.value)}
                                                        placeholder="1"
                                                        required
                                                        className="bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                                                    />
                                                    {errors.min_capacity && (
                                                        <p className="text-sm text-red-600 flex items-center space-x-1">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <span>{errors.min_capacity}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Location & Position Section */}
                                        <div className="space-y-6 border-t pt-6">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <MapPin className="h-5 w-5 text-green-600" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">Location & Position</h3>
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="location" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                    <MapPin className="h-4 w-4 text-green-600" />
                                                    <span>Location</span>
                                                </Label>
                                                <Input
                                                    id="location"
                                                    value={data.location}
                                                    onChange={(e) => setData('location', e.target.value)}
                                                    placeholder="Main Hall, Patio, VIP Area, etc."
                                                    className="bg-white border-green-200 focus:border-green-500 focus:ring-green-500 text-gray-900 placeholder:text-gray-500"
                                                />
                                                {errors.location && (
                                                    <p className="text-sm text-red-600 flex items-center space-x-1">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{errors.location}</span>
                                                    </p>
                                                    )}
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="description" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                    <Info className="h-4 w-4 text-green-600" />
                                                    <span>Description</span>
                                                </Label>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                                    placeholder="Special features, view, accessibility, etc."
                                                    rows={3}
                                                    className="bg-white border-green-200 focus:border-green-500 focus:ring-green-500 text-gray-900 placeholder:text-gray-500"
                                                />
                                                {errors.description && (
                                                    <p className="text-sm text-red-600 flex items-center space-x-1">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{errors.description}</span>
                                                    </p>
                                                    )}
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="position" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                    <Map className="h-4 w-4 text-green-600" />
                                                    <span>Position (for floor plan)</span>
                                                </Label>
                                                <Textarea
                                                    id="position"
                                                    value={data.position ? JSON.stringify(data.position) : ''}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('position', e.target.value ? JSON.parse(e.target.value) : null)}
                                                    placeholder='{"x": 0, "y": 0}'
                                                    rows={2}
                                                    className="bg-white border-green-200 focus:border-green-500 focus:ring-green-500 text-gray-900 placeholder:text-gray-500"
                                                />
                                                <p className="text-xs text-gray-500 flex items-center space-x-1">
                                                    <Info className="h-3 w-3" />
                                                    <span>Enter position as JSON: {`{"x": 0, "y": 0}`}</span>
                                                </p>
                                                {errors.position && (
                                                    <p className="text-sm text-red-600 flex items-center space-x-1">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{errors.position}</span>
                                                    </p>
                                                    )}
                                            </div>
                                        </div>

                                        {/* Status & Settings Section */}
                                        <div className="space-y-6 border-t pt-6">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <Power className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">Status & Settings</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <Label htmlFor="status" className="flex items-center space-x-2 text-gray-700 font-medium">
                                                        <Power className="h-4 w-4 text-purple-600" />
                                                        <span>Status *</span>
                                                    </Label>
                                                    <Select value={data.status} onValueChange={(value: 'available' | 'reserved' | 'occupied' | 'maintenance') => setData('status', value)}>
                                                        <SelectTrigger className="bg-white border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-gray-900">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white border-purple-200">
                                                            <SelectItem value="available" className="text-gray-900">Available</SelectItem>
                                                            <SelectItem value="reserved" className="text-gray-900">Reserved</SelectItem>
                                                            <SelectItem value="occupied" className="text-gray-900">Occupied</SelectItem>
                                                            <SelectItem value="maintenance" className="text-gray-900">Maintenance</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.status && (
                                                        <p className="text-sm text-red-600 flex items-center space-x-1">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <span>{errors.status}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                                                    <input
                                                        type="checkbox"
                                                        id="is_active"
                                                        checked={data.is_active}
                                                        onChange={(e) => setData('is_active', e.target.checked)}
                                                        className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                                                    />
                                                    <Label htmlFor="is_active" className="flex items-center space-x-2 text-gray-700 font-medium cursor-pointer">
                                                        <Power className="h-4 w-4 text-purple-600" />
                                                        <span>Table is active</span>
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-end space-x-4 pt-6 border-t">
                                            <Link href="/tables">
                                                <Button type="button" variant="outline" className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300">
                                                    Cancel
                                                </Button>
                                            </Link>
                                            <Button type="submit" disabled={processing} className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg">
                                                {processing ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Create Table
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
