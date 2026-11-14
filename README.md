# GitReplay

GitReplay is an interactive Git commit timeline and architecture visualizer built to help engineers understand how a codebase evolved—commit by commit, file by file, and decision by decision.

## Key Features

- **Overview, Timeline & Architecture Views**: Onboarding summary with guided tour, synchronized commit timeline replay with lazy diff loading, and layered architecture visualization showing module evolution over time.
- **Live Public & Token-Authenticated GitHub Import**: Import up to 200 commits from any public (or token-authenticated private) GitHub repository with folder path, date range, tag/release filters, milestone grouping, and remaining rate-limit visibility.
- **AI Architectural Analysis & Diff Q&A**: Deep commit analysis and multi-turn persona chat powered by server-side Gemini endpoints (`/api/ai/*`), rendered with sanitized Markdown and syntax-highlighted code blocks.
- **IndexedDB & Optional Cloud Sync**: Offline-first caching for fetched GitHub commits/diffs and AI answers in IndexedDB, with optional Firebase Google Sign-In for syncing saved repositories, commit annotations, and AI history across devices.
- **Markdown & PDF Exports**: Export a structured onboarding summary as Markdown or a printable PDF report.

---

## Local Development

### Prerequisites
- Node.js 20+ (Node 22 recommended)
- npm

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and add your Gemini API key if using AI features:
   ```bash
   cp .env.example .env
   ```
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Start the Express + Vite dev server on `http://localhost:3000`:
   ```bash
   npm run dev
   ```

---

## Hosting on GitHub Pages

This repository includes a ready-to-use GitHub Actions workflow at `.github/workflows/deploy.yml` and relative asset configuration in `vite.config.ts`.

### Steps

1. Push this repository to GitHub (on the `main` branch).
2. In your GitHub repository, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
3. Push to `main` (or trigger **Deploy to GitHub Pages** manually from the **Actions** tab).

The workflow automatically:
- Runs TypeScript type-checking (`npm run lint`)
- Builds the static bundle with `VITE_BASE_PATH=/<your-repo-name>/`
- Copies `dist/index.html` to `dist/404.html` for client-side SPA routing and adds `.nojekyll`
- Deploys `dist/` to GitHub Pages

### Optional: Connecting AI Features on GitHub Pages

GitHub Pages serves static files only and cannot hold a secret `GEMINI_API_KEY`. On GitHub Pages without a backend URL, all GitHub repository importing, timeline playback, diffs, IndexedDB caching, and Markdown/PDF exports continue to work normally.

To enable AI Commit Analysis and AI Chat on a GitHub Pages deployment:

1. Deploy `server.ts` (e.g., on Cloud Run, Render, Fly.io, or Railway) with `GEMINI_API_KEY` set in its environment and optional `ALLOWED_ORIGIN=https://<username>.github.io`.
2. In your GitHub repository, go to **Settings → Secrets and variables → Actions → Variables** and create a variable named `VITE_API_BASE_URL` pointing to your deployed backend URL (e.g., `https://gitreplay-api.example.com`).
3. Re-run the GitHub Pages workflow.

### Optional: Enabling Google Sign-In on GitHub Pages

If you use Firebase Google Sign-In on GitHub Pages, add `<your-username>.github.io` to **Firebase Console → Authentication → Settings → Authorized domains**.

---

## Full-Stack Production Build (Node + Express)

To run both the frontend bundle and `/api/ai/*` endpoints from a single server:

```bash
npm run build
NODE_ENV=production npm start
```
