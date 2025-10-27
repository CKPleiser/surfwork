"use client";

/**
 * Avatar Upload Component
 * Handles avatar image upload with preview and validation
 */

import { useState, useRef } from "react";
import { Camera, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import {
  uploadAvatar,
  validateAvatarFile,
} from "@/lib/storage/uploadAvatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string | null;
  displayName?: string;
  onUploadComplete: (url: string) => void;
}

export function AvatarUpload({
  userId,
  currentAvatarUrl,
  displayName,
  onUploadComplete,
}: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    currentAvatarUrl || null
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const url = await uploadAvatar(userId, file);

      // Immediately save to database
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: url, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (updateError) {
        throw new Error("Failed to save avatar to profile");
      }

      setAvatarUrl(url);
      onUploadComplete(url);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  // Trigger file input click
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || avatarUrl;
  const initial = displayName?.charAt(0).toUpperCase() || "?";

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Avatar Display and Upload */}
      <div className="flex items-start gap-6">
        {/* Avatar Preview */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-ocean-200 shadow-lg shadow-ocean-500/30 relative bg-gradient-ocean flex items-center justify-center">
            {displayUrl ? (
              <div className="relative w-full h-full">
                <Image
                  src={displayUrl}
                  alt="Avatar"
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
            ) : (
              <span className="text-5xl text-white font-bold">{initial}</span>
            )}
          </div>

          {/* Upload Button Overlay */}
          <button
            onClick={handleClick}
            disabled={uploading}
            className="absolute bottom-0 right-0 p-3 bg-ocean-500 text-white rounded-full shadow-lg hover:bg-ocean-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Change avatar"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
        </div>

        {/* Upload Instructions */}
        <div className="flex-1 space-y-2">
          <h3 className="text-sm font-bold text-ocean-900">Profile Picture</h3>
          <p className="text-xs text-muted-foreground">
            Click the camera icon to upload a new photo
          </p>
          <p className="text-xs text-muted-foreground">
            Accepted formats: JPG, PNG, WEBP (max 5MB)
          </p>
          {uploading && (
            <p className="text-xs text-ocean-600 font-medium">
              Uploading avatar...
            </p>
          )}
          {avatarUrl && !uploading && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClick}
              className="mt-2"
            >
              Change Photo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
