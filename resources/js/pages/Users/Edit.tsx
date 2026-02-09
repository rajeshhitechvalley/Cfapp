import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, User, Mail, Phone, MapPin, Shield, Eye, EyeOff, Edit, Save } from 'lucide-react';
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

            <div className="min-h-screen bg-gray-50">
                {/* Simple Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link href={route('users.index')}>
                                    <Button variant="outline" size="sm" className="flex items-center">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </Button>
                                </Link>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Edit className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">Edit Staff Member</h1>
                                        <p className="text-gray-600">Update {user.name}'s information</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Container */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                <User className="h-5 w-5 mr-2 text-gray-600" />
                                Basic Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter full name"
                                        className="mt-1 text-gray-900"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="staff@example.com"
                                        className="mt-1 text-gray-900"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+1 (555) 123-4567"
                                        className="mt-1 text-gray-900"
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
                                    <Input
                                        id="address"
                                        type="text"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="123 Main St, City, State"
                                        className="mt-1 text-gray-900"
                                    />
                                    {errors.address && (
                                        <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Role & Access */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                <Shield className="h-5 w-5 mr-2 text-gray-600" />
                                Role & Access
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role *</Label>
                                    <Select value={data.role} onValueChange={(value) => setData('role', value as 'staff' | 'customer' | 'kitchen')}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {Object.entries(roles).map(([key, value]) => (
                                                <SelectItem key={key} value={key} className="hover:bg-gray-50 hover:text-gray-50">
                                                    <div className="flex items-center">
                                                        <div className={`w-2 h-2 rounded-full mr-2 ${
                                                            key === 'staff' ? 'bg-blue-500' : 
                                                            key === 'kitchen' ? 'bg-orange-500' : 
                                                            'bg-green-500'
                                                        }`} />
                                                        <span className="text-gray-900">{value}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role && (
                                        <p className="text-sm text-red-600 mt-1">{errors.role}</p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                    />
                                    <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                        Active Account
                                    </Label>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Active staff members can log in and access the system.
                                </p>
                            </div>
                        </div>

                        {/* Security Settings */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                <Shield className="h-5 w-5 mr-2 text-gray-600" />
                                Security Settings
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Leave blank to keep current password"
                                            className="mt-1 pr-10"
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
                                    <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            type={showPasswordConfirmation ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Confirm new password"
                                            className="mt-1 pr-10"
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
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-2">
                                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium">Password Requirements:</p>
                                            <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                                                <li>At least 8 characters long</li>
                                                <li>Must include uppercase and lowercase letters</li>
                                                <li>Must include at least one number</li>
                                                <li>Must include at least one special character</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4">
                            <Link href={route('users.index')}>
                                <Button variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
