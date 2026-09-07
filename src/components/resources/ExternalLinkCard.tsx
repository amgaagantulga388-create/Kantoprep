'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ExternalResource } from '@/types';

export interface ExternalLinkCardProps {
  resource: ExternalResource;
}

export const ExternalLinkCard: React.FC<ExternalLinkCardProps> = ({ resource }) => {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col justify-between bg-[#1C1A17] border border-[#F5B942]/15 rounded-xl p-4 hover:border-[#F5B942]/40 hover:bg-[#201D1A] hover:shadow-sm transition"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center bg-[#F5B942]/10 text-[#F5B942] border border-[#F5B942]/30 rounded-full px-2 py-0.5 text-[10px] font-bold">
            {resource.source}
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-[#7A756D] group-hover:text-[#F5B942] transition-colors shrink-0" />
        </div>
        <h4 className="mt-2.5 text-sm font-semibold text-white group-hover:text-[#F5B942] transition-colors line-clamp-1">
          {resource.title}
        </h4>
        {resource.description && (
          <p className="mt-1 text-xs text-[#A8A39D] line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        )}
      </div>
    </a>
  );
};
