<?php

namespace App\Http\Requests\Brand;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * @method \App\Models\User|null user(string $guard = null)
 */
class UpdateBrandRequest extends FormRequest
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
        if ($this->has('name') && !$this->has('slug')) {
            $this->merge([
                'slug' => Str::slug($this->name),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $brandId = $this->route('brand'); // Assuming route parameter is 'brand'

        return [
            'name' => [
                'sometimes',
                'string',
                'max:150',
                Rule::unique('brands', 'name')->ignore($brandId),
            ],
            'slug' => [
                'sometimes',
                'string',
                'max:180',
                Rule::unique('brands', 'slug')->ignore($brandId),
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
