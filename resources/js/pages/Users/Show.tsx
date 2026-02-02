import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Edit, 
    Power, 
    Mail, 
    Phone, 
    MapPin, 
    Shield, 
    Clock, 
    Calendar,
    CheckCircle,
    XCircle,
    Users,
    ShoppingBag,
    ChefHat
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: string;
    order_time: string;
}

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
    created_orders: Order[];
    assigned_orders: Order[];
    customer_orders: Order[];
}

interface Props {
    user: User;
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
        'users.edit': '/users',
        'orders.show': '/orders',
    };
    
    let url = routes[name] || `/${name}`;
    
    if (params) {
        url += `/${params}`;
    }
    
    return url;
};

export default function UsersShow({ user }: Props) {
    const handleToggleActive = () => {
        router.post(`/users/${user.id}/toggle-active`, {}, {
            onSuccess: () => {
                // Success message will be shown via flash message
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Users', href: '/users' },
        { title: user.name, href: `/users/${user.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('users.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Users
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">{user.name}</h1>
                            <p className="text-muted-foreground">User details and activity</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={route('users.edit', user.id)}>
                            <Button variant="outline">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            onClick={handleToggleActive}
                            className={user.is_active ? 'text-orange-600' : 'text-green-600'}
                        >
                            <Power className="h-4 w-4 mr-2" />
                            {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-6 mb-6">
                                    <img
                                        src={user.avatar_url}
                                        alt={user.name}
                                        className="h-20 w-20 rounded-full object-cover"
                                    />
                                    <div>
                                        <h2 className="text-2xl font-bold">{user.name}</h2>
                                        <div className="flex items-center space-x-2 mt-2">
                                            <Badge className={roleColors[user.role]}>
                                                <Shield className="h-3 w-3 mr-1" />
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
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center text-sm text-muted-foreground mb-1">
                                            <Mail className="h-4 w-4 mr-2" />
                                            Email Address
                                        </div>
                                        <p className="font-semibold">{user.email}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center text-sm text-muted-foreground mb-1">
                                            <Phone className="h-4 w-4 mr-2" />
                                            Phone Number
                                        </div>
                                        <p className="font-semibold">{user.phone || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center text-sm text-muted-foreground mb-1">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            Address
                                        </div>
                                        <p className="font-semibold">{user.address || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center text-sm text-muted-foreground mb-1">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Member Since
                                        </div>
                                        <p className="font-semibold">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {user.last_login_at && (
                                        <div>
                                            <div className="flex items-center text-sm text-muted-foreground mb-1">
                                                <Clock className="h-4 w-4 mr-2" />
                                                Last Login
                                            </div>
                                            <p className="font-semibold">
                                                {new Date(user.last_login_at).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Orders based on role */}
                        {(user.created_orders.length > 0 || user.assigned_orders.length > 0 || user.customer_orders.length > 0) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Orders</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {user.role === 'staff' && user.created_orders.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold mb-2 flex items-center">
                                                    <Users className="h-4 w-4 mr-2" />
                                                    Created Orders
                                                </h3>
                                                <div className="space-y-2">
                                                    {user.created_orders.slice(0, 5).map((order) => (
                                                        <div key={order.id} className="flex items-center justify-between p-2 border rounded">
                                                            <div>
                                                                <Link href={route('orders.show', order.id)} className="font-semibold hover:underline">
                                                                    {order.order_number}
                                                                </Link>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {new Date(order.order_time).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold">${parseFloat(order.total_amount).toFixed(2)}</p>
                                                                <Badge className="text-xs">{order.status}</Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {user.role === 'kitchen' && user.assigned_orders.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold mb-2 flex items-center">
                                                    <ChefHat className="h-4 w-4 mr-2" />
                                                    Assigned Orders
                                                </h3>
                                                <div className="space-y-2">
                                                    {user.assigned_orders.slice(0, 5).map((order) => (
                                                        <div key={order.id} className="flex items-center justify-between p-2 border rounded">
                                                            <div>
                                                                <Link href={route('orders.show', order.id)} className="font-semibold hover:underline">
                                                                    {order.order_number}
                                                                </Link>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {new Date(order.order_time).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold">${parseFloat(order.total_amount).toFixed(2)}</p>
                                                                <Badge className="text-xs">{order.status}</Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {user.role === 'customer' && user.customer_orders.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold mb-2 flex items-center">
                                                    <ShoppingBag className="h-4 w-4 mr-2" />
                                                    Customer Orders
                                                </h3>
                                                <div className="space-y-2">
                                                    {user.customer_orders.slice(0, 5).map((order) => (
                                                        <div key={order.id} className="flex items-center justify-between p-2 border rounded">
                                                            <div>
                                                                <Link href={route('orders.show', order.id)} className="font-semibold hover:underline">
                                                                    {order.order_number}
                                                                </Link>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {new Date(order.order_time).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold">${parseFloat(order.total_amount).toFixed(2)}</p>
                                                                <Badge className="text-xs">{order.status}</Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* User Stats */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Status</span>
                                        <Badge className={user.is_active ? statusColors.active : statusColors.inactive}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Role</span>
                                        <Badge className={roleColors[user.role]}>
                                            {user.role_display_name}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Member Since</span>
                                        <span className="font-semibold">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {user.last_login_at && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Last Login</span>
                                            <span className="font-semibold">
                                                {new Date(user.last_login_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {user.role === 'staff' && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Orders Created</span>
                                            <span className="font-semibold">{user.created_orders.length}</span>
                                        </div>
                                    )}
                                    {user.role === 'kitchen' && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Orders Assigned</span>
                                            <span className="font-semibold">{user.assigned_orders.length}</span>
                                        </div>
                                    )}
                                    {user.role === 'customer' && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Total Orders</span>
                                            <span className="font-semibold">{user.customer_orders.length}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
