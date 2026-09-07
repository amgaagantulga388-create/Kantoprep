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
      className="group flex flex-col justify-between bg-white border border-zinc-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-sm transition"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 text-[10px] font-semibold">
            {resource.source}
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-600 transition-colors shrink-0" />
        </div>
        <h4 className="mt-2.5 text-sm font-semibold text-zinc-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
          {resource.title}
        </h4>
        {resource.description && (
          <p className="mt-1 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        )}
      </div>
    </a>
  );
};
