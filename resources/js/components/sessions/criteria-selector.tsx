import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CriteriaData } from '@/types/session';
import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface CriteriaSelectorProps {
  criteriaData: CriteriaData;
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
}

export function CriteriaSelector({ criteriaData, selectedIds = [], onSelectionChange }: CriteriaSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => Object.keys(criteriaData), [criteriaData]);
  const [activeCategory, setActiveCategory] = useState(categories[0] || '');

  const ranks = useMemo(() => {
    const allRanks = new Set<string>();
    Object.values(criteriaData).forEach((categoryData) => {
      Object.keys(categoryData).forEach((rank) => allRanks.add(rank));
    });
    return Array.from(allRanks);
  }, [criteriaData]);

  const filteredCriteria = useMemo(() => {
    if (!searchQuery) return criteriaData;

    const query = searchQuery.toLowerCase();
    const filtered: CriteriaData = {};

    Object.entries(criteriaData).forEach(([category, rankData]) => {
      const filteredRanks: Record<string, any[]> = {};
      Object.entries(rankData).forEach(([rank, criteria]) => {
        const matchingCriteria = criteria.filter((c) => c.name.toLowerCase().includes(query));
        if (matchingCriteria.length > 0) {
          filteredRanks[rank] = matchingCriteria;
        }
      });
      if (Object.keys(filteredRanks).length > 0) {
        filtered[category] = filteredRanks as any;
      }
    });

    return filtered;
  }, [searchQuery, criteriaData]);

  const toggleCriterion = (id: number) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((c) => c !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const toggleRank = (category: string, rank: string) => {
    if (!onSelectionChange) return;
    const rankCriteria = criteriaData[category]?.[rank as keyof (typeof criteriaData)[typeof category]] || [];
    const rankIds = rankCriteria.map((c) => c.id);
    const allSelected = rankIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      onSelectionChange(selectedIds.filter((id) => !rankIds.includes(id)));
    } else {
      const newIds = [...selectedIds];
      rankIds.forEach((id) => {
        if (!newIds.includes(id)) {
          newIds.push(id);
        }
      });
      onSelectionChange(newIds);
    }
  };

  const clearSelection = () => {
    if (onSelectionChange) onSelectionChange([]);
  };

  const getCategoryCount = (category: string) => {
    const categoryData = criteriaData[category];
    if (!categoryData) return 0;
    const allIds = Object.values(categoryData).flat().map((c) => c.id);
    return selectedIds.filter((id) => allIds.includes(id)).length;
  };

  const getRankCount = (category: string, rank: string) => {
    const rankCriteria = criteriaData[category]?.[rank as keyof (typeof criteriaData)[typeof category]] || [];
    const rankIds = rankCriteria.map((c) => c.id);
    return selectedIds.filter((id) => rankIds.includes(id)).length;
  };

  const getSelectedCriteriaNames = () => {
    const names: string[] = [];
    Object.values(criteriaData).forEach((categoryData) => {
      Object.values(categoryData).forEach((criteria) => {
        criteria.forEach((c) => {
          if (selectedIds.includes(c.id)) {
            names.push(c.name);
          }
        });
      });
    });
    return names;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search criteria..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={clearSelection}
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <X className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className={`grid w-full grid-cols-${categories.length}`}>
          {categories.map((category) => {
            const count = getCategoryCount(category);
            return (
              <TabsTrigger key={category} value={category} className="relative capitalize">
                {category}
                {count > 0 && (
                  <Badge variant="secondary" className="ml-2 min-w-5 px-1.5 text-xs">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-4">
            <Accordion type="multiple" className="w-full">
              {ranks.map((rank) => {
                const rankCriteria = filteredCriteria[category]?.[rank as keyof (typeof filteredCriteria)[typeof category]] || [];
                const rankCount = getRankCount(category, rank);
                const allSelected = rankCriteria.length > 0 && rankCriteria.every((c) => selectedIds.includes(c.id));

                if (rankCriteria.length === 0 && searchQuery) return null;
                if (!criteriaData[category]?.[rank as keyof (typeof criteriaData)[typeof category]]) return null;

                return (
                  <AccordionItem key={rank} value={rank}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex w-full items-center justify-between pr-4">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold capitalize">{rank}</span>
                          <span className="text-sm text-muted-foreground">
                            {rankCriteria.length} {rankCriteria.length === 1 ? 'criterion' : 'criteria'}
                          </span>
                        </div>
                        {rankCount > 0 && (
                          <Badge variant="default" className="ml-2">
                            {rankCount} selected
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {rankCriteria.length > 0 && (
                          <button type="button" onClick={() => toggleRank(category, rank)} className="mb-2 text-sm text-primary hover:underline">
                            {allSelected ? 'Deselect all' : 'Select all'} {rank}
                          </button>
                        )}
                        <div className="space-y-3">
                          {rankCriteria.map((criterion) => (
                            <div key={criterion.id} className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent/50">
                              <Checkbox
                                id={`criterion-${criterion.id}`}
                                checked={selectedIds.includes(criterion.id)}
                                onCheckedChange={() => toggleCriterion(criterion.id)}
                                className="mt-0.5"
                              />
                              <label htmlFor={`criterion-${criterion.id}`} className="flex-1 cursor-pointer text-sm leading-relaxed">
                                {criterion.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TabsContent>
        ))}
      </Tabs>

      {selectedIds.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Selected ({selectedIds.length})
          </p>
          <div className="space-y-1 text-sm">
            {getSelectedCriteriaNames().map((name) => (
              <div key={name}>{name}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
