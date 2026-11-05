<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email:rfc', 'max:255', Rule::unique('users', 'email')],
            'phone' => ['nullable', 'string', 'max:32'],
            'password' => ['required', 'string', 'min:12', 'confirmed'],
            'role' => ['required', Rule::in(['customer', 'stylist', 'salon'])],
            'business_name' => ['required_if:role,stylist,salon', 'nullable', 'string', 'max:160'],
            'location' => ['required_if:role,stylist,salon', 'nullable', 'string', 'max:160'],
            'bio' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'password.min' => 'Use a password with at least 12 characters.',
            'business_name.required_if' => 'A business or professional name is required for this account type.',
            'location.required_if' => 'A service location is required for this account type.',
        ];
    }
}
