<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreSessionWithAssessmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()->role === Role::ADMIN || Auth::user()->role === Role::JUNIOR_DEVELOPMENT_COACH;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Session details
            'name' => 'required|string|max:255',
            'date' => 'required|date',
            'focus_areas' => 'nullable|string|max:1000',

            // Attendance
            'attendingPlayers' => 'required|array|min:1',
            'attendingPlayers.*' => 'integer|exists:users,id',

            // Criteria assignments (criteriaId => playerIds[])
            'assignments' => 'required|array',
            'assignments.*' => 'array',
            'assignments.*.*' => 'integer|exists:users,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'attendingPlayers.required' => 'At least one player must be marked as attending.',
            'attendingPlayers.min' => 'At least one player must be marked as attending.',
            'assignments.required' => 'At least one criteria assignment is required.',
        ];
    }
}
