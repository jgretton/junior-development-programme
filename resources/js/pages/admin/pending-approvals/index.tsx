import Heading from '@/components/heading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Check, InfoIcon, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Pending Approvals',
    href: '/admin/pending-approvals',
  },
];

interface Approval {
  id: number;
  user: {
    id: number;
    name: string;
  };
  criteria: {
    id: number;
    name: string;
    rank: {
      id: number;
      name: string;
    };
    category: {
      id: number;
      name: string;
    };
  };
  assessedby: {
    id: number;
    name: string;
  };
  assessed_at: string;
  non_focus_criteria: boolean;
}

interface CriteriaGroup {
  criteria: {
    id: number;
    name: string;
    rank: {
      id: number;
      name: string;
    };
    category: {
      id: number;
      name: string;
    };
  };
  approvals: Approval[];
  count: number;
}

interface SessionGroup {
  session: {
    id: number;
    name: string;
    date: string;
  };
  criteriaGroups: CriteriaGroup[];
  count: number;
}

interface PageProps {
  groupedApprovals: SessionGroup[];
  totalPending: number;
  flash: { success?: string; error?: string };
}

export default function PendingApprovalsIndex({ groupedApprovals, totalPending, flash }: PageProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const [processingIds, setProcessingIds] = React.useState<Set<number>>(new Set());

  // Show flash messages
  React.useEffect(() => {
    if (flash.success) toast.success(flash.success);
    if (flash.error) toast.error(flash.error);
  }, [flash]);

  // Toggle individual item selection
  const toggleSelection = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Select all in a criteria group
  const selectAllInCriteria = (approvals: Approval[]) => {
    const newSet = new Set(selectedIds);
    approvals.forEach((approval) => newSet.add(approval.id));
    setSelectedIds(newSet);
  };

  // Deselect all in a criteria group
  const deselectAllInCriteria = (approvals: Approval[]) => {
    const newSet = new Set(selectedIds);
    approvals.forEach((approval) => newSet.delete(approval.id));
    setSelectedIds(newSet);
  };

  // Check if all in criteria are selected
  const areAllSelectedInCriteria = (approvals: Approval[]) => {
    return approvals.every((approval) => selectedIds.has(approval.id));
  };

  // Handle approve
  const handleApprove = (ids: number[]) => {
    if (ids.length === 0) {
      toast.error('No items selected');
      return;
    }

    setProcessingIds(new Set(ids));
    router.post(
      '/admin/pending-approvals',
      { ids },
      {
        onFinish: () => {
          setProcessingIds(new Set());
          setSelectedIds(new Set());
        },
      }
    );
  };

  // Handle reject with confirmation
  const handleReject = (ids: number[]) => {
    if (ids.length === 0) {
      toast.error('No items selected');
      return;
    }

    if (!confirm(`Are you sure you want to reject ${ids.length} assessment(s)? This action cannot be undone.`)) {
      return;
    }

    setProcessingIds(new Set(ids));
    router.delete('/admin/pending-approvals', {
      data: { ids },
      onFinish: () => {
        setProcessingIds(new Set());
        setSelectedIds(new Set());
      },
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Pending Approvals" />
      <Toaster />

      <div className="container mx-auto mt-10 max-w-7xl px-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Heading title="Pending Approvals" description="Review and approve or reject player assessments from coaches" />
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              {totalPending} pending
            </Badge>
          </div>

          {/* Empty state */}
          {groupedApprovals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Check className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No Pending Approvals</h3>
                <p className="text-sm text-muted-foreground">All assessments have been reviewed</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Info Alert */}
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  Select items using checkboxes, then use the buttons to approve or reject. You can also approve or reject individual items or entire
                  sessions.
                </AlertDescription>
              </Alert>

              {/* Fixed bottom action bar - positioned within content area */}
              {selectedIds.size > 0 && (
                <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
                  <div className="flex items-center gap-4 rounded-lg border bg-background px-6 py-3 shadow-lg">
                    <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                        Clear
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(Array.from(selectedIds))} disabled={processingIds.size > 0}>
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => handleApprove(Array.from(selectedIds))} disabled={processingIds.size > 0}>
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Session groups */}
              <div className="space-y-6 pb-24">
                {groupedApprovals.map((group) => {
                  const firstApproval = group.criteriaGroups[0]?.approvals[0];

                  return (
                    <CollapsibleCard
                      key={group.session.id}
                      title={group.session.name}
                      description={`${formatDate(group.session.date)} • Assessed by ${firstApproval?.assessedby.name} • ${group.count} pending`}
                      defaultOpen={true}>
                      <div className="space-y-4">
                        {/* Criteria groups */}
                        {group.criteriaGroups.map((criteriaGroup) => {
                          const allCriteriaSelected = areAllSelectedInCriteria(criteriaGroup.approvals);
                          const isNonFocus = criteriaGroup.approvals[0]?.non_focus_criteria;
                          const selectedCount = criteriaGroup.approvals.filter((a) => selectedIds.has(a.id)).length;
                          const hasSelection = selectedCount > 0;

                          return (
                            <CollapsibleCard
                              key={criteriaGroup.criteria.id}
                              title={
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={allCriteriaSelected}
                                    onCheckedChange={() =>
                                      allCriteriaSelected
                                        ? deselectAllInCriteria(criteriaGroup.approvals)
                                        : selectAllInCriteria(criteriaGroup.approvals)
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <span className="text-sm font-medium">{criteriaGroup.criteria.name}</span>
                                  {isNonFocus && (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100">
                                      Non-Focus
                                    </Badge>
                                  )}
                                  {hasSelection && (
                                    <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                      <span>{selectedCount} selected</span>
                                    </div>
                                  )}
                                </div>
                              }
                              description={`${criteriaGroup.criteria.rank.name} • ${criteriaGroup.criteria.category.name} • ${criteriaGroup.count} ${criteriaGroup.count === 1 ? 'player' : 'players'}`}
                              defaultOpen={false}
                              className={isNonFocus ? 'border-purple-200 bg-purple-50/30 dark:border-purple-800 dark:bg-purple-950/10' : ''}>
                              {/* Player list - simple and clean */}
                              <div className="divide-y rounded-lg border">
                                {criteriaGroup.approvals.map((approval) => {
                                  const isSelected = selectedIds.has(approval.id);
                                  const isProcessing = processingIds.has(approval.id);

                                  return (
                                    <div
                                      key={approval.id}
                                      className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                                        isSelected ? 'bg-muted/50' : ''
                                      } ${isProcessing ? 'opacity-50' : ''} hover:bg-muted/50`}>
                                      <Checkbox checked={isSelected} onCheckedChange={() => toggleSelection(approval.id)} disabled={isProcessing} />
                                      <span className="flex-1 text-sm">{approval.user.name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </CollapsibleCard>
                          );
                        })}
                      </div>
                    </CollapsibleCard>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
