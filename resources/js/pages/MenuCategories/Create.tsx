import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Plus, Utensils, Image as ImageIcon, Upload, X, Coffee, Cake, Pizza, Sandwich, IceCream, Soup, Salad, Beef, Fish, Cookie } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

export default function MenuCategoriesCreate() {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedIcon, setSelectedIcon] = useState<string>('Utensils');
    
    // Icon options for categories
    const iconOptions = [
        { name: 'Utensils', icon: Utensils, label: 'General' },
        { name: 'Coffee', icon: Coffee, label: 'Beverages' },
        { name: 'Cake', icon: Cake, label: 'Desserts' },
        { name: 'Pizza', icon: Pizza, label: 'Pizza' },
        { name: 'Sandwich', icon: Sandwich, label: 'Sandwiches' },
        { name: 'IceCream', icon: IceCream, label: 'Ice Cream' },
        { name: 'Soup', icon: Soup, label: 'Soups' },
        { name: 'Salad', icon: Salad, label: 'Salads' },
        { name: 'Beef', icon: Beef, label: 'Meat' },
        { name: 'Fish', icon: Fish, label: 'Seafood' },
        { name: 'Cookie', icon: Cookie, label: 'Bakery' },
    ];

    // Get the selected icon component
    const getSelectedIcon = () => {
        const iconOption = iconOptions.find(option => option.name === selectedIcon);
        return iconOption ? iconOption.icon : Utensils;
    };

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        image: null as File | null,
        sort_order: '0',
        is_active: true,
        icon: 'Utensils',
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setData('image', null);
        setImagePreview(null);
    };

    const handleIconChange = (iconName: string) => {
        setSelectedIcon(iconName);
        setData('icon', iconName);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/menu-categories');
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Menu Categories', href: '/menu-categories' },
        { title: 'Create Category', href: '/menu-categories/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Menu Category" />

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
                                    <Plus className="h-8 w-8 text-yellow-300" />
                                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200">
                                        Create Menu Category
                                    </h1>
                                </div>
                                <p className="text-blue-100 text-lg font-medium">Add a new category to organize your menu items</p>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30 transition-all duration-300">
                            {React.createElement(getSelectedIcon(), { className: "h-12 w-12 text-white" })}
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="border-0 bg-gradient-to-br from-white to-blue-50 shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300 rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-2xl">
                        <CardTitle className="flex items-center text-white font-bold text-xl">
                            <Plus className="h-6 w-6 mr-2" />
                            Category Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-sm font-bold text-gray-700 flex items-center">
                                        <Utensils className="h-4 w-4 mr-1 text-blue-600" />
                                        Category Name *
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter category name"
                                        required
                                        className="border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-200 h-12 text-gray-900 font-medium"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 font-medium flex items-center">
                                            <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-gray-700 flex items-center">
                                        {React.createElement(getSelectedIcon(), { className: "h-4 w-4 mr-1 text-blue-600" })}
                                        Category Icon
                                    </Label>
                                    <div className="grid grid-cols-6 gap-3">
                                        {iconOptions.map((option) => {
                                            const Icon = option.icon;
                                            return (
                                                <button
                                                    key={option.name}
                                                    type="button"
                                                    onClick={() => handleIconChange(option.name)}
                                                    className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                                                        selectedIcon === option.name
                                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                                            : 'border-gray-200 bg-white hover:border-blue-300'
                                                    }`}
                                                    title={option.label}
                                                >
                                                    <Icon className={`h-6 w-6 mx-auto ${
                                                        selectedIcon === option.name ? 'text-blue-600' : 'text-gray-600'
                                                    }`} />
                                                    <span className={`text-xs mt-1 block ${
                                                        selectedIcon === option.name ? 'text-blue-600 font-medium' : 'text-gray-500'
                                                    }`}>
                                                        {option.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-gray-500">Choose an icon that represents your category</p>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="sort_order" className="text-sm font-bold text-gray-700 flex items-center">
                                        <Utensils className="h-4 w-4 mr-1 text-blue-600" />
                                        Sort Order
                                    </Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        min="0"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', e.target.value)}
                                        placeholder="0"
                                        className="border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-200 h-12 text-gray-900 font-medium"
                                    />
                                    {errors.sort_order && (
                                        <p className="text-sm text-red-600 font-medium flex items-center">
                                            <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                            {errors.sort_order}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="description" className="text-sm font-bold text-gray-700 flex items-center">
                                    <Utensils className="h-4 w-4 mr-1 text-blue-600" />
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Enter category description (optional)"
                                    rows={4}
                                    className="border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-200 text-gray-900 font-medium resize-none"
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600 font-medium flex items-center">
                                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="image" className="text-sm font-bold text-gray-700 flex items-center">
                                    <ImageIcon className="h-4 w-4 mr-1 text-blue-600" />
                                    Category Image
                                </Label>
                                
                                {imagePreview ? (
                                    <div className="relative">
                                        <img 
                                            src={imagePreview} 
                                            alt="Category preview" 
                                            className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <Label htmlFor="image" className="cursor-pointer">
                                            <span className="text-blue-600 font-medium hover:text-blue-700">
                                                Click to upload image
                                            </span>
                                            <span className="text-gray-500 block text-sm mt-1">
                                                PNG, JPG, GIF, WebP up to 2MB
                                            </span>
                                        </Label>
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </div>
                                )}
                                
                                {errors.image && (
                                    <p className="text-sm text-red-600 font-medium flex items-center">
                                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                        {errors.image}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                    className="w-5 h-5 text-blue-600 border-blue-300 focus:ring-blue-200"
                                />
                                <Label htmlFor="is_active" className="text-gray-700 font-medium flex items-center cursor-pointer">
                                    <Utensils className="h-5 w-5 mr-2 text-blue-600" />
                                    Active
                                </Label>
                            </div>
                            {errors.is_active && (
                                <p className="text-sm text-red-600 font-medium flex items-center">
                                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                    {errors.is_active}
                                </p>
                            )}

                            <div className="flex items-center space-x-6 pt-6 border-t-2 border-gray-200">
                                <Button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                                >
                                    <Save className="h-5 w-5" />
                                    {processing ? 'Creating...' : 'Create Category'}
                                </Button>
                                <Link href="/menu-categories">
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
