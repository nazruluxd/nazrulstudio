# Implementation Plan: Fix Blank White Screen in Preview Window

## Problem Analysis
The AI Studio preview window displays a blank white screen when rendering the application. Based on diagnosis, there are four key contributing factors:
1. **Iframe Framing Restrictions & Security Headers**: In server-rendered dev environments, if security headers or frame options restrict iframe ancestors, browsers render a blank iframe without explicit console logs.
2. **`FadeIn` Opacity Trap in Iframes**: The `FadeIn` component sets initial element opacity to `0` and relies entirely on `IntersectionObserver`. In embedded preview iframes or during initial layout calculations, `isIntersecting` may not fire or may be delayed, causing all major homepage sections to remain invisible (`opacity: 0`).
3. **HTML Canvas Background Defaulting to White**: The `<html>` root tag lacked the dark background class (`bg-[#0B1121]`), causing any layout before paint or any unobserved space to display default white browser canvas.
4. **Missing React Error Boundary**: An uncaught error in any sub-component unmounts the entire React tree in React 18, leaving `#root` completely empty.
5. **Defensive Data Hydration**: Ensure `localStorage` state hydration in `App.tsx` has complete array and visibility guards so corrupted or empty state cannot prevent sections from rendering.

---

## Proposed Changes

### 1. Iframe & Dev Server Embedding Headers (`server.ts`)
- Add Express middleware allowing framing within AI Studio (`frame-ancestors *`, remove conflicting `X-Frame-Options` restrictions).
- Ensure all static and dynamic routes return clean caching headers for instant preview reloads.

### 2. Safeguard `FadeIn` Component (`src/components/FadeIn.tsx`)
- Implement a graceful fallback timeout (e.g., 50ms) so that if `IntersectionObserver` is not supported, delayed, or suppressed inside an iframe, elements automatically become visible (`opacity: 100`).
- Ensure `opacity: 100` is the default or quickly transitioned so content is never stuck at invisible opacity.

### 3. Ensure Dark Theme Background on Root Document (`index.html`)
- Apply `bg-[#0B1121] text-slate-300 min-h-screen` to the `<html>` and `<body>` tags.
- Add an inline fallback splash/loader in `index.html` inside `<div id="root">` with dark background and branding so that even before JS bundles evaluate, the screen is dark and branded rather than white.

### 4. Robust React Error Boundary (`src/components/ErrorBoundary.tsx` & `src/main.tsx`)
- Implement a comprehensive React Error Boundary component that catches runtime errors, displays a sleek dark-themed error report with a 1-click "Reset App State" button, and prevents blank white unmounting.

### 5. Defensive State Initialization (`src/App.tsx`)
- Fortify the `useState` initializer with comprehensive validation for `portfolio`, `showcase`, `skills`, `experience`, `education`, and all `visibility` keys.
- Add a safety check ensuring that if all visibility toggles are somehow off, default sections automatically show.

---

## Verification Plan

### Automated & Build Verification
1. Run `npx tsx` SSR test to verify `App` renders complete HTML without exceptions.
2. Run `compile_applet` to confirm zero TypeScript or bundling issues.
3. Test HTTP curl response with simulated iframe headers (`Sec-Fetch-Dest: iframe`, `X-Forwarded-Proto`, cross-origin) to confirm 200 OK and proper frame headers.

### User Acceptance
- Preview window in AI Studio immediately displays the full dark-themed Nazrul Studio homepage with Hero, Portfolio, Skills, and Serial Placer software banners loaded.
