import { StudyGroup } from '@/types';
import { VENUE_CONFIG } from './constants';

/**
 * Helper to compute event start and end dates based on meetingTime or tomorrow fallback
 */
function getEventDates(group: StudyGroup): { startDate: Date; endDate: Date } {
  let startDate: Date;
  if (group.meetingTime && !isNaN(Date.parse(group.meetingTime))) {
    startDate = new Date(group.meetingTime);
  } else {
    startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(16, 30, 0, 0);
  }

  const endDate = new Date(startDate.getTime() + group.durationMinutes * 60 * 1000);
  return { startDate, endDate };
}

/**
 * Generate a Google Calendar event creation URL
 */
export function generateGoogleCalendarUrl(group: StudyGroup): string {
  const title = encodeURIComponent(`[KantoPrep] ${group.title} (${group.subject})`);
  const venue = VENUE_CONFIG[group.venueType];
  const venueAddress = venue?.address || '';
  const locationText = venueAddress ? `${group.venueLabel} - ${venueAddress}` : group.venueLabel;
  const location = encodeURIComponent(locationText);
  
  const hostInfo = group.host ? `${group.host.fullName} (${group.host.schoolName})` : '';
  const description = encodeURIComponent(
    `Study Pod: ${group.title}\n` +
    `Subject: ${group.subject} (${group.curriculum})\n` +
    `Venue: ${group.venueLabel} (${venueAddress})\n` +
    `Format: ${group.format}\n` +
    `Duration: ${group.durationMinutes} minutes\n` +
    `Host: ${hostInfo}\n\n` +
    `Coordinated via KantoPrep - Tokyo International School Study Network`
  );

  const { startDate, endDate } = getEventDates(group);
  const formatTime = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
  const dates = `${formatTime(startDate)}/${formatTime(endDate)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${description}&location=${location}`;
}

/**
 * Generate RFC 5545 compliant iCalendar (.ics) content for Apple Calendar / Outlook
 */
export function generateIcsContent(group: StudyGroup): string {
  const venue = VENUE_CONFIG[group.venueType];
  const { startDate, endDate } = getEventDates(group);
  const formatIcsTime = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');

  const hostName = group.host?.fullName || '';
  const hostSchool = group.host?.schoolName ? ` (${group.host.schoolName})` : '';
  const venueAddress = venue?.address ? `, ${venue.address}` : '';

  return [
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
    `DESCRIPTION:${group.description || ''}\\nHost: ${hostName}${hostSchool}\\nCurriculum: ${group.curriculum}\\nSubject: ${group.subject}`,
    `LOCATION:${group.venueLabel}${venueAddress}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Generate and trigger download of an .ics iCalendar file for Apple Calendar / Outlook
 */
export function downloadIcsFile(group: StudyGroup): void {
  const icsContent = generateIcsContent(group);

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

