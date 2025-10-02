export interface SessionCriteria {
  id: number;
  name: string;
  rank_id: number;
  category_id: number;
}

export interface Session {
  id: number;
  name: string;
  date: string;
  focus_areas?: string;
  criteria?: SessionCriteria[];
}

export type FilterType = 'all' | 'upcoming' | 'pending' | 'completed';

export interface SessionCounts {
  upcoming: number;
  pending: number;
  completed: number;
}

export interface SessionGroup {
  year: number;
  month: number;
  monthName: string;
  sessions: Session[];
}
