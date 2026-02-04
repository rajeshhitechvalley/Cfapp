import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Calendar, Table2, ShoppingCart, TrendingUp, Utensils, Settings, Users, ChefHat, Phone, Zap } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Orders',
        href: '/orders',
        icon: ShoppingCart,
    },
    {
        title: 'Menu Items',
        href: '/menu-items',
        icon: Utensils,
    },
    {
        title: 'Sales',
        href: '/sales/dashboard',
        icon: TrendingUp,
        hasSubmenu: true,
        items: [
            {
                title: 'Dashboard',
                href: '/sales/dashboard',
            },
            {
                title: 'Reports',
                href: '/sales/reports',
            },
            {
                title: 'Menu Analytics',
                href: '/sales/menu-analytics',
            },
        ],
    },
    {
        title: 'Reservations',
        href: '/reservations',
        icon: Calendar,
    },
    {
        title: 'Tables',
        href: '/tables',
        icon: Table2,
    },
    {
        title: 'Quick Table Book',
        href: '/quick-table-book',
        icon: Zap,
    },
    {
        title: 'Kitchen Display',
        href: '/kitchen',
        icon: ChefHat,
    },
    {
        title: 'Reception',
        href: '/reception',
        icon: Phone,
    },
    {
        title: 'Tax Settings',
        href: '/tax-settings',
        icon: Settings,
    },
    {
        title: 'User Management',
        href: '/users',
        icon: Users,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

export default AppSidebar;
