<?php

namespace App\Http\Requests\Image;

use Illuminate\Foundation\Http\FormRequest;

/**
 * @method \App\Models\User|null user(string $guard = null)
 */
class UploadMultipleImagesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'images' => [
                'required',
                'array',
                'min:1',
                'max:10', // Maximum 10 images at once
            ],
            'images.*' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,png,jpg,gif,webp',
                'max:5120', // 5MB per image
            ],
            'folder' => [
                'sometimes',
                'string',
                'max:100',
                'regex:/^[a-zA-Z0-9_\-\/]+$/', // Only alphanumeric, underscore, hyphen, and slash
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
            'images.required' => 'At least one image file is required.',
            'images.array' => 'Images must be provided as an array.',
            'images.min' => 'At least one image is required.',
            'images.max' => 'You can upload a maximum of 10 images at once.',
            'images.*.required' => 'Each image file is required.',
            'images.*.file' => 'Each uploaded file must be a valid file.',
            'images.*.image' => 'Each uploaded file must be an image.',
            'images.*.mimes' => 'Each image must be a file of type: jpeg, png, jpg, gif, webp.',
            'images.*.max' => 'Each image size must not exceed 5MB.',
            'folder.string' => 'The folder name must be a string.',
            'folder.max' => 'The folder name must not exceed 100 characters.',
            'folder.regex' => 'The folder name contains invalid characters.',
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
            'images' => 'image files',
            'images.*' => 'image file',
            'folder' => 'folder name',
        ];
    }
}
