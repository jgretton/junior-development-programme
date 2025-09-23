import { columns } from '@/components/data-table/columns';
import { DataTable } from '@/components/data-table/data-table';
import Heading from '@/components/heading';
import AddPlayerModal from '@/components/modals/add-player-modal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from '@/layouts/app-layout';
import { Player, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertTriangleIcon, Archive, Baby, Clock, Users } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Players',
    href: '/players',
  },
];

interface PageProps {
  players: Player[];
  error: string;
  flash: { error: string; success: string };
}

export default function Index({ error, players, flash }: PageProps) {
  const stats = React.useMemo(() => {
    const total = players.length;
    const active = players.filter((player) => player.status?.toLowerCase() === 'active').length;
    const inactive = players.filter((player) => player.status?.toLowerCase() === 'inactive').length;
    const archived = players.filter((player) => player.status?.toLowerCase() === 'archived').length;
    const pending = players.filter((player) => player.status?.toLowerCase() === 'pending').length;
    const junior = players.filter((player) => player.guardian_email && player.guardian_email.trim() !== '').length;

    return {
      total,
      active,
      inactive,
      archived,
      pending,
      junior,
      adult: total - junior,
    };
  }, [players]);

  React.useEffect(() => {
    if (flash.success) toast.success(flash.success);
    if (flash.error) toast.error(flash.error);
  }, [flash]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Players" />

      {error ? (
        <div className="flex min-h-screen items-center justify-center">
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertTitle>Unable to load players</AlertTitle>
              <AlertDescription>
                {error}
                <Button variant="outline" size="sm" className="ml-2" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      ) : (
        <div className="container mx-auto mt-10 px-4">
          <div className="flex flex-row justify-between">
            <Heading title="Players" />
            <AddPlayerModal />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <CardDescription className="text-xs text-muted-foreground">
                  {stats.active} active, {stats.inactive} inactive
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Junior Players</CardTitle>
                <Baby className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.junior}</div>
                <CardDescription className="text-xs text-muted-foreground">{stats.adult} adult players</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <CardDescription className="text-xs text-muted-foreground">Awaiting registration</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Archived Players</CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.archived}</div>
                <CardDescription className="text-xs text-muted-foreground">
                  {stats.total > 0 ? ((stats.archived / stats.total) * 100).toFixed(1) : 0}% of total
                </CardDescription>
              </CardContent>
            </Card>
          </div>
          <div className="mt-10">
            <DataTable columns={columns} data={players} />
          </div>
        </div>
      )}

      <Toaster richColors expand position="top-center" />
    </AppLayout>
  );
}
