import { coaches_columns } from '@/components/data-table/columns/coaches-columns';
import { DataTable } from '@/components/data-table/data-table';
import Heading from '@/components/heading';
import AddCoachModal from '@/components/modals/add-coach-modal';
import DeleteUserModal from '@/components/modals/delete-user-modal';
import UpdateCoachSheet from '@/components/sheets/update-coach-sheet';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Player } from '@/types';
import { Head } from '@inertiajs/react';
import React from 'react';
import { toast, Toaster } from 'sonner';
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Coaches',
    href: '/players',
  },
];

interface PageProps {
  coaches: Player[];
  error: string;
  flash: { error: string; success: string };
}

export default function Index({ coaches, error, flash }: PageProps) {
  const [editingUser, setEditingUser] = React.useState<Player | null>();
  const [deletingPlayer, setDeletingPlayer] = React.useState<Player | null>();
  React.useEffect(() => {
    if (flash.success) toast.success(flash.success);
    if (flash.error) toast.error(flash.error);
  }, [flash]);
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Coaches" />
      <div className="container mx-auto mt-10 px-4">
        <div className="flex flex-row justify-between">
          <Heading title="Coaches" />
          <div className="flex">
            <AddCoachModal />
          </div>
        </div>
        <DataTable columns={coaches_columns} data={coaches} onEditPlayer={setEditingUser} onDeletePlayer={setDeletingPlayer} />
        <UpdateCoachSheet player={editingUser} open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)} />
        <DeleteUserModal type="coach" player={deletingPlayer} open={!!deletingPlayer} onOpenChange={(open) => !open && setDeletingPlayer(null)} />
      </div>
      <Toaster richColors expand position="top-center" />
    </AppLayout>
  );
}
