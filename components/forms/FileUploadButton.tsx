/**
 * File Upload Button Component
 * Reusable file upload with preview for avatars and logos
 */

"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadButtonProps {
  variant?: "avatar" | "logo";
  maxSizeMB: number;
  onFileSelect: (file: File, previewUrl: string) => void;
  onFileRemove: () => void;
  previewUrl: string | null;
  label?: string;
}

export function FileUploadButton({
  variant = "avatar",
  maxSizeMB,
  onFileSelect,
  onFileRemove,
  previewUrl,
  label,
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Image must be less than ${maxSizeMB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onFileSelect(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileRemove();
  };

  if (variant === "avatar") {
    return (
      <div className="flex items-center gap-4">
        <div
          role="button"
          tabIndex={0}
          aria-label={label || "Upload profile photo"}
          className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-ocean-400 focus-visible:border-ocean-500 focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2 transition-colors overflow-hidden outline-none"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            {label || `Upload a photo (max ${maxSizeMB}MB)`}
          </p>
          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm text-red-600 hover:text-red-700 mt-1"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>
    );
  }

  // Logo variant
  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
        <div className="h-20 w-20 rounded-lg border-2 border-gray-300 border-dashed overflow-hidden bg-gray-50">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Logo preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          {label || "Upload logo"}
        </Button>
        <p className="text-xs text-gray-500 mt-1">
          Max {maxSizeMB}MB (JPG, PNG, or WEBP)
        </p>
      </div>
    </div>
  );
}
