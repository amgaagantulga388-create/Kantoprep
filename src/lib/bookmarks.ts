export const BOOKMARKS_STORAGE_KEY = 'kantoprep_bookmarked_subjects';

export function getBookmarkedSubjects(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load bookmarked subjects:', err);
    return [];
  }
}

export function saveBookmarkedSubjects(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(ids));
    // Dispatch custom event so all active components update immediately
    window.dispatchEvent(new CustomEvent('kantoprep:bookmarks-updated', { detail: ids }));
  } catch (err) {
    console.error('Failed to save bookmarked subjects:', err);
  }
}

export function isSubjectBookmarked(id: string): boolean {
  const current = getBookmarkedSubjects();
  return current.includes(id);
}

export function toggleSubjectBookmark(id: string): { bookmarked: boolean; all: string[] } {
  const current = getBookmarkedSubjects();
  const exists = current.includes(id);
  const updated = exists ? current.filter((item) => item !== id) : [...current, id];
  saveBookmarkedSubjects(updated);
  return { bookmarked: !exists, all: updated };
}
