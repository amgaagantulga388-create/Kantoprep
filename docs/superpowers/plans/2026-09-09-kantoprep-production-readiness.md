# KantoPrep: Production Readiness & Engineering Excellence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a robust automated testing suite (Vitest + RTL), resolve all 24 ESLint/React 19 compiler errors and 41 warnings to reach 0 warnings, optimize performance (Next.js Image LCP), verify accessibility (a11y), and deploy a production CI/CD workflow for KantoPrep.

**Architecture:** We build a rock-solid quality foundation using Vitest for domain logic unit testing (safety heuristics, calendar formatting, exam countdown, domain whitelist) following strict TDD. In parallel, we systematically refactor React 19 anti-patterns (e.g. `setState` in effects refactored to lazy state initializers) to achieve zero lint errors. Finally, we optimize LCP and set up GitHub Actions CI.

**Tech Stack:** Next.js 16.3.4 (App Router, Turbopack), React 19.2.8, TypeScript 5, Tailwind CSS v4, Vitest, @testing-library/react, jsdom, Supabase.

**Spec:** `docs/superpowers/specs/2026-09-09-kantoprep-production-readiness-design.md`

## Global Constraints
- Node.js 20+ compatible.
- Zero TypeScript `any` types in modified code.
- Zero ESLint errors or warnings allowed in final state (`npm run lint`).
- Next.js production build (`npm run build`) must succeed with zero errors.
- Preserve all existing Tokyo school domains and academic curriculum data.

---

### Task 1: Testing Infrastructure Setup (Vitest + Testing Library + jsdom)

**Files:**
- Create: `vitest.config.ts`
- Create: `src/__tests__/setup.ts`
- Modify: `package.json:5-10`
- Test: `src/__tests__/sanity.test.ts`

**Interfaces:**
- Produces: `npm test` command running Vitest in jsdom environment with path alias `@/` mapping to `./src/*`.

- [ ] **Step 1: Install Vitest and testing dependencies**

Run:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @types/node
```

- [ ] **Step 2: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 3: Create `src/__tests__/setup.ts`**

```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Update `package.json` with test scripts**

Add to `"scripts"` in `package.json`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write failing sanity test**

Create `src/__tests__/sanity.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

describe('Sanity test', () => {
  it('verifies testing environment is functional', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test`  
Expected: PASS 1 test

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/__tests__/setup.ts src/__tests__/sanity.test.ts
git commit -m "chore: setup vitest and react testing library infrastructure"
```

---

### Task 2: Safety & Anti-Abuse Logic Unit Tests (TDD)

**Files:**
- Create: `src/__tests__/safety.test.ts`
- Modify: `src/lib/safety.ts`

**Interfaces:**
- Consumes: `checkMessageSafety(content: string)` and `checkRateLimit(key: string, limit: number, windowMs: number)` from `@/lib/safety`
- Produces: Full test coverage for PII detection, cheating detection, and rate limiting.

- [ ] **Step 1: Write comprehensive failing tests in `src/__tests__/safety.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { checkMessageSafety, checkRateLimit } from '@/lib/safety';

