import { columns } from '@/components/data-table/columns';
import { DataTable } from '@/components/data-table/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Player, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Archive, Baby, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Players',
    href: '/players',
  },
];

interface PageProps {
  players: Player[];
}

export default function Index({ players }: PageProps) {
  const totalPlayers = players.length;
  const activePlayers = players.filter((player) => player.status?.toLowerCase() === 'active').length;
  const inactivePlayers = players.filter((player) => player.status?.toLowerCase() === 'inactive').length;
  const archivedPlayers = players.filter((player) => player.status?.toLowerCase() === 'archived').length;
  const juniorPlayers = players.filter((player) => player.guardian_email && player.guardian_email.trim() !== '').length;
  const adultPlayers = totalPlayers - juniorPlayers;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Players" />
      <div className="container mx-auto mt-10 px-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPlayers}</div>
              <CardDescription className="text-xs text-muted-foreground">
                {activePlayers} active, {inactivePlayers} inactive
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Junior Players</CardTitle>
              <Baby className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{juniorPlayers}</div>
              <CardDescription className="text-xs text-muted-foreground">{adultPlayers} adult players</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Archived Players</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{archivedPlayers}</div>
              <CardDescription className="text-xs text-muted-foreground">
                {((archivedPlayers / totalPlayers) * 100).toFixed(1)}% of total
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="container mx-auto px-3 py-10">
        <DataTable columns={columns} data={players} />
      </div>
    </AppLayout>
  );
}
