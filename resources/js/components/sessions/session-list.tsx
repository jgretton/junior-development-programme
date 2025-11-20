import { SessionCard } from '@/components/sessions/session-card';
import { SessionGroup } from '@/types/session';

interface SessionListProps {
  groups: SessionGroup[];
}

export function SessionList({ groups }: SessionListProps) {
  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-12 text-center">
        <p className="text-sm text-muted-foreground">No sessions found.</p>
      </div>
    );
  }

  return (
    <>
      {groups.map((group) => (
        <div key={`${group.year}-${group.month}`} className="mb-6">
          <div className="sticky top-0 z-10 -mx-4 mb-3 border-b border-border bg-background px-4 pb-2 sm:-mx-0 sm:px-0">
            <h2 className="text-lg font-semibold text-foreground">
              {group.monthName} {group.year}
            </h2>
          </div>
          <div className="space-y-2">
            {group.sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
