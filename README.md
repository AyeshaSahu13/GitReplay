# GitReplay

**Replay how a codebase was built, and why.**

GitReplay turns a repository's commit history into a guided, replayable story: the base design, every change after it, the reasoning behind each decision, and how the architecture evolved. It is built to help new team members understand a module of a large codebase in minutes instead of days.

> Developed by **Ayush Raj**

---

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [What Makes It Different](#what-makes-it-different)
- [Features](#features)
- [Screens](#screens)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Try It With These Repos](#try-it-with-these-repos)
- [Tech Stack](#tech-stack)
- [Limitations](#limitations)
- [Roadmap](#roadmap)
- [Developer](#developer)

---

## The Problem

When someone joins a company, they usually get one module of a very large codebase. To work on it they need to know:

1. What the module does
2. How its base was designed
3. What changed afterwards, and why

Today they learn this by reading the final code, scrolling a flat `git log`, or asking seniors. The final code shows *what* exists, not *how* or *why* it got there. Diffs show line changes, not intent, trade-offs or architectural impact.

## The Solution

GitReplay imports a repository (public GitHub link or pasted `git log -p`) and presents its history as a three-step learning path:

| Step | Screen | Question it answers |
|------|--------|---------------------|
| 1 | **Overview** | What is this module, and where do I start? |
| 2 | **Timeline** | What changed, and why? |
| 3 | **Architecture** | How did the structure change? |

## What Makes It Different

| Existing approach | What it gives | Gap GitReplay fills |
|-------------------|---------------|---------------------|
| `git log` / GitHub commit list | Linear messages and diffs | No reasoning, no structure view, no guided order |
| File history / blame | Who changed a line and when | Per-file only, hard to follow a cross-file story |
| History visualisers | Animation of activity over time | No code and no explanation of decisions |
| Design docs / ADRs | Written rationale | Separate from the code, not tied to the exact commit |
| Hand-written code tours | Walkthrough of current code | Manual effort, shows today's code not its evolution |

**Key ideas**

- Code, reasoning and architecture in **one synchronized view** per commit
- **ADR-style rationale** (Problem, Decision, Trade-offs) next to the diff
- **Onboarding-first design:** guided tour and key milestones
- **Architecture diff:** modules marked added, modified or existing
- Works on **any public repo link** and exports to **PDF and Markdown**

## Features

- **Guided tour** that replays a module from commit #1
- **Timeline playback** with play/pause, previous/next, speed control and keyboard shortcuts
- **Unified and Split diff** views, with changed-file selector and +/- counts
- **"Why this change" panel:** summary, Problem, Decision, Trade-offs and personal notes
- **Category filters:** Architecture, Performance, Feature, Refactor, Bugfix
- **Architecture view:** module topology by layer, data flow and connections, commit slider
- **AI assistant:** analyze a commit and ask follow-up questions
- **Import:** public GitHub repo link or raw `git log -p`
- **Export:** PDF and Markdown

## Screens

### Overview
Module name and description, stats (commits, contributors, date range, current version), a **Start guided tour** button, current architecture, and the key milestones to read first.

### Timeline
Version slider with one node per milestone, code diff on the left, and the **Why this change** panel on the right with collapsible Problem, Decision, Trade-offs and Notes sections.

### Architecture
Step-by-step view comparing each commit with the previous one. Changed modules are highlighted and unchanged ones are muted, with a list of data flows and whether each link was updated.

> Add screenshots here:
>
> ```
> ![Overview](docs/overview.png)
> ![Timeline](docs/timeline.png)
> ![Architecture](docs/architecture.png)
> ```

## How It Works

1. **Input:** a public GitHub URL (optionally a folder or tag range) or a pasted git log
2. **Fetch:** commits, authors, dates, changed files and diffs
3. **Classify:** tag each commit with a category and version milestone
4. **Explain:** build the Problem / Decision / Trade-offs rationale from commit text plus AI analysis of the diff
5. **Model:** derive modules and links, compare each commit with the previous one
6. **Render and export:** show in the three screens, export to PDF or Markdown

## Getting Started

### Prerequisites

- Node.js 18 or later
- An AI API key (for the AI assistant)

### Installation

```bash
git clone https://github.com/<your-username>/gitreplay.git
cd gitreplay
npm install
```

### Environment variables

Create a `.env` file in the project root (never commit it):

```bash
GEMINI_API_KEY=your_api_key_here
```

### Run

```bash
npm run dev
```

Then open the URL shown in the terminal.

## Usage

1. Open **Import Git Log**.
2. Choose **Fetch Public GitHub Repo** and paste a link (for example `https://github.com/koajs/koa`), or choose **Paste Raw git log -p**.
3. Pick how many recent commits to replay and click **Build Playable Timeline**.
4. Start from **Overview**, press **Start guided tour**, and move through the Timeline and Architecture screens.
5. Use **Analyze with AI** or **Ask question** on any commit.
6. Click **Export** to save the replay as PDF or Markdown.

## Try It With These Repos

| Repository | Why it works well |
|------------|-------------------|
| `koajs/koa` | Small, readable framework with a clear architecture story |
| `pmndrs/zustand` | Tiny state library, quick to replay end to end |
| `vitejs/vite` | Active project with plenty of meaningful changes |
| `jashkenas/underscore` | Small library with simple history |
| `yjs/yjs` | Real-time sync and CRDT concepts |

For large repositories, scope to a single folder or a range between two release tags.

## Tech Stack

> Edit this section to match your implementation.

- **Frontend:** (for example React + TypeScript)
- **Data source:** GitHub REST API
- **AI:** Gemini API
- **Export:** PDF and Markdown generation

## Limitations

- Rationale quality depends on commit message quality and AI accuracy; AI text should be verified against the diff
- The number of commits per replay is limited by GitHub API rate limits and AI quota
- Architecture detection is approximate for some languages and project layouts
- Private repositories need authenticated access

## Roadmap

- [ ] Render AI answers as full Markdown with syntax highlighting
- [ ] Higher commit limits with pagination, folder and tag-range filters
- [ ] Cache AI responses per commit to save quota
- [ ] Private repository support with a GitHub token
- [ ] Pull request discussions and issue links
- [ ] Branch and merge visualisation
- [ ] Onboarding quizzes and team-shared notes

## Developer

**Ayush Raj**

- GitHub: [@ayushraj102](https://github.com/ayushraj102)
- Email: ayushraj1500@gmail.com

---

If you find this project useful, consider giving it a star.
