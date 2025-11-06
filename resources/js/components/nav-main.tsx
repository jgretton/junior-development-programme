import { Badge } from '@/components/ui/badge';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [], title }: { items: NavItem[]; title: string }) {
  const page = usePage();
  const pendingApprovalsCount = (usePage().props as any).pendingApprovalsCount as number | undefined;

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={page.url.startsWith(typeof item.href === 'string' ? item.href : item.href.url)}
              tooltip={{ children: item.title }}>
              <Link href={item.href} prefetch>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                {item.title === 'Pending Approvals' && pendingApprovalsCount > 0 && (
                  <Badge variant="default" className="ml-auto flex shrink-0 items-center justify-center rounded-full p-0 px-1 text-xs">
                    {pendingApprovalsCount}
                  </Badge>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
