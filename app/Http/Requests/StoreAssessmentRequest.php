<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreAssessmentRequest extends FormRequest
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
            'sessionId' => 'required|integer|exists:training_sessions,id',
            'attendingPlayers' => 'required|array',
            'attendingPlayers.*' => 'integer|exists:users,id',
            'assignments' => 'required|array',
            'assignments.*' => 'array',
            'assignments.*.*' => 'integer|exists:users,id',
        ];
    }
}
