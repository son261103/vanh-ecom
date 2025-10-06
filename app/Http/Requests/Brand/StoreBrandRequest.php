<?php

namespace App\Http\Requests\Brand;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

/**
 * @method \App\Models\User|null user(string $guard = null)
 */
class StoreBrandRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()?->isAdmin() ?? false;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $data = [];
        
        if ($this->has('name') && !$this->has('slug')) {
            $data['slug'] = Str::slug($this->name);
        }
        
        // Set default is_active to true if not provided
        if (!$this->has('is_active')) {
            $data['is_active'] = true;
        }
        
        if (!empty($data)) {
            $this->merge($data);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:150',
                'unique:brands,name',
            ],
            'slug' => [
                'sometimes',
                'string',
                'max:180',
                'unique:brands,slug',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', // Only lowercase letters, numbers, and hyphens
            ],
            'category_id' => [
                'nullable',
                'string',
                'exists:categories,id',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'logo_url' => [
                'nullable',
                'string',
                'url',
                'max:500',
            ],
            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Brand name is required.',
            'name.unique' => 'A brand with this name already exists.',
            'slug.unique' => 'A brand with this slug already exists.',
            'slug.regex' => 'Slug must contain only lowercase letters, numbers, and hyphens.',
            'logo_url.url' => 'Logo URL must be a valid URL.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'brand name',
            'slug' => 'brand slug',
            'category_id' => 'category',
            'description' => 'brand description',
            'logo_url' => 'logo URL',
            'is_active' => 'active status',
        ];
    }
}
