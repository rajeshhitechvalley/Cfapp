import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Table, Settings, Plus, List, Eye, Edit } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Test Navigation', href: '/test' },
];

export default function TestNavigation() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Test Navigation" />
            <div className="space-y-6 p-6">
                <h1 className="text-3xl font-bold">Cafe Booking System - Test Navigation</h1>
                <p className="text-gray-600">Test all CRUD operations and pages</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Reservations Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Reservations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/reservations">
                                <Button className="w-full justify-start">
                                    <List className="mr-2 h-4 w-4" />
                                    All Reservations
                                </Button>
                            </Link>
                            <Link href="/reservations/create">
                                <Button className="w-full justify-start" variant="outline">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Reservation
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Tables Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Table className="h-5 w-5" />
                                Tables
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/tables">
                                <Button className="w-full justify-start">
                                    <List className="mr-2 h-4 w-4" />
                                    All Tables
                                </Button>
                            </Link>
                            <Link href="/tables/create">
                                <Button className="w-full justify-start" variant="outline">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Table
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Dashboard Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Dashboard
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/dashboard">
                                <Button className="w-full justify-start">
                                    <Eye className="mr-2 h-4 w-4" />
                                    Main Dashboard
                                </Button>
                            </Link>
                            <Link href="/calendar">
                                <Button className="w-full justify-start" variant="outline">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Calendar View
                                </Button>
                            </Link>
                            <Link href="/analytics">
                                <Button className="w-full justify-start" variant="outline">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Analytics
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">✅</div>
                                <p className="text-sm text-gray-600">Reservations CRUD</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">✅</div>
                                <p className="text-sm text-gray-600">Tables CRUD</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">✅</div>
                                <p className="text-sm text-gray-600">Dashboard</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Database Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Database Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="font-medium">Users:</p>
                                <p className="text-gray-600">1 (test user available)</p>
                            </div>
                            <div>
                                <p className="font-medium">Tables:</p>
                                <p className="text-gray-600">28 (sample tables seeded)</p>
                            </div>
                            <div>
                                <p className="font-medium">Table Types:</p>
                                <p className="text-gray-600">10 (categories available)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
