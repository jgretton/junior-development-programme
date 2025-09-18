import { columns } from '@/components/data-table/columns';
import { DataTable } from '@/components/data-table/data-table';
import AppLayout from '@/layouts/app-layout';
import { Player, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

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
  console.log('This is the players', players);
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Players" />
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={players} />
      </div>
    </AppLayout>
  );
}
