import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react';

// Type for player progress data
export type PlayerProgressData = {
  id: number;
  name: string;
  email: string;
  currentRank: {
    name: string;
    level: number;
  };
  overallProgress: number;
  categoryRanks: {
    [category: string]: {
      rank: string;
      percentage: number;
    };
  };
  progressByRank: Array<{
    rank: { name: string; level: number };
    completed: number;
    total: number;
    percentage: number;
  }>;
};

// Helper to get rank text color
const getRankColor = (rankName: string) => {
  switch (rankName.toLowerCase()) {
    case 'bronze':
      return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700';
    case 'silver':
      return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700';
    case 'gold':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700';
    case 'platinum':
      return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-700';
    default:
      return '';
  }
};

// Helper to get progress color
const getProgressColor = (percentage: number) => {
  if (percentage >= 75) return 'bg-green-500';
  if (percentage >= 50) return 'bg-blue-500';
  if (percentage >= 25) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const createPlayerProgressColumns = (selectedCategory: string): ColumnDef<PlayerProgressData>[] => {
  const columns: ColumnDef<PlayerProgressData>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Player
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => row.toggleExpanded()}
              className="h-6 w-6 p-0"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <div>
              <div className="font-medium">{row.original.name}</div>
              <div className="text-sm text-muted-foreground">{row.original.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'currentRank',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Current Rank
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const rank = row.original.currentRank;
        // Find the progress for the current rank
        const currentRankProgress = row.original.progressByRank.find(
          (r) => r.rank.level === rank.level
        );
        const rankPercentage = currentRankProgress?.percentage || 0;

        return (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${getRankColor(rank.name)} font-semibold`}
            >
              {rank.name}
            </Badge>
            <span className="text-sm font-medium text-muted-foreground">
              {rankPercentage}%
            </span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        // Sort by rank level first, then by percentage within that rank
        const levelDiff = rowA.original.currentRank.level - rowB.original.currentRank.level;
        if (levelDiff !== 0) return levelDiff;

        // If same rank, sort by percentage
        const rowAProgress = rowA.original.progressByRank.find(
          (r) => r.rank.level === rowA.original.currentRank.level
        );
        const rowBProgress = rowB.original.progressByRank.find(
          (r) => r.rank.level === rowB.original.currentRank.level
        );

        return (rowAProgress?.percentage || 0) - (rowBProgress?.percentage || 0);
      },
    },
  ];

  // If a category is selected, show category rank and progress
  if (selectedCategory !== 'all') {
    columns.push(
      {
        id: 'categoryRank',
        accessorFn: (row) => {
          const categoryData = row.categoryRanks[selectedCategory];
          if (!categoryData) return null;

          const getRankLevel = (rankName: string) => {
            switch (rankName.toLowerCase()) {
              case 'bronze': return 1;
              case 'silver': return 2;
              case 'gold': return 3;
              case 'platinum': return 4;
              default: return 0;
            }
          };

          // Create a sortable value: rank_level * 1000 + percentage
          // This ensures Silver 1% (2001) > Bronze 99% (1099)
          const rankLevel = getRankLevel(categoryData.rank);
          return rankLevel * 1000 + categoryData.percentage;
        },
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              {selectedCategory} Rank
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const categoryData = row.original.categoryRanks[selectedCategory];
          if (!categoryData) return <span className="text-sm text-muted-foreground">-</span>;

          return (
            <Badge
              variant="outline"
              className={`${getRankColor(categoryData.rank)} font-semibold`}
            >
              {categoryData.rank}
            </Badge>
          );
        },
      },
      {
        id: 'categoryProgress',
        header: () => {
          return (
            <div className="px-4">
              {selectedCategory} Progress
            </div>
          );
        },
        cell: ({ row }) => {
          const categoryData = row.original.categoryRanks[selectedCategory];
          if (!categoryData) return <span className="text-sm text-muted-foreground">-</span>;

          return (
            <div className="flex items-center gap-3">
              <div className="w-24">
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full transition-all ${getProgressColor(categoryData.percentage)}`}
                    style={{ width: `${categoryData.percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium">{categoryData.percentage}%</span>
            </div>
          );
        },
        enableSorting: false,
      }
    );
  } else {
    // Show rank progress breakdown when no category is selected
    columns.push({
      id: 'rankProgress',
      header: 'Rank Progress',
      cell: ({ row }) => {
        const progressByRank = row.original.progressByRank;
        return (
          <div className="flex gap-2">
            {progressByRank.map((rankProgress) => (
              <div key={rankProgress.rank.name} className="flex flex-col items-center">
                <div className="text-xs font-medium text-muted-foreground">
                  {rankProgress.rank.name.substring(0, 3)}
                </div>
                <div className="text-sm font-bold">{rankProgress.percentage}%</div>
              </div>
            ))}
          </div>
        );
      },
    });
  }

  return columns;
};

// Export default columns for when no category is selected
export const player_progress_columns = createPlayerProgressColumns('all');
