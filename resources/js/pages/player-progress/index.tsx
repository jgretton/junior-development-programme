import { createPlayerProgressColumns, type PlayerProgressData } from '@/components/data-table/columns/player-progress-columns';
import { PlayerProgressDataTable } from '@/components/data-table/player-progress-data-table';
import Heading from '@/components/heading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import playerProgress from '@/routes/player-progress';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Award, BarChart3, Star, Users } from 'lucide-react';
import * as React from 'react';
import { Toaster } from 'sonner';

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
    averageStarsByRank: {
      Bronze: number;
      Silver: number;
      Gold: number;
      Platinum: number;
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

      <div className="container mx-auto mt-10 max-w-7xl px-4 pb-16">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Heading title="Player Progress" description="Track player development across all ranks and categories" />
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
              <CardDescription className="text-xs text-muted-foreground">Active in programme</CardDescription>
            </CardContent>
          </Card>

          {/* Average Stars by Rank */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Stars by Rank</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.averageStarsByRank).map(([rank, avgStars]) => (
                  <div key={rank} className="flex items-center gap-2">
                    <span className="w-8 text-xs font-medium text-muted-foreground">{rank.substring(0, 3)}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const fillPercentage = Math.min(100, Math.max(0, (avgStars - (star - 1)) * 100));
                        return (
                          <div key={star} className="relative h-3 w-3">
                            <Star className="absolute h-3 w-3 text-gray-300" />
                            <div style={{ clipPath: `inset(0 ${100 - fillPercentage}% 0 0)` }}>
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-xs font-bold">{avgStars}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rank Distribution */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Working Towards</CardTitle>
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
              <CardDescription className="text-xs text-muted-foreground">Overall progress</CardDescription>
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
