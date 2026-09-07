'use client';

import React from 'react';
import { FileText, CheckCircle, ExternalLink } from 'lucide-react';
import { PastPaperLink } from '@/types';

export interface PastPaperCardProps {
  paper: PastPaperLink;
}

export const PastPaperCard: React.FC<PastPaperCardProps> = ({ paper }) => {
  const sessionFormatted = paper.session === 'may' ? 'May' : 'Nov';
  const paperDetails = [sessionFormatted, `Paper ${paper.paper}`, paper.timezone]
    .filter(Boolean)
    .join(' • ');

  return (
    <div className="group flex items-center justify-between gap-3 bg-white border border-zinc-200 rounded-xl px-4 py-3 hover:border-emerald-300 hover:shadow-xs transition">
      <a
        href={paper.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
          <FileText className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 text-sm group-hover:text-emerald-800 transition-colors">
              {paper.year}
            </span>
            {paper.title && (
              <span className="text-xs text-zinc-500 truncate hidden sm:inline">
                {paper.title}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {paperDetails}
          </p>
        </div>
      </a>

      <div className="flex items-center gap-2 shrink-0">
        {paper.hasMarkscheme && paper.markschemeUrl && (
          <a
            href={paper.markschemeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
            title="Mark Scheme"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>MS</span>
          </a>
        )}
        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${paper.year} ${sessionFormatted} Paper ${paper.paper}`}
          className="p-1 text-zinc-400 hover:text-emerald-600 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
