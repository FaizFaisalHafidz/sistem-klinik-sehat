import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-0 py-0">
            <SidebarGroupLabel className="px-3 text-gray-600 font-semibold">Menu Sistem</SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                            asChild 
                            isActive={page.url.startsWith(item.href)} 
                            tooltip={{ children: item.title }}
                            className="bg-white/50 hover:bg-white/80 border border-transparent hover:border-gray-200/50 transition-all duration-200 backdrop-blur-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-500/10 data-[active=true]:to-green-500/10 data-[active=true]:border-blue-200/50 data-[active=true]:text-blue-700"
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon className="text-gray-600 data-[active=true]:text-blue-600" />}
                                <span className="font-medium">{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
