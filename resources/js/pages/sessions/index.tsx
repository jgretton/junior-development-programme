import Heading from '@/components/heading';
import { SessionFilters } from '@/components/sessions/session-filters';
import { SessionList } from '@/components/sessions/session-list';
import { Button } from '@/components/ui/button';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useSessionFilters } from '@/hooks/use-session-filters';
import { calculateSessionCounts, groupSessionsByMonth } from '@/lib/session-utils';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { FilterType, Session } from '@/types/session';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Sessions',
    href: '/sessions',
  },
];

const ITEMS_PER_PAGE = 15;

interface SessionsPageProps {
  sessions: Session[];
}

export default function SessionsPage({ sessions }: SessionsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const sessionCounts = useMemo(() => calculateSessionCounts(sessions), [sessions]);
  const filteredSessions = useSessionFilters({ sessions, searchQuery, filter });
  const groupedSessions = useMemo(() => groupSessionsByMonth(filteredSessions), [filteredSessions]);

  const { displayCount, loadMoreRef, hasMore, resetDisplayCount } = useInfiniteScroll({
    itemsPerPage: ITEMS_PER_PAGE,
    totalItems: filteredSessions.length,
  });

  const displayedGroups = useMemo(() => {
    let count = 0;
    const result = [];

    for (const group of groupedSessions) {
      const remainingInGroup = displayCount - count;
      if (remainingInGroup <= 0) break;

      const displayedSessions = group.sessions.slice(0, remainingInGroup);
      if (displayedSessions.length > 0) {
        result.push({
          ...group,
          sessions: displayedSessions,
        });
        count += displayedSessions.length;
      }
    }

    return result;
  }, [groupedSessions, displayCount]);

  useEffect(() => {
    resetDisplayCount();
  }, [searchQuery, resetDisplayCount]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Sessions" />
      <div className="container mx-auto px-4 py-6 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Heading title="Sessions" />
          <Button size="sm">Create Session</Button>
        </div>

        <div className="mt-6">
          <SessionFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={filter}
            onFilterChange={setFilter}
            sessionCounts={sessionCounts}
          />
        </div>

        <div className="mt-6">
          <SessionList groups={displayedGroups} hasMore={hasMore} loadMoreRef={loadMoreRef} />
        </div>
      </div>
    </AppLayout>
  );
}
