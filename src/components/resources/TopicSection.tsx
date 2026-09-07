'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Users } from 'lucide-react';
import { SyllabusTopic } from '@/types';
import { YouTubeEmbed } from './YouTubeEmbed';
import { PastPaperCard } from './PastPaperCard';
import { ExternalLinkCard } from './ExternalLinkCard';

export interface TopicSectionProps {
  topic: SyllabusTopic;
  defaultOpen?: boolean;
  onStudyTopic?: (topicName: string) => void;
}

type TabType = 'videos' | 'papers' | 'links';

export const TopicSection: React.FC<TopicSectionProps> = ({
  topic,
  defaultOpen = false,
  onStudyTopic,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<TabType>('videos');

  const videos = topic.youtubeResources || [];
  const papers = topic.pastPapers || [];
  const links = topic.externalResources || [];

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'videos', label: 'Videos', count: videos.length },
    { key: 'papers', label: 'Papers', count: papers.length },
    { key: 'links', label: 'Links', count: links.length },
  ];

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden transition-all shadow-xs hover:border-zinc-300">
      {/* Topic Header */}
      <div className="flex items-center justify-between px-5 py-4 gap-3">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="min-w-0 flex-1 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 hover:opacity-80 transition-opacity cursor-pointer"
          aria-expanded={isOpen}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h3 className="text-base font-semibold text-zinc-900">
                {topic.name}
              </h3>
              {topic.isHlOnly && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                  HL Only
                </span>
              )}
            </div>
            {!isOpen && topic.subtopics && topic.subtopics.length > 0 && (
              <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                {topic.subtopics.join(' • ')}
              </p>
            )}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-zinc-400 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180 text-zinc-600' : ''
            }`}
          />
        </button>

        {onStudyTopic && (
          <button
            type="button"
            onClick={() => onStudyTopic(topic.name)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-2xs hover:border-emerald-300"
            title="Create a study pod for this topic"
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Study in Pod</span>
            <span className="sm:hidden">Pod</span>
          </button>
        )}
      </div>

      {/* Expandable Content Area */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="topic-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-zinc-100">
              {/* Resource Tabs */}
              <div className="flex items-center gap-2 mt-3 mb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeTab === tab.key
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {/* Resource Tab Panels */}
              <div>
                {activeTab === 'videos' && (
                  videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videos.map((resource) => (
                        <YouTubeEmbed key={resource.id} resource={resource} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-xs text-zinc-400 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
                      No videos added yet
                    </p>
                  )
                )}

                {activeTab === 'papers' && (
                  papers.length > 0 ? (
                    <div className="space-y-2">
                      {papers.map((paper) => (
                        <PastPaperCard key={paper.id} paper={paper} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-xs text-zinc-400 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
                      No papers added yet
                    </p>
                  )
                )}

                {activeTab === 'links' && (
                  links.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {links.map((resource) => (
                        <ExternalLinkCard key={resource.id} resource={resource} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-xs text-zinc-400 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
                      No links added yet
                    </p>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
