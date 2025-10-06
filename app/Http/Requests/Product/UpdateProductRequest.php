<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * @method \App\Models\User|null user(string $guard = null)
 */
class UpdateProductRequest extends FormRequest
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
        $productId = $this->route('product')?->id ?? $this->route('product');

        return [
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('products', 'name')->ignore($productId),
            ],
            'slug' => [
                'sometimes',
                'string',
                'max:280',
                Rule::unique('products', 'slug')->ignore($productId),
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            ],
            'description' => [
                'nullable',
                'string',
                'max:5000',
            ],
            'short_description' => [
                'nullable',
                'string',
                'max:500',
            ],
            'sku' => [
                'sometimes',
                'string',
                'max:100',
                Rule::unique('products', 'sku')->ignore($productId),
            ],
            'price' => [
                'sometimes',
                'numeric',
                'min:0',
                'max:999999999.99',
            ],
            'sale_price' => [
                'nullable',
                'numeric',
                'min:0',
                'max:999999999.99',
                'lt:price',
            ],
            'stock_quantity' => [
                'sometimes',
                'integer',
                'min:0',
            ],
            'weight' => [
                'nullable',
                'numeric',
                'min:0',
            ],
            'dimensions' => [
                'nullable',
                'string',
                'max:100',
            ],
            'brand_id' => [
                'sometimes',
                'string',
                'exists:brands,id',
            ],
            'category_id' => [
                'sometimes',
                'string',
                'exists:categories,id',
            ],
            'is_active' => [
                'sometimes',
                'boolean',
            ],
            'is_featured' => [
                'sometimes',
                'boolean',
            ],
            'meta_title' => [
                'nullable',
                'string',
                'max:255',
            ],
            'meta_description' => [
                'nullable',
                'string',
                'max:500',
            ],
            'images' => [
                'sometimes',
                'array',
            ],
            'images.*' => [
                'sometimes',
                'image',
                'mimes:jpeg,jpg,png,gif,webp',
                'max:2048',
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
            'name.unique' => 'A product with this name already exists.',
            'sku.unique' => 'A product with this SKU already exists.',
            'sale_price.lt' => 'Sale price must be less than regular price.',
            'brand_id.exists' => 'Selected brand does not exist.',
            'category_id.exists' => 'Selected category does not exist.',
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
            'name' => 'product name',
            'sku' => 'SKU',
            'price' => 'price',
            'sale_price' => 'sale price',
            'stock_quantity' => 'stock quantity',
            'brand_id' => 'brand',
            'category_id' => 'category',
        ];
    }
}
