import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { SessionCriteria } from '@/types/session';
import { Check, ChevronLeft } from 'lucide-react';
import { AssessmentSummaryCard } from './assessment-summary-card';
import { AssessmentWarningCard } from './assessment-warning-card';

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
  attendingPlayers,
  assignments,
  isPlayersOpen,
  isCriteriaOpen,
  onTogglePlayersOpen,
  onToggleCriteriaOpen,
  onBackToAssessment,
  onSubmit,
  getCriteriaProgress,
}: AssessmentReviewProps) {
  // Calculate warnings
  const playersWithNoAchievements = attendingPlayers.filter((player) => {
    return !criteria.some((c) => assignments[c.id]?.includes(player.id));
  });

  const criteriaWithNoPlayers = criteria.filter((criterion) => {
    return !assignments[criterion.id] || assignments[criterion.id].length === 0;
  });

  const hasWarnings = playersWithNoAchievements.length > 0 || criteriaWithNoPlayers.length > 0;

  const totalAssignments = Object.values(assignments).reduce((sum, arr) => sum + arr.length, 0);

  const summaryItems = [
    { label: 'Players Attending', value: attendingPlayers.length },
    { label: 'Criteria Assessed', value: getCriteriaProgress() },
    { label: 'Total Assignments', value: totalAssignments },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Heading title="Review Assignments" />
          <p className="mt-2 text-sm text-muted-foreground">Review all assignments before submitting</p>
        </div>
        <Button variant="outline" onClick={onBackToAssessment}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Assessment
        </Button>
      </div>

      <div className="space-y-6">
        {/* Summary Card */}
        <AssessmentSummaryCard items={summaryItems} />

        {/* Warning Cards */}
        {hasWarnings && (
          <div className="space-y-4">
            <AssessmentWarningCard
              title="Players with No Achievements"
              description={`${playersWithNoAchievements.length} player${playersWithNoAchievements.length !== 1 ? 's' : ''} haven't achieved any criteria`}
              items={playersWithNoAchievements}
            />
            <AssessmentWarningCard
              title="Criteria with No Achievements"
              description={`${criteriaWithNoPlayers.length} criteria ${criteriaWithNoPlayers.length !== 1 ? 'have' : 'has'} no players assigned`}
              items={criteriaWithNoPlayers}
            />
          </div>
        )}

        {/* Player-by-Player Review - Collapsible */}
        <CollapsibleCard
          title="Player Achievements"
          description="Review what each player has achieved"
          open={isPlayersOpen}
          onOpenChange={onTogglePlayersOpen}>
          <div className="space-y-4">
            {attendingPlayers.map((player) => {
              const achievedCriteria = criteria.filter((c) => assignments[c.id]?.includes(player.id));

              return (
                <div key={player.id} className="rounded-lg border bg-muted/20 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium">{player.name}</h3>
                    <Badge variant={achievedCriteria.length > 0 ? 'default' : 'secondary'}>
                      {achievedCriteria.length}/{criteria.length} criteria
                    </Badge>
                  </div>
                  {achievedCriteria.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {achievedCriteria.map((criterion) => (
                        <Badge
                          key={criterion.id}
                          variant="outline"
                          className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                          <Check className="mr-1 h-3 w-3" />
                          {criterion.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No criteria achieved</p>
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleCard>

        {/* Criteria-by-Criteria Review - Collapsible */}
        <CollapsibleCard
          title="Criteria Breakdown"
          description="Review which players achieved each criteria"
          open={isCriteriaOpen}
          onOpenChange={onToggleCriteriaOpen}>
          <div className="space-y-4">
            {criteria.map((criterion) => {
              const achievedPlayers = attendingPlayers.filter((p) => assignments[criterion.id]?.includes(p.id));

              return (
                <div key={criterion.id} className="rounded-lg border bg-muted/20 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium">{criterion.name}</h3>
                    <Badge variant={achievedPlayers.length > 0 ? 'default' : 'secondary'}>
                      {achievedPlayers.length}/{attendingPlayers.length} players
                    </Badge>
                  </div>
                  {achievedPlayers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {achievedPlayers.map((player) => (
                        <Badge key={player.id} variant="outline">
                          {player.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No players achieved this criteria</p>
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleCard>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onBackToAssessment}>
            Continue Editing
          </Button>
          <Button size="lg" onClick={onSubmit}>
            Submit Assessments
          </Button>
        </div>
      </div>
    </div>
  );
}
