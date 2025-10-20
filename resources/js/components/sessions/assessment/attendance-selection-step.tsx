import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronRight } from 'lucide-react';
import { PlayerSelectionList } from './player-selection-list';

interface Player {
  id: string;
  name: string;
}

interface AttendanceSelectionStepProps {
  players: Player[];
  attendingPlayerIds: string[];
  onTogglePlayer: (playerId: string) => void;
  onContinue: () => void;
}

export function AttendanceSelectionStep({
  players,
  attendingPlayerIds,
  onTogglePlayer,
  onContinue,
}: AttendanceSelectionStepProps) {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <Heading title="Select Attending Players" />
        <p className="mt-2 text-sm text-muted-foreground">
          Choose which players attended this session
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Players ({players.length})</CardTitle>
            <Badge variant="secondary">{attendingPlayerIds.length} selected</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <PlayerSelectionList
            players={players}
            selectedPlayerIds={attendingPlayerIds}
            onTogglePlayer={onTogglePlayer}
            variant="attendance"
          />

          <Separator className="my-6" />

          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              {attendingPlayerIds.length} players selected
            </p>
            <Button onClick={onContinue} disabled={attendingPlayerIds.length === 0}>
              Continue to Assessment
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
