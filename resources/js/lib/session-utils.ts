import { Session, SessionCounts, SessionGroup } from '@/types/session';

export const RANK_NAMES: Record<number, string> = {
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Platinum',
};

export const CATEGORY_NAMES: Record<number, string> = {
  1: 'Hitting',
  2: 'Serving',
  3: 'Blocking',
  4: 'Passing',
  5: 'Setting',
};

export function isSessionUpcoming(date: string | Date): boolean {
  const sessionDate = new Date(date);
  const today = new Date();
  return sessionDate >= today;
}

export function isSessionCompleted(session: Session): boolean {
  return session.is_assessed === true;
}

export function formatSessionDate(date: string | Date): string {
  const sessionDate = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  if (isSameDay(sessionDate, today)) return 'Today';
  if (isSameDay(sessionDate, tomorrow)) return 'Tomorrow';

  return sessionDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: sessionDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

export function calculateSessionCounts(sessions: Session[]): SessionCounts {
  const today = new Date();
  let upcoming = 0;
  let pending = 0;
  let completed = 0;

  sessions.forEach((session) => {
    const isUpcoming = isSessionUpcoming(session.date);
    const isCompleted = isSessionCompleted(session);

    if (isCompleted) {
      completed++;
    } else if (isUpcoming) {
      upcoming++;
    } else {
      pending++;
    }
  });

  return { upcoming, pending, completed };
}

export function getCriteriaBreakdown(session: Session): Record<string, number> | null {
  if (!session.criteria || session.criteria.length === 0) return null;

  const breakdown: Record<string, number> = {};
  session.criteria.forEach((criterion) => {
    const rank = RANK_NAMES[criterion.rank_id];
    breakdown[rank] = (breakdown[rank] || 0) + 1;
  });

  return breakdown;
}

export function groupSessionsByMonth(sessions: Session[]): SessionGroup[] {
  const groups: SessionGroup[] = [];

  sessions.forEach((session) => {
    const date = new Date(session.date);
    const year = date.getFullYear();
    const month = date.getMonth();

    let group = groups.find((g) => g.year === year && g.month === month);
    if (!group) {
      const monthName = date.toLocaleDateString('en-GB', { month: 'long' });
      group = { year, month, monthName, sessions: [] };
      groups.push(group);
    }
    group.sessions.push(session);
  });

  return groups;
}
