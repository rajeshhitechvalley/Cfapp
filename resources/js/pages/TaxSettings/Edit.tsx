import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Textarea from '@/components/ui/textarea';
import { ArrowLeft, Settings, Percent, Info } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface TaxSetting {
    id: number;
    name: string;
    type: 'free' | 'manual';
    tax_rate: number | null;
    is_active: boolean;
    description: string | null;
}

interface Props {
    taxSetting: TaxSetting;
}

export default function TaxSettingsEdit({ taxSetting }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: taxSetting.name,
        type: taxSetting.type,
        tax_rate: taxSetting.tax_rate?.toString() || '',
        description: taxSetting.description || '',
        is_active: taxSetting.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/tax-settings/${taxSetting.id}`, {
            method: 'put',
            onSuccess: () => reset(),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tax Settings', href: '/tax-settings' },
        { title: 'Edit Tax Setting', href: `/tax-settings/${taxSetting.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Tax Setting" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/tax-settings">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Tax Settings
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center">
                                <Settings className="h-8 w-8 mr-3" />
                                Edit Tax Setting
                            </h1>
                            <p className="text-muted-foreground">Modify tax rates and settings</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Setting Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g., Standard Tax, Restaurant Tax"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="type">Tax Type *</Label>
                                        <Select value={data.type} onValueChange={(value) => setData('type', value as 'free' | 'manual')}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select tax type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="free">
                                                    <div className="flex items-center space-x-2">
                                                        <span>🆓</span>
                                                        <div>
                                                            <div className="font-medium">Free</div>
                                                            <div className="text-sm text-muted-foreground">No tax applied</div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="manual">
                                                    <div className="flex items-center space-x-2">
                                                        <span>📝</span>
                                                        <div>
                                                            <div className="font-medium">Manual</div>
                                                            <div className="text-sm text-muted-foreground">Define custom tax rate</div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.type && (
                                            <p className="text-sm text-red-600 mt-1">{errors.type}</p>
                                        )}
                                    </div>

                                    {data.type === 'manual' && (
                                        <div>
                                            <Label htmlFor="tax_rate">Tax Rate (%) *</Label>
                                            <Input
                                                id="tax_rate"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={data.tax_rate}
                                                onChange={(e) => setData('tax_rate', e.target.value)}
                                                placeholder="e.g., 10.00 for 10%"
                                                required
                                            />
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Enter tax rate as a percentage (e.g., 10.00 for 10%)
                                            </p>
                                            {errors.tax_rate && (
                                                <p className="text-sm text-red-600 mt-1">{errors.tax_rate}</p>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Optional description for this tax setting..."
                                            rows={3}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Configuration */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Configuration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                        />
                                        <Label htmlFor="is_active" className="text-sm font-medium">
                                            Set as Active Tax Setting
                                        </Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Only one tax setting can be active at a time. Enabling this will deactivate all other tax settings.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Preview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Info className="h-5 w-5 mr-2" />
                                        Preview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Tax Configuration Summary */}
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                                            <div className="flex items-center mb-4">
                                                <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                                                    <Settings className="h-4 w-4 text-white" />
                                                </div>
                                                <h4 className="font-semibold text-gray-800">Tax Configuration Summary</h4>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                                                    <span className="text-sm font-medium text-gray-600">Name</span>
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {data.name || 'Not specified'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                                                    <span className="text-sm font-medium text-gray-600">Type</span>
                                                    <span className="text-sm font-semibold text-gray-900 flex items-center">
                                                        {data.type === 'free' ? (
                                                            <>
                                                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                                                Free (No Tax)
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                                                Manual Tax
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                                
                                                {data.type === 'manual' && data.tax_rate && (
                                                    <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                                                        <span className="text-sm font-medium text-gray-600">Tax Rate</span>
                                                        <span className="text-sm font-semibold text-purple-600">
                                                            {data.tax_rate}%
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                                                    <span className="text-sm font-medium text-gray-600">Status</span>
                                                    <span className={`text-sm font-semibold flex items-center ${data.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                                                        <span className={`w-2 h-2 rounded-full mr-2 ${data.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                        {data.is_active ? 'Will be Active' : 'Will be Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Example Calculation */}
                                        {data.type === 'manual' && data.tax_rate && (
                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                                                <div className="flex items-center mb-4">
                                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                                        <Percent className="h-4 w-4 text-white" />
                                                    </div>
                                                    <h4 className="font-semibold text-blue-800">Example Calculation</h4>
                                                </div>
                                                
                                                <div className="bg-white rounded-lg p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Order Amount</span>
                                                        <span className="text-sm font-semibold text-gray-900">$100.00</span>
                                                    </div>
                                                    
                                                    <div className="border-t pt-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Tax ({data.tax_rate}%)</span>
                                                            <span className="text-sm font-semibold text-blue-600">
                                                                ${(100 * parseFloat(data.tax_rate) / 100).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="border-t pt-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-base font-semibold text-gray-800">Total</span>
                                                            <span className="text-base font-bold text-green-600">
                                                                ${(100 + (100 * parseFloat(data.tax_rate) / 100)).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-3 text-xs text-blue-600 text-center">
                                                    💡 This is how the tax will be applied to customer orders
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Free Tax Notice */}
                                        {data.type === 'free' && (
                                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                                                <div className="flex items-center mb-3">
                                                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                                                        <span className="text-white font-bold">🆓</span>
                                                    </div>
                                                    <h4 className="font-semibold text-green-800">Free Tax Applied</h4>
                                                </div>
                                                
                                                <div className="bg-white rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Order Amount</span>
                                                        <span className="text-sm font-semibold text-gray-900">$100.00</span>
                                                    </div>
                                                    
                                                    <div className="border-t pt-3 mt-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Tax (0%)</span>
                                                            <span className="text-sm font-semibold text-green-600">$0.00</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="border-t pt-3 mt-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-base font-semibold text-gray-800">Total</span>
                                                            <span className="text-base font-bold text-green-600">$100.00</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-3 text-xs text-green-600 text-center">
                                                    🎉 No tax will be applied to customer orders
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <Link href="/tax-settings">
                                    <Button variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="flex items-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Settings className="h-4 w-4" />
                                            Update Tax Setting
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
