<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Get primary image URL (first image by sort_order)
        $primaryImageUrl = null;
        if ($this->relationLoaded('images') && $this->images->isNotEmpty()) {
            $primaryImage = $this->images->sortBy('sort_order')->first();
            $primaryImageUrl = $primaryImage?->url;
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'sku' => $this->sku,
            'price' => $this->price,
            'sale_price' => $this->sale_price,
            'stock_quantity' => $this->stock_quantity ?? 0,
            'category_id' => $this->category_id,
            'brand_id' => $this->brand_id,
            'is_active' => $this->is_active ?? true,
            'is_featured' => $this->is_featured ?? false,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Relationships
            'brand' => new BrandResource($this->whenLoaded('brand')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            
            // Images: Full collection for detail view, single for list view
            'images' => $this->when(
                $this->relationLoaded('images') && $this->images->count() > 1,
                fn() => ProductImageResource::collection($this->images)
            ),
            
            // Primary image URL (always available - first image by sort_order)
            'primary_image_url' => $primaryImageUrl,

            // Computed fields
            'is_on_sale' => (bool)($this->sale_price && $this->sale_price < $this->price),
            'discount_percentage' => $this->when(
                $this->sale_price && $this->sale_price < $this->price,
                fn() => round((($this->price - $this->sale_price) / $this->price) * 100, 2)
            ),
        ];
    }
}
