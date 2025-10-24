import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatSessionDate, getCriteriaBreakdown, RANK_NAMES } from '@/lib/session-utils';
import { Session } from '@/types/session';
import { Link } from '@inertiajs/react';
import { Calendar, ChevronRight, Target } from 'lucide-react';

interface NextSessionCardProps {
  session: Session | null;
}

export function NextSessionCard({ session }: NextSessionCardProps) {
  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Next Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No upcoming sessions scheduled</p>
          <Button asChild className="mt-4 w-full">
            <Link href="/sessions/create">Create New Session</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formattedDate = formatSessionDate(session.date);
  const criteriaCount = getCriteriaBreakdown(session);

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Next Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">{session.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{formattedDate}</p>
        </div>

        {session.focus_areas && (
          <div className="flex items-start gap-2">
            <Target className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Focus Areas</p>
              <p className="text-sm text-muted-foreground">{session.focus_areas}</p>
            </div>
          </div>
        )}

        {criteriaCount && (
          <div>
            <p className="mb-2 text-sm font-medium">Criteria to Assess</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(criteriaCount).map(([rank, count]) => (
                <Badge key={rank} variant="secondary">
                  {rank}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button asChild className="w-full" variant="outline">
          <Link href={`/sessions/${session.id}`}>
            View Details
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
