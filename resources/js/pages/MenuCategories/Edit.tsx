import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Edit, Utensils, Image as ImageIcon, Upload, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface MenuCategory {
    id: number;
    name: string;
    description: string | null;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    category: MenuCategory;
}

export default function MenuCategoriesEdit({ category }: Props) {
    const [imagePreview, setImagePreview] = useState<string | null>(category.image_url);
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        description: category.description || '',
        image: null as File | null,
        sort_order: category.sort_order.toString(),
        is_active: category.is_active,
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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(`/menu-categories/${category.id}`);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Menu Categories', href: '/menu-categories' },
        { title: `Edit ${category.name}`, href: `/menu-categories/${category.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${category.name}`} />

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
                                    <Edit className="h-8 w-8 text-yellow-300" />
                                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200">
                                        Edit Category
                                    </h1>
                                </div>
                                <p className="text-blue-100 text-lg font-medium">Update category information for "{category.name}"</p>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                            <Utensils className="h-12 w-12 text-white" />
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="border-0 bg-gradient-to-br from-white to-blue-50 shadow-xl hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300 rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-2xl">
                        <CardTitle className="flex items-center text-white font-bold text-xl">
                            <Edit className="h-6 w-6 mr-2" />
                            Update Category Details
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
                                    {processing ? 'Updating...' : 'Update Category'}
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
