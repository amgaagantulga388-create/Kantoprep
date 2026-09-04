import { StudyGroup } from '@/types';
import { VENUE_CONFIG } from './constants';

/**
 * Generate a Google Calendar event creation URL
 */
export function generateGoogleCalendarUrl(group: StudyGroup): string {
  const title = encodeURIComponent(`[KantoPrep] ${group.title} (${group.subject})`);
  const venue = VENUE_CONFIG[group.venueType];
  const location = encodeURIComponent(`${group.venueLabel} - ${venue.address}`);
  
  const description = encodeURIComponent(
    `Study Pod: ${group.title}\n` +
    `Subject: ${group.subject} (${group.curriculum})\n` +
    `Venue: ${group.venueLabel} (${venue.address})\n` +
    `Format: ${group.format}\n` +
    `Duration: ${group.durationMinutes} minutes\n` +
    `Host: ${group.host.fullName} (${group.host.schoolName})\n\n` +
    `Coordinated via KantoPrep - Tokyo International School Study Network`
  );

  // Default start date: tomorrow at 4:30 PM (or today + 1 day)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(16, 30, 0, 0);

  const endDate = new Date(startDate.getTime() + group.durationMinutes * 60 * 1000);

  const formatTime = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
  const dates = `${formatTime(startDate)}/${formatTime(endDate)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${description}&location=${location}`;
}

/**
 * Generate and trigger download of an .ics iCalendar file for Apple Calendar / Outlook
 */
export function downloadIcsFile(group: StudyGroup): void {
  const venue = VENUE_CONFIG[group.venueType];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(16, 30, 0, 0);

  const endDate = new Date(startDate.getTime() + group.durationMinutes * 60 * 1000);

  const formatIcsTime = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KantoPrep//Tokyo International School Study Pod//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:kantoprep-${group.id}@kantoprep.org`,
    `DTSTAMP:${formatIcsTime(new Date())}`,
    `DTSTART:${formatIcsTime(startDate)}`,
    `DTEND:${formatIcsTime(endDate)}`,
    `SUMMARY:[KantoPrep] ${group.title}`,
    `DESCRIPTION:${group.description}\\nHost: ${group.host.fullName} (${group.host.schoolName})\\nCurriculum: ${group.curriculum}\\nSubject: ${group.subject}`,
    `LOCATION:${group.venueLabel}, ${venue.address}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `kantoprep-${group.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
