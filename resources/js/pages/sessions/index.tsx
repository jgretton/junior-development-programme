import Heading from '@/components/heading';
import { LastSessionCard } from '@/components/sessions/last-session-card';
import { NextSessionCard } from '@/components/sessions/next-session-card';
import { SessionList } from '@/components/sessions/session-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from '@/layouts/app-layout';
import { groupSessionsByMonth, isSessionUpcoming } from '@/lib/session-utils';
import { BreadcrumbItem } from '@/types';
import { FilterType, Session } from '@/types/session';
import { Head, Link, InfiniteScroll } from '@inertiajs/react';
import { PlusIcon, Search } from 'lucide-react';
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
  all: number;
  pending: number;
  completed: number;
  upcoming: number;
}

interface SessionsPageProps {
  sessions: ScrollProp<Session>;
  counts: Counts;
  flash: { error: string; success: string; warning: string };
}

export default function SessionsPage({ sessions, counts, flash }: SessionsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  // We need to access the items from the infinite scroll data.
  // For the "Next" and "Last" cards, we ideally want the *latest* data.
  // 'sessions.data' will contain the merged items as InfiniteScroll loads more.
  const allItems = sessions.data || [];

  // Find next upcoming session
  const nextSession = useMemo(() => {
    const upcomingSessions = allItems
      .filter((s: Session) => isSessionUpcoming(s.date))
      .sort((a: Session, b: Session) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcomingSessions[0] || null;
  }, [allItems]);

  // Find last past session
  const lastSession = useMemo(() => {
    const pastSessions = allItems
      .filter((s: Session) => !isSessionUpcoming(s.date))
      .sort((a: Session, b: Session) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return pastSessions[0] || null;
  }, [allItems]);

  // Filter sessions for the list (client-side filtering of loaded items)
  const filteredSessions = useMemo(() => {
    return allItems
      .filter((s: Session) => {
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
      .filter((s: Session) => {
        // Apply search
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const date = new Date(s.date);
        const dateString = date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        return (
          s.name.toLowerCase().includes(query) ||
          s.date.includes(query) ||
          dateString.toLowerCase().includes(query)
        );
      });
  }, [allItems, searchQuery, filter]);

  const groupedSessions = useMemo(() => groupSessionsByMonth(filteredSessions), [filteredSessions]);

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
                <span className="ml-1.5 text-xs text-muted-foreground">({counts.all})</span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Pending
                <span className="ml-1.5 text-xs text-muted-foreground">({counts.pending})</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="relative">
                Assessed
                <span className="ml-1.5 text-xs text-muted-foreground">({counts.completed})</span>
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="relative">
                Upcoming
                <span className="ml-1.5 text-xs text-muted-foreground">({counts.upcoming})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <InfiniteScroll data="sessions">
            <SessionList groups={groupedSessions} />
          </InfiniteScroll>
        </div>
      </div>
    </AppLayout>
  );
}
