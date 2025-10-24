import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatSessionDate, getCriteriaBreakdown } from '@/lib/session-utils';
import { Session } from '@/types/session';
import { Link } from '@inertiajs/react';
import { AlertCircle, CheckCircle, ChevronRight, ClipboardCheck, History } from 'lucide-react';

interface LastSessionCardProps {
  session: Session | null;
}

export function LastSessionCard({ session }: LastSessionCardProps) {
  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            Last Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No previous sessions found</p>
        </CardContent>
      </Card>
    );
  }

  const formattedDate = formatSessionDate(session.date);
  const criteriaCount = getCriteriaBreakdown(session);
  const isAssessed = session.is_assessed === true;

  return (
    <Card
      className={
        isAssessed
          ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20'
          : 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20'
      }>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className={`h-5 w-5 ${isAssessed ? 'text-green-500' : 'text-amber-500'}`} />
          Last Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-xl font-bold">{session.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{formattedDate}</p>
            </div>
            {isAssessed ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                <CheckCircle className="mr-1 h-3 w-3" />
                Assessed
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                <AlertCircle className="mr-1 h-3 w-3" />
                Pending
              </Badge>
            )}
          </div>
        </div>

        {criteriaCount && (
          <div>
            <p className="mb-2 text-sm font-medium">Criteria</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(criteriaCount).map(([rank, count]) => (
                <Badge key={rank} variant="secondary">
                  {rank}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {isAssessed ? (
          <Button asChild className="w-full" variant="outline">
            <Link href={`/sessions/${session.id}`}>
              View Results
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild className="w-full">
            <Link href={`/sessions/${session.id}/assessment`}>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Assess Now
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