describe('Safety & Content Moderation Shield', () => {
  describe('checkMessageSafety', () => {
    it('allows normal academic discussion', () => {
      const result = checkMessageSafety('Let us meet at Arisugawa Library to solve Math Paper 2 questions.');
      expect(result.safe).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('flags telephone numbers to prevent off-platform contact leaks', () => {
      const result1 = checkMessageSafety('Call me at 090-1234-5678');
      expect(result1.safe).toBe(false);
      expect(result1.reason).toMatch(/phone/i);

      const result2 = checkMessageSafety('My number is +81 80 9876 5432');
      expect(result2.safe).toBe(false);
    });

    it('flags academic dishonesty and leak solicitation', () => {
      const result1 = checkMessageSafety('Does anyone have the leaked May 2026 Math HL paper?');
      expect(result1.safe).toBe(false);
      expect(result1.reason).toMatch(/academic integrity|leak/i);

      const result2 = checkMessageSafety('Selling unreleased exam question banks');
      expect(result2.safe).toBe(false);
    });

    it('flags commercial tutoring solicitation', () => {
      const result = checkMessageSafety('Pay me 5000 yen per hour for private tutoring');
      expect(result.safe).toBe(false);
    });
  });

  describe('checkRateLimit', () => {
    beforeEach(() => {
      // Clear localStorage or memory state if needed
    });

    it('allows actions within rate limit and blocks when exceeded', () => {
      const key = 'test-client-' + Date.now();
      expect(checkRateLimit(key, 3, 5000)).toBe(true);
      expect(checkRateLimit(key, 3, 5000)).toBe(true);
      expect(checkRateLimit(key, 3, 5000)).toBe(true);
      expect(checkRateLimit(key, 3, 5000)).toBe(false);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify failure/coverage**

Run: `npm test src/__tests__/safety.test.ts`

- [ ] **Step 3: Refine `src/lib/safety.ts` if needed to ensure all edge cases pass cleanly**

Ensure regex patterns correctly cover Japanese phone formats (`090`, `080`, `070`, `+81`) and unreleased exam trade keywords.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/__tests__/safety.test.ts`  
Expected: PASS all tests

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/safety.test.ts src/lib/safety.ts
git commit -m "test: add comprehensive unit test suite for safety and rate limiting engine"
```

---

### Task 3: School Domain Whitelist & Calendar Integration Unit Tests (TDD)

**Files:**
- Create: `src/__tests__/domainAndCalendar.test.ts`
- Modify: `src/lib/constants.ts`
- Modify: `src/lib/calendar.ts`

**Interfaces:**
- Consumes: `ALLOWED_SCHOOLS` from `@/lib/constants`, `generateIcsCalendar` and `generateGoogleCalendarUrl` from `@/lib/calendar`
- Produces: Verified school domain validation and RFC 5545 calendar file generation.

- [ ] **Step 1: Write failing tests in `src/__tests__/domainAndCalendar.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { ALLOWED_SCHOOLS } from '@/lib/constants';
import { generateIcsCalendar, generateGoogleCalendarUrl } from '@/lib/calendar';

describe('School Domain Security Gatekeeper', () => {
  it('contains verified Tokyo international schools with proper domains', () => {
    const domains = ALLOWED_SCHOOLS.map((s) => s.domain);
    expect(domains).toContain('students.aobajapan.jp');
    expect(domains).toContain('bst.ac.jp');
    expect(domains).toContain('asij.ac.jp');
    expect(domains).toContain('k-international.ed.jp');
    expect(domains).toContain('smis.ac.jp');
  });

  it('rejects public email providers and subdomain spoofing', () => {
    const isDomainAllowed = (email: string) => {
      const parts = email.split('@');
      if (parts.length !== 2) return false;
      const domain = parts[1].toLowerCase().trim();
      return ALLOWED_SCHOOLS.some((school) => school.domain.toLowerCase() === domain);
    };

    expect(isDomainAllowed('student@students.aobajapan.jp')).toBe(true);
    expect(isDomainAllowed('student@bst.ac.jp')).toBe(true);
    expect(isDomainAllowed('attacker@gmail.com')).toBe(false);
    expect(isDomainAllowed('attacker@students.aobajapan.jp.evil.com')).toBe(false);
    expect(isDomainAllowed('attacker@fake-students.aobajapan.jp')).toBe(false);
  });
});

describe('Calendar Engine (RFC 5545 & Google Calendar)', () => {
  const mockSession = {
    title: 'IB Math HL Paper 2 Study Pod',
    description: 'Past paper marathon at Tokyo Metropolitan Central Library',
    location: 'Tokyo Metropolitan Central Library, Minato-ku',
    startTime: new Date('2026-09-15T15:00:00+09:00'),
    endTime: new Date('2026-09-15T17:00:00+09:00'),
  };

  it('generates compliant RFC 5545 .ics calendar content', () => {
    const ics = generateIcsCalendar(mockSession);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('SUMMARY:IB Math HL Paper 2 Study Pod');
    expect(ics).toContain('LOCATION:Tokyo Metropolitan Central Library, Minato-ku');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('generates valid Google Calendar deep link with encoded query parameters', () => {
    const url = generateGoogleCalendarUrl(mockSession);
    expect(url).toContain('https://calendar.google.com/calendar/render');
    expect(url).toContain('action=TEMPLATE');
    expect(url).toContain(encodeURIComponent('IB Math HL Paper 2 Study Pod'));
  });
});
```

- [ ] **Step 2: Run test to verify execution**

Run: `npm test src/__tests__/domainAndCalendar.test.ts`

- [ ] **Step 3: Ensure `calendar.ts` functions match interface and pass cleanly**

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/domainAndCalendar.test.ts src/lib/calendar.ts src/lib/constants.ts
git commit -m "test: add unit tests for school domain gatekeeper and RFC 5545 calendar engine"
```

---

### Task 4: Exam Schedule & D-Day Radar Unit Tests (TDD)

**Files:**
- Create: `src/__tests__/examSchedule.test.ts`
- Modify: `src/lib/examSchedule.ts`

**Interfaces:**
- Consumes: `EXAM_SCHEDULES`, `getNextExamCountdown` from `@/lib/examSchedule`
- Produces: Tested countdown calculation logic without runtime date errors.

- [ ] **Step 1: Write failing tests in `src/__tests__/examSchedule.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { EXAM_SCHEDULES, getNextExamCountdown } from '@/lib/examSchedule';

describe('Authoritative Exam Schedule & D-Day Engine', () => {
  it('contains official exam events for SAT, IB, and AP', () => {
    expect(EXAM_SCHEDULES.length).toBeGreaterThan(0);
    const curricula = EXAM_SCHEDULES.map((e) => e.curriculum);
    expect(curricula).toContain('Digital SAT');
    expect(curricula).toContain('IB Diploma');
  });

  it('calculates days remaining accurately without negative NaN issues', () => {
    const countdown = getNextExamCountdown();
    expect(countdown).toBeDefined();
    if (countdown) {
      expect(typeof countdown.daysRemaining).toBe('number');
      expect(countdown.daysRemaining).toBeGreaterThanOrEqual(0);
      expect(countdown.title).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Run test to verify**

Run: `npm test src/__tests__/examSchedule.test.ts`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/examSchedule.test.ts src/lib/examSchedule.ts
git commit -m "test: add unit tests for D-Day exam countdown and schedule data"
```

---

### Task 5: Systematic ESLint & React 19 Compiler Error Resolution

**Files:**
- Modify: `src/context/ThemeProvider.tsx`
- Modify: `src/context/AuthProvider.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/InteractiveBackground.tsx`
- Modify: `src/components/AuthModal.tsx`
- Modify: `src/components/GroupChatDrawer.tsx`
- Modify: `src/components/ExamRadar.tsx`
- Modify: `src/components/CreateGroupModal.tsx`
- Modify: `src/components/resources/SuggestResourceModal.tsx`
- Modify: `src/app/resources/[subjectId]/page.tsx`
- Modify: `src/app/resources/page.tsx`
- Modify: `src/components/AddToHomeScreenBanner.tsx`
- Modify: `src/lib/supabase.ts`
- Modify: `scripts/addAcademicToolsData.js`
- Modify: `scripts/buildUnifiedData.js`
- Modify: `eslint.config.mjs`

**Interfaces:**
- Produces: Clean exit for `npm run lint` with 0 errors and 0 warnings.

- [ ] **Step 1: Fix `scripts/*.js` in `eslint.config.mjs`**

Update `eslint.config.mjs` to ignore standalone migration scripts in `scripts/**` from TypeScript compiler lint rules:
```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/*",
      "out/*",
      "node_modules/*",
      "scripts/*",
    ],
  },
];

export default eslintConfig;
```

- [ ] **Step 2: Fix `ThemeProvider.tsx`**

1. Move `applyTheme` definition above its usage in the component.
2. Initialize `theme` directly from `localStorage` using lazy `useState`:
```typescript
const [theme, setThemeState] = useState<Theme>(() => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem('kantoprep_theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  } catch {
    return 'dark';
  }
});
```
3. Run `applyTheme` inside `useEffect` without synchronous `setThemeState`.
4. Remove unused `mounted` state warning.

- [ ] **Step 3: Fix `AuthProvider.tsx`**

Initialize `currentUser` using lazy `useState`:
```typescript
const [currentUser, setCurrentUser] = useState<StudentProfile | null>(() => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('kantoprep_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id) return parsed;
    }
  } catch {}
  return null;
});
```
Remove synchronous `setCurrentUser` from `useEffect`.

- [ ] **Step 4: Fix `InteractiveBackground.tsx`**

Remove render mutation `themeRef.current = theme;` and place it inside `useEffect`:
```typescript
useEffect(() => {
  themeRef.current = theme;
}, [theme]);
```

- [ ] **Step 5: Fix `AuthModal.tsx`**

1. Replace `id: 'usr_' + Date.now()` inside render body with an event-generated ID or fixed seed `id: 'usr_demo_student'`.
2. Remove unused imports: `AnimatePresence`, `School`, `Lock`, `UserCheck`.

- [ ] **Step 6: Fix `GroupChatDrawer.tsx`**

1. Handle `ambientAudio.stop()` without setting state in effect when closed.
2. Escape unescaped single quotes: replace `'` with `&apos;` in JSX.
3. Remove unused imports: `Bookmark`, `CheckCircle2`.

- [ ] **Step 7: Fix `ExamRadar.tsx` & `CreateGroupModal.tsx`**

1. Initialize `selectedSatSessionId` via lazy `useState`.
2. Remove unused imports in `ExamRadar.tsx` (`Filter`, `Clock`, `Target`, `AlertCircle`, `ExamSessionSchedule`).
3. In `CreateGroupModal.tsx`, initialize state from props directly when modal opens or in handlers, avoiding unconditional `setState` in `useEffect`.

- [ ] **Step 8: Fix `src/app/page.tsx` & `src/app/resources`**

Initialize `groups` from `mockData` and hydrate cleanly on mount without cascaded `setState` loops.
Remove unused import `Sparkles` in `src/app/resources/page.tsx`.

- [ ] **Step 9: Fix `src/lib/supabase.ts` `any` types**

Replace `any` in `searchGroups` and `getGroupMessages` with `unknown` or explicit generic types:
```typescript
export async function searchGroups(query: string): Promise<{ data: StudyGroup[] | null; error: unknown }> { ... }
```

- [ ] **Step 10: Run `npm run lint` and verify 0 errors**

Run: `npm run lint`  
Expected: 0 errors, 0 warnings.

- [ ] **Step 11: Commit**

```bash
git add src/ eslint.config.mjs
git commit -m "refactor: resolve all ESLint and React 19 compiler errors and warnings"
```

---

### Task 6: Performance & Next.js `<Image />` LCP Optimization

**Files:**
- Modify: `src/components/Navbar.tsx`
- Modify: `src/components/SchoolGateScreen.tsx`
- Modify: `src/components/GroupCard.tsx`
- Modify: `src/components/InviteModal.tsx`
- Modify: `src/components/EditProfileModal.tsx`
- Modify: `src/components/SchoolSwitchModal.tsx`

**Interfaces:**
- Replaces raw `<img>` with Next.js `<Image />` or optimized inline SVGs with explicit `width`, `height`, and `alt`.
- Produces: Zero `@next/next/no-img-element` warnings and optimized LCP metrics.

- [ ] **Step 1: Replace raw avatars/logos with Next.js `<Image />`**

In `Navbar.tsx`, `SchoolGateScreen.tsx`, `GroupCard.tsx`, `InviteModal.tsx`, `EditProfileModal.tsx`, and `SchoolSwitchModal.tsx`, import `Image from 'next/image'` and configure avatars with proper sizes:
```tsx
<Image
  src={avatarUrl}
  alt={studentName}
  width={40}
  height={40}
  className="rounded-full object-cover"
/>
```

- [ ] **Step 2: Run `npm run lint` and `npm run build`**

Run: `npm run lint`  
Run: `npm run build`  
Expected: Both pass cleanly with 0 warnings.

- [ ] **Step 3: Commit**

```bash
git add src/components/
git commit -m "perf: optimize avatar and school badge rendering using next/image"
```

---

### Task 7: Accessibility (a11y) & Mobile Viewport Audit

**Files:**
- Modify: `src/components/AuthModal.tsx`
- Modify: `src/components/CreateGroupModal.tsx`
- Modify: `src/components/JoinGroupModal.tsx`
- Modify: `src/components/FeedbackModal.tsx`
- Modify: `src/app/manifest.ts`

**Interfaces:**
- Consumes: WCAG 2.1 AA accessibility guidelines
- Produces: Accessible dialog markup, keyboard navigation support, and validated PWA manifest.

- [ ] **Step 1: Enhance modal dialog accessibility**

Ensure all modals include:
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby="modal-title"`
- Focus trapping and ESC key dismissal.

- [ ] **Step 2: Verify `manifest.ts` PWA metadata**

Verify PWA manifest parameters in `src/app/manifest.ts`:
- Name: `KantoPrep - Tokyo International School Study Network`
- Short Name: `KantoPrep`
- Theme Color: `#0B0F17`
- Background Color: `#0B0F17`
- Display: `standalone`

- [ ] **Step 3: Test responsive layout and keyboard accessibility**

Run: `npm test`  
Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/components/ src/app/manifest.ts
git commit -m "feat: enhance modal a11y attributes and PWA manifest configuration"
```

---

### Task 8: Production CI/CD Pipeline & GitHub Showcase

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `README.md`

**Interfaces:**
- Produces: Automated GitHub Actions pipeline verifying quality on every commit and PR.

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: KantoPrep CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Lint Verification
        run: npm run lint

      - name: TypeScript Strict Check
        run: npx tsc --noEmit

      - name: Run Automated Test Suite
        run: npm test

      - name: Production Build Verification
        run: npm run build
```

- [ ] **Step 2: Update `README.md` with verified badges and college portfolio highlights**

Add CI status badge, Vitest test suite badge, and curriculum alignment breakdown to `README.md`.

- [ ] **Step 3: Run full verification checklist locally**

Run:
1. `npm run lint` -> must output 0 errors, 0 warnings
2. `npx tsc --noEmit` -> must exit with 0
3. `npm test` -> all tests must pass
4. `npm run build` -> production build must succeed

- [ ] **Step 4: Commit and Push**

```bash
git add .github/workflows/ci.yml README.md
git commit -m "ci: add automated github actions workflow and update readme portfolio badges"
```
