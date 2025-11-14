import { PlayerProgressDataTable } from '@/components/data-table/player-progress-data-table';
import { createPlayerProgressColumns, type PlayerProgressData } from '@/components/data-table/columns/player-progress-columns';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import playerProgress from '@/routes/player-progress';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Users, Award, BarChart3, Target } from 'lucide-react';
import { Toaster } from 'sonner';
import * as React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Player Progress',
    href: playerProgress.index().url,
  },
];

type PlayerProgressPageProps = {
  players: PlayerProgressData[];
  stats: {
    totalPlayers: number;
    averageRank: {
      name: string;
      level: number;
    };
    rankDistribution: {
      Bronze: number;
      Silver: number;
      Gold: number;
      Platinum: number;
    };
    averageCompletion: number;
  };
};

// Helper to get rank color
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

// Helper to get rank bar color
const getRankBarColor = (rankName: string) => {
  switch (rankName.toLowerCase()) {
    case 'bronze':
      return 'bg-orange-500';
    case 'silver':
      return 'bg-gray-500';
    case 'gold':
      return 'bg-yellow-500';
    case 'platinum':
      return 'bg-slate-500';
    default:
      return 'bg-gray-500';
  }
};

export default function PlayerProgressPage({ players, stats }: PlayerProgressPageProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedRank, setSelectedRank] = React.useState<string>('all');

  // Apply custom filters
  const filteredData = React.useMemo(() => {
    let data = players;

    // Filter by rank
    if (selectedRank !== 'all') {
      data = data.filter((player: PlayerProgressData) => player.currentRank.name === selectedRank);
    }

    // Filter by category - show only players who have progress in this category
    if (selectedCategory !== 'all') {
      data = data.filter((player: PlayerProgressData) => {
        return player.categoryRanks[selectedCategory] !== undefined;
      });
    }

    return data;
  }, [players, selectedRank, selectedCategory]);

  // Create dynamic columns based on selected category
  const columns = React.useMemo(() => {
    return createPlayerProgressColumns(selectedCategory);
  }, [selectedCategory]);

  // Calculate max count for distribution visualization
  const maxDistribution = Math.max(...Object.values(stats.rankDistribution));

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Player Progress" />
      <Toaster richColors expand position="top-center" />

      <div className="container mx-auto mt-10 max-w-7xl px-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Heading
            title="Player Progress"
            description="Track player development across all ranks and categories"
          />
        </div>

        {/* Stats Cards */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Players */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlayers}</div>
              <CardDescription className="text-xs text-muted-foreground">
                Active in programme
              </CardDescription>
            </CardContent>
          </Card>

          {/* Average Club Rank */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Club Rank</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${getRankColor(stats.averageRank.name)} font-semibold`}>
                  {stats.averageRank.name}
                </Badge>
              </div>
              <CardDescription className="mt-1 text-xs text-muted-foreground">
                Level {stats.averageRank.level.toFixed(1)}
              </CardDescription>
            </CardContent>
          </Card>

          {/* Rank Distribution */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rank Distribution</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.rankDistribution).map(([rank, count]) => (
                  <div key={rank} className="flex items-center gap-2">
                    <span className="w-8 text-xs font-medium text-muted-foreground">{rank.substring(0, 3)}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full transition-all ${getRankBarColor(rank)}`}
                        style={{ width: maxDistribution > 0 ? `${(count / maxDistribution) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Average Completion */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageCompletion}%</div>
              <CardDescription className="text-xs text-muted-foreground">
                Overall progress
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <div className="mt-10">
          <PlayerProgressDataTable
            columns={columns}
            data={filteredData}
            selectedRank={selectedRank}
            selectedCategory={selectedCategory}
            onRankChange={setSelectedRank}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </div>
    </AppLayout>
  );
}
