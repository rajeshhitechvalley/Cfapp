import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Settings, Coffee, MapPin, Users, Star, Award, Zap, Clock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface TableType {
    id: number;
    name: string;
    description: string | null;
    price_multiplier: number;
    is_active: boolean;
}

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
    table_type_id: number;
}

interface TableEditProps {
    table: Table;
    tableTypes: TableType[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tables', href: '/tables' },
    { title: 'Edit', href: '' },
];

export default function EditTable({ table, tableTypes }: TableEditProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        table_number: table.table_number,
        name: table.name || '',
        table_type_id: table.table_type_id.toString(),
        capacity: table.capacity.toString(),
        min_capacity: table.min_capacity.toString(),
        location: table.location || '',
        description: table.description || '',
        position: table.position || null,
        status: table.status,
        is_active: table.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        put(`/tables/${table.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Table" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
                {/* Beautiful Header */}
                <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
                    <div className="flex items-center gap-4">
                        <Link href="/tables">
                            <Button className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30 font-semibold px-4 py-2 rounded-xl shadow-lg transition-all duration-300">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Coffee className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold">Edit Table {table.table_number}</h1>
                                <p className="text-indigo-100 text-lg">Modify table details and settings</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Edit Form */}
                <Card className="max-w-4xl mx-auto border-0 bg-gradient-to-r from-slate-50 to-blue-50 shadow-lg rounded-xl">
                    <CardHeader className="bg-gradient-to-r from-slate-600 to-blue-600 text-white rounded-t-xl">
                        <CardTitle className="flex items-center">
                            <Settings className="h-5 w-5 mr-2" />
                            Table Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Information Section */}
                            <div className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg mr-3">
                                        <Coffee className="h-4 w-4 text-blue-600" />
                                    </div>
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="table_number" className="text-sm font-bold text-gray-700 flex items-center">
                                            <span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
                                            Table Number *
                                        </Label>
                                        <Input
                                            id="table_number"
                                            value={data.table_number}
                                            onChange={(e) => setData('table_number', e.target.value)}
                                            placeholder="T1, A1, etc."
                                            required
                                            className="border-2 border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 h-12 font-medium"
                                        />
                                        {errors.table_number && (
                                            <p className="text-sm text-red-600 font-medium">{errors.table_number}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-bold text-gray-700 flex items-center">
                                            <span className="w-1 h-4 bg-green-500 rounded-full mr-2"></span>
                                            Table Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Window Table, Corner Booth, etc."
                                            className="border-2 border-gray-200 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-xl px-4 py-3 h-12 font-medium"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600 font-medium">{errors.name}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Table Type Section */}
                            <div className="bg-gradient-to-r from-white to-purple-50 p-6 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                    <div className="p-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg mr-3">
                                        <Star className="h-4 w-4 text-purple-600" />
                                    </div>
                                    Table Type
                                </h3>
                                <div className="space-y-2">
                                    <Label htmlFor="table_type_id" className="text-sm font-bold text-gray-700 flex items-center">
                                        <span className="w-1 h-4 bg-purple-500 rounded-full mr-2"></span>
                                        Table Type *
                                    </Label>
                                    <Select value={data.table_type_id} onValueChange={(value) => setData('table_type_id', value)}>
                                        <SelectTrigger className="border-2 border-gray-200 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-3 h-12 font-medium">
                                            <SelectValue placeholder="Select table type" />
                                        </SelectTrigger>
                                        <SelectContent className="border-2 border-gray-200 shadow-lg">
                                            {tableTypes.map(type => (
                                                <SelectItem key={type.id} value={type.id.toString()} className="font-medium">
                                                    {type.name} ({type.price_multiplier}x)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.table_type_id && (
                                        <p className="text-sm text-red-600 font-medium">{errors.table_type_id}</p>
                                    )}
                                </div>
                            </div>

                            {/* Capacity Section */}
                            <div className="bg-gradient-to-r from-white to-green-50 p-6 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                    <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg mr-3">
                                        <Users className="h-4 w-4 text-green-600" />
                                    </div>
                                    Capacity Settings
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="capacity" className="text-sm font-bold text-gray-700 flex items-center">
                                            <span className="w-1 h-4 bg-green-500 rounded-full mr-2"></span>
                                            Maximum Capacity *
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
                                            className="border-2 border-gray-200 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-xl px-4 py-3 h-12 font-medium"
                                        />
                                        {errors.capacity && (
                                            <p className="text-sm text-red-600 font-medium">{errors.capacity}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="min_capacity" className="text-sm font-bold text-gray-700 flex items-center">
                                            <span className="w-1 h-4 bg-emerald-500 rounded-full mr-2"></span>
                                            Minimum Capacity *
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
                                            className="border-2 border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 h-12 font-medium"
                                        />
                                        {errors.min_capacity && (
                                            <p className="text-sm text-red-600 font-medium">{errors.min_capacity}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Location and Description Section */}
                            <div className="bg-gradient-to-r from-white to-orange-50 p-6 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                    <div className="p-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg mr-3">
                                        <MapPin className="h-4 w-4 text-orange-600" />
                                    </div>
                                    Location & Details
                                </h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="location" className="text-sm font-bold text-gray-700 flex items-center">
                                            <span className="w-1 h-4 bg-orange-500 rounded-full mr-2"></span>
                                            Location
                                        </Label>
                                        <Input
                                            id="location"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            placeholder="Main Hall, Patio, VIP Area, etc."
                                            className="border-2 border-gray-200 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl px-4 py-3 h-12 font-medium"
                                        />
                                        {errors.location && (
                                            <p className="text-sm text-red-600 font-medium">{errors.location}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-sm font-bold text-gray-700 flex items-center">
                                            <span className="w-1 h-4  rounded-full mr-2"></span>
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                            placeholder="Special features, view, accessibility, etc."
                                            rows={4}
                                            className="border-2 border-gray-200 text-gray-900  focus:ring-2 focus:ring-amber-500/20 resize-none rounded-xl px-4 py-3 font-medium bg-white"
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600 font-medium">{errors.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Settings Section */}
                            <div className="bg-gradient-to-r from-white to-red-50 p-6 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                    <div className="p-2 bg-gradient-to-r from-red-100 to-rose-100 rounded-lg mr-3">
                                        <Settings className="h-4 w-4 text-red-600" />
                                    </div>
                                    Advanced Settings
                                </h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="position" className="text-sm font-bold text-gray-700 flex items-center">
                                            <span className="w-1 h-4 bg-red-500 rounded-full mr-2"></span>
                                            Position (for floor plan)
                                        </Label>
                                        <Textarea
                                            id="position"
                                            value={data.position ? JSON.stringify(data.position) : ''}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('position', e.target.value ? JSON.parse(e.target.value) : null)}
                                            placeholder='{"x": 0, "y": 0}'
                                            rows={3}
                                            className="border-2 border-gray-200 text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 resize-none rounded-xl px-4 py-3 font-mono text-sm bg-white"
                                        />
                                        <p className="text-xs text-gray-500 font-medium">Enter position as JSON: {`{"x": 0, "y": 0}`}</p>
                                        {errors.position && (
                                            <p className="text-sm text-red-600 font-medium">{errors.position}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="status" className="text-sm font-bold text-gray-700 flex items-center">
                                                <span className="w-1 h-4 bg-rose-500 rounded-full mr-2"></span>
                                                Status *
                                            </Label>
                                            <Select value={data.status} onValueChange={(value: 'available' | 'reserved' | 'occupied' | 'maintenance') => setData('status', value)}>
                                                <SelectTrigger className="border-2 border-gray-200 text-gray-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 rounded-xl px-4 py-3 h-12 font-medium">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent className="border-2 border-gray-200 shadow-lg">
                                                    <SelectItem value="available" className="font-medium">Available</SelectItem>
                                                    <SelectItem value="reserved" className="font-medium">Reserved</SelectItem>
                                                    <SelectItem value="occupied" className="font-medium">Occupied</SelectItem>
                                                    <SelectItem value="maintenance" className="font-medium">Maintenance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && (
                                                <p className="text-sm text-red-600 font-medium">{errors.status}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-200">
                                            <input
                                                type="checkbox"
                                                id="is_active"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                                            />
                                            <Label htmlFor="is_active" className="text-sm font-bold text-gray-700 cursor-pointer">
                                                Table is active
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Action Buttons */}
                            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                <Link href={`/tables/${table.id}`}>
                                    <Button type="button" variant="outline" className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                >
                                    {processing ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Updating...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <Settings className="h-4 w-4" />
                                            <span>Update Table</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
