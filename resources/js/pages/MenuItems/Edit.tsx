import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Textarea from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
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
}

interface Props {
    menuItem: MenuItem;
}

export default function MenuItemsEdit({ menuItem }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: menuItem.name,
        category: menuItem.category,
        description: menuItem.description || '',
        price: menuItem.price,
        image_url: menuItem.image_url || '',
        is_available: menuItem.is_available,
        preparation_time: menuItem.preparation_time.toString(),
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(`/menu-items/${menuItem.id}`);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Menu Items', href: '/menu-items' },
        { title: 'Edit Menu Item', href: `/menu-items/${menuItem.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Menu Item" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/menu-items">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Menu Items
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Edit Menu Item</h1>
                            <p className="text-muted-foreground">Update menu item information and pricing</p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Menu Item Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Item Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter item name"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tea">🍵 Tea</SelectItem>
                                            <SelectItem value="snack">🍟 Snack</SelectItem>
                                            <SelectItem value="cake">🍰 Cake</SelectItem>
                                            <SelectItem value="pizza">🍕 Pizza</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.category && (
                                        <p className="text-sm text-red-600">{errors.category}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Price ($) *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-red-600">{errors.price}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="preparation_time">Preparation Time (minutes) *</Label>
                                    <Input
                                        id="preparation_time"
                                        type="number"
                                        min="0"
                                        max="120"
                                        value={data.preparation_time}
                                        onChange={(e) => setData('preparation_time', e.target.value)}
                                        placeholder="10"
                                        required
                                    />
                                    {errors.preparation_time && (
                                        <p className="text-sm text-red-600">{errors.preparation_time}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Enter item description (optional)"
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image_url">Image URL</Label>
                                <Input
                                    id="image_url"
                                    type="url"
                                    value={data.image_url}
                                    onChange={(e) => setData('image_url', e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                />
                                {errors.image_url && (
                                    <p className="text-sm text-red-600">{errors.image_url}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_available"
                                    checked={data.is_available}
                                    onCheckedChange={(checked) => setData('is_available', checked as boolean)}
                                />
                                <Label htmlFor="is_available">Available for order</Label>
                            </div>
                            {errors.is_available && (
                                <p className="text-sm text-red-600">{errors.is_available}</p>
                            )}

                            <div className="flex items-center space-x-4 pt-4">
                                <Button type="submit" disabled={processing} className="flex items-center gap-2">
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Updating...' : 'Update Menu Item'}
                                </Button>
                                <Link href="/menu-items">
                                    <Button variant="outline" type="button">
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
