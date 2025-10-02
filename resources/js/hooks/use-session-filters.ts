import { isSessionCompleted, isSessionUpcoming } from '@/lib/session-utils';
import { FilterType, Session } from '@/types/session';
import { useMemo } from 'react';

interface UseSessionFiltersParams {
  sessions: Session[];
  searchQuery: string;
  filter: FilterType;
}

export function useSessionFilters({ sessions, searchQuery, filter }: UseSessionFiltersParams) {
  return useMemo(() => {
    let filtered = sessions;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter((session) => {
        const isUpcoming = isSessionUpcoming(session.date);
        const isCompleted = isSessionCompleted(session);

        if (filter === 'upcoming') return isUpcoming;
        if (filter === 'completed') return isCompleted;
        if (filter === 'pending') return !isUpcoming && !isCompleted;
        return true;
      });
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((s) => {
        const sessionDate = new Date(s.date);
        const formattedDate = sessionDate.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        return (
          s.name.toLowerCase().includes(query) ||
          s.focus_areas?.toLowerCase().includes(query) ||
          s.criteria?.some((c) => c.name.toLowerCase().includes(query)) ||
          formattedDate.toLowerCase().includes(query) ||
          s.date.includes(query)
        );
      });
    }

    return filtered;
  }, [sessions, searchQuery, filter]);
}
