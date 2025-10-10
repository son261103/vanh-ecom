/**
 * Get full image URL from storage path
 * @param path - Image path from storage (e.g., "/storage/products/image.jpg" or Cloudinary URL)
 * @returns Full URL to the image
 */
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  // If path already starts with http/https (Cloudinary or full URL), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // For relative paths (legacy local storage), prepend backend URL
  // Get backend URL from env or use default
  const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
  
  // Remove leading slash if exists
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${backendUrl}/${cleanPath}`;
};

/**
 * Get placeholder image URL when no image is available
 */
export const getPlaceholderImage = (): string => {
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" dy="0.3em" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
};
