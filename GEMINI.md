# KantoPrep - Project Architecture & Agent Rules

## Project Overview
KantoPrep is a medical/board exam preparation application built with Next.js 16 (App Router), React 19, Supabase, and Tailwind CSS v4.

## Key Directory Structure
- `src/app/`: Next.js 16 App Router pages, layouts, and route handlers.
- `src/components/`: Reusable React components using Tailwind CSS v4 and Framer Motion.
- `src/context/`: Global React state / context providers.
- `src/lib/`: Helper utilities, Supabase client initialization, and database queries.
- `src/types/`: TypeScript interface and type declarations.
- `src/__tests__/`: Unit and integration test suites using Vitest and React Testing Library.

## Core Commands
- **Run dev server**: `npm run dev`
- **Run tests**: `npm test` (executes `vitest run`)
- **Lint code**: `npm run lint` (executes `eslint`)
- **Build project**: `npm run build`

## Autonomous Agent Directives (No Manual Babysitting)
1. **Self-Verification**: After making any code changes, always execute `npm test` to ensure no regressions were introduced.
2. **Auto-Fixing**: If `npm test` or `npm run lint` fails, systematically diagnose the failure and apply the fix automatically before completing the task. Do not stop to ask the user to fix test failures.
3. **App Router Conventions**: Follow Next.js 16 App Router standards. Mark client-side interactive components with `'use client';` at the top.
4. **Token Optimization**: Avoid reading `.next/`, build artifacts, or `package-lock.json`.
