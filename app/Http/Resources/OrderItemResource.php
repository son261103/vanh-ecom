<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name, // Saved product name
            'sku' => $this->sku, // Saved SKU
            'quantity' => $this->quantity,
            'price' => $this->unit_price, // Return as 'price' for frontend compatibility
            'subtotal' => $this->line_total, // Return as 'subtotal' for frontend compatibility
            'unit_price' => $this->unit_price, // Keep for reference
            'line_total' => $this->line_total, // Keep for reference
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Relationships - product may be null if deleted
            'product' => $this->whenLoaded('product', function () {
                return $this->product ? new ProductResource($this->product) : [
                    'name' => $this->product_name,
                    'sku' => $this->sku,
                    'images' => [],
                ];
            }),
        ];
    }
}
