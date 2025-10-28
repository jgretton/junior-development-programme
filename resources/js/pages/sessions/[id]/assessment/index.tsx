import { AdditionalCriteriaModal } from '@/components/sessions/assessment/additional-criteria-modal';
import { AssessmentReview } from '@/components/sessions/assessment/assessment-review';
import { AttendanceSelectionStep } from '@/components/sessions/assessment/attendance-selection-step';
import { CriteriaListAssessmentStep } from '@/components/sessions/assessment/criteria-list-assessment-step';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { CriteriaData, Session } from '@/types/session';
import { Head, router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';

interface AssessmentPageProps {
  session: Session;
  players: {
    id: string;
    name: string;
  }[];
  criteriaData: CriteriaData;
}

interface PlayerAssignment {
  [criteriaId: string]: string[];
}

export default function AssessmentPage({ session, players, criteriaData }: AssessmentPageProps) {
  // State
  const [attendingPlayers, setAttendingPlayers] = useState<Set<string>>(new Set());
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<PlayerAssignment>({});
  const [showReview, setShowReview] = useState(false);
  const [attendanceConfirmed, setAttendanceConfirmed] = useState(false);
  const [isPlayersOpen, setIsPlayersOpen] = useState(false);
  const [isCriteriaOpen, setIsCriteriaOpen] = useState(false);
  const [showAdditionalCriteriaModal, setShowAdditionalCriteriaModal] = useState(false);
  const [additionalCriteriaIds, setAdditionalCriteriaIds] = useState<number[]>([]);

  // Computed values
  const criteria = session.criteria || [];

  // Convert additional criteria IDs to full criteria objects with category and rank info
  const additionalCriteria = useMemo(() => {
    const criteriaObjects: Array<{
      id: number;
      name: string;
      category?: { id: number; name: string };
      rank?: { id: number; name: string };
    }> = [];
    additionalCriteriaIds.forEach((id) => {
      // Search through all categories and ranks to find the criteria
      Object.entries(criteriaData).forEach(([categoryName, categoryData]) => {
        Object.entries(categoryData).forEach(([rankName, rankCriteria]) => {
          const found = rankCriteria.find((c) => c.id === id);
          if (found) {
            criteriaObjects.push({
              ...found,
              category: { id: 0, name: categoryName },
              rank: { id: 0, name: rankName },
            });
          }
        });
      });
    });
    return criteriaObjects;
  }, [additionalCriteriaIds, criteriaData]);

  // Combined list: both session and additional criteria
  const allCriteria = useMemo(() => {
    return [...criteria, ...additionalCriteria];
  }, [criteria, additionalCriteria]);

  // Compute disabled criteria IDs (session criteria + already added additional criteria)
  const disabledCriteriaIds = useMemo(() => {
    return [...criteria.map((c) => c.id), ...additionalCriteriaIds];
  }, [criteria, additionalCriteriaIds]);

  const selectedCriteria = allCriteria.find((c) => c.id === selectedCriteriaId);

  const attendingPlayersList = useMemo(() => {
    return players.filter((p) => attendingPlayers.has(p.id));
  }, [players, attendingPlayers]);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Sessions',
      href: '/sessions',
    },
    {
      title: session.name,
      href: `/sessions/${session.id}`,
    },
    {
      title: 'Assessment',
      href: `/sessions/${session.id}/assessment`,
    },
  ];

  // Handlers
  const togglePlayerAttendance = useCallback((playerId: string) => {
    setAttendingPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  }, []);

  const handleSelectCriteria = useCallback((criteriaId: number) => {
    setSelectedCriteriaId(criteriaId);
  }, []);

  const togglePlayerAssignment = useCallback(
    (playerId: string) => {
      if (!selectedCriteria) return;

      setAssignments((prev) => {
        const current = prev[selectedCriteria.id] || [];
        const isAssigned = current.includes(playerId);

        return {
          ...prev,
          [selectedCriteria.id]: isAssigned ? current.filter((id) => id !== playerId) : [...current, playerId],
        };
      });
    },
    [selectedCriteria]
  );

  const handleSelectAll = useCallback(() => {
    if (!selectedCriteria) return;
    setAssignments((prev) => ({
      ...prev,
      [selectedCriteria.id]: attendingPlayersList.map((p) => p.id),
    }));
  }, [selectedCriteria, attendingPlayersList]);

  const handleClearAll = useCallback(() => {
    if (!selectedCriteria) return;
    setAssignments((prev) => ({
      ...prev,
      [selectedCriteria.id]: [],
    }));
  }, [selectedCriteria]);

  const getAssignmentCount = useCallback(
    (playerId: string) => {
      return Object.values(assignments).filter((playerIds) => playerIds.includes(playerId)).length;
    },
    [assignments]
  );

  const getCriteriaProgress = useCallback(() => {
    const completed = Object.keys(assignments).filter((criteriaId) => assignments[criteriaId].length > 0).length;
    return `${completed}/${criteria.length}`;
  }, [assignments, criteria.length]);

  const getPlayerProgress = useCallback(
    (playerId: string) => {
      return {
        current: getAssignmentCount(playerId),
        total: criteria.length,
      };
    },
    [getAssignmentCount, criteria.length]
  );

  const handleContinueToAssessment = useCallback(() => {
    setAttendanceConfirmed(true);
  }, []);

  const handleBackToAssessment = useCallback(() => {
    setShowReview(false);
  }, []);

  const handleAddAdditionalCriteria = useCallback(() => {
    setShowAdditionalCriteriaModal(true);
  }, []);

  const handleAddSelectedCriteria = useCallback((criteriaIds: number[]) => {
    // Add the new criteria IDs to the additional criteria list
    setAdditionalCriteriaIds((prev) => [...prev, ...criteriaIds]);
  }, []);

  const handleRemoveAdditionalCriteria = useCallback((criteriaId: number) => {
    setAdditionalCriteriaIds((prev) => prev.filter((id) => id !== criteriaId));
    // Also clear any assignments for this criteria
    setAssignments((prev) => {
      const updated = { ...prev };
      delete updated[criteriaId];
      return updated;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    router.post(
      `/sessions/${session.id}/assessment`,
      {
        sessionId: session.id,
        attendingPlayers: Array.from(attendingPlayers),
        assignments: assignments,
        additionalCriteriaIds: additionalCriteriaIds,
      },
      {
        onSuccess: () => {
          console.log('success');
        },
        onError: (errors) => {
          console.error('Submission failed:', errors);
        },
      }
    );
  }, [session.id, attendingPlayers, assignments, additionalCriteriaIds]);

  // Render steps
  if (showReview) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title={`${session.name} - Review`} />
        <AssessmentReview
          sessionName={session.name}
          criteria={criteria}
          additionalCriteria={additionalCriteria}
          attendingPlayers={attendingPlayersList}
          assignments={assignments}
          isPlayersOpen={isPlayersOpen}
          isCriteriaOpen={isCriteriaOpen}
          onTogglePlayersOpen={setIsPlayersOpen}
          onToggleCriteriaOpen={setIsCriteriaOpen}
          onBackToAssessment={handleBackToAssessment}
          onSubmit={handleSubmit}
          getCriteriaProgress={getCriteriaProgress}
        />
      </AppLayout>
    );
  }

  if (!attendanceConfirmed) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title={`${session.name} - Assessment`} />
        <AttendanceSelectionStep
          players={players}
          attendingPlayerIds={Array.from(attendingPlayers)}
          onTogglePlayer={togglePlayerAttendance}
          onContinue={handleContinueToAssessment}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${session.name} - Assessment`} />
      <CriteriaListAssessmentStep
        criteria={criteria}
        additionalCriteria={additionalCriteria}
        attendingPlayers={attendingPlayersList}
        assignments={assignments}
        selectedCriteriaId={selectedCriteriaId}
        onSelectCriteria={handleSelectCriteria}
        onTogglePlayerAssignment={togglePlayerAssignment}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
        onReview={() => setShowReview(true)}
        onAddAdditionalCriteria={handleAddAdditionalCriteria}
        onRemoveAdditionalCriteria={handleRemoveAdditionalCriteria}
        getCriteriaProgress={getCriteriaProgress}
        getPlayerProgress={getPlayerProgress}
      />

      {/* Additional Criteria Selection Modal */}
      <AdditionalCriteriaModal
        open={showAdditionalCriteriaModal}
        onOpenChange={setShowAdditionalCriteriaModal}
        criteriaData={criteriaData}
        disabledCriteriaIds={disabledCriteriaIds}
        onAdd={handleAddSelectedCriteria}
      />
    </AppLayout>
  );
}
