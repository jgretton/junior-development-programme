import { Player } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '../ui/badge';

import PlayerController from '@/actions/App/Http/Controllers/Admin/PlayerController';
import { Form } from '@inertiajs/react';
import {
  Archive,
  ArrowUpDown,
  CheckCircle,
  Clock,
  CopyIcon,
  Edit2Icon,
  LoaderCircle,
  MailIcon,
  MoreHorizontal,
  Pause,
  Trash2Icon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from './data-table-column-header';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Player>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="w-full justify-start" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
  },
  {
    accessorKey: 'guardian_email',
    header: 'Guardian Email',
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button variant="ghost" className="w-full" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as string;

      const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
          case 'active':
            return {
              variant: 'default' as const,
              icon: CheckCircle,
              className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
            };
          case 'inactive':
            return {
              variant: 'secondary' as const,
              icon: Pause,
              className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
            };
          case 'pending':
            return {
              variant: 'outline' as const,
              icon: Clock,
              className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
            };
          case 'archived':
            return {
              variant: 'destructive' as const,
              icon: Archive,
              className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
            };
          default:
            return {
              variant: 'secondary' as const,
              icon: Pause,
              className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
            };
        }
      };

      const config = getStatusConfig(status);
      const IconComponent = config.icon;

      return (
        <div className="text-center">
          <Badge className={config.className} variant={config.variant}>
            <IconComponent className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'last_login_at',
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button variant="ghost" className="w-full" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Last Logged In
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },

    cell: ({ row }) => {
      const lastLogin = row.getValue('last_login_at') as string | null;

      if (!lastLogin) {
        return <div className="text-center">Never</div>;
      }

      const getTimeAgo = (dateString: string) => {
        const loginDate = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - loginDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          return 'Today';
        } else if (diffDays === 1) {
          return '1 day ago';
        } else if (diffDays <= 30) {
          return `${diffDays} days ago`;
        } else {
          const diffMonths = Math.floor(diffDays / 30);
          if (diffMonths === 1) {
            return '1 month ago';
          } else {
            return `${diffMonths} months ago`;
          }
        }
      };

      return <div className="text-center">{getTimeAgo(lastLogin)}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const player = row.original;
      const isPending = player.status?.toLowerCase() === 'pending';
      const meta = table.options.meta as { editPlayer?: (player: Player) => void; deletePlayer?: (player: Player) => void };

      return (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.getValue('email'))}>
                <CopyIcon className="size-3 text-gray-500" />
                Copy Player Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isPending && (
                <>
                  <Form {...PlayerController.resendInvitation.form(parseInt(player.id))}>
                    {({ processing }) => (
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        asChild
                      >
                        <button className="flex w-full items-center gap-2" disabled={processing}>
                          {processing ? <LoaderCircle className="size-3 animate-spin" /> : <MailIcon className="size-3" />}
                          {processing ? 'Sending invitation' : 'Resend Invitation'}
                        </button>
                      </DropdownMenuItem>
                    )}
                  </Form>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onSelect={() => meta?.editPlayer?.(row.original)}>
                <Edit2Icon className="size-3 text-gray-500" />
                Edit Player
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => meta?.deletePlayer?.(row.original)}>
                <Trash2Icon className="size-3 text-red-500" />
                Delete Player
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
