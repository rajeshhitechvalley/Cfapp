import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Settings, Percent } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface TaxSetting {
    id: number;
    name: string;
    type: 'free' | 'manual';
    tax_rate: number | null;
    is_active: boolean;
    description: string | null;
    formatted_tax_rate: string;
}

interface Props {
    taxSettings: TaxSetting[];
    activeTax: TaxSetting | null;
}

export default function TaxSettingsIndex({ taxSettings, activeTax }: Props) {
    const toggleActive = (id: number) => {
        router.post(`/tax-settings/${id}/toggle-active`, {}, {
            preserveScroll: true,
        });
    };

    const deleteTaxSetting = (id: number) => {
        if (confirm('Are you sure you want to delete this tax setting?')) {
            router.delete(`/tax-settings/${id}`);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tax Settings', href: '/tax-settings' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tax Settings" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center">
                                <Settings className="h-8 w-8 mr-3" />
                                Tax Settings
                            </h1>
                            <p className="text-muted-foreground">Manage tax rates and configurations</p>
                        </div>
                    </div>
                    <Link href="/tax-settings/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Tax Setting
                        </Button>
                    </Link>
                </div>

                {/* Active Tax Display */}
                {activeTax && (
                    <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-xl p-6 border-2 border-green-300 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Percent className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h2 className="text-2xl font-bold text-green-500">Currently Active Tax Setting</h2>
                                        <Badge className="bg-green-600 text-white px-3 py-1 text-sm font-semibold shadow-md">
                                            🟢 ACTIVE
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-4">
                                            <span className="text-lg font-bold text-green-600">{activeTax.name}</span>
                                            <Badge className={activeTax.type === 'free' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                                                {activeTax.type === 'free' ? '🆓 Free' : '📝 Manual'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center space-x-6 text-green-600">
                                            <span className="flex items-center">
                                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                Tax Rate: <span className="font-bold text-green-600 ml-1">{activeTax.formatted_tax_rate}</span>
                                            </span>
                                            {activeTax.description && (
                                                <span className="text-sm text-green-600 italic">
                                                    💡 {activeTax.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="text-right">
                                    <div className="text-xs text-green-600 font-medium mb-1">APPLIED TO</div>
                                    <div className="text-sm font-bold text-green-700">ALL ORDERS</div>
                                </div>
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                                    <span className="text-white text-xs font-bold">✓</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tax Settings List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {taxSettings.map((taxSetting) => (
                        <Card key={taxSetting.id} className={`transition-all duration-200 hover:shadow-lg ${taxSetting.is_active ? 'border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md' : ''}`}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-green-600 text-lg">{taxSetting.name}</CardTitle>
                                        <div className="flex items-center space-x-2 mt-2">
                                            <Badge className={taxSetting.type === 'free' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                                                {taxSetting.type === 'free' ? '🆓 Free' : '📝 Manual'}
                                            </Badge>
                                            {taxSetting.is_active && (
                                                <Badge className="bg-green-600 text-white px-2 py-1 text-xs font-semibold shadow-sm animate-pulse">
                                                    🟢 ACTIVE
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleActive(taxSetting.id)}
                                            className="h-8 w-8 p-0"
                                        >
                                            {taxSetting.is_active ? (
                                                <ToggleRight className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <ToggleLeft className="h-4 w-4 text-gray-400" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Tax Rate:</span>
                                        <span className="font-medium">{taxSetting.formatted_tax_rate}</span>
                                    </div>
                                    
                                    {taxSetting.description && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Description:</p>
                                            <p className="text-sm">{taxSetting.description}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-2 pt-2">
                                        <Link href={`/tax-settings/${taxSetting.id}/edit`}>
                                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                                                <Edit className="h-3 w-3" />
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => deleteTaxSetting(taxSetting.id)}
                                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {taxSettings.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Tax Settings Found</h3>
                            <p className="text-muted-foreground mb-4">Get started by creating your first tax setting.</p>
                            <Link href="/tax-settings/create">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Tax Setting
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
