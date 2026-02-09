import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Image as ImageIcon, ToggleLeft, ToggleRight, Utensils } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { getCategoryIcon } from '@/utils/categoryIcons';

interface MenuCategory {
    id: number;
    name: string;
    description: string | null;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
    item_count?: number;
    icon?: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    categories: MenuCategory[];
}

export default function MenuCategoriesIndex({ categories }: Props) {
    const handleToggleActive = (category: MenuCategory) => {
        router.patch(
            `/menu-categories/${category.id}`,
            {
                ...category,
                is_active: !category.is_active,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Success message will be shown via flash session
                },
            }
        );
    };

    const handleDelete = (category: MenuCategory) => {
        if (confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
            router.delete(`/menu-categories/${category.id}`, {
                onError: (errors) => {
                    console.error('Delete error:', errors);
                    if (errors.message && errors.message.includes('associated menu items')) {
                        alert('Cannot delete this category because it has menu items associated with it. Please remove or reassign the menu items first.');
                    } else {
                        alert('Error deleting category: ' + (errors.message || 'Unknown error'));
                    }
                },
                onSuccess: () => {
                    console.log('Category deleted successfully');
                }
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Menu Categories', href: '/menu-categories' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu Categories" />

            <div className="space-y-8 px-6 py-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-white/10 blur-lg"></div>
                    
                    <div className="relative flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                    {(() => {
                                        const totalItems = categories.reduce((sum, cat) => sum + (cat.item_count || 0), 0);
                                        const mostUsedIcon = categories.length > 0 ? categories[0].icon : 'Utensils';
                                        const Icon = getCategoryIcon(mostUsedIcon);
                                        return <Icon className="h-8 w-8 text-white" />;
                                    })()}
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-white tracking-tight">Menu Categories</h1>
                                    <p className="text-lg text-white/90 font-medium">Organize your restaurant menu with style</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-white/80">
                                <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                    {categories.length} categories
                                </span>
                                <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                    {categories.reduce((sum, cat) => sum + (cat.item_count || 0), 0)} total items
                                </span>
                                <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                    {new Set(categories.map(cat => cat.icon).filter(Boolean)).size} unique icons
                                </span>
                            </div>
                        </div>
                        <Link href="/menu-categories/create">
                            <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 h-12 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold border-0">
                                <Plus className="h-5 w-5 mr-2" />
                                Add Category
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {categories.map((category) => (
                        <Card key={category.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-md bg-white/80 backdrop-blur-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl font-bold text-gray-900">
                                        {category.name}
                                    </CardTitle>
                                    <div className="flex items-center space-x-3">
                                        <Badge 
                                            variant={category.is_active ? "default" : "secondary"} 
                                            className={`px-3 py-1 text-xs font-semibold ${
                                                category.is_active 
                                                    ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                        >
                                            {category.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleActive(category)}
                                            className="h-9 w-9 p-0 hover:bg-gray-100 rounded-full"
                                        >
                                            {category.is_active ? (
                                                <ToggleRight className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <ToggleLeft className="h-5 w-5 text-gray-400" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {category.image_url && (
                                    <div className="w-full h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-inner">
                                        <img
                                            src={category.image_url}
                                            alt={category.name}
                                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                                
                                {category.description && (
                                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                        {category.description}
                                    </p>
                                )}
                                
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <div className="bg-blue-50 p-2 rounded-lg">
                                            {(() => {
                                                const Icon = getCategoryIcon(category.icon);
                                                return <Icon className="h-4 w-4 text-blue-600" />;
                                            })()}
                                        </div>
                                        <span className="font-medium">{category.item_count || 0} items</span>
                                    </div>
                                    <div className="bg-gray-50 px-3 py-1 rounded-full">
                                        <span className="text-xs font-medium text-gray-600">
                                            Order: {category.sort_order}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                                    <Link href={`/menu-categories/${category.id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors">
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                    </Link>
                                    <Link href={`/menu-categories/${category.id}/edit`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors">
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(category)}
                                        className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {categories.length === 0 && (
                    <div className="text-center py-20 px-6">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            {(() => {
                                const Icon = getCategoryIcon(null);
                                return <Icon className="h-12 w-12 text-gray-400" />;
                            })()}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No categories yet</h3>
                        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">Get started by creating your first menu category to organize your restaurant menu.</p>
                        <Link href="/menu-categories/create">
                            <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 h-12 shadow-lg hover:shadow-xl transition-all duration-200">
                                <Plus className="h-5 w-5 mr-2" />
                                Add Your First Category
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
