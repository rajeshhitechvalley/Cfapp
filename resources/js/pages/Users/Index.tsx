import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Plus, 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    Power, 
    Eye, 
    Users, 
    Mail, 
    Phone, 
    MapPin,
    Clock,
    CheckCircle,
    Coffee, Star, Zap, Award, Activity, Shield, Crown, XCircle,
    UserPlus,
    MoreVertical,
    Building2,
    TrendingUp,
    UserCheck,
    ChefHat
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
    id: number;
    name: string;
    email: string;
    role: 'staff' | 'customer' | 'kitchen';
    phone: string | null;
    address: string | null;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
    role_display_name: string;
    avatar_url: string;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    users: PaginatedUsers;
    filters: {
        role?: string;
        active?: string;
        search?: string;
    };
    roles: Record<string, string>;
}

const roleColors = {
    staff: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600',
    customer: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600',
    kitchen: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-600',
};

const statusColors = {
    active: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-600',
    inactive: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600',
};

const roleIcons = {
    staff: Shield,
    customer: Crown,
    kitchen: ChefHat,
};

// Helper function for route generation
const route = (name: string, params?: any) => {
    const baseUrl = window.location.origin;
    const routes: Record<string, string> = {
        'users.index': '/users',
        'users.create': '/users/create',
        'users.edit': '/users',
        'users.show': '/users',
    };
    
    let url = routes[name] || `/${name}`;
    
    if (params) {
        url += `/${params}`;
    }
    
    return url;
};

