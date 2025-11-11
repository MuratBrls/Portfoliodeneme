/**
 * Security utilities for input validation and sanitization
 */

// Allowed file extensions for uploads
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
export const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm"];
export const ALLOWED_EXTENSIONS = [...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_VIDEO_EXTENSIONS];

// Allowed MIME types
export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
export const ALLOWED_VIDEO_MIMES = ["video/mp4", "video/quicktime", "video/webm"];
export const ALLOWED_MIMES = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES];

// Maximum file size: 50MB
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

/**
 * Validate and sanitize slug
 */
export function validateSlug(slug: string): { valid: boolean; error?: string; sanitized?: string } {
  if (!slug || typeof slug !== "string") {
    return { valid: false, error: "Slug is required" };
  }

  const trimmed = slug.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Slug cannot be empty" };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: "Slug is too long (max 100 characters)" };
  }

  // Only allow alphanumeric, hyphens, and underscores
  if (!/^[a-z0-9_-]+$/i.test(trimmed)) {
    return { valid: false, error: "Slug can only contain letters, numbers, hyphens, and underscores" };
  }

  // Prevent path traversal attempts
  if (trimmed.includes("..") || trimmed.includes("/") || trimmed.includes("\\")) {
    return { valid: false, error: "Invalid slug format" };
  }

  // Prevent reserved names
  const reserved = ["admin", "api", "data", "public", "src", "node_modules"];
  if (reserved.includes(trimmed.toLowerCase())) {
    return { valid: false, error: "Slug is reserved" };
  }

  return { valid: true, sanitized: trimmed.toLowerCase() };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  allowedExtensions: string[] = ALLOWED_EXTENSIONS,
  allowedMimes: string[] = ALLOWED_MIMES,
  maxSize: number = MAX_FILE_SIZE,
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "File is required" };
  }

  // Check file size
  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds maximum allowed size (${maxSize / 1024 / 1024}MB)` };
  }

  if (file.size === 0) {
    return { valid: false, error: "File is empty" };
  }

  // Check file extension
  const fileName = file.name || "";
  const extension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: `File type not allowed. Allowed types: ${allowedExtensions.join(", ")}` };
  }

  // Check MIME type
  if (file.type && !allowedMimes.includes(file.type)) {
    return { valid: false, error: `MIME type not allowed: ${file.type}` };
  }

  return { valid: true };
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string, maxLength?: number): string {
  if (typeof input !== "string") return "";
  
  let sanitized = input.trim();
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, "");
  
  // Limit length
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Check if admin password is secure in production
 */
export function validateAdminPassword(): { valid: boolean; error?: string } {
  const password = process.env.ADMIN_PASSWORD;
  
  if (process.env.NODE_ENV === "production") {
    if (!password || password === "admin123" || password.length < 12) {
      return {
        valid: false,
        error: "ADMIN_PASSWORD must be set and at least 12 characters long in production",
      };
    }
  }
  
  return { valid: true };
}

