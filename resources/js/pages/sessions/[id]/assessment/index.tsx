import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Session } from '@/types/session';
import { Head } from '@inertiajs/react';
import { useState, useMemo, useCallback } from 'react';
import { AttendanceSelectionStep } from '@/components/sessions/assessment/attendance-selection-step';
import { CriteriaAssessmentStep } from '@/components/sessions/assessment/criteria-assessment-step';
import { AssessmentReview } from '@/components/sessions/assessment/assessment-review';

interface AssessmentPageProps {
  session: Session;
  players: {
    id: string;
    name: string;
  }[];
}

interface PlayerAssignment {
  [criteriaId: string]: string[];
}

export default function AssessmentPage({ session, players }: AssessmentPageProps) {
  // State
  const [attendingPlayers, setAttendingPlayers] = useState<Set<string>>(new Set());
  const [currentCriteriaIndex, setCurrentCriteriaIndex] = useState(0);
  const [assignments, setAssignments] = useState<PlayerAssignment>({});
  const [showReview, setShowReview] = useState(false);
  const [attendanceConfirmed, setAttendanceConfirmed] = useState(false);
  const [isPlayersOpen, setIsPlayersOpen] = useState(false);
  const [isCriteriaOpen, setIsCriteriaOpen] = useState(false);

  // Computed values
  const criteria = session.criteria || [];
  const currentCriteria = criteria[currentCriteriaIndex];

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

  const togglePlayerAssignment = useCallback(
    (playerId: string) => {
      if (!currentCriteria) return;

      setAssignments((prev) => {
        const current = prev[currentCriteria.id] || [];
        const isAssigned = current.includes(playerId);

        return {
          ...prev,
          [currentCriteria.id]: isAssigned ? current.filter((id) => id !== playerId) : [...current, playerId],
        };
      });
    },
    [currentCriteria]
  );

  const handleSelectAll = useCallback(() => {
    if (!currentCriteria) return;
    setAssignments((prev) => ({
      ...prev,
      [currentCriteria.id]: attendingPlayersList.map((p) => p.id),
    }));
  }, [currentCriteria, attendingPlayersList]);

  const handleClearAll = useCallback(() => {
    if (!currentCriteria) return;
    setAssignments((prev) => ({
      ...prev,
      [currentCriteria.id]: [],
    }));
  }, [currentCriteria]);

  const handleNext = useCallback(() => {
    if (currentCriteriaIndex < criteria.length - 1) {
      setCurrentCriteriaIndex((prev) => prev + 1);
    } else {
      setShowReview(true);
    }
  }, [currentCriteriaIndex, criteria.length]);

  const handlePrevious = useCallback(() => {
    if (currentCriteriaIndex > 0) {
      setCurrentCriteriaIndex((prev) => prev - 1);
    }
  }, [currentCriteriaIndex]);

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

  const handleSubmit = useCallback(() => {
    // TODO: Implement submission logic
    console.log('Submitting assessments:', {
      sessionId: session.id,
      attendingPlayers: Array.from(attendingPlayers),
      assignments,
    });
  }, [session.id, attendingPlayers, assignments]);

  // Render steps
  if (showReview) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title={`${session.name} - Review`} />
        <AssessmentReview
          sessionName={session.name}
          criteria={criteria}
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
      <CriteriaAssessmentStep
        criteria={criteria}
        currentCriteriaIndex={currentCriteriaIndex}
        attendingPlayers={attendingPlayersList}
        assignments={assignments}
        onTogglePlayerAssignment={togglePlayerAssignment}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onReview={() => setShowReview(true)}
        getCriteriaProgress={getCriteriaProgress}
        getPlayerProgress={getPlayerProgress}
      />
    </AppLayout>
  );
}
