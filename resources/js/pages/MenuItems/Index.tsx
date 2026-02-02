import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Clock, Coffee, Utensils, Star, Zap, Award, ChefHat } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useCurrency } from '@/components/currency-switcher';
import type { BreadcrumbItem } from '@/types';

interface MenuItem {
    id: number;
    name: string;
    category: string;
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

const categoryIcons = {
    tea: '🍵',
    snack: '🍟',
    cake: '🍰',
    pizza: '🍕',
};

const categoryColors = {
    tea: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300',
    snack: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300',
    cake: 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border-pink-300',
    pizza: 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border-red-300',
};

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
                        <Card key={item.id} className={`group transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-0 rounded-2xl ${
                            !item.is_available ? 'opacity-75' : ''
                        } ${
                            item.category === 'tea' ? 'bg-gradient-to-br from-green-50 to-emerald-50' :
                            item.category === 'snack' ? 'bg-gradient-to-br from-yellow-50 to-orange-50' :
                            item.category === 'cake' ? 'bg-gradient-to-br from-pink-50 to-rose-50' :
                            'bg-gradient-to-br from-red-50 to-orange-50'
                        }`}>
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                                            {categoryIcons[item.category as keyof typeof categoryIcons]}
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold text-gray-900">{item.name}</CardTitle>
                                            <Badge className={`${categoryColors[item.category as keyof typeof categoryColors]} font-semibold px-3 py-1 rounded-full border`}>
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
