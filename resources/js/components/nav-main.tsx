import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
import { useState } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

    const toggleSubmenu = (title: string) => {
        setOpenSubmenus(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const isSubmenuActive = (item: NavItem): boolean => {
        if (item.href && isCurrentUrl(item.href)) return true;
        if (item.items) {
            return item.items.some(subItem => subItem.href && isCurrentUrl(subItem.href));
        }
        return false;
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {item.hasSubmenu && item.items ? (
                            <>
                                <SidebarMenuButton
                                    tooltip={{ children: item.title }}
                                    onClick={() => toggleSubmenu(item.title)}
                                    isActive={isSubmenuActive(item)}
                                >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    <ChevronDown className={`ml-auto transition-transform ${
                                        openSubmenus[item.title] ? 'rotate-180' : ''
                                    }`} />
                                </SidebarMenuButton>
                                {openSubmenus[item.title] && (
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={subItem.href ? isCurrentUrl(subItem.href) : false}
                                                >
                                                    <Link href={subItem.href || '#'} prefetch>
                                                <span>{subItem.title}</span>
                                                </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                )}
                            </>
                        ) : (
                            <SidebarMenuButton
                                asChild
                                isActive={item.href ? isCurrentUrl(item.href) : false}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href || '#'} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
