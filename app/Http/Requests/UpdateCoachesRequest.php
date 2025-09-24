<?php

namespace App\Http\Requests;

use App\Enums\Role;
use App\Enums\Status;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateCoachesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()->role === Role::ADMIN;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $coach = $this->route('coach');

        $rules = [
            'name' => 'required|string|min:2|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($coach)],
            'role' => ['required', Rule::enum(Role::class)],
        ];

        // Only require status for non-pending users
        if ($coach && $coach->status !== 'pending') {
            $rules['status'] = ['required', Rule::enum(Status::class)];
        }

        return $rules;
    }
}
