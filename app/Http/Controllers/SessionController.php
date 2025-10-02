<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Criteria;
use App\Models\Rank;
use App\Models\Session;
use Illuminate\Http\Request;
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

        $categories = Category::with(['criteria' => function ($query) {
            $query->with('rank')->orderBy('rank_id');
        }])->get();

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
    public function store(Request $request)
    {
        dd($request->all());
    }

    /**
     * Display the specified resource.
     */
    public function show(Session $session)
    {
        //
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
