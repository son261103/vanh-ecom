<?php

namespace App\Services;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    /**
     * Upload an image to Cloudinary.
     *
     * @param UploadedFile $file
     * @param string $folder
     * @param array $options
     * @return array
     */
    public function uploadImage(UploadedFile $file, string $folder = 'products', array $options = []): array
    {
        try {
            $defaultOptions = [
                'folder' => $folder,
                'resource_type' => 'image',
                'quality' => 'auto',
                'fetch_format' => 'auto',
            ];

            $uploadOptions = array_merge($defaultOptions, $options);

            $result = Cloudinary::upload($file->getRealPath(), $uploadOptions);

            return [
                'success' => true,
                'url' => $result->getSecurePath(),
                'public_id' => $result->getPublicId(),
                'width' => $result->getWidth(),
                'height' => $result->getHeight(),
                'format' => $result->getExtension(),
                'size' => $result->getSize(),
            ];
        } catch (\Exception $e) {
            Log::error('Cloudinary upload failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Upload multiple images to Cloudinary.
     *
     * @param array $files
     * @param string $folder
     * @param array $options
     * @return array
     */
    public function uploadMultipleImages(array $files, string $folder = 'products', array $options = []): array
    {
        $results = [];
        $errors = [];

        foreach ($files as $index => $file) {
            if ($file instanceof UploadedFile) {
                $result = $this->uploadImage($file, $folder, $options);
                
                if ($result['success']) {
                    $results[] = $result;
                } else {
                    $errors[] = [
                        'index' => $index,
                        'error' => $result['error'],
                    ];
                }
            }
        }

        return [
            'success' => empty($errors),
            'uploaded' => $results,
            'errors' => $errors,
            'total_uploaded' => count($results),
            'total_errors' => count($errors),
        ];
    }

    /**
     * Delete an image from Cloudinary.
     *
     * @param string $publicId
     * @return array
     */
    public function deleteImage(string $publicId): array
    {
        try {
            $result = Cloudinary::destroy($publicId);

            return [
                'success' => $result['result'] === 'ok',
                'result' => $result['result'],
            ];
        } catch (\Exception $e) {
            Log::error('Cloudinary delete failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Generate a transformation URL for an image.
     *
     * @param string $publicId
     * @param array $transformations
     * @return string
     */
    public function getTransformedUrl(string $publicId, array $transformations = []): string
    {
        try {
            return Cloudinary::getUrl($publicId, $transformations);
        } catch (\Exception $e) {
            Log::error('Cloudinary URL generation failed: ' . $e->getMessage());
            return '';
        }
    }

    /**
     * Get optimized image URL with common transformations.
     *
     * @param string $publicId
     * @param int $width
     * @param int $height
     * @param string $crop
     * @return string
     */
    public function getOptimizedUrl(string $publicId, int $width = 300, int $height = 300, string $crop = 'fill'): string
    {
        $transformations = [
            'width' => $width,
            'height' => $height,
            'crop' => $crop,
            'quality' => 'auto',
            'fetch_format' => 'auto',
        ];

        return $this->getTransformedUrl($publicId, $transformations);
    }

    /**
     * Validate image file.
     *
     * @param UploadedFile $file
     * @param int $maxSize Maximum size in MB
     * @return array
     */
    public function validateImage(UploadedFile $file, int $maxSize = 5): array
    {
        $errors = [];

        // Check if file is an image
        if (!$file->isValid()) {
            $errors[] = 'Invalid file upload';
        }

        // Check file type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowedTypes)) {
            $errors[] = 'File must be an image (JPEG, PNG, GIF, or WebP)';
        }

        // Check file size
        $maxSizeBytes = $maxSize * 1024 * 1024; // Convert MB to bytes
        if ($file->getSize() > $maxSizeBytes) {
            $errors[] = "File size must be less than {$maxSize}MB";
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * Extract public ID from Cloudinary URL.
     *
     * @param string $url
     * @return string|null
     */
    public function extractPublicId(string $url): ?string
    {
        // Extract public ID from Cloudinary URL
        // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg
        $pattern = '/\/v\d+\/(.+)\.[a-zA-Z]+$/';
        
        if (preg_match($pattern, $url, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
