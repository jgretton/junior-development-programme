import { useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollParams {
  itemsPerPage: number;
  totalItems: number;
  onLoadMore?: () => void;
}

export function useInfiniteScroll({ itemsPerPage, totalItems, onLoadMore }: UseInfiniteScrollParams) {
  const [displayCount, setDisplayCount] = useState(itemsPerPage);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasMore = displayCount < totalItems;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setDisplayCount((prev) => prev + itemsPerPage);
          onLoadMore?.();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, itemsPerPage, onLoadMore]);

  const resetDisplayCount = () => {
    setDisplayCount(itemsPerPage);
  };

  return {
    displayCount,
    loadMoreRef,
    hasMore,
    resetDisplayCount,
  };
}
