import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Eye, Trash2, Settings, Coffee, Table as TableIcon, Users, Clock, Star, Zap, Award, MapPin, TrendingUp, Activity } from 'lucide-react';
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
        case 'available': return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg font-bold px-4 py-2 rounded-full';
        case 'reserved': return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 shadow-lg font-bold px-4 py-2 rounded-full';
        case 'occupied': return 'bg-gradient-to-r from-red-400 to-rose-500 text-white border-0 shadow-lg font-bold px-4 py-2 rounded-full';
        case 'maintenance': return 'bg-gradient-to-r from-gray-400 to-slate-500 text-white border-0 shadow-lg font-bold px-4 py-2 rounded-full';
        default: return 'bg-gradient-to-r from-gray-400 to-slate-500 text-white border-0 shadow-lg font-bold px-4 py-2 rounded-full';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'available': return <Zap className="h-4 w-4" />;
        case 'reserved': return <Clock className="h-4 w-4" />;
        case 'occupied': return <Users className="h-4 w-4" />;
        case 'maintenance': return <Settings className="h-4 w-4" />;
        default: return <Settings className="h-4 w-4" />;
    }
};

export default function TablesIndex({ tables, tableTypes = [] }: TablesIndexProps) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this table? This action cannot be undone.')) {
            console.log('Attempting to delete table:', id);
            router.delete(`/tables/${id}`, {
                onSuccess: () => {
                    console.log('Table deleted successfully');
                    // Success message will be shown via flash message
                },
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                    // Error message will be shown via flash message
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
            <Head title="Tables Management" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
                {/* Beautiful Header */}
                <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <TableIcon className="h-8 w-8" />
                                <h1 className="text-4xl font-bold">Tables Management</h1>
                            </div>
                            <p className="text-indigo-100 text-lg">Manage and organize restaurant tables</p>
                        </div>
                        <Link href="/tables/create">
                            <Button className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Table
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-400 to-indigo-500">
                        <CardContent className="p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 font-medium">Total Tables</p>
                                    <p className="text-3xl font-bold mt-1">{activeTables.length}</p>
                                    <p className="text-blue-200 text-sm mt-2">
                                        {tables.length - activeTables.length} inactive
                                    </p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Settings className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-green-400 to-emerald-500">
                        <CardContent className="p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 font-medium">Available</p>
                                    <p className="text-3xl font-bold mt-1">{availableTables.length}</p>
                                    <p className="text-green-200 text-sm mt-2">Ready for booking</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Zap className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-gradient-to-br from-red-400 to-rose-500">
                        <CardContent className="p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-100 font-medium">Occupied</p>
                                    <p className="text-3xl font-bold mt-1">{occupiedTables.length}</p>
                                    <p className="text-red-200 text-sm mt-2">Currently in use</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Users className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Enhanced Tables List */}
                <Card className="border-0 bg-gradient-to-r from-slate-50 to-blue-50 shadow-lg rounded-xl">
                    <CardHeader className="bg-gradient-to-r from-slate-600 to-blue-600 text-white rounded-t-xl">
                        <CardTitle className="flex items-center">
                            <TableIcon className="h-5 w-5 mr-2" />
                            All Tables
                            <Badge className="ml-2 bg-white text-slate-600">
                                {tables.length} Tables
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-slate-100 to-blue-100 border-b-2 border-slate-200">
                                    <tr className="text-left">
                                        <th className="p-4 font-bold text-slate-700">Table Number</th>
                                        <th className="p-4 font-bold text-slate-700">Name</th>
                                        <th className="p-4 font-bold text-slate-700">Type</th>
                                        <th className="p-4 font-bold text-slate-700">Capacity</th>
                                        <th className="p-4 font-bold text-slate-700">Location</th>
                                        <th className="p-4 font-bold text-slate-700">Status</th>
                                        <th className="p-4 font-bold text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tables.map((table) => (
                                        <tr key={table.id} className="border-b hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300">
                                            <td className="p-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                                                        <TableIcon className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <span className="font-bold text-gray-900 text-lg">{table.table_number}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-gray-700 font-medium">{table.name || 'No Name'}</span>
                                            </td>
                                            <td className="p-4">
                                                <Badge className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-0 font-medium">
                                                    {table.tableType?.name || 'Standard'}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center space-x-2">
                                                    <Users className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-700 font-medium">
                                                        {table.min_capacity}-{table.capacity} guests
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-700 font-medium">{table.location || 'Not Set'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getStatusColor(table.status)}>
                                                        <div className="flex items-center space-x-1">
                                                            {getStatusIcon(table.status)}
                                                            <span>{table.status}</span>
                                                        </div>
                                                    </Badge>
                                                    {!table.is_active && (
                                                        <Badge variant="outline" className="text-gray-500 border-gray-300">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/tables/${table.id}`}>
                                                        <Button variant="outline" size="sm" className="bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/tables/${table.id}/edit`}>
                                                        <Button variant="outline" size="sm" className="bg-white border-2 border-green-200 text-green-600 hover:bg-green-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Select value={table.status} onValueChange={(value) => handleStatusUpdate(table.id, value)}>
                                                        <SelectTrigger className="w-36 h-9 text-sm text-gray-900 border-2 border-gray-200 bg-white hover:border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                                                            <SelectValue placeholder="Status" />
                                                        </SelectTrigger>
                                                        <SelectContent className="border-2 border-gray-200 shadow-lg ">
                                                            <SelectItem value="available" className="font-medium">Available</SelectItem>
                                                            <SelectItem value="reserved" className="font-medium">Reserved</SelectItem>
                                                            <SelectItem value="occupied" className="font-medium">Occupied</SelectItem>
                                                            <SelectItem value="maintenance" className="font-medium">Maintenance</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleDelete(table.id)}
                                                        className="bg-white border-2 border-red-200 text-red-600 hover:bg-red-400 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
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
                            <div className="text-center py-16">
                                <div className="p-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl border-2 border-gray-300 max-w-md mx-auto">
                                    <div className="p-4 bg-white rounded-xl shadow-sm mb-4 inline-block">
                                        <TableIcon className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Tables Found</h3>
                                    <p className="text-gray-600 mb-6">Get started by adding your first table to manage your restaurant seating.</p>
                                    <Link href="/tables/create">
                                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Your First Table
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
