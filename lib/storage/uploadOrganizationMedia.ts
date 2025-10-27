/**
 * Organization Media Upload Utilities
 * Handles uploading, deleting, and managing organization images in Supabase Storage
 */

import { createClient } from "@/lib/supabase/client";

export type MediaType = "hero" | "gallery";

/**
 * Upload an image to organization media bucket
 * @param organizationId - UUID of the organization
 * @param file - Image file to upload
 * @param type - Type of media (hero or gallery)
 * @returns Public URL of the uploaded image
 */
export async function uploadOrganizationImage(
  organizationId: string,
  file: File,
  type: MediaType
): Promise<string> {
  const supabase = createClient();

  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    throw new Error(
      `Invalid file type: ${file.type}. Allowed types: ${validTypes.join(", ")}`
    );
  }

  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error(
      `File size exceeds limit. Maximum allowed: ${maxSize / 1024 / 1024}MB`
    );
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${organizationId}/${type}/${fileName}`;

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("school-media")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("school-media").getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Delete an image from organization media bucket
 * @param url - Public URL of the image to delete
 */
export async function deleteOrganizationImage(url: string): Promise<void> {
  const supabase = createClient();

  // Extract file path from URL
  // URL format: https://{project}.supabase.co/storage/v1/object/public/school-media/{path}
  const urlParts = url.split("/school-media/");

  if (urlParts.length < 2 || !urlParts[1]) {
    throw new Error("Invalid image URL format");
  }

  const filePath = urlParts[1];

  // Delete file from storage
  const { error } = await supabase.storage.from("school-media").remove([filePath]);

  if (error) {
    console.error("Delete error:", error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Upload multiple images at once
 * @param organizationId - UUID of the organization
 * @param files - Array of image files
 * @param type - Type of media (hero or gallery)
 * @returns Array of public URLs
 */
export async function uploadMultipleOrganizationImages(
  organizationId: string,
  files: File[],
  type: MediaType
): Promise<string[]> {
  const uploadPromises = files.map((file) =>
    uploadOrganizationImage(organizationId, file, type)
  );

  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Batch upload failed:", error);
    throw error;
  }
}

/**
 * Replace hero image (deletes old, uploads new)
 * @param organizationId - UUID of the organization
 * @param newFile - New hero image file
 * @param oldUrl - URL of existing hero image to delete (optional)
 * @returns Public URL of new hero image
 */
export async function replaceHeroImage(
  organizationId: string,
  newFile: File,
  oldUrl?: string | null
): Promise<string> {
  // Delete old image if it exists
  if (oldUrl) {
    try {
      await deleteOrganizationImage(oldUrl);
    } catch (error) {
      console.warn("Failed to delete old hero image:", error);
      // Continue with upload even if delete fails
    }
  }

  // Upload new image
  return await uploadOrganizationImage(organizationId, newFile, "hero");
}

/**
 * Validate image file before upload
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: 10MB`,
    };
  }

  return { valid: true };
}
