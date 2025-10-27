/**
 * Avatar Upload Utilities
 * Handles uploading and managing user avatars in Supabase Storage
 */

import { createClient } from "@/lib/supabase/client";

/**
 * Upload an avatar image to profiles bucket
 * @param userId - UUID of the user profile
 * @param file - Image file to upload
 * @returns Public URL of the uploaded avatar
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const supabase = createClient();

  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    throw new Error(
      `Invalid file type: ${file.type}. Allowed types: ${validTypes.join(", ")}`
    );
  }

  // Validate file size (5MB limit for avatars)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error(
      `File size exceeds limit. Maximum allowed: ${maxSize / 1024 / 1024}MB`
    );
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true, // Replace existing avatar
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error(`Failed to upload avatar: ${uploadError.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Delete an avatar from storage
 * @param url - Public URL of the avatar to delete
 */
export async function deleteAvatar(url: string): Promise<void> {
  const supabase = createClient();

  // Extract file path from URL
  // URL format: https://{project}.supabase.co/storage/v1/object/public/avatars/{path}
  const urlParts = url.split("/avatars/");

  if (urlParts.length < 2 || !urlParts[1]) {
    throw new Error("Invalid avatar URL format");
  }

  const filePath = urlParts[1];

  // Delete file from storage
  const { error } = await supabase.storage.from("avatars").remove([filePath]);

  if (error) {
    console.error("Delete error:", error);
    throw new Error(`Failed to delete avatar: ${error.message}`);
  }
}

/**
 * Replace avatar (deletes old, uploads new)
 * @param userId - UUID of the user
 * @param newFile - New avatar image file
 * @param oldUrl - URL of existing avatar to delete (optional)
 * @returns Public URL of new avatar
 */
export async function replaceAvatar(
  userId: string,
  newFile: File,
  oldUrl?: string | null
): Promise<string> {
  // Delete old avatar if it exists
  if (oldUrl) {
    try {
      await deleteAvatar(oldUrl);
    } catch (error) {
      console.warn("Failed to delete old avatar:", error);
      // Continue with upload even if delete fails
    }
  }

  // Upload new avatar
  return await uploadAvatar(userId, newFile);
}

/**
 * Validate avatar file before upload
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export function validateAvatarFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: 5MB`,
    };
  }

  return { valid: true };
}
