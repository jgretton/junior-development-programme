import Heading from '@/components/heading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { Separator } from '@/components/ui/separator';
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

  // Get all approvals from criteria groups
  const getAllApprovalsFromSession = (criteriaGroups: CriteriaGroup[]) => {
    return criteriaGroups.flatMap((group) => group.approvals);
  };

  // Select all in a session
  const selectAllInSession = (criteriaGroups: CriteriaGroup[]) => {
    const newSet = new Set(selectedIds);
    getAllApprovalsFromSession(criteriaGroups).forEach((approval) => newSet.add(approval.id));
    setSelectedIds(newSet);
  };

  // Deselect all in a session
  const deselectAllInSession = (criteriaGroups: CriteriaGroup[]) => {
    const newSet = new Set(selectedIds);
    getAllApprovalsFromSession(criteriaGroups).forEach((approval) => newSet.delete(approval.id));
    setSelectedIds(newSet);
  };

  // Check if all in session are selected
  const areAllSelectedInSession = (criteriaGroups: CriteriaGroup[]) => {
    return getAllApprovalsFromSession(criteriaGroups).every((approval) => selectedIds.has(approval.id));
  };

  // Get selected IDs for a session
  const getSelectedInSession = (criteriaGroups: CriteriaGroup[]) => {
    return getAllApprovalsFromSession(criteriaGroups).filter((approval) => selectedIds.has(approval.id));
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

  // Get selected IDs for a criteria
  const getSelectedInCriteria = (approvals: Approval[]) => {
    return approvals.filter((approval) => selectedIds.has(approval.id));
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

              {/* Global action buttons */}
              {selectedIds.size > 0 && (
                <div className="sticky top-0 z-10 flex items-center gap-2 rounded-lg border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
                  <Separator orientation="vertical" className="h-6" />
                  <Button size="sm" onClick={() => handleApprove(Array.from(selectedIds))} disabled={processingIds.size > 0}>
                    <Check className="mr-2 h-4 w-4" />
                    Approve Selected
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReject(Array.from(selectedIds))} disabled={processingIds.size > 0}>
                    <X className="mr-2 h-4 w-4" />
                    Reject Selected
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                    Clear Selection
                  </Button>
                </div>
              )}

              {/* Session groups */}
              <div className="space-y-6">
                {groupedApprovals.map((group) => {
                  const selectedInSession = getSelectedInSession(group.criteriaGroups);
                  const allSelected = areAllSelectedInSession(group.criteriaGroups);
                  const firstApproval = group.criteriaGroups[0]?.approvals[0];

                  return (
                    <CollapsibleCard
                      key={group.session.id}
                      title={
                        <div className="flex items-center gap-2">
                          {group.session.name}
                          {selectedInSession.length > 0 && (
                            <Badge variant="default" className="ml-2">
                              {selectedInSession.length} selected
                            </Badge>
                          )}
                        </div>
                      }
                      description={`${formatDate(group.session.date)} • Assessed by ${firstApproval?.assessedby.name} • ${group.count} pending`}
                      defaultOpen={true}
                      className={selectedInSession.length > 0 ? 'border-primary' : ''}>
                      <div className="space-y-6">
                        {/* Session-level actions */}
                        <div className="flex flex-wrap gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => (allSelected ? deselectAllInSession(group.criteriaGroups) : selectAllInSession(group.criteriaGroups))}>
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </Button>
                          {selectedInSession.length > 0 && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(selectedInSession.map((a) => a.id))}
                                disabled={processingIds.size > 0}>
                                <Check className="mr-2 h-4 w-4" />
                                Approve Selected ({selectedInSession.length})
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(selectedInSession.map((a) => a.id))}
                                disabled={processingIds.size > 0}>
                                <X className="mr-2 h-4 w-4" />
                                Reject Selected ({selectedInSession.length})
                              </Button>
                            </>
                          )}
                        </div>

                        <Separator />

                        {/* Criteria groups */}
                        <div className="space-y-4">
                          {group.criteriaGroups.map((criteriaGroup) => {
                            const selectedInCriteria = getSelectedInCriteria(criteriaGroup.approvals);
                            const allCriteriaSelected = areAllSelectedInCriteria(criteriaGroup.approvals);
                            const isNonFocus = criteriaGroup.approvals[0]?.non_focus_criteria;

                            return (
                              <div
                                key={criteriaGroup.criteria.id}
                                className={`rounded-lg border-2 ${
                                  isNonFocus ? 'border-purple-300 bg-purple-50/50 dark:border-purple-700 dark:bg-purple-950/20' : 'border-border'
                                }`}>
                                {/* Criteria header */}
                                <div className="border-b bg-muted/30 p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Checkbox
                                        checked={allCriteriaSelected}
                                        onCheckedChange={() =>
                                          allCriteriaSelected
                                            ? deselectAllInCriteria(criteriaGroup.approvals)
                                            : selectAllInCriteria(criteriaGroup.approvals)
                                        }
                                      />
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h4 className="text-base font-semibold">{criteriaGroup.criteria.name}</h4>
                                          {isNonFocus && (
                                            <Badge
                                              variant="secondary"
                                              className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100">
                                              Non-Focus
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="mt-1 flex items-center gap-2">
                                          <Badge variant="secondary" className="text-xs">
                                            {criteriaGroup.criteria.rank.name}
                                          </Badge>
                                          <Badge variant="outline" className="text-xs">
                                            {criteriaGroup.criteria.category.name}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">
                                            {criteriaGroup.count} {criteriaGroup.count === 1 ? 'player' : 'players'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    {selectedInCriteria.length > 0 && (
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => handleApprove(selectedInCriteria.map((a) => a.id))}
                                          disabled={processingIds.size > 0}>
                                          <Check className="mr-2 h-4 w-4" />
                                          Approve ({selectedInCriteria.length})
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleReject(selectedInCriteria.map((a) => a.id))}
                                          disabled={processingIds.size > 0}>
                                          <X className="mr-2 h-4 w-4" />
                                          Reject ({selectedInCriteria.length})
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Player list - compact table style */}
                                <div className="divide-y">
                                  {criteriaGroup.approvals.map((approval) => {
                                    const isSelected = selectedIds.has(approval.id);
                                    const isProcessing = processingIds.has(approval.id);

                                    return (
                                      <div
                                        key={approval.id}
                                        className={`flex items-center gap-3 px-4 py-2 transition-colors ${
                                          isSelected ? 'bg-accent' : 'hover:bg-accent/50'
                                        } ${isProcessing ? 'opacity-50' : ''}`}>
                                        <Checkbox checked={isSelected} onCheckedChange={() => toggleSelection(approval.id)} disabled={isProcessing} />
                                        <span className="flex-1 font-medium">{approval.user.name}</span>
                                        <div className="flex gap-1">
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7"
                                            onClick={() => handleApprove([approval.id])}
                                            disabled={isProcessing || processingIds.size > 0}>
                                            <Check className="h-4 w-4 text-green-600" />
                                          </Button>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7"
                                            onClick={() => handleReject([approval.id])}
                                            disabled={isProcessing || processingIds.size > 0}>
                                            <X className="h-4 w-4 text-red-600" />
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
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
