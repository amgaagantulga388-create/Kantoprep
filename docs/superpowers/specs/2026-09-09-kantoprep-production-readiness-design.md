# KantoPrep: Production Readiness & Engineering Excellence Specification

## Executive Overview
**Project:** KantoPrep (関東プレップ)  
**Author:** Amgaa Gantulga (Aoba-Japan International School, Tokyo)  
**Target:** Production release on Vercel (`kantoprep.vercel.app`) and showcase on GitHub for Tokyo international school peers and college engineering portfolio review.  
**Date:** 2026-09-09  

---

## 1. Objectives & Quality Goals
1. **Student Reliability (Tokyo Pilot):** 100% bug-free user journey across mobile and desktop for students from 10 pilot Tokyo international schools (A-JIS, BST, ASIJ, KIST, St. Mary's, Seisen, ISSH, YIS, Saint Maur, CAJ).
2. **Academic & Engineering Rigor:** Flawless React 19 compiler compliance, zero ESLint errors/warnings, strict TypeScript 5 typing, and zero `any` usage.
3. **Automated Verification:** Comprehensive test suite featuring:
   - Fast unit/integration tests (Vitest) verifying domain validation, safety filters, calendar generation, and exam schedules.
   - E2E smoke tests (Playwright/Puppeteer) verifying core student workflows (Domain gate -> Pod search -> Chat/Pomodoro -> Resource library).
4. **Performance & Accessibility:** WCAG 2.1 AA compliance across Light/Dark luxury themes and Core Web Vitals optimization (Next.js `<Image />` component migration for sub-second LCP).
5. **Continuous Integration:** Automated GitHub Actions workflow (`ci.yml`) enforcing type checking, linting, and automated testing on every pull request and push.

---

## 2. Architecture & Detailed Specifications

### Section 1: Code Quality & React 19 Modernization
* **ESLint & Compiler Purity:**
  * Resolve all 24 errors and 41 warnings reported by `eslint` (React 19 compiler rules).
  * **State Updates inside Effects:** Refactor `src/app/page.tsx`, `AuthProvider.tsx`, `ThemeProvider.tsx`, `ExamRadar.tsx`, `GroupChatDrawer.tsx`, and `SuggestResourceModal.tsx` to eliminate synchronous `setState` in `useEffect` (using initialization states, event-driven updates, or `useLayoutEffect` where synchronous DOM measurements are required).
  * **Render Purity:** Replace impure `Date.now()` calls during render in `AuthModal.tsx` with deterministic IDs or generation inside event handlers.
  * **Ref Access during Render:** Fix `InteractiveBackground.tsx` to synchronize `themeRef` inside an effect or event listener rather than mutating `themeRef.current` during render body.
  * **Next.js `<Image />` Migration:** Replace raw `<img>` tags across `Navbar.tsx`, `SchoolGateScreen.tsx`, `GroupCard.tsx`, `InviteModal.tsx`, and `EditProfileModal.tsx` with Next.js `<Image />` or optimized inline SVGs to optimize Largest Contentful Paint (LCP) and prevent layout shift.
  * **Type Hardening:** Replace loose `any` types in `src/lib/supabase.ts` with explicit Supabase query return types.

### Section 2: Automated Testing Infrastructure (TDD & E2E)
* **Testing Framework Selection:**
  * **Vitest + @testing-library/react + jsdom:** High-performance, native ESM/TypeScript testing framework seamlessly compatible with Next.js 16 and Tailwind v4.
  * **Playwright / Puppeteer:** Headless browser automation for end-to-end integration and accessibility testing.
* **Unit & Domain Test Coverage (`src/__tests__/`):**
  * `safety.test.ts`:
    * PII detection (phone number formats, Japanese phone numbers, private physical addresses, line IDs).
    * Academic dishonesty heuristics (requests for unreleased exam leaks, markscheme purchasing, exam cheating solicitation).
    * Token-bucket rate limiting enforcement.
  * `calendar.test.ts`:
    * RFC 5545 `.ics` formatting, timezone specification (Asia/Tokyo), geolocation coordinates, and Google Calendar deep-link generation.
  * `examSchedule.test.ts`:
    * D-day calculations for SAT, IB Diploma, AP exams, and boundary edge cases (past dates, day-of exams).
  * `constants.test.ts`:
    * School domain validation: strict matching of `@students.aobajapan.jp`, `@bst.ac.jp`, etc., and rejection of spoofed subdomains (`@fake.students.aobajapan.jp`, `@students.aobajapan.jp.evil.com`).
* **E2E Student Journey Scenarios:**
  1. *School Gatekeeper Flow:* Non-authenticated visitor arrives -> School Gate Screen is displayed -> School domain selected -> Valid domain allows mock/OTP transition -> Main dashboard loads.
  2. *Pod Discovery & Pomodoro Flow:* Student filters pods by curriculum (IB DP) and subject (Math AA HL) -> Opens pod drawer -> Toggles 25/5 Pomodoro focus timer -> Tests quick chat status broadcast.
  3. *Academic Resources & Tooling Flow:* Navigation to `/resources` -> Selects IB Mathematics -> Verifies Formula Booklet drawer opens -> Verifies TI-84 Online Calculator modal launches correctly.

### Section 3: Accessibility (a11y) & Mobile PWA Polish
* **Color Contrast & Theme Auditing:**
  * Audit background and text contrast across dark (`#0B0F17`, `#111827`) and light (`#F8FAFC`, `#FFFFFF`) palettes to guarantee a minimum 4.5:1 ratio for standard text (WCAG AA).
* **ARIA & Focus Accessibility:**
  * Ensure modals (`AuthModal`, `CreateGroupModal`, `JoinGroupModal`, `FeedbackModal`) maintain `role="dialog"`, `aria-modal="true"`, accessible headings, and escape key listener.
  * Interactive buttons and status chips equipped with meaningful `aria-label`s.
* **PWA & Mobile Polish:**
  * Validate `manifest.ts` icons (`icon.png`, `apple-icon.png`), theme colors, and display configuration.
  * Test responsive layouts across mobile (390px iPhone), tablet (820px iPad), and desktop (1440px).

### Section 4: CI/CD Pipeline & GitHub Showcase
* **GitHub Actions Workflow (`.github/workflows/ci.yml`):**
  * Step 1: Checkout repository.
  * Step 2: Setup Node.js 20 with npm caching.
  * Step 3: `npm ci`.
  * Step 4: `npm run lint` (zero warnings tolerance).
  * Step 5: `npx tsc --noEmit` (strict TypeScript check).
  * Step 6: `npm test` (Vitest suite execution).
  * Step 7: `npm run build` (Next.js production build verification).
* **README & Documentation Enhancement:**
  * Embed verified build and test badges.
  * Add clear architecture diagrams and technical highlights designed for university admissions officers and developer contributors.

---

## 3. Verification & Success Criteria
| Stage | Verification Command / Method | Success Threshold |
| :--- | :--- | :--- |
| **Lint & Purity** | `npm run lint` | 0 errors, 0 warnings |
| **Type Check** | `npx tsc --noEmit` | Clean exit (code 0) |
| **Unit Tests** | `npm test` | 100% passing tests across all domain test suites |
| **Production Build** | `npm run build` | Successful static page & Turbopack build |
| **A11y & E2E** | Headless automated runs & responsive validation | Zero accessibility violations, all flows complete |
