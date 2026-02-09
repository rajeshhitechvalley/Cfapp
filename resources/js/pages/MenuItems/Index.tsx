import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Clock, Star, Zap, Award, ChefHat } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useCurrency } from '@/components/currency-switcher';
import type { BreadcrumbItem } from '@/types';
import { getCategoryIcon, getCategoryColor, getCardBackground } from '@/utils/categoryIcons';

interface MenuCategory {
    id: number;
    name: string;
    image_url: string | null;
    icon?: string | null;
}

interface MenuItem {
    id: number;
    name: string;
    category: string;
    menu_category: MenuCategory | null;
    description: string | null;
    price: string;
    image_url: string | null;
    is_available: boolean;
    preparation_time: number;
    formatted_price: string;
}

interface Props {
    menuItems: MenuItem[];
}


export default function MenuItemsIndex({ menuItems }: Props) {
    const { formatCurrency } = useCurrency();
    
    const toggleAvailability = (id: number) => {
        router.post(`/menu-items/${id}/toggle-availability`, {}, {
            preserveScroll: true,
        });
    };

    const deleteItem = (id: number) => {
        if (confirm('Are you sure you want to delete this menu item?')) {
            router.delete(`/menu-items/${id}`);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Menu Items', href: '/menu-items' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu Items" />

            <div className="space-y-8 p-6">
                {/* Beautiful Header */}
                <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <ChefHat className="h-8 w-8" />
                                <h1 className="text-4xl font-bold">Menu Management</h1>
                            </div>
                            <p className="text-orange-100 text-lg">Manage your restaurant menu items and prices with style</p>
                        </div>
                        <Link href="/menu-items/create">
                            <Button className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Menu Item
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Enhanced Menu Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item) => (
                        <Card key={item.id} className={`group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] rounded-xl border-2 border-transparent hover:border-blue-200 overflow-hidden ${getCardBackground(item.category)}`}>
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                                            {item.menu_category?.image_url ? (
                                                <img 
                                                    src={item.menu_category.image_url} 
                                                    alt={item.category}
                                                    className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-md"
                                                />
                                            ) : (
                                                (() => {
                                                    // Debug: Log the actual data structure
                                                    console.log('Menu Item Debug:', {
                                                        itemName: item.name,
                                                        category: item.category,
                                                        menuCategory: item.menu_category,
                                                        iconFromDb: item.menu_category?.icon,
                                                        finalIconParam: item.menu_category?.icon || item.category
                                                    });
                                                    
                                                    // Get icon from database if available, otherwise use category name
                                                    const IconComponent = getCategoryIcon(item.menu_category?.icon || item.category);
                                                    console.log('Icon Component:', IconComponent);
                                                    return React.createElement(IconComponent, { className: "h-8 w-8" });
                                                })()
                                            )}
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold text-gray-900">{item.name}</CardTitle>
                                            <Badge className={`${getCategoryColor(item.category)} font-semibold px-3 py-1 rounded-full border`}>
                                                {item.category}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleAvailability(item.id)}
                                            className="h-10 w-10 p-0 rounded-full hover:bg-white/50 transition-all duration-300"
                                        >
                                            {item.is_available ? (
                                                <ToggleRight className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <ToggleLeft className="h-5 w-5 text-gray-400" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {item.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2 italic">
                                            {item.description}
                                        </p>
                                    )}
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-bold text-2xl text-gray-900">{formatCurrency(item.price)}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-white/50 px-3 py-2 rounded-full">
                                            <Clock className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-semibold text-gray-700">{item.preparation_time} min</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <Badge variant={item.is_available ? "default" : "secondary"} className={`font-semibold px-3 py-1 rounded-full ${
                                            item.is_available 
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                                        }`}>
                                            {item.is_available ? 'Available' : 'Unavailable'}
                                        </Badge>
                                        
                                        <div className="flex items-center space-x-2">
                                            <Link href={`/menu-items/${item.id}/edit`}>
                                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full hover:bg-blue-100 transition-all duration-300">
                                                    <Edit className="h-4 w-4 text-blue-600" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteItem(item.id)}
                                                className="h-9 w-9 p-0 rounded-full hover:bg-red-100 transition-all duration-300"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {menuItems.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <div className="text-6xl mb-4">🍽️</div>
                            <h3 className="text-lg font-semibold mb-2">No menu items yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Get started by adding your first menu item
                            </p>
                            <Link href="/menu-items/create">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Menu Item
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
