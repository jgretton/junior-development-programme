<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSessionRequest;
use App\Models\Category;
use App\Models\Criteria;
use App\Models\Rank;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session as FacadesSession;
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

            return redirect()->route('sessions.index')->with('success', 'Session created successfully!');
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
}
