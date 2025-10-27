"use client";

/**
 * Media Upload Zone Component
 * Drag-and-drop image upload for organization galleries with preview
 */

import { useState, useCallback, DragEvent } from "react";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import {
  uploadOrganizationImage,
  deleteOrganizationImage,
  validateImageFile,
  type MediaType,
} from "@/lib/storage/uploadOrganizationMedia";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MediaUploadZoneProps {
  organizationId: string;
  type: MediaType;
  currentImages: string[];
  maxImages?: number;
  onUploadComplete: (urls: string[]) => void;
  label?: string;
  description?: string;
}

export function MediaUploadZone({
  organizationId,
  type,
  currentImages,
  maxImages = 10,
  onUploadComplete,
  label = "Upload Images",
  description = "Drag & drop images or click to browse",
}: MediaUploadZoneProps) {
  const [images, setImages] = useState<string[]>(currentImages);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingSlots = maxImages - images.length;
  const canUpload = remainingSlots > 0 && !uploading;

  // Handle file upload
  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setError(null);
      setUploading(true);

      try {
        // Validate all files first
        const fileArray = Array.from(files);
        const filesToUpload = fileArray.slice(0, remainingSlots);

        for (const file of filesToUpload) {
          const validation = validateImageFile(file);
          if (!validation.valid) {
            setError(validation.error || "Invalid file");
            setUploading(false);
            return;
          }
        }

        // Upload files
        const uploadedUrls: string[] = [];
        for (const file of filesToUpload) {
          const url = await uploadOrganizationImage(organizationId, file, type);
          uploadedUrls.push(url);
        }

        const newImages = [...images, ...uploadedUrls];
        setImages(newImages);
        onUploadComplete(newImages);
      } catch (err) {
        console.error("Upload failed:", err);
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [organizationId, type, images, remainingSlots, onUploadComplete]
  );

  // Remove image
  const removeImage = async (url: string) => {
    try {
      setError(null);
      await deleteOrganizationImage(url);
      const updated = images.filter((img) => img !== url);
      setImages(updated);
      onUploadComplete(updated);
    } catch (err) {
      console.error("Delete failed:", err);
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canUpload) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!canUpload) return;

    const files = e.dataTransfer?.files;
    handleFiles(files);
  };

  // File input change handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div className="space-y-4">
      {/* Label */}
      {label && (
        <div>
          <h3 className="text-sm font-bold text-ocean-900">{label}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center
          transition-all duration-200
          ${
            isDragging
              ? "border-ocean-500 bg-ocean-50 scale-[1.02]"
              : "border-border hover:border-ocean-400"
          }
          ${!canUpload ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileInputChange}
          disabled={!canUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {uploading ? (
          <div className="py-4">
            <Loader2 className="h-12 w-12 animate-spin text-ocean-500 mx-auto mb-4" />
            <p className="text-sm font-medium text-foreground">
              Uploading images...
            </p>
          </div>
        ) : (
          <div className="py-4">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">
              {isDragging
                ? "Drop images here"
                : "Drag & drop images or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WEBP up to 10MB • {images.length}/{maxImages} uploaded
              {remainingSlots > 0 && ` • ${remainingSlots} slots remaining`}
            </p>
          </div>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative group aspect-square bg-muted rounded-lg overflow-hidden border-2 border-border hover:border-ocean-400 transition-all"
            >
              <Image
                src={url}
                alt={`${type} ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />

              {/* Remove Button */}
              <button
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-destructive/90"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-md">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Limit Reached */}
      {remainingSlots === 0 && (
        <p className="text-sm text-center text-muted-foreground">
          Maximum {maxImages} images reached. Remove images to upload more.
        </p>
      )}
    </div>
  );
}