export default function UsersIndex({ users, filters, roles }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [activeFilter, setActiveFilter] = useState(filters.active || 'all');

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        updateFilters({ search: value, page: 1 });
    };

    const handleRoleFilter = (value: string) => {
        setRoleFilter(value);
        updateFilters({ role: value === 'all' ? '' : value, page: 1 });
    };

    const handleActiveFilter = (value: string) => {
        setActiveFilter(value);
        updateFilters({ active: value === 'all' ? '' : value, page: 1 });
    };

    const updateFilters = (newFilters: Record<string, any>) => {
        const currentFilters = {
            search: searchTerm,
            role: roleFilter,
            active: activeFilter,
            ...newFilters,
        };

        // Remove empty filters
        const cleanedFilters = Object.fromEntries(
            Object.entries(currentFilters).filter(([_, value]) => value !== '' && value !== 'all')
        );

        router.get(route('users.index'), cleanedFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleToggleActive = (user: User) => {
        router.post(`/users/${user.id}/toggle-active`, {}, {
            onSuccess: () => {
                // Success message will be shown via flash message
            }
        });
    };

    const handleDelete = (user: User) => {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            router.delete(`/users/${user.id}`, {
                onSuccess: () => {
                    // Success message will be shown via flash message
                }
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Users', href: '/users' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Management" />
            
            <div className="min-h-screen bg-gray-50">
                {/* Simple Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                                    <p className="text-gray-600">Manage your team members</p>
                                </div>
                            </div>
                            <Link href={route('users.create')}>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Staff
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                            <div className="p-6">
                                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="text-sm font-medium text-blue-100">Total Staff</div>
                                    <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition-transform duration-300">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white">{users.total}</div>
                                <p className="text-xs text-blue-200">
                                    All team members
                                </p>
                            </div>
                        </div>
                        <div className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl">
                            <div className="p-6">
                                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="text-sm font-medium text-green-100">Active Staff</div>
                                    <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition-transform duration-300">
                                        <CheckCircle className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white">
                                    {users.data.filter(u => u.is_active).length}
                                </div>
                                <p className="text-xs text-green-200">
                                    Currently active
                                </p>
                            </div>
                        </div>
                        <div className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl">
                            <div className="p-6">
                                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="text-sm font-medium text-orange-100">Kitchen Staff</div>
                                    <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition-transform duration-300">
                                        <ChefHat className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white">
                                    {users.data.filter(u => u.role === 'kitchen').length}
                                </div>
                                <p className="text-xs text-orange-200">
                                    Kitchen team
                                </p>
                            </div>
                        </div>
                        <div className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
                            <div className="p-6">
                                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="text-sm font-medium text-purple-100">Regular Staff</div>
                                    <div className="bg-white/20 p-2 rounded-full group-hover:scale-110 transition-transform duration-300">
                                        <Shield className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white">
                                    {users.data.filter(u => u.role === 'staff').length}
                                </div>
                                <p className="text-xs text-purple-200">
                                    Support team
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search staff..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={handleRoleFilter}>
                                <SelectTrigger className="w-full lg:w-48">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {Object.entries(roles).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={activeFilter} onValueChange={handleActiveFilter}>
                                <SelectTrigger className="w-full lg:w-48">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setRoleFilter('all');
                                    setActiveFilter('all');
                                    router.get(route('users.index'));
                                }}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>

                    {/* Users Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.data.map((user) => {
                            const RoleIcon = roleIcons[user.role];
                            return (
                                <div
                                    key={user.id}
                                    className="group bg-white rounded-2xl border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                                >
                                    {/* User Header with Gradient */}
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 border-b border-gray-100">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                    <img
                                                        src={user.avatar_url}
                                                        alt={user.name}
                                                        className="h-14 w-14 rounded-2xl object-cover border-3 border-white shadow-md group-hover:shadow-lg transition-shadow"
                                                    />
                                                    <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center ${
                                                        user.is_active ? 'bg-green-500' : 'bg-red-500'
                                                    }`}>
                                                        {user.is_active ? (
                                                            <CheckCircle className="h-3 w-3 text-white" />
                                                        ) : (
                                                            <XCircle className="h-3 w-3 text-white" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        <Badge className={`${roleColors[user.role]} text-xs px-3 py-1 rounded-full shadow-sm`}>
                                                            <RoleIcon className="h-3 w-3 mr-1" />
                                                            {user.role_display_name}
                                                        </Badge>
                                                        <Badge className={`text-xs px-3 py-1 rounded-full shadow-sm ${
                                                            user.is_active 
                                                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                                                                : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                                                        }`}>
                                                            {user.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-lg border-0 shadow-lg">
                                                    <DropdownMenuItem asChild className="hover:bg-gray-50 rounded-lg">
                                                        <Link href={route('users.show', user.id)} className="flex items-center px-2 py-2">
                                                            <Eye className="h-4 w-4 mr-2 text-gray-600" />
                                                            <span className="text-gray-700">View Details</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild className="hover:bg-gray-50 rounded-lg">
                                                        <Link href={route('users.edit', user.id)} className="flex items-center px-2 py-2">
                                                            <Edit className="h-4 w-4 mr-2 text-gray-600" />
                                                            <span className="text-gray-700">Edit</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleActive(user)}
                                                        className={`hover:bg-gray-50 rounded-lg ${user.is_active ? 'text-orange-600' : 'text-green-600'}`}
                                                    >
                                                        <Power className="h-4 w-4 mr-2" />
                                                        {user.is_active ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(user)}
                                                        className="text-red-600 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* User Details */}
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                        
                                        {user.phone && (
                                            <div className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                                <span>{user.phone}</span>
                                            </div>
                                        )}
                                        
                                        {user.address && (
                                            <div className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                                <span className="truncate">{user.address}</span>
                                            </div>
                                        )}
                                        
                                        {user.last_login_at && (
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                                <span>Last login: {new Date(user.last_login_at).toLocaleDateString()}</span>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex space-x-3 pt-4 border-t border-gray-100">
                                            <Link href={route('users.show', user.id)} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>
                                            </Link>
                                            <Link href={route('users.edit', user.id)} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Empty State */}
                    {users.data.length === 0 && (
                        <div className="text-center py-16">
                            <div className="h-16 w-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No staff members found</h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || roleFilter !== 'all' || activeFilter !== 'all'
                                    ? 'Try adjusting your filters or search terms.'
                                    : 'Start by adding your first staff member.'}
                            </p>
                            {!searchTerm && roleFilter === 'all' && activeFilter === 'all' && (
                                <Link href={route('users.create')}>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add Staff Member
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                            <div className="text-sm text-gray-700">
                                Showing {users.data.length} of {users.total} staff members
                            </div>
                            <div className="flex items-center space-x-2">
                                {users.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                const url = new URL(link.url, window.location.origin);
                                                const page = url.searchParams.get('page');
                                                updateFilters({ page });
                                            }
                                        }}
                                        className={link.active ? 'bg-blue-600 text-white' : ''}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
