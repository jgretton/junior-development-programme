<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Enums\Status;
use App\Http\Requests\StoreSessionWithAssessmentRequest;
use App\Models\Category;
use App\Models\Criteria;
use App\Models\PlayerProgress;
use App\Models\Session;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use Inertia\Inertia;

class SessionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Get session IDs that have pending player progress (awaiting admin approval)
        $pendingSessionIds = PlayerProgress::where('status', 'PENDING')
            ->distinct()
            ->pluck('session_id');

        // Pending approval sessions (have PENDING player progress)
        $pendingSessions = Session::whereIn('id', $pendingSessionIds)
            ->withCount('attendees')
            ->orderBy('date', 'DESC')
            ->get()
            ->map(fn($session) => [
                'id' => $session->id,
                'name' => $session->name,
                'date' => $session->date,
                'focus_areas' => $session->focus_areas,
                'attendees_count' => $session->attendees_count,
                'status' => 'pending',
            ]);

        // Completed sessions (no PENDING player progress, all approved)
        $completedSessions = Session::whereNotIn('id', $pendingSessionIds)
            ->whereHas('attendees') // Only sessions that have been assessed
            ->withCount('attendees')
            ->orderBy('date', 'DESC')
            ->paginate(15)
            ->through(fn($session) => [
                'id' => $session->id,
                'name' => $session->name,
                'date' => $session->date,
                'focus_areas' => $session->focus_areas,
                'attendees_count' => $session->attendees_count,
                'status' => 'completed',
            ]);

        // Counts for summary
        $counts = [
            'pending' => $pendingSessions->count(),
            'completed' => Session::whereNotIn('id', $pendingSessionIds)->whereHas('attendees')->count(),
        ];

        return Inertia::render('sessions/index', [
            'pendingSessions' => $pendingSessions,
            'completedSessions' => Inertia::scroll($completedSessions),
            'counts' => $counts,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get all active players for attendance selection
        $players = User::where('role', Role::PLAYER)
            ->where('status', Status::ACTIVE)
            ->select(['id', 'name'])
            ->get();

        // Get criteria organized by category and rank
        $criteriaData = [];
        $categories = Category::with([
            'criteria' => function ($query) {
                $query->with('rank')->orderBy('rank_id');
            },
        ])->get();

        foreach ($categories as $category) {
            $categoryKey = strtolower($category->name);
            $criteriaData[$categoryKey] = [];

            foreach ($category->criteria as $criterion) {
                $rankKey = strtolower($criterion->rank->name);
                if (!isset($criteriaData[$categoryKey][$rankKey])) {
                    $criteriaData[$categoryKey][$rankKey] = [];
                }
                $criteriaData[$categoryKey][$rankKey][] = [
                    'id' => $criterion->id,
                    'name' => $criterion->name,
                ];
            }
        }

        // Get existing player achievements to disable already-completed criteria
        $existingAchievements = PlayerProgress::where('status', 'COMPLETED')
            ->select(['user_id', 'criteria_id'])
            ->get()
            ->groupBy('user_id')
            ->map(fn($records) => $records->pluck('criteria_id')->toArray())
            ->toArray();

        return Inertia::render('sessions/create', [
            'players' => $players,
            'criteriaData' => $criteriaData,
            'existingAchievements' => $existingAchievements,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * Handles session creation, attendance, and assessments in one transaction.
     */
    public function store(StoreSessionWithAssessmentRequest $request)
    {
        DB::beginTransaction();

        try {
            // Create the session
            $session = Session::create([
                'name' => $request->validated()['name'],
                'date' => $request->validated()['date'],
                'created_by' => auth()->id(),
                'focus_areas' => $request->validated()['focus_areas'] ?? null,
            ]);

            // Insert attendance records
            $attendance = [];
            foreach ($request->validated()['attendingPlayers'] as $playerId) {
                $attendance[] = [
                    'session_id' => $session->id,
                    'player_id' => $playerId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            DB::table('session_attendance')->insertOrIgnore($attendance);

            // Insert player progress records
            $isAdmin = Auth::user()->role === Role::ADMIN;
            $progress = [];

            foreach ($request->validated()['assignments'] as $criteriaId => $playerIds) {
                foreach ($playerIds as $playerId) {
                    $progress[] = [
                        'user_id' => $playerId,
                        'criteria_id' => $criteriaId,
                        'status' => $isAdmin ? 'COMPLETED' : 'PENDING',
                        'session_id' => $session->id,
                        'assessed_by' => Auth::id(),
                        'approved_by' => $isAdmin ? Auth::id() : null,
                        'assessed_at' => now(),
                        'approved_at' => $isAdmin ? now() : null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            PlayerProgress::insertOrIgnore($progress);

            DB::commit();

            return redirect()->route('sessions.show', $session)->with('success', 'Session created successfully!');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('SessionController@store failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->validated(),
            ]);

            return redirect()
                ->back()
                ->withErrors(['general' => 'Failed to create session. Please try again.'])
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Session $training_session)
    {
        // Render a single session.
        $session = Session::with(['attendees:id,name'])->findOrFail($training_session->id);

        // Find player progress from session with relationships
        $progress = PlayerProgress::with(['criteria.category', 'criteria.rank', 'user'])
            ->where('session_id', $training_session->id)
            ->get();

        // Get attending players
        $attendance = $session->attendees;
        $attendeeCount = $attendance->count();

        // Group progress by category, then by rank, then by criteria
        $categoryProgress = $progress->groupBy('criteria.category.name')->map(function ($categoryRecords, $categoryName) {
            $category = $categoryRecords->first()->criteria->category;
            $uniquePlayerIds = $categoryRecords->pluck('user_id')->unique();

            // Group by rank within this category
            $rankGroups = $categoryRecords->groupBy('criteria.rank.name')->map(function ($rankRecords, $rankName) {
                $rank = $rankRecords->first()->criteria->rank;

                // Group by criteria within this rank
                $criteriaList = $rankRecords->groupBy('criteria_id')->map(function ($criteriaRecords) {
                    $criteria = $criteriaRecords->first()->criteria;
                    $achievedPlayers = $criteriaRecords->map(fn($record) => [
                        'id' => $record->user->id,
                        'name' => $record->user->name,
                    ])->values();

                    return [
                        'id' => $criteria->id,
                        'name' => $criteria->name,
                        'achievedPlayers' => $achievedPlayers,
                        'achievedCount' => $achievedPlayers->count(),
                    ];
                })->values();

                return [
                    'rank' => $rank->name,
                    'rankLevel' => $rank->level,
                    'criteria' => $criteriaList,
                ];
            })->sortBy('rankLevel')->values();

            return [
                'categoryId' => $category->id,
                'categoryName' => $categoryName,
                'playerCount' => $uniquePlayerIds->count(),
                'ranks' => $rankGroups,
            ];
        })->values();

        // Calculate rank progression statistics
        $rankProgression = $progress->groupBy('criteria.rank.name')->map(function ($rankRecords, $rankName) {
            $rank = $rankRecords->first()->criteria->rank;
            $uniquePlayerIds = $rankRecords->pluck('user_id')->unique();

            return [
                'rank' => $rankName,
                'rankLevel' => $rank->level,
                'criteriaCount' => $rankRecords->groupBy('criteria_id')->count(),
                'playerCount' => $uniquePlayerIds->count(),
            ];
        })->sortBy('rankLevel')->values();

        // Calculate club-wide completion statistics for assessed criteria
        $assessedCriteriaIds = $progress->pluck('criteria_id')->unique();
        $totalClubMembers = \App\Models\User::where('role', 'player')->count();

        $clubWideCompletion = PlayerProgress::whereIn('criteria_id', $assessedCriteriaIds)
            ->select('criteria_id', \DB::raw('COUNT(DISTINCT user_id) as completion_count'))
            ->groupBy('criteria_id')
            ->get()
            ->keyBy('criteria_id')
            ->map(fn($item) => [
                'completionCount' => $item->completion_count,
                'totalMembers' => $totalClubMembers,
                'percentage' => $totalClubMembers > 0 ? round(($item->completion_count / $totalClubMembers) * 100) : 0,
            ]);

        // Get previous achievers (players who completed criteria in other sessions)
        $currentSessionPlayerIds = $progress->pluck('user_id')->unique();

        $previousAchievers = PlayerProgress::whereIn('criteria_id', $assessedCriteriaIds)
            ->where('session_id', '!=', $training_session->id)
            ->whereNotIn('user_id', $currentSessionPlayerIds)
            ->with(['user:id,name'])
            ->orderBy('assessed_at', 'desc')
            ->get()
            ->groupBy('criteria_id')
            ->map(fn($records) => $records->map(fn($record) => [
                'id' => $record->user->id,
                'name' => $record->user->name,
                'assessedAt' => $record->assessed_at,
            ])->values());

        // Calculate summary statistics
        $totalProgressions = $progress->count();
        $totalCriteriaAssessed = $progress->pluck('criteria_id')->unique()->count();

        // Find most improved category
        $mostImprovedCategory = $categoryProgress->sortByDesc('playerCount')->first();

        $summaryStats = [
            'totalAttendance' => $attendeeCount,
            'totalProgressions' => $totalProgressions,
            'totalCriteriaAssessed' => $totalCriteriaAssessed,
            'mostImprovedCategory' => $mostImprovedCategory ? [
                'name' => $mostImprovedCategory['categoryName'],
                'playerCount' => $mostImprovedCategory['playerCount'],
            ] : null,
        ];

        return Inertia::render('sessions/[id]/index', [
            'session' => $session,
            'attendance' => $attendance,
            'categoryProgress' => $categoryProgress,
            'rankProgression' => $rankProgression,
            'summaryStats' => $summaryStats,
            'clubWideCompletion' => $clubWideCompletion,
            'previousAchievers' => $previousAchievers,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Session $session)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Session $session)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Session $session)
    {
        //
    }
}
