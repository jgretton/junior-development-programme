import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SessionCriteria } from '@/types/session';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { PlayerSelectionList } from './player-selection-list';

interface Player {
  id: string;
  name: string;
}

interface PlayerAssignment {
  [criteriaId: string]: string[];
}

interface CriteriaAssessmentStepProps {
  criteria: SessionCriteria[];
  currentCriteriaIndex: number;
  attendingPlayers: Player[];
  assignments: PlayerAssignment;
  onTogglePlayerAssignment: (playerId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onReview: () => void;
  getCriteriaProgress: () => string;
  getPlayerProgress: (playerId: string) => { current: number; total: number };
}

export function CriteriaAssessmentStep({
  criteria,
  currentCriteriaIndex,
  attendingPlayers,
  assignments,
  onTogglePlayerAssignment,
  onSelectAll,
  onClearAll,
  onPrevious,
  onNext,
  onReview,
  getCriteriaProgress,
  getPlayerProgress,
}: CriteriaAssessmentStepProps) {
  const currentCriteria = criteria[currentCriteriaIndex];
  const isFirstCriteria = currentCriteriaIndex === 0;
  const isLastCriteria = currentCriteriaIndex === criteria.length - 1;
  const assignedPlayerIds = assignments[currentCriteria.id] || [];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Heading title="Assess Criteria" />
            <p className="mt-2 text-sm text-muted-foreground">
              Select players who achieved each criteria
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">Progress: {getCriteriaProgress()}</Badge>
            <Button variant="outline" size="sm" onClick={onReview}>
              Review All
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${((currentCriteriaIndex + 1) / criteria.length) * 100}%`,
            }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Criteria {currentCriteriaIndex + 1} of {criteria.length}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_auto_1.5fr]">
        {/* Current Criteria Card */}
        <Card className="border-2 border-blue-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {currentCriteriaIndex + 1}
              </span>
              Current Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
              <p className="font-medium leading-relaxed">{currentCriteria.name}</p>
            </div>

            <Separator />

            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Players Selected</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">{assignedPlayerIds.length}</span>
                <span className="text-muted-foreground">/ {attendingPlayers.length}</span>
              </div>
            </div>

            {assignedPlayerIds.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Selected Players</p>
                <div className="flex flex-wrap gap-2">
                  {attendingPlayers
                    .filter((p) => assignedPlayerIds.includes(p.id))
                    .map((player) => (
                      <Badge key={player.id} variant="default">
                        {player.name}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator orientation="vertical" className="hidden lg:block" />

        {/* Players Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Players</CardTitle>
            <CardDescription>Choose players who achieved this criteria</CardDescription>
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={onSelectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={onClearAll}>
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PlayerSelectionList
              players={attendingPlayers}
              selectedPlayerIds={assignedPlayerIds}
              onTogglePlayer={onTogglePlayerAssignment}
              variant="achievement"
              showProgressBadges
              getPlayerProgress={getPlayerProgress}
            />
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={isFirstCriteria}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous Criteria
        </Button>

        <div className="flex gap-2">
          {criteria.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                /* We'll handle this in parent component if needed */
              }}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentCriteriaIndex
                  ? 'w-8 bg-blue-600'
                  : assignments[criteria[index].id]?.length > 0
                    ? 'bg-green-600'
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <Button onClick={isLastCriteria ? onReview : onNext}>
          {isLastCriteria ? (
            <>
              Review Assignments
              <Check className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Next Criteria
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
