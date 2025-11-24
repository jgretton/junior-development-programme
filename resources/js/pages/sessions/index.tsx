import Heading from '@/components/heading';
import { SessionCard } from '@/components/sessions/session-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from '@/layouts/app-layout';
import { groupSessionsByMonth } from '@/lib/session-utils';
import { BreadcrumbItem } from '@/types';
import { Session, SessionGroup } from '@/types/session';
import { Head, InfiniteScroll, Link } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, PlusIcon, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Sessions',
    href: '/sessions',
  },
];

interface ScrollProp<T> {
  data: T[];
  links: any;
  meta: any;
}

interface Counts {
  pending: number;
  completed: number;
}

interface SessionsPageProps {
  pendingSessions: Session[];
  completedSessions: ScrollProp<Session>;
  counts: Counts;
  flash?: { error?: string; success?: string; warning?: string };
}

function SessionsByMonth({ groups }: { groups: SessionGroup[] }) {
  if (groups.length === 0) return null;

  return (
    <>
      {groups.map((group) => (
        <div key={`${group.year}-${group.month}`} className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            {group.monthName} {group.year}
          </h3>
          <div className="space-y-2">
            {group.sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export default function SessionsPage({ pendingSessions, completedSessions, counts, flash }: SessionsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter pending sessions by search
  const filteredPendingSessions = useMemo(() => {
    if (!searchQuery) return pendingSessions;
    const query = searchQuery.toLowerCase();
    return pendingSessions.filter((s) =>
      s.name.toLowerCase().includes(query) ||
      s.focus_areas?.toLowerCase().includes(query)
    );
  }, [pendingSessions, searchQuery]);

  // Filter completed sessions by search and group by month
  const groupedCompletedSessions = useMemo(() => {
    let sessions = completedSessions.data;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      sessions = sessions.filter((s) =>
        s.name.toLowerCase().includes(query) ||
        s.focus_areas?.toLowerCase().includes(query)
      );
    }
    return groupSessionsByMonth(sessions);
  }, [completedSessions.data, searchQuery]);

  // Group pending sessions by month as well
  const groupedPendingSessions = useMemo(() => {
    return groupSessionsByMonth(filteredPendingSessions);
  }, [filteredPendingSessions]);

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
    if (flash?.warning) toast.warning(flash.warning);
  }, [flash]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Toaster richColors expand position="top-center" />
      <Head title="Sessions" />
      <div className="container mx-auto mt-10 max-w-7xl px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Heading title="Sessions" />
          <Link href="/sessions/create">
            <Button>
              <PlusIcon className="mr-1.5 h-4 w-4" /> Create Session
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mt-8">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Pending Approvals Section */}
        {filteredPendingSessions.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold">Pending Approvals</h2>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                {counts.pending}
              </Badge>
            </div>
            <SessionsByMonth groups={groupedPendingSessions} />
          </div>
        )}

        {/* Completed Sessions Section */}
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold">Completed</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
              {counts.completed}
            </Badge>
          </div>

          {groupedCompletedSessions.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <p className="text-sm text-muted-foreground">No completed sessions found.</p>
            </div>
          ) : (
            <InfiniteScroll data="completedSessions">
              <SessionsByMonth groups={groupedCompletedSessions} />
            </InfiniteScroll>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
