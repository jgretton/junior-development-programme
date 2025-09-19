import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import players from '@/routes/players';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { IdCardLanyard, LayoutGrid, Users } from 'lucide-react';
import AppLogo from './app-logo';
import { Separator } from './ui/separator';

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: dashboard(),
    icon: LayoutGrid,
  },
];
const adminNavItems: NavItem[] = [
  {
    title: 'Players',
    href: players.index(),
    icon: Users,
  },
  {
    title: 'Coaches',
    href: players.index(),
    icon: IdCardLanyard,
  },
];

export function AppSidebar() {
  const { role } = usePage<SharedData>().props.auth.user;
  const isAdmin = role === 'admin';

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={dashboard()} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain title="Platform" items={mainNavItems} />
        {isAdmin && (
          <>
            <Separator />

            <NavMain title="Admin" items={adminNavItems} />
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
