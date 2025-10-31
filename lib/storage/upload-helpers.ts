/**
 * Storage Upload Helpers
 * Shared file upload utilities for Supabase Storage
 */

import { createClient } from "@/lib/supabase/server";
import { errorTracker } from "@/lib/utils/error-tracking";

export interface UploadOptions {
  file: File;
  bucket: string;
  basePath: string;
  maxSizeMB: number;
  allowedTypes?: string[];
}

export interface UploadResult {
  url?: string;
  error?: string;
}

/**
 * Validates image file meets requirements
 *
 * @param file File to validate
 * @param maxSizeMB Maximum file size in megabytes
 * @param allowedTypes Array of allowed MIME type prefixes
 * @returns Error message if invalid, null if valid
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number,
  allowedTypes: string[] = ["image/"]
): string | null {
  // Check file type
  const isAllowedType = allowedTypes.some((type) =>
    file.type.startsWith(type)
  );

  if (!isAllowedType) {
    const typesList = allowedTypes.map((t) => t.replace("/", "")).join(", ");
    return `File must be of type: ${typesList}`;
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File must be less than ${maxSizeMB}MB`;
  }

  return null;
}

/**
 * Generates a storage path for uploaded file
 *
 * @param basePath Base directory path (e.g., "profiles/user123" or "orgId/logo")
 * @param fileName Original file name
 * @returns Full storage path with timestamp
 */
export function generateStoragePath(basePath: string, fileName: string): string {
  const fileExt = fileName.split(".").pop();
  const timestamp = Date.now();
  return `${basePath}/${timestamp}.${fileExt}`;
}

/**
 * Uploads an image file to Supabase Storage
 * Validates file type and size before uploading
 *
 * @param options Upload configuration
 * @returns Upload result with public URL or error message
 */
export async function uploadImage(
  options: UploadOptions
): Promise<UploadResult> {
  const {
    file,
    bucket,
    basePath,
    maxSizeMB,
    allowedTypes = ["image/"],
  } = options;

  try {
    // Validate file
    const validationError = validateImageFile(file, maxSizeMB, allowedTypes);
    if (validationError) {
      return { error: validationError };
    }

    // Generate storage path
    const filePath = generateStoragePath(basePath, file.name);

    // Get Supabase client
    const supabase = await createClient();

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      errorTracker.logError("Image upload failed", { error: uploadError, bucket, basePath });
      return { error: uploadError.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return { url: publicUrl };
  } catch (error) {
    errorTracker.logError("Unexpected image upload error", { error, bucket, basePath });
    return {
      error: error instanceof Error ? error.message : "Failed to upload image",
    };
  }
}

/**
 * Uploads a crew member avatar
 * Convenience wrapper around uploadImage for avatar uploads
 *
 * @param file Avatar image file
 * @param profileId User profile ID
 * @returns Upload result with URL or error
 */
export async function uploadAvatar(
  file: File,
  profileId: string
): Promise<UploadResult> {
  return uploadImage({
    file,
    bucket: "avatars",
    basePath: profileId,
    maxSizeMB: 2,
    allowedTypes: ["image/"],
  });
}

/**
 * Uploads an organization logo
 * Convenience wrapper around uploadImage for logo uploads
 *
 * @param file Logo image file
 * @param orgId Organization ID
 * @returns Upload result with URL or error
 */
export async function uploadOrgLogo(
  file: File,
  orgId: string
): Promise<UploadResult> {
  return uploadImage({
    file,
    bucket: "school-media",
    basePath: `${orgId}/logo`,
    maxSizeMB: 5,
    allowedTypes: ["image/"],
  });
}
