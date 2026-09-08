import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KantoPrep - Tokyo Study Network',
    short_name: 'KantoPrep',
    description: 'Find study pods, collaborate with peers, and prepare for exams across Tokyo international schools.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0E0D0B',
    theme_color: '#F5B942',
    categories: ['education', 'productivity'],
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
