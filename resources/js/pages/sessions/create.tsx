import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { CriteriaSelector } from '@/components/sessions/criteria-selector';
import { PlayerSelectionList } from '@/components/sessions/assessment/player-selection-list';
import { AccordionCard, AccordionCardStatus } from '@/components/sessions/wizard/accordion-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { CriteriaData, CriterionItem } from '@/types/session';
import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { ArrowLeft, Calendar as CalendarIcon, Check, CheckCircle2, ChevronDownIcon, ClipboardList, Loader2, Plus, Search, Target, Users, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Sessions',
    href: '/sessions',
  },
  {
    title: 'Create',
    href: '/sessions/create',
  },
];

interface Player {
  id: number;
  name: string;
}

interface CreatePageProps {
  players: Player[];
  criteriaData: CriteriaData;
  existingAchievements: Record<number, number[]>;
}

type WizardStep = 'details' | 'attendance' | 'assessment' | 'review';

interface SessionFormData {
  name: string;
  date: Date | undefined;
  focus_areas: string;
}

interface PlayerAssignment {
  [criteriaId: number]: string[];
}

export default function CreatePage({ players, criteriaData, existingAchievements }: CreatePageProps) {
  // Step management
  const [currentStep, setCurrentStep] = useState<WizardStep>('details');
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set());

  // Step 1: Session details
  const [sessionData, setSessionData] = useState<SessionFormData>({
    name: '',
    date: undefined,
    focus_areas: '',
  });
  const [dateOpen, setDateOpen] = useState(false);

  // Step 2: Attendance
  const [attendingPlayerIds, setAttendingPlayerIds] = useState<Set<string>>(new Set());

  // Step 3: Criteria assessment
  const [selectedCriteriaIds, setSelectedCriteriaIds] = useState<number[]>([]); // Criteria to assess
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<number | null>(null); // Currently selected for player assignment
  const [assignments, setAssignments] = useState<PlayerAssignment>({});
  const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);
  const [tempSelectedCriteria, setTempSelectedCriteria] = useState<number[]>([]);
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');

  // Form errors
  const [errors] = useState<Record<string, string>>({});

  // Players formatted for PlayerSelectionList (needs string IDs)
  const formattedPlayers = useMemo(
    () => players.map((p) => ({ id: String(p.id), name: p.name })),
    [players]
  );

  // Attending players for criteria assignment step
  const attendingPlayers = useMemo(
    () => formattedPlayers.filter((p) => attendingPlayerIds.has(p.id)),
    [formattedPlayers, attendingPlayerIds]
  );

  // Get all criteria as a flat list
  const allCriteria = useMemo(() => {
    const criteria: Array<CriterionItem & { category: string; rank: string }> = [];
    Object.entries(criteriaData).forEach(([category, ranks]) => {
      Object.entries(ranks).forEach(([rank, items]) => {
        items.forEach((item) => {
          criteria.push({ ...item, category, rank });
        });
      });
    });
    return criteria;
  }, [criteriaData]);

  // Get selected criteria details
  const selectedCriteriaList = useMemo(() => {
    return selectedCriteriaIds
      .map((id) => allCriteria.find((c) => c.id === id))
      .filter(Boolean) as Array<CriterionItem & { category: string; rank: string }>;
  }, [selectedCriteriaIds, allCriteria]);

  // Group selected criteria by category for display
  const groupedSelectedCriteria = useMemo(() => {
    const groups: Record<string, Array<CriterionItem & { category: string; rank: string }>> = {};
    selectedCriteriaList.forEach((criterion) => {
      if (!groups[criterion.category]) {
        groups[criterion.category] = [];
      }
      groups[criterion.category].push(criterion);
    });
    return groups;
  }, [selectedCriteriaList]);

  // Get disabled criteria IDs for each player (already achieved)
  const getDisabledCriteriaForPlayer = useCallback(
    (playerId: string): number[] => {
      return existingAchievements[Number(playerId)] || [];
    },
    [existingAchievements]
  );

  // Check if a player can be assigned to a criteria (hasn't already achieved it)
  const canAssignPlayerToCriteria = useCallback(
    (playerId: string, criteriaId: number): boolean => {
      const disabled = getDisabledCriteriaForPlayer(playerId);
      return !disabled.includes(criteriaId);
    },
    [getDisabledCriteriaForPlayer]
  );

  // Get players who have already completed the current criteria
  const alreadyCompletedPlayerIds = useMemo(() => {
    if (!selectedCriteriaId) return [];
    return attendingPlayers
      .filter((p) => !canAssignPlayerToCriteria(p.id, selectedCriteriaId))
      .map((p) => p.id);
  }, [attendingPlayers, selectedCriteriaId, canAssignPlayerToCriteria]);

  // Count of eligible players (not already completed)
  const eligiblePlayerCount = attendingPlayers.length - alreadyCompletedPlayerIds.length;

  // Step validation
  const isStep1Valid = sessionData.name.trim() !== '' && sessionData.date !== undefined;
  const isStep2Valid = attendingPlayerIds.size > 0;
  const isStep3Valid = Object.keys(assignments).some((key) => assignments[Number(key)]?.length > 0);

  // Get step status
  const getStepStatus = (step: WizardStep): AccordionCardStatus => {
    if (currentStep === step) return 'active';
    if (completedSteps.has(step)) return 'completed';
    return 'locked';
  };

  // Step navigation
  const completeStep = (step: WizardStep) => {
    setCompletedSteps((prev) => new Set([...prev, step]));
  };

  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };

  const handleStep1Continue = () => {
    if (isStep1Valid) {
      completeStep('details');
      goToStep('attendance');
    }
  };

  const handleStep2Continue = () => {
    if (isStep2Valid) {
      completeStep('attendance');
      goToStep('assessment');
    }
  };

  const handleReviewSession = () => {
    if (isStep3Valid) {
      completeStep('assessment');
      setCurrentStep('review');
    }
  };

  // Player toggle for attendance
  const toggleAttendance = (playerId: string) => {
    setAttendingPlayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
        // Also remove from assignments
        const newAssignments = { ...assignments };
        Object.keys(newAssignments).forEach((criteriaId) => {
          newAssignments[Number(criteriaId)] = newAssignments[Number(criteriaId)].filter(
            (id) => id !== playerId
          );
        });
        setAssignments(newAssignments);
      } else {
        next.add(playerId);
      }
      return next;
    });
  };

  // Player toggle for criteria assignment
  const togglePlayerAssignment = (playerId: string) => {
    if (!selectedCriteriaId) return;

    setAssignments((prev) => {
      const current = prev[selectedCriteriaId] || [];
      const updated = current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId];
      return { ...prev, [selectedCriteriaId]: updated };
    });
  };

  // Select all eligible players for current criteria (excluding already completed)
  const selectAllPlayers = () => {
    if (!selectedCriteriaId) return;
    const eligibleIds = attendingPlayers
      .filter((p) => canAssignPlayerToCriteria(p.id, selectedCriteriaId))
      .map((p) => p.id);
    setAssignments((prev) => ({ ...prev, [selectedCriteriaId]: eligibleIds }));
  };

  // Clear all players for current criteria
  const clearAllPlayers = () => {
    if (!selectedCriteriaId) return;
    setAssignments((prev) => ({ ...prev, [selectedCriteriaId]: [] }));
  };

  // Get player progress for badges
  const getPlayerProgress = useCallback(
    (playerId: string) => {
      const assignedCount = Object.values(assignments).filter((playerIds) =>
        playerIds.includes(playerId)
      ).length;
      return { current: assignedCount, total: selectedCriteriaIds.length };
    },
    [assignments, selectedCriteriaIds.length]
  );

  // Currently selected criteria details
  const currentCriteria = allCriteria.find((c) => c.id === selectedCriteriaId);
  const assignedPlayerIds = selectedCriteriaId ? assignments[selectedCriteriaId] || [] : [];

  // Count of criteria with assignments
  const assessedCriteriaCount = Object.values(assignments).filter((ids) => ids.length > 0).length;

  // Criteria modal handlers
  const openCriteriaModal = () => {
    setTempSelectedCriteria([...selectedCriteriaIds]);
    setCriteriaModalOpen(true);
  };

  const handleAddCriteria = () => {
    setSelectedCriteriaIds(tempSelectedCriteria);
    setCriteriaModalOpen(false);
    // If we added criteria, select the first one
    if (tempSelectedCriteria.length > 0 && !selectedCriteriaId) {
      setSelectedCriteriaId(tempSelectedCriteria[0]);
    }
  };

  const handleRemoveCriteria = (criteriaId: number) => {
    setSelectedCriteriaIds((prev) => prev.filter((id) => id !== criteriaId));
    // Remove assignments for this criteria
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[criteriaId];
      return next;
    });
    // If this was the selected criteria, clear selection
    if (selectedCriteriaId === criteriaId) {
      setSelectedCriteriaId(null);
    }
  };

  // Review step state and helpers
  const [isSubmitting, setIsSubmitting] = useState(false);

  const attendingPlayersList = useMemo(
    () => players
      .filter((p) => attendingPlayerIds.has(String(p.id)))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [players, attendingPlayerIds]
  );

  // Group assignments by category for review display
  const groupedAssignments = useMemo(() => {
    const groups: Record<
      string,
      Array<{
        criterion: CriterionItem & { category: string; rank: string };
        players: typeof players;
      }>
    > = {};

    Object.entries(assignments).forEach(([criteriaIdStr, playerIds]) => {
      if (playerIds.length === 0) return;

      const criteriaId = Number(criteriaIdStr);
      const criterion = allCriteria.find((c) => c.id === criteriaId);
      if (!criterion) return;

      const assignedPlayers = playerIds
        .map((pid: string) => players.find((p) => String(p.id) === pid))
        .filter(Boolean) as typeof players;

      if (!groups[criterion.category]) {
        groups[criterion.category] = [];
      }
      groups[criterion.category].push({ criterion, players: assignedPlayers });
    });

    return Object.entries(groups).map(([category, items]) => ({
      category,
      items: items.sort((a, b) => a.criterion.rank.localeCompare(b.criterion.rank)),
    }));
  }, [assignments, allCriteria, players]);

  // Review stats
  const reviewStats = useMemo(() => {
    const criteriaWithAssignments = Object.values(assignments).filter((ids) => ids.length > 0).length;
    const totalAssignments = Object.values(assignments).reduce((sum, ids) => sum + ids.length, 0);

    return {
      players: attendingPlayerIds.size,
      criteria: criteriaWithAssignments,
      totalAssignments,
    };
  }, [assignments, attendingPlayerIds.size]);

  const handleBackToEdit = () => {
    setCurrentStep('assessment');
  };

  const handleSubmit = () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    // Convert assignments to the format expected by the backend
    const formattedAssignments: Record<number, number[]> = {};
    Object.entries(assignments).forEach(([criteriaId, playerIds]) => {
      if (playerIds.length > 0) {
        formattedAssignments[Number(criteriaId)] = playerIds.map(Number);
      }
    });

    router.post(
      '/sessions',
      {
        name: sessionData.name,
        date: sessionData.date?.toISOString().split('T')[0],
        focus_areas: sessionData.focus_areas,
        attendingPlayers: Array.from(attendingPlayerIds).map(Number),
        assignments: formattedAssignments,
      },
      {
        onError: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  // Show review step
  if (currentStep === 'review') {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Review Session" />

        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8">
            <Heading title="Review Session" />
            <p className="mt-2 text-muted-foreground">
              Review your session details before submitting
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reviewStats.players}</p>
                  <p className="text-sm text-muted-foreground">Players Attending</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <ClipboardList className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reviewStats.criteria}</p>
                  <p className="text-sm text-muted-foreground">Criteria Assessed</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <CheckCircle2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reviewStats.totalAssignments}</p>
                  <p className="text-sm text-muted-foreground">Total Achievements</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon className="h-5 w-5" />
                Session Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Session Name</p>
                  <p className="text-lg">{sessionData.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="text-lg">
                    {sessionData.date?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              {sessionData.focus_areas && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Focus Areas</p>
                  <p className="text-base">{sessionData.focus_areas}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance */}
          <Collapsible>
            <Card className="mb-6">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    Attendance ({attendingPlayersList.length} players)
                  </CardTitle>
                  <ChevronDownIcon className="h-5 w-5 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3 md:grid-cols-4">
                    {attendingPlayersList.map((player) => (
                      <div key={player.id} className="rounded-md px-3 py-2 text-sm">
                        {player.name}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Criteria Achievements */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5" />
                Criteria Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {groupedAssignments.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">No criteria achievements recorded</p>
              ) : (
                groupedAssignments.map(({ category, items }) => (
                  <div key={category}>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                      {category}
                    </h3>
                    <div className="space-y-3">
                      {items.map(({ criterion, players: assignedPlayers }) => (
                        <div key={criterion.id} className="rounded-lg border bg-card p-4">
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div>
                              <Badge variant="outline" className="mb-1 text-xs capitalize">
                                {criterion.rank}
                              </Badge>
                              <p className="font-medium">{criterion.name}</p>
                            </div>
                            <Badge variant="secondary">
                              {assignedPlayers.length} player{assignedPlayers.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {assignedPlayers.map((player) => (
                              <span
                                key={player.id}
                                className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
                              >
                                {player.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBackToEdit} disabled={isSubmitting}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Edit
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Session'
              )}
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Session" />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <Heading title="Create a Session" />
          <p className="mt-2 text-muted-foreground">
            Complete each section to create and assess a training session
          </p>
        </div>

        <div className="space-y-4">
          {/* Step 1: Session Details */}
          <AccordionCard
            title="Session Details"
            stepNumber={1}
            status={getStepStatus('details')}
            onEdit={() => goToStep('details')}
            onContinue={handleStep1Continue}
            canContinue={isStep1Valid}
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Session Name<span className="ml-1 text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Bronze Skills Training"
                  value={sessionData.name}
                  onChange={(e) => setSessionData((prev) => ({ ...prev, name: e.target.value }))}
                />
                <InputError message={errors.name} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">
                  Date<span className="ml-1 text-destructive">*</span>
                </Label>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between text-left font-normal">
                      {sessionData.date
                        ? sessionData.date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Select a date'}
                      <ChevronDownIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={sessionData.date}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setSessionData((prev) => ({ ...prev, date }));
                        setDateOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="focus_areas">
                  Focus Areas <span className="text-xs text-muted-foreground">(Optional)</span>
                </Label>
                <Textarea
                  id="focus_areas"
                  placeholder="Describe the key focus areas for this session..."
                  rows={3}
                  value={sessionData.focus_areas}
                  onChange={(e) => setSessionData((prev) => ({ ...prev, focus_areas: e.target.value }))}
                />
              </div>
            </div>
          </AccordionCard>

          {/* Step 2: Attendance */}
          <AccordionCard
            title="Attendance"
            stepNumber={2}
            status={getStepStatus('attendance')}
            onEdit={() => goToStep('attendance')}
            onContinue={handleStep2Continue}
            canContinue={isStep2Valid}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Select the players who attended this session
                </p>
                <Badge variant="secondary">
                  <Users className="mr-1 h-3 w-3" />
                  {attendingPlayerIds.size} selected
                </Badge>
              </div>
              <PlayerSelectionList
                players={formattedPlayers}
                selectedPlayerIds={Array.from(attendingPlayerIds)}
                onTogglePlayer={toggleAttendance}
                variant="attendance"
              />
            </div>
          </AccordionCard>

          {/* Step 3: Criteria Assessment */}
          <AccordionCard
            title="Criteria Assessment"
            stepNumber={3}
            status={getStepStatus('assessment')}
            onEdit={() => goToStep('assessment')}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Add criteria and assign players who achieved them
                </p>
                <Badge variant="secondary">
                  {assessedCriteriaCount} criteria assessed
                </Badge>
              </div>

              {/* Two Column Layout */}
              <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
                {/* Left Panel: Selected Criteria List */}
                <Card className="flex h-[600px] flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Target className="h-4 w-4" />
                      Criteria ({selectedCriteriaIds.length})
                    </CardTitle>
                    <CardDescription>Click a criteria to assign players</CardDescription>
                    <div className="mt-3">
                      <Button onClick={openCriteriaModal} variant="outline" className="w-full" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Criteria
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full px-6">
                      {selectedCriteriaIds.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Target className="h-10 w-10 text-muted-foreground/50" />
                          <p className="mt-3 text-sm font-medium text-muted-foreground">
                            No criteria added yet
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Click the button above to add criteria
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 pb-4">
                          {Object.entries(groupedSelectedCriteria).map(([category, criteria]) => (
                            <div key={category}>
                              <div className="mb-2">
                                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                  {category}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {criteria.map((criterion) => {
                                  const isSelected = selectedCriteriaId === criterion.id;
                                  const assignedCount = assignments[criterion.id]?.length || 0;
                                  const hasAssignments = assignedCount > 0;

                                  return (
                                    <div key={criterion.id} className="relative">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedCriteriaId(criterion.id)}
                                        className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                                          isSelected
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                                            : 'border-border bg-card hover:border-blue-300 hover:bg-muted/50'
                                        }`}
                                      >
                                        <div className="flex items-start justify-between gap-2 pr-6">
                                          <div className="flex-1 space-y-1">
                                            <Badge variant="outline" className="text-xs capitalize">
                                              {criterion.rank}
                                            </Badge>
                                            <p className={`text-sm font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                                              {criterion.name}
                                            </p>
                                            {hasAssignments && (
                                              <Badge variant="secondary" className="text-xs">
                                                {assignedCount} player{assignedCount !== 1 ? 's' : ''}
                                              </Badge>
                                            )}
                                          </div>
                                          {hasAssignments && (
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500">
                                              <Check className="h-3 w-3 text-white" />
                                            </div>
                                          )}
                                        </div>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveCriteria(criterion.id);
                                        }}
                                        className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white transition-opacity hover:bg-red-600"
                                        title="Remove criteria"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Right Panel: Player Selection */}
                <Card className="flex h-[600px] flex-col">
                  {currentCriteria ? (
                    <>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Assign Players</CardTitle>
                        <CardDescription className="mt-1">
                          <span className="font-medium text-foreground">{currentCriteria.name}</span>
                        </CardDescription>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                            <span className="text-sm text-muted-foreground">Selected</span>
                            <div className="flex items-center gap-1">
                              <span className="text-lg font-bold text-blue-600">{assignedPlayerIds.length}</span>
                              <span className="text-muted-foreground">/ {eligiblePlayerCount}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={selectAllPlayers}>
                              Select All
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1" onClick={clearAllPlayers}>
                              Clear
                            </Button>
                          </div>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Search players..."
                              value={playerSearchQuery}
                              onChange={(e) => setPlayerSearchQuery(e.target.value)}
                              className="pl-9"
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-hidden p-0 px-6 pb-6">
                        <PlayerSelectionList
                          players={attendingPlayers}
                          selectedPlayerIds={assignedPlayerIds}
                          onTogglePlayer={togglePlayerAssignment}
                          variant="achievement"
                          showProgressBadges
                          getPlayerProgress={getPlayerProgress}
                          alreadyCompletedIds={alreadyCompletedPlayerIds}
                          hideSearch={true}
                          externalSearchQuery={playerSearchQuery}
                        />
                      </CardContent>
                    </>
                  ) : (
                    <CardContent className="flex flex-1 items-center justify-center py-12">
                      <div className="text-center">
                        <Target className="mx-auto h-10 w-10 text-muted-foreground/50" />
                        <p className="mt-3 text-sm font-medium text-muted-foreground">
                          {selectedCriteriaIds.length === 0
                            ? 'Add criteria to get started'
                            : 'Select a criteria from the list'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {selectedCriteriaIds.length === 0
                            ? 'Use the "Add Criteria" button to begin'
                            : 'Click on any criteria to start assigning players'}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>
          </AccordionCard>

          {/* Review Session Button */}
          {currentStep === 'assessment' && (
            <div className="flex justify-end">
              <Button
                onClick={handleReviewSession}
                disabled={!isStep3Valid}
                size="lg"
                className="min-w-[200px]"
              >
                Review Session
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Criteria Selection Modal */}
      <Dialog open={criteriaModalOpen} onOpenChange={setCriteriaModalOpen}>
        <DialogContent className="flex max-h-[85vh] w-full flex-col overflow-hidden sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Select Criteria</DialogTitle>
            <DialogDescription>
              Choose the criteria that players achieved during this session.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            <CriteriaSelector
              criteriaData={criteriaData}
              selectedIds={tempSelectedCriteria}
              onSelectionChange={setTempSelectedCriteria}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCriteriaModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddCriteria}>
              Confirm Selection ({tempSelectedCriteria.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
