import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from '@/layouts/app-layout';
import { formatSessionDate, isSessionUpcoming } from '@/lib/session-utils';
import { BreadcrumbItem } from '@/types';
import {
  CategoryProgress,
  ClubWideCompletion,
  Player,
  PreviousAchievers,
  RankProgressionItem,
  Session,
  SummaryStats,
} from '@/types/session';
import { Head } from '@inertiajs/react';
import { Award, Calendar, ChevronDown, ChevronUp, Target, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SingleSessionPageProps {
  session: Session;
  attendance?: Player[];
  categoryProgress?: CategoryProgress[];
  rankProgression?: RankProgressionItem[];
  summaryStats?: SummaryStats;
  clubWideCompletion?: ClubWideCompletion;
  previousAchievers?: PreviousAchievers;
  flash: { error: string; success: string; warning: string };
}

export default function SingleSessionPage({
  session,
  attendance,
  categoryProgress,
  rankProgression,
  summaryStats,
  clubWideCompletion,
  previousAchievers,
  flash,
}: SingleSessionPageProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [expandedCriteria, setExpandedCriteria] = useState<Record<number, boolean>>({});
  const [showClubWide, setShowClubWide] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
    if (flash?.warning) toast.warning(flash.warning);
  }, [flash]);

  const isAssessed = attendance && attendance.length > 0;
  const isUpcoming = isSessionUpcoming(session.date);
  const formattedDate = formatSessionDate(session.date);

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

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const toggleCriteria = (criteriaId: number) => {
    setExpandedCriteria((prev) => ({ ...prev, [criteriaId]: !prev[criteriaId] }));
  };

  const toggleClubWide = (categoryId: number) => {
    setShowClubWide((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
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
            </CardContent>
          </Card>

          {/* Assessment Results - Only show if assessed */}
          {isAssessed && categoryProgress && summaryStats && (
            <>
              {/* Summary Statistics */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">Most Improved Category</p>
                      </div>
                      {summaryStats.mostImprovedCategory ? (
                        <>
                          <p className="mt-2 text-2xl font-bold">{summaryStats.mostImprovedCategory.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {summaryStats.mostImprovedCategory.playerCount} players
                          </p>
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">No data</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">Total Attendance</p>
                      </div>
                      <p className="mt-2 text-2xl font-bold">{summaryStats.totalAttendance}</p>
                      <p className="mt-1 text-sm text-muted-foreground">players attended</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">Total Progressions</p>
                      </div>
                      <p className="mt-2 text-2xl font-bold">{summaryStats.totalProgressions}</p>
                      <p className="mt-1 text-sm text-muted-foreground">criteria completions</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">Total Criteria Assessed</p>
                      </div>
                      <p className="mt-2 text-2xl font-bold">{summaryStats.totalCriteriaAssessed}</p>
                      <p className="mt-1 text-sm text-muted-foreground">unique criteria</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Rank Progression */}
              {rankProgression && rankProgression.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Rank Progression
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {rankProgression.map((rank) => (
                      <div key={rank.rank} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-semibold">
                            {rank.rank}
                          </Badge>
                          <span className="text-sm font-medium">
                            {rank.criteriaCount} criteria completed by {rank.playerCount} players
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Category Progress */}
              {categoryProgress.map((category) => (
                <Card key={category.categoryId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {category.categoryName} ({category.playerCount} players progressed)
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleClubWide(category.categoryId)}
                        className="text-xs text-muted-foreground hover:text-foreground">
                        {showClubWide[category.categoryId] ? (
                          <>
                            Hide club-wide rates <ChevronUp className="ml-1 h-3 w-3" />
                          </>
                        ) : (
                          <>
                            Show club-wide rates <ChevronDown className="ml-1 h-3 w-3" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Club-wide completion rates - expandable */}
                    {showClubWide[category.categoryId] && clubWideCompletion && (
                      <div className="mb-4 rounded-lg border bg-muted/30 p-4">
                        <h4 className="mb-3 text-sm font-semibold">Club-wide completion rates</h4>
                        <div className="space-y-2">
                          {category.ranks.map((rankGroup) =>
                            rankGroup.criteria.map((criteria) => {
                              const clubData = clubWideCompletion[criteria.id];
                              if (!clubData) return null;
                              return (
                                <div key={criteria.id} className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">• {criteria.name}</span>
                                  <span className="font-medium">
                                    {clubData.completionCount}/{clubData.totalMembers} members ({clubData.percentage}%)
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rank groups */}
                    {category.ranks.map((rankGroup) => (
                      <div key={rankGroup.rank} className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground">{rankGroup.rank}</h4>
                        <div className="space-y-2">
                          {rankGroup.criteria.map((criteria) => (
                            <div key={criteria.id} className="space-y-2">
                              <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">↳ {criteria.name}</span>
                                  <span className="text-sm text-muted-foreground">({criteria.achievedCount} players)</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleCriteria(criteria.id)}
                                  className="text-xs text-muted-foreground hover:text-foreground">
                                  View players →
                                </Button>
                              </div>

                              {/* Expanded player details */}
                              {expandedCriteria[criteria.id] && (
                                <div className="ml-4 space-y-3 rounded-lg border bg-card p-4">
                                  <div>
                                    <h5 className="mb-2 text-sm font-semibold">Achieved in this session:</h5>
                                    <div className="space-y-1">
                                      {criteria.achievedPlayers.map((player) => (
                                        <div key={player.id} className="text-sm text-foreground/80">
                                          • {player.name}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Previous achievers */}
                                  {previousAchievers && previousAchievers[criteria.id] && previousAchievers[criteria.id].length > 0 && (
                                    <div className="border-t pt-3">
                                      <h5 className="mb-2 text-sm font-semibold text-muted-foreground">
                                        Previously achieved ({previousAchievers[criteria.id].length} players):
                                      </h5>
                                      <div className="max-h-40 space-y-1 overflow-y-auto">
                                        {previousAchievers[criteria.id].slice(0, 10).map((player) => (
                                          <div key={player.id} className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>• {player.name}</span>
                                            <span className="text-xs">
                                              {new Date(player.assessedAt).toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                              })}
                                            </span>
                                          </div>
                                        ))}
                                        {previousAchievers[criteria.id].length > 10 && (
                                          <div className="text-xs text-muted-foreground">
                                            + {previousAchievers[criteria.id].length - 10} more players
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
