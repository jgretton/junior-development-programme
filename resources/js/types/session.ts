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
    is_assessed?: boolean;
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

export type RankLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface CriterionItem {
    id: number;
    name: string;
}

export type CategoryCriteria = {
    [key in RankLevel]: CriterionItem[];
};

export type CriteriaData = {
    [category: string]: CategoryCriteria;
};

export interface CreatePageProps {
    criteria: CriteriaData;
}

export interface Player {
    id: number;
    name: string;
}

export interface CriteriaProgress {
    criteria: {
        id: number;
        name: string;
    };
    achieved: Player[];
    notAchieved: Player[];
}
