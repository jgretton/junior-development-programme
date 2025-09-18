import { Player } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '../ui/badge';

import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

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
      const getVariant = (status: string) => {
        switch (status.toLowerCase()) {
          case 'active':
            return 'default';
          case 'inactive':
            return 'secondary';
          case 'archived':
            return 'outline';
          default:
            return 'secondary';
        }
      };

      return (
        <div className="text-center">
          <Badge className="" variant={getVariant(status)}>
            {status}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'last_login_at',
    header: () => <div className="text-center">Last Logged In</div>,

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
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>Copy payment ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
