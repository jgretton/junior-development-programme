import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CATEGORY_NAMES, formatSessionDate, getCriteriaBreakdown, isSessionCompleted, isSessionUpcoming, RANK_NAMES } from '@/lib/session-utils';
import { Session } from '@/types/session';
import { Link } from '@inertiajs/react';
import { AlertCircle, ArrowRight, Calendar, CheckCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isUpcoming = isSessionUpcoming(session.date);
  const isCompleted = isSessionCompleted(session);
  const formattedDate = formatSessionDate(session.date);
  const criteriaCount = getCriteriaBreakdown(session);

  const getDotColor = () => {
    if (isCompleted) return 'bg-green-500';
    if (isUpcoming) return 'bg-blue-500';
    return 'bg-muted-foreground/50';
  };

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
          <CheckCircle className="mr-1 h-3 w-3" />
          Assessed
        </Badge>
      );
    }
    if (isUpcoming) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
          <Calendar className="mr-1 h-3 w-3" />
          Upcoming
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
        <AlertCircle className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    );
  };

  return (
    <div className="w-full rounded-lg border border-border bg-card">
      <div className="w-full p-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${getDotColor()}`} />
              <span className="text-xs font-medium text-muted-foreground">{formattedDate}</span>
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <h3 className="truncate leading-tight font-semibold text-foreground">{session.name}</h3>

              {criteriaCount && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(criteriaCount).map(([rank, count]) => (
                    <span key={rank} className="text-xs text-muted-foreground">
                      {rank} ({count})
                    </span>
                  ))}
                </div>
              )}

              {session.focus_areas && <p className="text-sm text-muted-foreground">{session.focus_areas}</p>}
            </div>

            <Button asChild variant="link" size="sm" className="shrink-0">
              <Link href={`sessions/${session.id}`}>
                View
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {session.criteria && session.criteria.length > 0 && (
        <div className="border-t border-border px-4">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between py-3 text-sm font-medium transition-colors hover:text-foreground">
              <span className="text-muted-foreground">View Criteria Details</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 pt-2 last:pb-4">
                {session.criteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-1.5 rounded-md border border-border bg-muted/30 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {RANK_NAMES[criterion.rank_id]}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {CATEGORY_NAMES[criterion.category_id]}
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{criterion.name}</p>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}
