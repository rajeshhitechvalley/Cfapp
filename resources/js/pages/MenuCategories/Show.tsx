import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Utensils, Image as ImageIcon, Clock, DollarSign } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: string;
    image_url: string | null;
    is_available: boolean;
    preparation_time: number;
}

interface MenuCategory {
    id: number;
    name: string;
    description: string | null;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    menu_items: MenuItem[];
}

interface Props {
    category: MenuCategory;
}

export default function MenuCategoriesShow({ category }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Menu Categories', href: '/menu-categories' },
        { title: category.name, href: `/menu-categories/${category.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={category.name} />

            <div className="space-y-8 p-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/menu-categories">
                                <Button variant="outline" size="sm" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Categories
                                </Button>
                            </Link>
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <Utensils className="h-8 w-8 text-yellow-300" />
                                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200">
                                        {category.name}
                                    </h1>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Badge variant={category.is_active ? "default" : "secondary"} className="bg-white/20 text-white border-white/30">
                                        {category.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                    <span className="text-blue-100 text-sm">
                                        Sort Order: {category.sort_order}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link href={`/menu-categories/${category.id}/edit`}>
                                <Button className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Category
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Category Details */}
                    <div className="lg:col-span-1">
                        <Card className="border-0 bg-gradient-to-br from-white to-blue-50 shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-2xl">
                                <CardTitle className="flex items-center text-white font-bold text-xl">
                                    <Utensils className="h-6 w-6 mr-2" />
                                    Category Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {category.image_url && (
                                    <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={category.image_url}
                                            alt={category.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                                
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-600">
                                        {category.description || 'No description provided'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Status</h3>
                                        <Badge variant={category.is_active ? "default" : "secondary"}>
                                            {category.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Sort Order</h3>
                                        <p className="text-gray-600">{category.sort_order}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Menu Items</h3>
                                        <p className="text-gray-600">{category.menu_items.length}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Available Items</h3>
                                        <p className="text-gray-600">
                                            {category.menu_items.filter(item => item.is_available).length}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <div className="text-sm text-gray-500">
                                        <p>Created: {new Date(category.created_at).toLocaleDateString()}</p>
                                        <p>Updated: {new Date(category.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Menu Items */}
                    <div className="lg:col-span-2">
                        <Card className="border-0 bg-gradient-to-br from-white to-blue-50 shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-2xl">
                                <CardTitle className="flex items-center text-white font-bold text-xl">
                                    <Utensils className="h-6 w-6 mr-2" />
                                    Menu Items ({category.menu_items.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {category.menu_items.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {category.menu_items.map((item) => (
                                            <Card key={item.id} className="hover:shadow-lg transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                                            {item.description && (
                                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                                <div className="flex items-center">
                                                                    <DollarSign className="h-4 w-4 mr-1" />
                                                                    ${parseFloat(item.price).toFixed(2)}
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <Clock className="h-4 w-4 mr-1" />
                                                                    {item.preparation_time}min
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Badge variant={item.is_available ? "default" : "secondary"}>
                                                            {item.is_available ? "Available" : "Unavailable"}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items yet</h3>
                                        <p className="text-gray-600">This category doesn't have any menu items.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
