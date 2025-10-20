import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
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
}

export function PlayerSelectionList({
  players,
  selectedPlayerIds,
  onTogglePlayer,
  showProgressBadges = false,
  getPlayerProgress,
  variant = 'attendance',
}: PlayerSelectionListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlayers = useMemo(() => {
    if (!searchQuery) return players;
    return players.filter((player) =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [players, searchQuery]);

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

      <div className="h-[500px] overflow-y-auto pr-4">
        <div className="space-y-2">
          {filteredPlayers.map((player) => {
            const isSelected = selectedPlayerIds.includes(player.id);
            const progress = showProgressBadges && getPlayerProgress ? getPlayerProgress(player.id) : null;

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
    </div>
  );
}
