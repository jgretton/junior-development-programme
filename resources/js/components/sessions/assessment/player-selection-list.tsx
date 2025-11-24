import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Player {
  id: string;
  name: string;
}

interface PlayerSelectionListProps {
  players: Player[];
  selectedPlayerIds: string[];
  onTogglePlayer: (playerId: string) => void;
  showProgressBadges?: boolean;
  getPlayerProgress?: (playerId: string) => { current: number; total: number };
  variant?: 'attendance' | 'achievement';
  /** IDs of players who have already completed this criteria (shown as non-selectable with green tick) */
  alreadyCompletedIds?: string[];
}

export function PlayerSelectionList({
  players,
  selectedPlayerIds,
  onTogglePlayer,
  showProgressBadges = false,
  getPlayerProgress,
  variant = 'attendance',
  alreadyCompletedIds = [],
}: PlayerSelectionListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlayers = useMemo(() => {
    let result = players;

    // Filter by search query
    if (searchQuery) {
      result = result.filter((player) =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort: eligible players first, already completed at the bottom
    if (alreadyCompletedIds.length > 0) {
      result = [...result].sort((a, b) => {
        const aCompleted = alreadyCompletedIds.includes(a.id);
        const bCompleted = alreadyCompletedIds.includes(b.id);
        if (aCompleted === bCompleted) return 0;
        return aCompleted ? 1 : -1;
      });
    }

    return result;
  }, [players, searchQuery, alreadyCompletedIds]);

  const colors = {
    attendance: {
      border: 'border-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
      checkbox: 'data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600',
    },
    achievement: {
      border: 'border-green-600',
      bg: 'bg-green-50 dark:bg-green-950',
      checkbox: 'data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600',
    },
  };

  const currentColors = colors[variant];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <TooltipProvider>
        <div className="h-[500px] overflow-y-auto pr-4">
          <div className="space-y-2">
            {filteredPlayers.map((player) => {
              const isSelected = selectedPlayerIds.includes(player.id);
              const isAlreadyCompleted = alreadyCompletedIds.includes(player.id);
              const progress = showProgressBadges && getPlayerProgress ? getPlayerProgress(player.id) : null;

              // Already completed - show with green checkmark, non-selectable
              if (isAlreadyCompleted) {
                return (
                  <Tooltip key={player.id}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <span className="font-medium text-green-700 dark:text-green-300">{player.name}</span>
                        </div>
                        <Badge variant="outline" className="border-green-300 bg-green-100 text-green-700 dark:border-green-700 dark:bg-green-900 dark:text-green-300">
                          Completed
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Already completed this criteria</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Label
                  key={player.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50 has-[[aria-checked=true]]:${currentColors.border} has-[[aria-checked=true]]:${currentColors.bg}`}>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`player-${player.id}`}
                      checked={isSelected}
                      onCheckedChange={() => onTogglePlayer(player.id)}
                      className={`${currentColors.checkbox} data-[state=checked]:text-white`}
                    />
                    <span className="font-medium">{player.name}</span>
                  </div>
                  {progress && progress.current > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {progress.current}/{progress.total}
                    </Badge>
                  )}
                </Label>
              );
            })}
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
