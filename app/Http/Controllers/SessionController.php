<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Enums\Status;
use App\Http\Requests\StoreAssessmentRequest;
use App\Http\Requests\StoreSessionRequest;
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
        //
        $sessions = Session::with('criteria')->orderBy('date', 'DESC')->get();

        return Inertia::render('sessions/index', [
            'sessions' => $sessions,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
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

        return Inertia::render('sessions/create', [
            'criteria' => $criteriaData,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSessionRequest $request)
    {
        try {
            $session = Session::create([
                'name' => $request->validated()['name'],
                'date' => $request->validated()['date'],
                'created_by' => auth()->id(),
                'focus_areas' => $request->validated()['focus_areas'] ?? null,
            ]);

            $session->criteria()->attach($request->validated()['criteria']);

            return redirect()->route('sessions.show', $session)->with('success', 'Session created successfully!');
        } catch (\Exception $e) {
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
        // Re.nder a single session.
        $session = Session::with('criteria')->findOrFail($training_session->id);

        return Inertia::render('sessions/[id]/index', [
            'session' => $session,
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

    public function assessment(Session $training_session)
    {
        // Route model binding automatically returns 404 if session doesn't exist
        // No need for manual checks

        $players = User::where('role', Role::PLAYER)
            ->where('status', Status::ACTIVE)
            ->select(['id', 'name'])
            ->get();

        $session = Session::with(['criteria:id,name'])->findOrFail($training_session->id);

        // Return new session screen with session criteria and players
        return Inertia::render('sessions/[id]/assessment/index', [
            'players' => $players,
            'session' => $session,
        ]);
    }

    public function storeAssessment(StoreAssessmentRequest $request, Session $training_session)
    {
        DB::beginTransaction();

        try {
            // Insert attendance records
            $attendance = [];
            foreach ($request->attendingPlayers as $playerId) {
                $attendance[] = [
                    'session_id' => $training_session->id,
                    'player_id' => $playerId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            DB::table('session_attendance')->insertOrIgnore($attendance);

            // TODO: Insert player progress records
            // Loop through $request->assignments
            // Handle duplicates with try/catch
            // Set status based on Auth::user()->role
            /* 
            {
    "sessionId": 40,
    "attendingPlayers": [
                13,
                12,
                4,
                5
            ],
            "assignments": {
                "35": [
                    5,
                    4
                ],
                "65": [
                    13,
                    12
                ],
                "102": [
                    4,
                    5,
                    12,
                    13
                ]
            }
        }

       
        progress = player_progress
        map over assignments with criteriaID
        map over criteria ids as user_ids

            */
            $isAdmin = Auth::user()->role === Role::ADMIN;
            $progress = [];
            foreach ($request->assignments as $criteriaId => $playersId) {
                foreach ($playersId as $playerId) {
                    $progress[] = [
                        'user_id' => $playerId,
                        'criteria_id' => $criteriaId,
                        'status' => $isAdmin ? 'COMPLETED' : 'PENDING',
                        'session_id' => $training_session->id,
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

            return redirect()->route('sessions.show', $training_session)->with('success', 'Assessment submitted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Assessment submission failed', [
                'error' => $e->getMessage(),
                'session_id' => $training_session->id,
                'user_id' => Auth::id(),
            ]);

            return redirect()->back()->with('error', 'Failed to submit assessment. Please try again.');
        }
    }
}
