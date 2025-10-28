import Heading from '@/components/heading';
import { LastSessionCard } from '@/components/sessions/last-session-card';
import { NextSessionCard } from '@/components/sessions/next-session-card';
import { SessionList } from '@/components/sessions/session-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import AppLayout from '@/layouts/app-layout';
import { groupSessionsByMonth, isSessionUpcoming } from '@/lib/session-utils';
import { BreadcrumbItem } from '@/types';
import { FilterType, Session } from '@/types/session';
import { Head, Link } from '@inertiajs/react';
import { PlusIcon, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Sessions',
    href: '/sessions',
  },
];

const ITEMS_PER_PAGE = 15;

interface SessionsPageProps {
  sessions: Session[];
  flash: { error: string; success: string; warning: string };
}

export default function SessionsPage({ sessions, flash }: SessionsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  // Find next upcoming session
  const nextSession = useMemo(() => {
    const upcomingSessions = sessions
      .filter((s) => isSessionUpcoming(s.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcomingSessions[0] || null;
  }, [sessions]);

  // Find last past session
  const lastSession = useMemo(() => {
    const pastSessions = sessions
      .filter((s) => !isSessionUpcoming(s.date))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return pastSessions[0] || null;
  }, [sessions]);

  // Calculate counts for filter tabs
  const filterCounts = useMemo(() => {
    return {
      all: sessions.length,
      pending: sessions.filter((s) => !isSessionUpcoming(s.date) && !s.is_assessed).length,
      completed: sessions.filter((s) => s.is_assessed).length,
      upcoming: sessions.filter((s) => isSessionUpcoming(s.date)).length,
    };
  }, [sessions]);

  // Filter sessions for the list
  const filteredSessions = useMemo(() => {
    return sessions
      .filter((s) => {
        // Apply filter
        if (filter === 'pending') {
          return !isSessionUpcoming(s.date) && !s.is_assessed;
        } else if (filter === 'completed') {
          return s.is_assessed;
        } else if (filter === 'upcoming') {
          return isSessionUpcoming(s.date);
        }
        return true; // 'all'
      })
      .filter((s) => {
        // Apply search
        if (!searchQuery) return true;
        return s.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [sessions, searchQuery, filter]);

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
  }, [searchQuery, filter, resetDisplayCount]);

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
    if (flash?.warning) toast.warning(flash.warning);
  }, [flash]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Toaster richColors expand position="top-center" />
      <Head title="Sessions" />
      <div className="container mx-auto max-w-7xl mt-10 px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Heading title="Sessions" />
          <Link href={'/sessions/create'}>
            <Button>
              <PlusIcon /> Create Session
            </Button>
          </Link>
        </div>

        {/* Prominent Cards Section */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <NextSessionCard session={nextSession} />
          <LastSessionCard session={lastSession} />
        </div>

        {/* All Sessions Section */}
        <div className="mt-10">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">All Sessions</h2>
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

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="relative">
                All
                <span className="ml-1.5 text-xs text-muted-foreground">({filterCounts.all})</span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Pending
                <span className="ml-1.5 text-xs text-muted-foreground">({filterCounts.pending})</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="relative">
                Assessed
                <span className="ml-1.5 text-xs text-muted-foreground">({filterCounts.completed})</span>
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="relative">
                Upcoming
                <span className="ml-1.5 text-xs text-muted-foreground">({filterCounts.upcoming})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <SessionList groups={displayedGroups} hasMore={hasMore} loadMoreRef={loadMoreRef} />
        </div>
      </div>
    </AppLayout>
  );
}
