import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterType, SessionCounts } from '@/types/session';
import { Search } from 'lucide-react';

interface SessionFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sessionCounts: SessionCounts;
}

export function SessionFilters({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  sessionCounts,
}: SessionFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs value={filter} onValueChange={(value: string) => onFilterChange(value as FilterType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="text-xs sm:text-sm">
            Upcoming {sessionCounts.upcoming > 0 && <span className="ml-1">({sessionCounts.upcoming})</span>}
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">
            Pending {sessionCounts.pending > 0 && <span className="ml-1">({sessionCounts.pending})</span>}
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">
            Completed {sessionCounts.completed > 0 && <span className="ml-1">({sessionCounts.completed})</span>}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
