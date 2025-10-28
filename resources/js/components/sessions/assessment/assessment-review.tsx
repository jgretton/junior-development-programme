import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SessionCriteria } from '@/types/session';
import { AlertCircle, ChevronDown, ChevronLeft, Users } from 'lucide-react';
import { useState } from 'react';

interface Player {
  id: string;
  name: string;
}

interface PlayerAssignment {
  [criteriaId: string]: string[];
}

interface AssessmentReviewProps {
  sessionName: string;
  criteria: SessionCriteria[];
  additionalCriteria?: Array<{
    id: number;
    name: string;
    category?: { id: number; name: string };
    rank?: { id: number; name: string };
  }>;
  attendingPlayers: Player[];
  assignments: PlayerAssignment;
  isPlayersOpen: boolean;
  isCriteriaOpen: boolean;
  onTogglePlayersOpen: (open: boolean) => void;
  onToggleCriteriaOpen: (open: boolean) => void;
  onBackToAssessment: () => void;
  onSubmit: () => void;
  getCriteriaProgress: () => string;
}

export function AssessmentReview({
  sessionName,
  criteria,
  additionalCriteria = [],
  attendingPlayers,
  assignments,
  onBackToAssessment,
  onSubmit,
}: AssessmentReviewProps) {
  // Calculate stats - ONLY using session criteria, not additional
  const playersWithNoAchievements = attendingPlayers.filter((player) => {
    return !criteria.some((c) => assignments[c.id]?.includes(player.id));
  });

  const sessionCriteriaWithNoPlayers = criteria.filter((criterion) => {
    return !assignments[criterion.id] || assignments[criterion.id].length === 0;
  });

  const criteriaCompleted = criteria.length - sessionCriteriaWithNoPlayers.length;
  const playersAssessed = attendingPlayers.length - playersWithNoAchievements.length;

  const hasWarnings = playersWithNoAchievements.length > 0 || sessionCriteriaWithNoPlayers.length > 0;

  const [openCriteria, setOpenCriteria] = useState<{ [key: number]: boolean }>({});

  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Heading title="Review Assessment" />
          <p className="mt-2 text-sm text-muted-foreground">Check everything looks correct before submitting</p>
        </div>
        <Button variant="outline" onClick={onBackToAssessment}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="space-y-6">
        {/* Quick Sanity Check Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Players Attending</p>
                  <p className="text-2xl font-bold">{attendingPlayers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Session Criteria</p>
                <p className="text-2xl font-bold">{criteria.length}</p>
                <p className="text-xs text-muted-foreground">to assess</p>
              </div>
            </CardContent>
          </Card>

          <Card className={sessionCriteriaWithNoPlayers.length > 0 ? 'border-amber-200 dark:border-amber-800' : ''}>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Criteria Completed</p>
                <p className={`text-2xl font-bold ${sessionCriteriaWithNoPlayers.length > 0 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                  {criteriaCompleted}/{criteria.length}
                </p>
                {sessionCriteriaWithNoPlayers.length > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">{sessionCriteriaWithNoPlayers.length} incomplete</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={playersWithNoAchievements.length > 0 ? 'border-amber-200 dark:border-amber-800' : ''}>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground">Players Assessed</p>
                <p className={`text-2xl font-bold ${playersWithNoAchievements.length > 0 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                  {playersAssessed}/{attendingPlayers.length}
                </p>
                {playersWithNoAchievements.length > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">{playersWithNoAchievements.length} without achievements</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warning Banner */}
        {hasWarnings && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <h3 className="font-medium text-amber-900 dark:text-amber-100">Incomplete Assignments</h3>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-amber-800 dark:text-amber-200">
                  {playersWithNoAchievements.length > 0 && (
                    <span>
                      <strong>{playersWithNoAchievements.length}</strong> player{playersWithNoAchievements.length !== 1 ? 's' : ''} with
                      no achievements
                    </span>
                  )}
                  {sessionCriteriaWithNoPlayers.length > 0 && (
                    <span>
                      <strong>{sessionCriteriaWithNoPlayers.length}</strong> criteria with no players
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session Criteria Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Session Focus ({criteria.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criteria.map((criterion) => {
                const achievedPlayers = attendingPlayers.filter((p) => assignments[criterion.id]?.includes(p.id));
                const percentage = attendingPlayers.length > 0 ? Math.round((achievedPlayers.length / attendingPlayers.length) * 100) : 0;
                const isOpen = openCriteria[criterion.id] || false;

                return (
                  <Collapsible
                    key={criterion.id}
                    open={isOpen}
                    onOpenChange={(open) => setOpenCriteria({ ...openCriteria, [criterion.id]: open })}>
                    <div className="rounded-lg border">
                      <CollapsibleTrigger className="w-full p-4 text-left transition-colors hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <ChevronDown
                            className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          />
                          <div className="flex-1">
                            <div className="mb-2 flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-medium">{criterion.name}</h3>
                                {criterion.category?.name && (
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    {criterion.category.name}
                                    {criterion.rank?.name && ` · ${criterion.rank.name}`}
                                  </p>
                                )}
                              </div>
                              <Badge variant={achievedPlayers.length > 0 ? 'default' : 'secondary'}>
                                {achievedPlayers.length}/{attendingPlayers.length}
                              </Badge>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div className="h-full bg-blue-600 transition-all" style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-t p-4">
                          {achievedPlayers.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {achievedPlayers.map((player) => (
                                <Badge key={player.id} variant="outline">
                                  {player.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No players assigned to this criteria</p>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Additional Criteria Breakdown */}
        {additionalCriteria.length > 0 && (
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-purple-700 dark:text-purple-300">Additional Achievements ({additionalCriteria.length})</CardTitle>
                <Badge variant="outline" className="border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400">
                  Non-Focus
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {additionalCriteria.map((criterion) => {
                  const achievedPlayers = attendingPlayers.filter((p) => assignments[criterion.id]?.includes(p.id));
                  const percentage = attendingPlayers.length > 0 ? Math.round((achievedPlayers.length / attendingPlayers.length) * 100) : 0;
                  const isOpen = openCriteria[criterion.id] || false;

                  return (
                    <Collapsible
                      key={criterion.id}
                      open={isOpen}
                      onOpenChange={(open) => setOpenCriteria({ ...openCriteria, [criterion.id]: open })}>
                      <div className="rounded-lg border border-dashed border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20">
                        <CollapsibleTrigger className="w-full p-4 text-left transition-colors hover:bg-purple-100/50 dark:hover:bg-purple-900/30">
                          <div className="flex items-center gap-4">
                            <ChevronDown
                              className={`h-5 w-5 shrink-0 text-purple-600 transition-transform dark:text-purple-400 ${isOpen ? 'rotate-180' : ''}`}
                            />
                            <div className="flex-1">
                              <div className="mb-2 flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="font-medium">{criterion.name}</h3>
                                  {criterion.category?.name && (
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                      {criterion.category.name}
                                      {criterion.rank?.name && ` · ${criterion.rank.name}`}
                                    </p>
                                  )}
                                </div>
                                <Badge
                                  variant={achievedPlayers.length > 0 ? 'default' : 'secondary'}
                                  className="bg-purple-600 dark:bg-purple-700">
                                  {achievedPlayers.length}/{attendingPlayers.length}
                                </Badge>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-purple-100 dark:bg-purple-900/30">
                                <div className="h-full bg-purple-600 transition-all dark:bg-purple-500" style={{ width: `${percentage}%` }} />
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="border-t border-purple-200 p-4 dark:border-purple-800">
                            {achievedPlayers.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {achievedPlayers.map((player) => (
                                  <Badge key={player.id} variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300">
                                    {player.name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No players assigned to this criteria</p>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between border-t pt-6">
          <Button variant="ghost" onClick={onBackToAssessment}>
            Continue Editing
          </Button>
          <Button size="lg" onClick={onSubmit}>
            Submit Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}
