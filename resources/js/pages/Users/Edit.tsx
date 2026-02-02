import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, User, Mail, Phone, MapPin, Shield, Eye, EyeOff } from 'lucide-react';
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
}

interface Props {
    user: User;
    roles: Record<string, string>;
}

// Helper function for route generation
const route = (name: string, params?: any) => {
    const baseUrl = window.location.origin;
    const routes: Record<string, string> = {
        'users.index': '/users',
        'users.edit': '/users',
    };
    
    let url = routes[name] || `/${name}`;
    
    if (params) {
        url += `/${params}`;
    }
    
    return url;
};

export default function UsersEdit({ user, roles }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        is_active: user.is_active,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.update', user.id), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Users', href: '/users' },
        { title: user.name, href: `/users/${user.id}` },
        { title: 'Edit User', href: `/users/${user.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${user.name}`} />

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
                            <h1 className="text-3xl font-bold">Edit User</h1>
                            <p className="text-muted-foreground">Update user information</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="h-5 w-5 mr-2" />
                                User Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter full name"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="Enter email address"
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Enter new password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            type={showPasswordConfirmation ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Confirm new password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        >
                                            {showPasswordConfirmation ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-red-600 mt-1">{errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Select value={data.role} onValueChange={(value: 'staff' | 'customer' | 'kitchen') => setData('role', value)}>
                                            <SelectTrigger className="pl-10">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(roles).map(([key, value]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {value}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {errors.role && (
                                        <p className="text-sm text-red-600 mt-1">{errors.role}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="Enter phone number"
                                            className="pl-10"
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="address">Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="address"
                                        type="text"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Enter address"
                                        className="pl-10"
                                    />
                                </div>
                                {errors.address && (
                                    <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="is_active">Active User</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Link href={route('users.show', user.id)}>
                            <Button variant="outline" disabled={processing}>
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            Update User
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
