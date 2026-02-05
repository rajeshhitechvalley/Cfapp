import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Plus, 
    Edit, 
    Trash2, 
    ToggleLeft, 
    ToggleRight, 
    Settings, 
    Percent,
    Calculator,
    DollarSign,
    Info,
    CheckCircle,
    AlertTriangle,
    Sparkles,
    TrendingUp
} from 'lucide-react';
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                {/* Beautiful Header */}
                <div className="bg-gradient-to-r from-slate-700 via-blue-700 to-indigo-700 shadow-2xl">
                    <div className="px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Calculator className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold text-white">Tax Settings</h1>
                                        <p className="text-blue-100 text-lg mt-1">Configure tax rates and manage financial settings</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Link href="/tax-settings/create">
                                    <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Tax Setting
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="px-6 py-8">
                    {/* Active Tax Display */}
                    {activeTax && (
                        <div className="mb-8">
                            <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white border-0 shadow-2xl">
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-6">
                                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                                <Percent className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-4 mb-3">
                                                    <h2 className="text-3xl font-bold text-white">Currently Active Tax Setting</h2>
                                                    <div className="bg-white/20 px-3 py-1 rounded-full">
                                                        <span className="text-white text-sm font-bold">🟢 ACTIVE</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-4">
                                                        <span className="text-2xl font-bold text-white">{activeTax.name}</span>
                                                        <Badge className="bg-white/20 text-white px-3 py-1 border border-white/30">
                                                            {activeTax.type === 'free' ? '🆓 Free Tax' : '📝 Manual Tax'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center space-x-3 text-white/90">
                                                        <DollarSign className="h-6 w-6" />
                                                        <span className="text-3xl font-bold">Tax Rate: <span className="font-black">{activeTax.formatted_tax_rate}</span></span>
                                                    </div>
                                                    {activeTax.description && (
                                                        <div className="flex items-start space-x-2 text-white/80">
                                                            <Info className="h-5 w-5 mt-1" />
                                                            <p className="text-white/90 italic">{activeTax.description}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                                                <div className="text-white/80 text-xs font-medium mb-1">APPLIED TO</div>
                                                <div className="text-white text-lg font-bold">ALL ORDERS</div>
                                                <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center animate-pulse">
                                                    <CheckCircle className="h-5 w-5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tax Settings List */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <Sparkles className="h-6 w-6 text-indigo-600" />
                            <h2 className="text-2xl font-bold text-gray-900">All Tax Settings</h2>
                            <Badge className="bg-indigo-100 text-indigo-800 px-3 py-1">
                                {taxSettings.length} {taxSettings.length === 1 ? 'Setting' : 'Settings'}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {taxSettings.map((taxSetting) => (
                                <Card key={taxSetting.id} className={`bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${taxSetting.is_active ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}>
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="flex items-center space-x-3 text-xl">
                                                    <div className={`p-2 rounded-xl ${taxSetting.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}>
                                                        <Percent className="h-5 w-5 text-white" />
                                                    </div>
                                                    <span className={`${taxSetting.is_active ? 'text-emerald-600' : 'text-gray-600'}`}>{taxSetting.name}</span>
                                                </CardTitle>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <Badge className={taxSetting.type === 'free' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                                                        {taxSetting.type === 'free' ? '🆓 Free' : '📝 Manual'}
                                                    </Badge>
                                                    {taxSetting.is_active && (
                                                        <Badge className="bg-emerald-600 text-white px-2 py-1 text-xs font-semibold animate-pulse">
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
                                                    className="h-10 w-10 p-0 hover:bg-gray-100"
                                                >
                                                    {taxSetting.is_active ? (
                                                        <ToggleRight className="h-5 w-5 text-emerald-600" />
                                                    ) : (
                                                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg">
                                                <span className="text-sm font-medium text-gray-600">Tax Rate</span>
                                                <div className="flex items-center space-x-2">
                                                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                                                    <span className="text-2xl font-bold text-indigo-600">{taxSetting.formatted_tax_rate}</span>
                                                </div>
                                            </div>
                                            
                                            {taxSetting.description && (
                                                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                                                    <div className="flex items-start space-x-2">
                                                        <Info className="h-4 w-4 text-blue-600 mt-1" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                                                            <p className="text-gray-900">{taxSetting.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-4 border-t">
                                                <Link href={`/tax-settings/${taxSetting.id}/edit`}>
                                                    <Button variant="outline" size="sm" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200">
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => deleteTaxSetting(taxSetting.id)}
                                                    className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Empty State */}
                    {taxSettings.length === 0 && (
                        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="text-center space-y-6">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                        <Calculator className="h-10 w-10 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Tax Settings Found</h3>
                                        <p className="text-gray-600 mb-6">Get started by creating your first tax setting to manage your restaurant's tax configuration.</p>
                                        <Link href="/tax-settings/create">
                                            <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Your First Tax Setting
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
