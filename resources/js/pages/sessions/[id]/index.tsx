import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from '@/layouts/app-layout';
import { CATEGORY_NAMES, formatSessionDate, getCriteriaBreakdown, isSessionUpcoming, RANK_NAMES } from '@/lib/session-utils';
import { BreadcrumbItem } from '@/types';
import { CriteriaProgress, Player, Session } from '@/types/session';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Check, ClipboardCheck, Edit, Target, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AdditionalProgress {
  criteria: { id: number; name: string };
  achieved: Player[];
}

interface SingleSessionPageProps {
  session: Session;
  attendance?: Player[];
  criteriaProgress?: CriteriaProgress[];
  additionalProgress?: AdditionalProgress[];
  flash: { error: string; success: string; warning: string };
}

export default function SingleSessionPage({ session, attendance, flash, criteriaProgress, additionalProgress }: SingleSessionPageProps) {
  const [isCriteriaOpen, setIsCriteriaOpen] = useState(false);
  const [highPerformersOpen, setHighPerformersOpen] = useState(false);
  const [goodProgressOpen, setGoodProgressOpen] = useState(false);
  const [needsSupportOpen, setNeedsSupportOpen] = useState(true);

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
    if (flash?.warning) toast.warning(flash.warning);
  }, [flash]);

  const isAssessed = attendance && attendance.length > 0;
  const isUpcoming = isSessionUpcoming(session.date);
  const formattedDate = formatSessionDate(session.date);
  const criteriaCount = getCriteriaBreakdown(session);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Sessions',
      href: '/sessions',
    },
    {
      title: session.name,
      href: `/sessions/${session.id}`,
    },
  ];

  const getDotColor = () => {
    if (isAssessed) return 'bg-green-500';
    if (isUpcoming) return 'bg-blue-500';
    return 'bg-muted-foreground/50';
  };

  const getStatusText = () => {
    if (isAssessed) return 'Assessed';
    if (isUpcoming) return 'Upcoming';
    return 'Pending';
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Toaster richColors expand position="top-center" />
      <Head title={session.name} />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <Heading title={session.name} />
            <div className="mt-3 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${getDotColor()}`} />
              <span className="text-sm text-muted-foreground">{getStatusText()}</span>
            </div>
          </div>
          {isAssessed ? (
            <Button variant="outline" asChild>
              <Link href={`/sessions/${session.id}/assessment`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Assessment
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href={`/sessions/${session.id}/assessment`}>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Start Assessment
              </Link>
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Session Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Session Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">{formattedDate}</p>
                </div>
              </div>

              {session.focus_areas && (
                <div className="flex items-start gap-3">
                  <Target className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Focus Areas</p>
                    <p className="text-sm text-muted-foreground">{session.focus_areas}</p>
                  </div>
                </div>
              )}

              {criteriaCount && (
                <div className="pt-2">
                  <p className="mb-2 text-sm font-medium">Criteria Summary</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(criteriaCount).map(([rank, count]) => (
                      <Badge key={rank} variant="secondary">
                        {rank}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assessment Results - Only show if assessed */}
          {isAssessed && attendance && criteriaProgress && criteriaProgress.length > 0 && (() => {
            // Calculate summary statistics
            const totalPlayers = attendance.length;
            const totalCriteria = criteriaProgress.length;

            // Calculate player achievements
            const playerStats = attendance.map(player => {
              const achieved = criteriaProgress.filter(cp =>
                cp.achieved.some(p => p.id === player.id)
              ).length;
              return {
                ...player,
                achievedCount: achieved,
                percentage: Math.round((achieved / totalCriteria) * 100)
              };
            }).sort((a, b) => b.achievedCount - a.achievedCount);

            // Calculate criteria statistics
            const criteriaStats = criteriaProgress.map(cp => {
              const achievedCount = cp.achieved.length;
              const rate = Math.round((achievedCount / totalPlayers) * 100);
              return {
                ...cp,
                achievedCount,
                totalCount: totalPlayers,
                rate,
                status: rate >= 80 ? 'high' : rate >= 50 ? 'medium' : 'low'
              };
            }).sort((a, b) => b.rate - a.rate);

            // Overall stats
            const totalAssignments = criteriaProgress.reduce((sum, cp) => sum + cp.achieved.length, 0);
            const possibleAssignments = totalPlayers * totalCriteria;
            const overallRate = Math.round((totalAssignments / possibleAssignments) * 100);

            const strugglingPlayers = playerStats.filter(p => p.percentage < 50);
            const difficultCriteria = criteriaStats.filter(c => c.rate < 50);

            return (
              <>
                {/* Summary Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground">Overall Achievement</p>
                        <p className="mt-2 text-3xl font-bold">{overallRate}%</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {totalAssignments} / {possibleAssignments} achievements
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground">Players Attended</p>
                        <p className="mt-2 text-3xl font-bold">{totalPlayers}</p>
                        {strugglingPlayers.length > 0 && (
                          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                            {strugglingPlayers.length} below 50%
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground">Criteria Assessed</p>
                        <p className="mt-2 text-3xl font-bold">{totalCriteria}</p>
                        {difficultCriteria.length > 0 && (
                          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                            {difficultCriteria.length} below 50%
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Player Performance by Tier */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Player Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Group players by performance tier */}
                    {(() => {
                      const highPerformers = playerStats.filter((p) => p.percentage >= 80);
                      const goodProgress = playerStats.filter((p) => p.percentage >= 50 && p.percentage < 80);
                      const needsSupport = playerStats.filter((p) => p.percentage < 50);

                      return (
                        <>
                          {/* High Achievers */}
                          <CollapsibleCard
                            title={
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <span>High Achievers (80-100%)</span>
                              </div>
                            }
                            description={`${highPerformers.length} player${highPerformers.length !== 1 ? 's' : ''}`}
                            open={highPerformersOpen}
                            onOpenChange={setHighPerformersOpen}>
                            {highPerformers.length > 0 ? (
                              <div className="space-y-2">
                                {highPerformers.map((player) => (
                                  <div key={player.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-2">
                                    <span className="text-sm font-medium">{player.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-muted-foreground">
                                        {player.achievedCount}/{totalCriteria}
                                      </span>
                                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                                        {player.percentage}%
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No players in this tier</p>
                            )}
                          </CollapsibleCard>

                          {/* Good Progress */}
                          <CollapsibleCard
                            title={
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-amber-500" />
                                <span>Good Progress (50-79%)</span>
                              </div>
                            }
                            description={`${goodProgress.length} player${goodProgress.length !== 1 ? 's' : ''}`}
                            open={goodProgressOpen}
                            onOpenChange={setGoodProgressOpen}>
                            {goodProgress.length > 0 ? (
                              <div className="space-y-2">
                                {goodProgress.map((player) => (
                                  <div key={player.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-2">
                                    <span className="text-sm font-medium">{player.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-muted-foreground">
                                        {player.achievedCount}/{totalCriteria}
                                      </span>
                                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                                        {player.percentage}%
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No players in this tier</p>
                            )}
                          </CollapsibleCard>

                          {/* Needs Support */}
                          <CollapsibleCard
                            title={
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-500" />
                                <span>Needs Support (&lt;50%)</span>
                              </div>
                            }
                            description={`${needsSupport.length} player${needsSupport.length !== 1 ? 's' : ''}`}
                            open={needsSupportOpen}
                            onOpenChange={setNeedsSupportOpen}>
                            {needsSupport.length > 0 ? (
                              <div className="space-y-2">
                                {needsSupport.map((player) => (
                                  <div key={player.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-2">
                                    <span className="text-sm font-medium">{player.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-muted-foreground">
                                        {player.achievedCount}/{totalCriteria}
                                      </span>
                                      <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
                                        {player.percentage}%
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No players in this tier</p>
                            )}
                          </CollapsibleCard>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Criteria Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Criteria Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {criteriaStats.map((criteria) => (
                      <div key={criteria.criteria.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{criteria.criteria.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {criteria.achievedCount}/{criteria.totalCount}
                            </span>
                            <Badge
                              variant={criteria.rate >= 80 ? 'default' : criteria.rate >= 50 ? 'secondary' : 'destructive'}
                              className="min-w-[50px] justify-center">
                              {criteria.rate}%
                            </Badge>
                          </div>
                        </div>
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full transition-all ${
                              criteria.rate >= 80
                                ? 'bg-green-500'
                                : criteria.rate >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${criteria.rate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Additional Achievements */}
                {additionalProgress && additionalProgress.length > 0 && (
                  <Card className="border-purple-200 dark:border-purple-800">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                          <Target className="h-5 w-5" />
                          Additional Achievements
                        </CardTitle>
                        <Badge variant="outline" className="border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400">
                          Non-Focus
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {additionalProgress.map((progress) => {
                        const achievedCount = progress.achieved.length;

                        return (
                          <div key={progress.criteria.id} className="rounded-lg border border-dashed border-purple-200 bg-purple-50/50 p-4 dark:border-purple-800 dark:bg-purple-950/20">
                            <div className="mb-3 flex items-start justify-between">
                              <h4 className="font-medium">{progress.criteria.name}</h4>
                              <Badge variant="default" className="bg-purple-600 dark:bg-purple-700">
                                {achievedCount} player{achievedCount !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                            {progress.achieved.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {progress.achieved.map((player) => (
                                  <Badge key={player.id} variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300">
                                    {player.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* Detailed Breakdown - Collapsible */}
                <CollapsibleCard
                  title="Detailed Results"
                  description="View which players achieved each criteria"
                  open={isCriteriaOpen}
                  onOpenChange={setIsCriteriaOpen}>
                  <div className="space-y-6">
                    {criteriaProgress.map((progress) => {
                      const achievedCount = progress.achieved.length;
                      const totalCount = progress.achieved.length + progress.notAchieved.length;
                      const rate = Math.round((achievedCount / totalCount) * 100);

                      return (
                        <div key={progress.criteria.id} className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{progress.criteria.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {achievedCount} of {totalCount} players achieved ({rate}%)
                              </p>
                            </div>
                            <Badge
                              variant={rate >= 80 ? 'default' : rate >= 50 ? 'secondary' : 'destructive'}>
                              {rate}%
                            </Badge>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            {/* Achieved */}
                            <div className="rounded-lg border bg-green-50/50 p-3 dark:bg-green-950/20">
                              <div className="mb-2 flex items-center gap-1.5 text-green-700 dark:text-green-400">
                                <Check className="h-4 w-4" />
                                <span className="text-sm font-medium">Achieved</span>
                              </div>
                              {progress.achieved.length > 0 ? (
                                <div className="space-y-1">
                                  {progress.achieved.map((player) => (
                                    <div key={player.id} className="text-sm text-foreground/80">
                                      {player.name}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">None</p>
                              )}
                            </div>

                            {/* Not Achieved */}
                            <div className="rounded-lg border bg-red-50/50 p-3 dark:bg-red-950/20">
                              <div className="mb-2 flex items-center gap-1.5 text-red-700 dark:text-red-400">
                                <X className="h-4 w-4" />
                                <span className="text-sm font-medium">Not Achieved</span>
                              </div>
                              {progress.notAchieved.length > 0 ? (
                                <div className="space-y-1">
                                  {progress.notAchieved.map((player) => (
                                    <div key={player.id} className="text-sm text-foreground/80">
                                      {player.name}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">None</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleCard>
              </>
            );
          })()}

          {/* Criteria Details - Only show if not assessed */}
          {!isAssessed && session.criteria && session.criteria.length > 0 && (
            <CollapsibleCard
              title="Criteria Details"
              description="View all criteria for this session"
              open={isCriteriaOpen}
              onOpenChange={setIsCriteriaOpen}>
              <div className="space-y-3">
                {session.criteria.map((criterion) => (
                  <div key={criterion.id} className="rounded-lg border bg-muted/20 p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{RANK_NAMES[criterion.rank_id]}</Badge>
                      <Badge variant="outline">{CATEGORY_NAMES[criterion.category_id]}</Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{criterion.name}</p>
                  </div>
                ))}
              </div>
            </CollapsibleCard>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
