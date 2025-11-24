import { Badge } from '@/components/ui/badge';
import { Session } from '@/types/session';
import { Link } from '@inertiajs/react';
import { ArrowRight, Calendar, Users } from 'lucide-react';

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  const isPending = session.status === 'pending';
  const sessionDate = new Date(session.date);

  const formattedDate = sessionDate.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
  });

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${isPending ? 'bg-muted-foreground/50' : 'bg-green-500'}`} />
          <h3 className="font-medium text-foreground truncate">
            {session.name}
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isPending && (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
              Pending
            </Badge>
          )}
          <Link
            href={`/sessions/${session.id}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            View
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-1.5 ml-5 flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span>{formattedDate}</span>
        <span>·</span>
        <Users className="h-3.5 w-3.5" />
        <span>{session.attendees_count} players</span>
      </div>

      {session.focus_areas && (
        <p className="mt-2 ml-5 text-sm text-muted-foreground truncate">
          {session.focus_areas}
        </p>
      )}
    </div>
  );
}
