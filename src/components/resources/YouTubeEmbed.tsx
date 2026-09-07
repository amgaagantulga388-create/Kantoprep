'use client';

import React from 'react';
import { YouTubeResource } from '@/types';

export interface YouTubeEmbedProps {
  resource: YouTubeResource;
}

// Automatically extracts the 11-character video ID even if the user pastes a full URL
function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  // If it's already an 11-char ID like "kYv9iB9xJ4E"
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  // Matches watch?v=ID, youtu.be/ID, embed/ID, shorts/ID
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : trimmed;
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ resource }) => {
  const cleanVideoId = extractYouTubeId(resource.videoId);

  return (
    <div className="group">
      <div className="relative aspect-video rounded-xl overflow-hidden border border-[#F5B942]/15 shadow-sm transition-colors group-hover:border-[#F5B942]/40 bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${cleanVideoId}`}
          title={resource.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
      <div className="mt-2 px-0.5">
        <p className="text-sm font-semibold text-white line-clamp-2 group-hover:text-[#F5B942] transition-colors">
          {resource.title}
        </p>
        <p className="text-xs text-[#A8A39D] mt-0.5">
          {resource.channelName}
          {resource.durationMinutes ? ` • ${resource.durationMinutes} min` : ''}
        </p>
      </div>
    </div>
  );
};
