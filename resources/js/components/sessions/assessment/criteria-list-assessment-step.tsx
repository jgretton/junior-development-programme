import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SessionCriteria } from '@/types/session';
import { Check, Plus, Target, X } from 'lucide-react';
import { useMemo } from 'react';
import { PlayerSelectionList } from './player-selection-list';

interface Player {
  id: string;
  name: string;
}

interface PlayerAssignment {
  [criteriaId: string]: string[];
}

interface CriteriaListAssessmentStepProps {
  criteria: SessionCriteria[];
  additionalCriteria?: Array<{
    id: number;
    name: string;
    category?: { id: number; name: string };
    rank?: { id: number; name: string };
  }>;
  attendingPlayers: Player[];
  assignments: PlayerAssignment;
  selectedCriteriaId: number | null;
  onSelectCriteria: (criteriaId: number) => void;
  onTogglePlayerAssignment: (playerId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onReview: () => void;
  onAddAdditionalCriteria: () => void;
  onRemoveAdditionalCriteria: (criteriaId: number) => void;
  getCriteriaProgress: () => string;
  getPlayerProgress: (playerId: string) => { current: number; total: number };
}

// Helper type for grouped criteria
type CriteriaWithMeta =
  | SessionCriteria
  | {
      id: number;
      name: string;
      category?: { id: number; name: string };
      rank?: { id: number; name: string };
    };

interface GroupedCriteria {
  categoryName: string;
  criteria: CriteriaWithMeta[];
}

export function CriteriaListAssessmentStep({
  criteria,
  additionalCriteria = [],
  attendingPlayers,
  assignments,
  selectedCriteriaId,
  onSelectCriteria,
  onTogglePlayerAssignment,
  onSelectAll,
  onClearAll,
  onReview,
  onAddAdditionalCriteria,
  onRemoveAdditionalCriteria,
  getCriteriaProgress,
  getPlayerProgress,
}: CriteriaListAssessmentStepProps) {
  const allCriteria = [...criteria, ...additionalCriteria];
  const selectedCriteria = allCriteria.find((c) => c.id === selectedCriteriaId);
  const assignedPlayerIds = selectedCriteria ? assignments[selectedCriteria.id] || [] : [];

  // Group session criteria by category and sort by rank
  const groupedSessionCriteria = useMemo(() => {
    const groups: { [categoryName: string]: SessionCriteria[] } = {};
    criteria.forEach((criterion) => {
      const categoryName = criterion.category?.name || 'Uncategorized';
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(criterion);
    });

    // Sort criteria within each group by rank_id
    Object.keys(groups).forEach((categoryName) => {
      groups[categoryName].sort((a, b) => a.rank_id - b.rank_id);
    });

    // Convert to array and sort by category name
    return Object.entries(groups)
      .map(([categoryName, criteria]) => ({ categoryName, criteria }))
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }, [criteria]);

  // Group additional criteria by category and sort by rank
  const groupedAdditionalCriteria = useMemo(() => {
    const groups: { [categoryName: string]: typeof additionalCriteria } = {};
    additionalCriteria.forEach((criterion) => {
      const categoryName = criterion.category?.name || 'Uncategorized';
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(criterion);
    });

    // Sort criteria within each group by rank name
    Object.keys(groups).forEach((categoryName) => {
      groups[categoryName].sort((a, b) => {
        const rankA = a.rank?.name || '';
        const rankB = b.rank?.name || '';
        return rankA.localeCompare(rankB);
      });
    });

    // Convert to array and sort by category name
    return Object.entries(groups)
      .map(([categoryName, criteria]) => ({ categoryName, criteria }))
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }, [additionalCriteria]);

  // Calculate overall completion stats
  const completedCount = Object.keys(assignments).filter((criteriaId) => assignments[criteriaId].length > 0).length;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Heading title="Assess Session" />
            <p className="mt-2 text-sm text-muted-foreground">Select a criteria from the list, then assign players who achieved it</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">
              Assessed: {completedCount}/{criteria.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-[500px_1fr]">
        {/* Left Panel: Criteria List */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Session Criteria
            </CardTitle>
            <CardDescription>Click a criteria to assign players</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {/* Session Criteria - Grouped by Category */}
                {groupedSessionCriteria.map(({ categoryName, criteria: categoryCriteria }) => (
                  <div key={categoryName}>
                    {/* Category Header */}
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{categoryName}</span>
                    </div>
                    <div className="space-y-2">
                      {categoryCriteria.map((criterion) => {
                        const isSelected = selectedCriteriaId === criterion.id;
                        const assignedCount = assignments[criterion.id]?.length || 0;
                        const hasAssignments = assignedCount > 0;

                        return (
                          <button
                            key={criterion.id}
                            onClick={() => onSelectCriteria(criterion.id)}
                            className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                                : 'border-border bg-card hover:border-blue-300 hover:bg-muted/50'
                            }`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  {criterion.rank?.name && (
                                    <Badge variant="outline" className="text-xs">
                                      {criterion.rank.name}
                                    </Badge>
                                  )}
                                </div>
                                <p className={`text-sm leading-snug font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                                  {criterion.name}
                                </p>
                                {hasAssignments && (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {assignedCount} player{assignedCount !== 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              {hasAssignments && (
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500">
                                  <Check className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Additional Criteria Section - Grouped by Category */}
                {additionalCriteria.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="mb-3 flex items-center gap-2">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Additional Criteria</span>
                    </div>
                    {groupedAdditionalCriteria.map(({ categoryName, criteria: categoryCriteria }) => (
                      <div key={`additional-${categoryName}`} className="mb-4">
                        {/* Category Header */}
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                            {categoryName}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {categoryCriteria.map((criterion) => {
                            const isSelected = selectedCriteriaId === criterion.id;
                            const assignedCount = assignments[criterion.id]?.length || 0;
                            const hasAssignments = assignedCount > 0;

                            return (
                              <div key={criterion.id} className="relative">
                                <button
                                  onClick={() => onSelectCriteria(criterion.id)}
                                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                                    isSelected
                                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                                      : 'border-dashed border-border bg-card hover:border-purple-300 hover:bg-muted/50'
                                  }`}>
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs text-purple-600 dark:text-purple-400">
                                          Non-focus
                                        </Badge>
                                        {criterion.rank?.name && (
                                          <Badge variant="outline" className="text-xs">
                                            {criterion.rank.name}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className={`text-sm leading-snug font-medium ${isSelected ? 'text-purple-700 dark:text-purple-300' : ''}`}>
                                        {criterion.name}
                                      </p>
                                      {hasAssignments && (
                                        <div className="flex items-center gap-2">
                                          <Badge variant="secondary" className="text-xs">
                                            {assignedCount} player{assignedCount !== 1 ? 's' : ''}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                    {hasAssignments && (
                                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500">
                                        <Check className="h-4 w-4 text-white" />
                                      </div>
                                    )}
                                  </div>
                                </button>
                                {/* Remove button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveAdditionalCriteria(criterion.id);
                                  }}
                                  className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white transition-opacity hover:bg-red-600"
                                  title="Remove this criteria">
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardContent className="mt-auto border-t pt-4">
            {/* Add Additional Criteria Button */}
            <Button onClick={onAddAdditionalCriteria} variant="outline" className="w-full" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Additional Criteria
            </Button>
          </CardContent>
        </Card>

        {/* Right Panel: Player Selection */}
        <Card className="flex flex-col">
          {selectedCriteria ? (
            <>
              <CardHeader>
                <CardTitle>Assign Players</CardTitle>
                <CardDescription className="mt-2">
                  <span className="font-medium text-foreground">{selectedCriteria.name}</span>
                </CardDescription>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-sm font-medium text-muted-foreground">Players Selected</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-blue-600">{assignedPlayerIds.length}</span>
                      <span className="text-muted-foreground">/ {attendingPlayers.length}</span>
                    </div>
                  </div>
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
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-[600px] pr-4">
                  <PlayerSelectionList
                    players={attendingPlayers}
                    selectedPlayerIds={assignedPlayerIds}
                    onTogglePlayer={onTogglePlayerAssignment}
                    variant="achievement"
                    showProgressBadges
                    getPlayerProgress={getPlayerProgress}
                  />
                </ScrollArea>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">Select a criteria from the list</p>
                <p className="mt-1 text-xs text-muted-foreground">Click on any criteria to start assigning players</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Review Assessment Button - Outside grid, bottom right */}
      <div className="mt-6 flex justify-end">
        <Button onClick={onReview} size="lg">
          Review Assessment
        </Button>
      </div>
    </div>
  );
}
