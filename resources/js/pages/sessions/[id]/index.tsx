import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import AppLayout from '@/layouts/app-layout';
import { CATEGORY_NAMES, formatSessionDate, getCriteriaBreakdown, isSessionCompleted, isSessionUpcoming, RANK_NAMES } from '@/lib/session-utils';
import { BreadcrumbItem } from '@/types';
import { Session } from '@/types/session';
import { Head, Link } from '@inertiajs/react';
import { Calendar, ChevronDown, ClipboardCheck, Target } from 'lucide-react';
import { useState } from 'react';

interface SingleSessionPageProps {
  session: Session;
  players: {
    id: string;
    name: string;
  };
}

export default function SingleSessionPage({ session, players }: SingleSessionPageProps) {
  const [isCriteriaOpen, setIsCriteriaOpen] = useState(false);

  const isUpcoming = isSessionUpcoming(session.date);
  const isCompleted = isSessionCompleted(session);
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
    if (isCompleted) return 'bg-green-500';
    if (isUpcoming) return 'bg-blue-500';
    return 'bg-muted-foreground/50';
  };

  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (isUpcoming) return 'Upcoming';
    return 'Pending';
  };
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={session.name} />

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <Heading title={session.name} />
            <div className="mt-3 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${getDotColor()}`} />
              <span className="text-sm text-muted-foreground">{getStatusText()}</span>
            </div>
          </div>
          <Button asChild>
            <Link href={`/sessions/${session.id}/assessment`}>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Start Assessment
            </Link>
          </Button>
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

          {/* Criteria Details */}
          {session.criteria && session.criteria.length > 0 && (
            <Card>
              <Collapsible open={isCriteriaOpen} onOpenChange={setIsCriteriaOpen}>
                <CollapsibleTrigger className="w-full cursor-pointer transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <CardTitle>Criteria Details</CardTitle>
                        <CardDescription>
                          View all criteria for this session
                        </CardDescription>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isCriteriaOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
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
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
