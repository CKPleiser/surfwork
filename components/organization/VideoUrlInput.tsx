"use client";

/**
 * Video URL Input Component
 * Allows adding YouTube/Vimeo URLs with preview thumbnails
 */

import { useState } from "react";
import { Plus, X, Youtube, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VideoUrlInputProps {
  videoUrls: string[];
  maxVideos?: number;
  onUpdate: (urls: string[]) => void;
}

/**
 * Extract video ID from YouTube or Vimeo URL
 */
function extractVideoId(url: string): {
  platform: "youtube" | "vimeo" | null;
  id: string | null;
} {
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /youtube\.com\/watch\?.*v=([^&]+)/,
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return { platform: "youtube", id: match[1] };
    }
  }

  // Vimeo patterns
  const vimeoPattern = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoPattern);
  if (vimeoMatch && vimeoMatch[1]) {
    return { platform: "vimeo", id: vimeoMatch[1] };
  }

  return { platform: null, id: null };
}

/**
 * Get thumbnail URL for video
 */
function getVideoThumbnail(url: string): string | null {
  const { platform, id } = extractVideoId(url);

  if (platform === "youtube" && id) {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }

  if (platform === "vimeo" && id) {
    // Vimeo requires API call for thumbnail, using placeholder for now
    return `https://vumbnail.com/${id}.jpg`;
  }

  return null;
}

/**
 * Validate video URL
 */
function isValidVideoUrl(url: string): boolean {
  const { platform, id } = extractVideoId(url);
  return platform !== null && id !== null;
}

export function VideoUrlInput({
  videoUrls,
  maxVideos = 5,
  onUpdate,
}: VideoUrlInputProps) {
  const [newUrl, setNewUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const remainingSlots = maxVideos - videoUrls.length;
  const canAddMore = remainingSlots > 0;

  const handleAddVideo = () => {
    setError(null);

    if (!newUrl.trim()) {
      setError("Please enter a video URL");
      return;
    }

    if (!isValidVideoUrl(newUrl)) {
      setError("Invalid YouTube or Vimeo URL. Please check the URL and try again.");
      return;
    }

    if (videoUrls.includes(newUrl)) {
      setError("This video has already been added");
      return;
    }

    onUpdate([...videoUrls, newUrl]);
    setNewUrl("");
  };

  const handleRemoveVideo = (urlToRemove: string) => {
    onUpdate(videoUrls.filter((url) => url !== urlToRemove));
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddVideo();
    }
  };

  return (
    <div className="space-y-4">
      {/* Label */}
      <div>
        <Label className="text-sm font-bold text-ocean-900">
          Video Links (YouTube or Vimeo)
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          Add up to {maxVideos} video URLs to showcase your organization
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add Video Input */}
      {canAddMore && (
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200"
          />
          <Button
            type="button"
            onClick={handleAddVideo}
            disabled={!newUrl.trim()}
            className="gap-2 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Add Video
          </Button>
        </div>
      )}

      {/* Video List */}
      {videoUrls.length > 0 && (
        <div className="space-y-3">
          {videoUrls.map((url, index) => {
            const { platform } = extractVideoId(url);
            const thumbnail = getVideoThumbnail(url);

            return (
              <div
                key={url}
                className="flex items-center gap-3 p-3 border-2 border-border rounded-lg hover:border-ocean-300 transition-colors group"
              >
                {/* Thumbnail or Icon */}
                <div className="flex-shrink-0 w-24 h-16 bg-muted rounded-md overflow-hidden relative">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={`Video ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Youtube className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {/* Platform Badge */}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
                    {platform === "youtube" ? "YT" : "VM"}
                  </div>
                </div>

                {/* URL Display */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{url}</p>
                  <p className="text-xs text-muted-foreground">
                    Video {index + 1} of {maxVideos}
                  </p>
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveVideo(url)}
                  className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Count */}
      <p className="text-sm text-muted-foreground text-center">
        {videoUrls.length} / {maxVideos} videos added
        {remainingSlots === 0 && " (Maximum reached)"}
      </p>

      {/* Help Text */}
      {videoUrls.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <Youtube className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">
            No videos added yet
          </p>
          <p className="text-xs text-muted-foreground">
            Paste a YouTube or Vimeo link above to get started
          </p>
        </div>
      )}
    </div>
  );
}
