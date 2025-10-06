<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ImageController extends Controller
{
    protected CloudinaryService $cloudinaryService;

    public function __construct(CloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }

    /**
     * Upload a single image.
     */
    public function uploadSingle(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => ['required', 'file', 'image', 'max:5120'], // 5MB max
            'folder' => ['sometimes', 'string', 'max:100'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('image');
        $folder = $request->input('folder', 'products');

        // Validate image
        $validation = $this->cloudinaryService->validateImage($file);
        if (!$validation['valid']) {
            return response()->json([
                'success' => false,
                'message' => 'Image validation failed',
                'errors' => $validation['errors'],
            ], 422);
        }

        // Upload to Cloudinary
        $result = $this->cloudinaryService->uploadImage($file, $folder);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Image upload failed',
                'error' => $result['error'],
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Image uploaded successfully',
            'data' => [
                'url' => $result['url'],
                'public_id' => $result['public_id'],
                'width' => $result['width'],
                'height' => $result['height'],
                'format' => $result['format'],
                'size' => $result['size'],
            ],
        ]);
    }

    /**
     * Upload multiple images.
     */
    public function uploadMultiple(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'images' => ['required', 'array', 'min:1', 'max:10'],
            'images.*' => ['required', 'file', 'image', 'max:5120'], // 5MB max each
            'folder' => ['sometimes', 'string', 'max:100'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $files = $request->file('images');
        $folder = $request->input('folder', 'products');

        // Upload to Cloudinary
        $result = $this->cloudinaryService->uploadMultipleImages($files, $folder);

        return response()->json([
            'success' => $result['success'],
            'message' => $result['success'] ? 'Images uploaded successfully' : 'Some images failed to upload',
            'data' => [
                'uploaded' => $result['uploaded'],
                'errors' => $result['errors'],
                'total_uploaded' => $result['total_uploaded'],
                'total_errors' => $result['total_errors'],
            ],
        ], $result['success'] ? 200 : 207); // 207 Multi-Status for partial success
    }

    /**
     * Delete an image.
     */
    public function delete(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'public_id' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $publicId = $request->input('public_id');
        $result = $this->cloudinaryService->deleteImage($publicId);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Image deletion failed',
                'error' => $result['error'] ?? 'Unknown error',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Image deleted successfully',
        ]);
    }

    /**
     * Get transformed image URL.
     */
    public function transform(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'public_id' => ['required', 'string'],
            'width' => ['sometimes', 'integer', 'min:1', 'max:2000'],
            'height' => ['sometimes', 'integer', 'min:1', 'max:2000'],
            'crop' => ['sometimes', 'string', 'in:fill,fit,scale,crop,thumb'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $publicId = $request->input('public_id');
        $width = $request->input('width', 300);
        $height = $request->input('height', 300);
        $crop = $request->input('crop', 'fill');

        $url = $this->cloudinaryService->getOptimizedUrl($publicId, $width, $height, $crop);

        if (empty($url)) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate transformed URL',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'url' => $url,
                'transformations' => [
                    'width' => $width,
                    'height' => $height,
                    'crop' => $crop,
                ],
            ],
        ]);
    }
}
