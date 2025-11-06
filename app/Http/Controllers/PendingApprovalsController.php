<?php

namespace App\Http\Controllers;

use App\Models\PlayerProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PendingApprovalsController extends Controller
{
    /**
     * Display a listing of pending player progress records that need admin approval.
     *
     * This method:
     * 1. Fetches all PlayerProgress records with status = 'PENDING'
     * 2. Loads related data (player, criteria, session, coach who assessed)
     * 3. Groups the results by session for better UX
     * 4. Returns data to the Inertia view
     */
    public function index()
    {
        // Step 1: Query all pending player progress records
        // We need to eager load relationships to avoid N+1 queries
        $pendingApprovals = PlayerProgress::where('status', 'PENDING')
            ->with([
                'user',              // The player being assessed
                'criteria.rank',     // The criteria with its rank
                'criteria.category', // The criteria with its category
                'session',           // The session where assessment occurred
                'assessedby',        // The coach who assessed
            ])
            ->orderBy('assessed_at', 'desc') // Most recent first
            ->get();

        // Step 2: Group by session, then by criteria for better display
        // This creates a structure like:
        // [
        //   session_id => [
        //     'session' => Session object,
        //     'criteriaGroups' => [
        //       criteria_id => [
        //         'criteria' => Criteria object,
        //         'approvals' => [PlayerProgress objects for this criteria],
        //         'count' => number of pending items for this criteria
        //       ]
        //     ],
        //     'count' => total number of pending items in session
        //   ]
        // ]
        $groupedBySession = $pendingApprovals->groupBy('session_id')->map(function ($approvals, $sessionId) {
            // Group approvals within this session by criteria
            $criteriaGroups = $approvals->groupBy('criteria_id')->map(function ($criteriaApprovals, $criteriaId) {
                return [
                    'criteria' => $criteriaApprovals->first()->criteria,
                    'approvals' => $criteriaApprovals,
                    'count' => $criteriaApprovals->count(),
                ];
            })->values();

            return [
                'session' => $approvals->first()->session,
                'criteriaGroups' => $criteriaGroups,
                'count' => $approvals->count(),
            ];
        })->values(); // Reset keys to 0, 1, 2... instead of session IDs

        // Step 3: Get total count for display
        $totalPending = $pendingApprovals->count();

        // Step 4: Return to Inertia view with data
        return Inertia::render('admin/pending-approvals/index', [
            'groupedApprovals' => $groupedBySession,
            'totalPending' => $totalPending,
        ]);
    }

    /**
     * Approve one or multiple player progress records.
     *
     * This method:
     * 1. Accepts an array of PlayerProgress IDs
     * 2. Updates them to status = 'COMPLETED'
     * 3. Sets approved_by and approved_at
     * 4. Returns success message
     *
     * Expected request format:
     * {
     *   "ids": [1, 2, 3, 4, 5]
     * }
     */
    public function store(Request $request)
    {
        // Step 1: Validate the incoming request
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|integer|exists:player_progress,id',
        ]);

        // Step 2: Update all PlayerProgress records with these IDs
        $updated = PlayerProgress::whereIn('id', $validated['ids'])
            ->where('status', 'PENDING') // Only update if still pending
            ->update([
                'status' => 'COMPLETED',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

        // Step 3: Return response with success message
        return redirect()
            ->route('pending-approvals.index')
            ->with('success', "Successfully approved {$updated} assessment(s)");
    }

    /**
     * Reject (delete) one or multiple player progress records.
     *
     * This method:
     * 1. Accepts an array of PlayerProgress IDs
     * 2. Deletes them from the database
     * 3. Returns success message
     *
     * Expected request format:
     * {
     *   "ids": [1, 2, 3, 4, 5]
     * }
     */
    public function destroy(Request $request)
    {
        // Step 1: Validate the incoming request
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|integer|exists:player_progress,id',
        ]);

        // Step 2: Delete all PlayerProgress records with these IDs
        $deleted = PlayerProgress::whereIn('id', $validated['ids'])
            ->where('status', 'PENDING') // Only delete if still pending
            ->delete();

        // Step 3: Return response with success message
        return redirect()
            ->route('pending-approvals.index')
            ->with('success', "Successfully rejected {$deleted} assessment(s)");
    }
}

/**
 * IMPLEMENTATION GUIDE
 * ====================
 *
 * FRONTEND (resources/js/pages/admin/pending-approvals/index.tsx):
 *
 * 1. Receive props: { groupedApprovals, totalPending }
 *
 * 2. Display structure:
 *    - Header with total count
 *    - Loop through groupedApprovals
 *    - For each group:
 *      - Show session name & date
 *      - Show list of pending assessments
 *      - Add "Approve All" button for the session
 *      - Add individual approve buttons per assessment
 *
 * 3. Approve function:
 *    const handleApprove = (ids: number[]) => {
 *      router.post('/admin/pending-approvals', { ids });
 *    };
 *
 * 4. Data structure you'll receive:
 *    groupedApprovals = [
 *      {
 *        session: { id, name, date, ... },
 *        approvals: [
 *          {
 *            id: 1,
 *            user: { id, name, ... },
 *            criteria: { id, name, rank: {...}, category: {...} },
 *            assessedby: { id, name, ... },
 *            assessed_at: "2024-11-01",
 *            ...
 *          }
 *        ],
 *        count: 5
 *      }
 *    ]
 *
 * NAVIGATION (Add to your layout component):
 *
 * 1. Add bell icon with count in your navigation:
 *    - Query: PlayerProgress::where('status', 'PENDING')->count()
 *    - Share globally via Inertia middleware or include in each request
 *
 * 2. Add this to app/Http/Middleware/HandleInertiaRequests.php:
 *    public function share(Request $request): array
 *    {
 *        return [
 *            ...parent::share($request),
 *            'pendingApprovalsCount' => PlayerProgress::where('status', 'PENDING')->count(),
 *        ];
 *    }
 *
 * 3. Then in your nav component:
 *    const { pendingApprovalsCount } = usePage().props;
 *    // Show bell icon with badge showing the count
 */
