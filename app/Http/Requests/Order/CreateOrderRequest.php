<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
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
            'shipping_address' => [
                'required',
                'array',
            ],
            'shipping_address.full_name' => [
                'required',
                'string',
                'max:255',
            ],
            'shipping_address.phone' => [
                'required',
                'string',
                'max:20',
            ],
            'shipping_address.address_line_1' => [
                'required',
                'string',
                'max:255',
            ],
            'shipping_address.address_line_2' => [
                'nullable',
                'string',
                'max:255',
            ],
            'shipping_address.city' => [
                'required',
                'string',
                'max:100',
            ],
            'shipping_address.state' => [
                'required',
                'string',
                'max:100',
            ],
            'shipping_address.postal_code' => [
                'required',
                'string',
                'max:20',
            ],
            'shipping_address.country' => [
                'required',
                'string',
                'max:100',
            ],
            'billing_address' => [
                'nullable',
                'array',
            ],
            'billing_address.full_name' => [
                'required_with:billing_address',
                'string',
                'max:255',
            ],
            'billing_address.phone' => [
                'required_with:billing_address',
                'string',
                'max:20',
            ],
            'billing_address.address_line_1' => [
                'required_with:billing_address',
                'string',
                'max:255',
            ],
            'billing_address.address_line_2' => [
                'nullable',
                'string',
                'max:255',
            ],
            'billing_address.city' => [
                'required_with:billing_address',
                'string',
                'max:100',
            ],
            'billing_address.state' => [
                'required_with:billing_address',
                'string',
                'max:100',
            ],
            'billing_address.postal_code' => [
                'required_with:billing_address',
                'string',
                'max:20',
            ],
            'billing_address.country' => [
                'required_with:billing_address',
                'string',
                'max:100',
            ],
            'payment_method' => [
                'required',
                'string',
                'in:credit_card,debit_card,paypal,bank_transfer,cash_on_delivery',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:1000',
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
            'shipping_address.required' => 'Shipping address is required.',
            'payment_method.required' => 'Payment method is required.',
            'payment_method.in' => 'Invalid payment method selected.',
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
            'shipping_address.full_name' => 'shipping full name',
            'shipping_address.phone' => 'shipping phone',
            'shipping_address.address_line_1' => 'shipping address',
            'shipping_address.city' => 'shipping city',
            'shipping_address.state' => 'shipping state',
            'shipping_address.postal_code' => 'shipping postal code',
            'shipping_address.country' => 'shipping country',
            'billing_address.full_name' => 'billing full name',
            'billing_address.phone' => 'billing phone',
            'billing_address.address_line_1' => 'billing address',
            'billing_address.city' => 'billing city',
            'billing_address.state' => 'billing state',
            'billing_address.postal_code' => 'billing postal code',
            'billing_address.country' => 'billing country',
            'payment_method' => 'payment method',
        ];
    }
}
