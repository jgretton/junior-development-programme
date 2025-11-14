import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import coaches from '@/routes/coaches';
import pendingApprovals from '@/routes/pending-approvals';
import playerProgress from '@/routes/player-progress';
import players from '@/routes/players';
import sessions from '@/routes/sessions';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Calendar, ClipboardCheck, IdCardLanyard, LayoutGrid, Users, UserStar } from 'lucide-react';
import AppLogo from './app-logo';
import { Separator } from './ui/separator';

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: dashboard(),
    icon: LayoutGrid,
  },
  {
    title: 'Sessions',
    href: sessions.index(),
    icon: Calendar,
  },
  {
    title: 'Player Progress',
    href: playerProgress.index(),
    icon: UserStar,
  },
];
const adminNavItems: NavItem[] = [
  {
    title: 'Pending Approvals',
    href: pendingApprovals.index(),
    icon: ClipboardCheck,
  },
  {
    title: 'Players',
    href: players.index(),
    icon: Users,
  },
  {
    title: 'Coaches',
    href: coaches.index(),
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
