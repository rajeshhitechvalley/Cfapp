import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Plus, Utensils, Clock, DollarSign, Image, CheckCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { getCategoryIcon } from '@/utils/categoryIcons';

interface MenuCategory {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    icon?: string | null;
}

interface Props {
    categories: MenuCategory[];
}

export default function MenuItemsCreate({ categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        menu_category_id: categories.length > 0 ? categories[0].id.toString() : '',
        category: categories.length > 0 ? categories[0].name : '',
        description: '',
        price: '',
        image_url: '',
        is_available: true,
        preparation_time: '10',
    });

    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Set category name based on selected category ID
        const selectedCategory = categories.find(cat => cat.id.toString() === data.menu_category_id);
        if (selectedCategory) {
            setData('category', selectedCategory.name);
        }
        
        post('/menu-items');
    };

    const handleCategoryChange = (value: string) => {
        setData('menu_category_id', value);
        const selectedCategory = categories.find(cat => cat.id.toString() === value);
        if (selectedCategory) {
            setData('category', selectedCategory.name);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Menu Items', href: '/menu-items' },
        { title: 'Create Menu Item', href: '/menu-items/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Menu Item" />

            <div className="space-y-8 p-8">
                {/* Enhanced Header */}
                <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/menu-items">
                                <Button variant="outline" size="sm" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Menu Items
                                </Button>
                            </Link>
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <Plus className="h-8 w-8 text-yellow-300" />
                                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200">
                                        Create Menu Item
                                    </h1>
                                </div>
                                <p className="text-green-100 text-lg font-medium">Add a new delicious item to your restaurant menu</p>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                            <Utensils className="h-12 w-12 text-white" />
                        </div>
                    </div>
                </div>

                {/* Enhanced Form Card */}
                <Card className="border-0 bg-gradient-to-br from-white to-green-50 shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300 rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-2xl">
                        <CardTitle className="flex items-center text-white font-bold text-xl">
                            <Plus className="h-6 w-6 mr-2" />
                            Menu Item Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-sm font-bold text-gray-700 flex items-center">
                                        <Utensils className="h-4 w-4 mr-1 text-green-600" />
                                        Item Name *
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter item name"
                                        required
                                        className="border-2 border-gray-300 focus:border-green-500 focus:ring-green-200 h-12 text-gray-900 font-medium"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 font-medium flex items-center">
                                            <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="category" className="text-sm font-bold text-gray-700 flex items-center">
                                        <Utensils className="h-4 w-4 mr-1 text-green-600" />
                                        Category *
                                    </Label>
                                    <Select value={data.menu_category_id} onValueChange={handleCategoryChange}>
                                        <SelectTrigger className="border-2 border-gray-300 focus:border-green-500 focus:ring-green-200 h-12 text-gray-900 font-medium">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent className="text-gray-700 bg-white border-2 border-gray-200 shadow-lg">
                                            {categories.map((category) => {
                                                const Icon = getCategoryIcon(category.icon);
                                                return (
                                                    <SelectItem key={category.id} value={category.id.toString()} className="text-gray-900 font-semibold hover:bg-green-50 cursor-pointer">
                                                        <div className="flex items-center">
                                                            <Icon className="h-4 w-4 mr-2" />
                                                            {category.name}
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && (
                                        <p className="text-sm text-red-600 font-medium flex items-center">
                                            <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                            {errors.category}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="price" className="text-sm font-bold text-gray-700 flex items-center">
                                        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                                        Price ($) *
                                    </Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="0.00"
                                        required
                                        className="border-2 border-gray-300 focus:border-green-500 focus:ring-green-200 h-12 text-gray-900 font-medium"
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-red-600 font-medium flex items-center">
                                            <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                            {errors.price}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="preparation_time" className="text-sm font-bold text-gray-700 flex items-center">
                                        <Clock className="h-4 w-4 mr-1 text-green-600" />
                                        Preparation Time (minutes) *
                                    </Label>
                                    <Input
                                        id="preparation_time"
                                        type="number"
                                        min="0"
                                        max="120"
                                        value={data.preparation_time}
                                        onChange={(e) => setData('preparation_time', e.target.value)}
                                        placeholder="10"
                                        required
                                        className="border-2 border-gray-300 focus:border-green-500 focus:ring-green-200 h-12 text-gray-900 font-medium"
                                    />
                                    {errors.preparation_time && (
                                        <p className="text-sm text-red-600 font-medium flex items-center">
                                            <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                            {errors.preparation_time}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="description" className="text-sm font-bold text-gray-700 flex items-center">
                                    <Utensils className="h-4 w-4 mr-1 text-green-600" />
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Enter item description (optional)"
                                    rows={4}
                                    className="border-2 border-gray-300 focus:border-green-500 focus:ring-green-200 text-gray-900 font-medium resize-none"
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600 font-medium flex items-center">
                                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="image_url" className="text-sm font-bold text-gray-700 flex items-center">
                                    <Image className="h-4 w-4 mr-1 text-green-600" />
                                    Image URL
                                </Label>
                                <Input
                                    id="image_url"
                                    type="url"
                                    value={data.image_url}
                                    onChange={(e) => setData('image_url', e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="border-2 border-gray-300 focus:border-green-500 focus:ring-green-200 h-12 text-gray-900 font-medium"
                                />
                                {errors.image_url && (
                                    <p className="text-sm text-red-600 font-medium flex items-center">
                                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                        {errors.image_url}
                                        </p>
                                    )}
                            </div>

                            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                                <Checkbox
                                    id="is_available"
                                    checked={data.is_available}
                                    onCheckedChange={(checked) => setData('is_available', checked as boolean)}
                                    className="w-5 h-5 text-green-600 border-green-300 focus:ring-green-200"
                                />
                                <Label htmlFor="is_available" className="text-gray-700 font-medium flex items-center cursor-pointer">
                                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                                    Available for order
                                </Label>
                            </div>
                            {errors.is_available && (
                                <p className="text-sm text-red-600 font-medium flex items-center">
                                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                    {errors.is_available}
                                </p>
                            )}

                            <div className="flex items-center space-x-6 pt-6 border-t-2 border-gray-200">
                                <Button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                                >
                                    <Save className="h-5 w-5" />
                                    {processing ? 'Creating...' : 'Create Menu Item'}
                                </Button>
                                <Link href="/menu-items">
                                    <Button 
                                        variant="outline" 
                                        type="button"
                                        className="border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 font-bold px-8 py-3 rounded-xl transition-all duration-300"
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
