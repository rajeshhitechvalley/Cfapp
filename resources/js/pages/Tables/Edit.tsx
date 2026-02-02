import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Textarea from '@/components/ui/textarea';
import { ArrowLeft, Settings } from 'lucide-react';
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
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Link href="/tables">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Edit Table {table.table_number}</h1>
                </div>

                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Table Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="table_number">Table Number *</Label>
                                    <Input
                                        id="table_number"
                                        value={data.table_number}
                                        onChange={(e) => setData('table_number', e.target.value)}
                                        placeholder="T1, A1, etc."
                                        required
                                    />
                                    {errors.table_number && (
                                        <p className="text-sm text-red-600">{errors.table_number}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Table Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Window Table, Corner Booth, etc."
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="table_type_id">Table Type *</Label>
                                <Select value={data.table_type_id} onValueChange={(value) => setData('table_type_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select table type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tableTypes.map(type => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {type.name} ({type.price_multiplier}x)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.table_type_id && (
                                    <p className="text-sm text-red-600">{errors.table_type_id}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Capacity *</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={data.capacity}
                                        onChange={(e) => setData('capacity', e.target.value)}
                                        placeholder="4"
                                        required
                                    />
                                    {errors.capacity && (
                                        <p className="text-sm text-red-600">{errors.capacity}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="min_capacity">Minimum Capacity *</Label>
                                    <Input
                                        id="min_capacity"
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={data.min_capacity}
                                        onChange={(e) => setData('min_capacity', e.target.value)}
                                        placeholder="1"
                                        required
                                    />
                                    {errors.min_capacity && (
                                        <p className="text-sm text-red-600">{errors.min_capacity}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    placeholder="Main Hall, Patio, VIP Area, etc."
                                />
                                {errors.location && (
                                    <p className="text-sm text-red-600">{errors.location}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                    placeholder="Special features, view, accessibility, etc."
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="position">Position (for floor plan)</Label>
                                <Textarea
                                    id="position"
                                    value={data.position ? JSON.stringify(data.position) : ''}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('position', e.target.value ? JSON.parse(e.target.value) : null)}
                                    placeholder='{"x": 0, "y": 0}'
                                    rows={2}
                                />
                                <p className="text-xs text-gray-500">Enter position as JSON: {`{"x": 0, "y": 0}`}</p>
                                {errors.position && (
                                    <p className="text-sm text-red-600">{errors.position}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select value={data.status} onValueChange={(value: 'available' | 'reserved' | 'occupied' | 'maintenance') => setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="reserved">Reserved</SelectItem>
                                            <SelectItem value="occupied">Occupied</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="is_active">Table is active</Label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Link href={`/tables/${table.id}`}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Table'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
