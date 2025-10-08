import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import AppLayout from '@/layouts/app-layout';
import { CATEGORY_NAMES, formatSessionDate, getCriteriaBreakdown, isSessionCompleted, isSessionUpcoming, RANK_NAMES } from '@/lib/session-utils';
import { BreadcrumbItem } from '@/types';
import { Session } from '@/types/session';
import { Head } from '@inertiajs/react';
import { Calendar, ChevronDown, Target } from 'lucide-react';
import { useState } from 'react';

interface SingleSessionPageProps {
  session: Session;
}

export default function SingleSessionPage({ session }: SingleSessionPageProps) {
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
        <div className="mb-8">
          <Heading title={session.name} />
          <div className="mt-3 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${getDotColor()}`} />
            <span className="text-sm text-muted-foreground">{getStatusText()}</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Session Overview */}
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Session Overview</h2>
              <div className="space-y-4">
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
              </div>
            </div>
          </div>

          {/* Criteria Details */}
          {session.criteria && session.criteria.length > 0 && (
            <div className="rounded-lg border bg-card">
              <Collapsible open={isCriteriaOpen} onOpenChange={setIsCriteriaOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between p-6 transition-colors hover:bg-muted/50">
                  <h2 className="text-lg font-semibold">Criteria Details</h2>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isCriteriaOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-3 px-6 pb-6">
                    {session.criteria.map((criterion) => (
                      <div key={criterion.id} className="rounded-md border border-border bg-muted/30 p-4">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{RANK_NAMES[criterion.rank_id]}</Badge>
                          <Badge variant="outline">{CATEGORY_NAMES[criterion.category_id]}</Badge>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground">{criterion.name}</p>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
