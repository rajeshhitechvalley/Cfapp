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
    Coffee, Star, Zap, Award, Activity, Shield, Crown, XCircle
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

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
    staff: 'bg-blue-100 text-blue-800',
    customer: 'bg-green-100 text-green-800',
    kitchen: 'bg-orange-100 text-orange-800',
};

const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
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
            <Head title="Users" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div>
                            <h1 className="text-3xl font-bold">Users</h1>
                            <p className="text-muted-foreground">Manage users and their roles</p>
                        </div>
                    </div>
                    <Link href={route('users.create')}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="h-5 w-5 mr-2" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={handleRoleFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by role" />
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
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
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
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Users List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Users className="h-5 w-5 mr-2" />
                                Users List ({users.total})
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {users.data.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <img
                                            src={user.avatar_url}
                                            alt={user.name}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-semibold">{user.name}</h3>
                                                <Badge className={roleColors[user.role]}>
                                                    {user.role_display_name}
                                                </Badge>
                                                <Badge className={user.is_active ? statusColors.active : statusColors.inactive}>
                                                    {user.is_active ? (
                                                        <>
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Inactive
                                                        </>
                                                    )}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                                <div className="flex items-center">
                                                    <Mail className="h-3 w-3 mr-1" />
                                                    {user.email}
                                                </div>
                                                {user.phone && (
                                                    <div className="flex items-center">
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        {user.phone}
                                                    </div>
                                                )}
                                                {user.address && (
                                                    <div className="flex items-center">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {user.address}
                                                    </div>
                                                )}
                                            </div>
                                            {user.last_login_at && (
                                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Last login: {new Date(user.last_login_at).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Link href={route('users.show', user.id)}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                        </Link>
                                        <Link href={route('users.edit', user.id)}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleToggleActive(user)}
                                            className={user.is_active ? 'text-orange-600' : 'text-green-600'}
                                        >
                                            <Power className="h-4 w-4 mr-2" />
                                            {user.is_active ? 'Deactivate' : 'Activate'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(user)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {users.data.length === 0 && (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchTerm || roleFilter !== 'all' || activeFilter !== 'all'
                                        ? 'Try adjusting your filters or search terms.'
                                        : 'Get started by adding your first user.'}
                                </p>
                                {!searchTerm && roleFilter === 'all' && activeFilter === 'all' && (
                                    <Link href={route('users.create')}>
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add User
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex items-center justify-center space-x-2 mt-6">
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
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
