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
    <div className="group flex items-center justify-between gap-3 bg-[#1C1A17] border border-[#F5B942]/15 rounded-xl px-4 py-3 hover:border-[#F5B942]/40 hover:bg-[#201D1A] transition">
      <a
        href={paper.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <div className="w-8 h-8 rounded-lg bg-[#F5B942]/10 text-[#F5B942] flex items-center justify-center shrink-0 group-hover:bg-[#F5B942]/20 transition-colors">
          <FileText className="w-4 h-4 text-[#F5B942]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm group-hover:text-[#F5B942] transition-colors">
              {paper.year}
            </span>
            {paper.title && (
              <span className="text-xs text-[#A8A39D] truncate hidden sm:inline">
                {paper.title}
              </span>
            )}
          </div>
          <p className="text-xs text-[#A8A39D] mt-0.5">
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
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5B942]/10 text-[#F5B942] border border-[#F5B942]/30 hover:bg-[#F5B942]/20 transition-colors"
            title="Mark Scheme"
          >
            <CheckCircle className="w-3.5 h-3.5 text-[#F5B942]" />
            <span>MS</span>
          </a>
        )}
        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${paper.year} ${sessionFormatted} Paper ${paper.paper}`}
          className="p-1 text-[#7A756D] hover:text-[#F5B942] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
