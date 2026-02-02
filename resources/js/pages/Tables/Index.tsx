import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Eye, Trash2, Settings, Coffee, Table as TableIcon, Users, Clock, Star, Zap, Award } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Table {
    id: number;
    table_number: string;
    name: string | null;
    capacity: number;
    min_capacity: number;
    location: string | null;
    status: 'available' | 'reserved' | 'occupied' | 'maintenance';
    is_active: boolean;
    tableType?: {
        id: number;
        name: string;
        price_multiplier: number;
    };
}

interface TablesIndexProps {
    tables: Table[];
    tableTypes: Array<{
        id: number;
        name: string;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tables', href: '/tables' },
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

export default function TablesIndex({ tables, tableTypes = [] }: TablesIndexProps) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this table? This action cannot be undone.')) {
            router.delete(`/tables/${id}`, {
                onSuccess: () => {
                    // Success message will be shown via flash message
                }
            });
        }
    };

    const handleStatusUpdate = (id: number, newStatus: string) => {
        router.post(`/tables/${id}/status`, { status: newStatus }, {
            onSuccess: () => {
                // Success message will be shown via flash message
            }
        });
    };

    const activeTables = tables.filter(table => table.is_active);
    const availableTables = activeTables.filter(table => table.status === 'available');
    const occupiedTables = activeTables.filter(table => table.status === 'occupied');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tables" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Tables</h1>
                    <Link href="/tables/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Table
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeTables.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {tables.length - activeTables.length} inactive
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available</CardTitle>
                            <div className="h-4 w-4 bg-green-500 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{availableTables.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Ready for booking
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
                            <div className="h-4 w-4 bg-red-500 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{occupiedTables.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently in use
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Tables</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4">Table Number</th>
                                        <th className="text-left p-4">Name</th>
                                        <th className="text-left p-4">Type</th>
                                        <th className="text-left p-4">Capacity</th>
                                        <th className="text-left p-4">Location</th>
                                        <th className="text-left p-4">Status</th>
                                        <th className="text-left p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tables.map((table) => (
                                        <tr key={table.id} className="border-b hover:bg-accent/50 transition-colors duration-150">
                                            <td className="p-4 font-medium">{table.table_number}</td>
                                            <td className="p-4">{table.name || '-'}</td>
                                            <td className="p-4">
                                                <span className="text-sm text-gray-600">
                                                    {table.tableType?.name || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">
                                                    {table.min_capacity}-{table.capacity} guests
                                                </span>
                                            </td>
                                            <td className="p-4">{table.location || '-'}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getStatusColor(table.status)}>
                                                        {table.status}
                                                    </Badge>
                                                    {!table.is_active && (
                                                        <Badge variant="outline" className="text-gray-500">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/tables/${table.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/tables/${table.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Select value={table.status} onValueChange={(value) => handleStatusUpdate(table.id, value)}>
                                                        <SelectTrigger className="w-32 h-8 text-sm border border-input bg-background hover:bg-accent hover:border-input/80 transition-colors duration-150">
                                                            <SelectValue placeholder="Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="available">Available</SelectItem>
                                                            <SelectItem value="reserved">Reserved</SelectItem>
                                                            <SelectItem value="occupied">Occupied</SelectItem>
                                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleDelete(table.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {tables.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">No tables found</p>
                                <Link href="/tables/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Your First Table
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
