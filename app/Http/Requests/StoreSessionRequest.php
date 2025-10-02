<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreSessionRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'date' => 'required|date',
            'focus_areas' => 'nullable|string|max:1000',
            'criteria' => 'required|array|min:1', // Must be array with at least 1
            'criteria.*' => 'exists:criteria,id', // Each ID must exist in criteria table
        ];
    }
}
