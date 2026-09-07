import { StudyGroup, StudentProfile } from '@/types';

/**
 * Dispatch an offline chat notification email to pod members
 */
export async function notifyPodMembersOfChat(
  group: StudyGroup,
  sender: StudentProfile,
  messageText: string
): Promise<void> {
  try {
    // Collect all other members in the pod (plus host if sender is not host)
    const allParticipants = [group.host, ...group.members];
    const uniqueRecipients = new Map<string, { email: string; name: string }>();

    for (const p of allParticipants) {
      if (p.id !== sender.id && p.email && !uniqueRecipients.has(p.email)) {
        uniqueRecipients.set(p.email, {
          email: p.email,
          name: p.fullName,
        });
      }
    }

    const recipients = Array.from(uniqueRecipients.values());
    if (recipients.length === 0) return;

    // Send payload to backend notification endpoint
    await fetch('/api/notifications/chat-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients,
        senderName: sender.fullName,
        senderSchool: sender.schoolName ? sender.schoolName.split(' ')[0] : undefined,
        podTitle: group.title,
        podSubject: group.subject,
        venueLabel: group.venueLabel,
        meetingTime: group.meetingTime,
        messageSnippet: messageText,
        podId: group.id,
      }),
    });
  } catch (err) {
    // Non-blocking catch to ensure chat responsiveness
    console.warn('[Notification] Unable to dispatch offline email notification:', err);
  }
}
