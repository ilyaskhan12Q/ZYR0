# Contributing to ZYR0

Welcome! We are thrilled that you are interested in contributing to **ZYR0**. Whether you are fixing a bug, designing a new feature, improving documentation, or optimizing performance, your contributions are invaluable to our project and community.

---

## 1. Welcome

**ZYR0** is a modern, database-driven internship and career platform designed to bridge students, companies, and mentors. Our mission is to create a transparent, real-time, and seamless career ecosystem powered by top-tier engineering standards and intuitive UI/UX.

We believe building exceptional software is a team effort. This guide is designed to help you get started quickly and ensure a smooth, enjoyable, and high-impact contribution experience.

Thank you for spending your time and skills to make ZYR0 better for everyone!

---

## 2. Before You Start

Before diving into code, take a few minutes to familiarize yourself with the project's foundation. Having context will save you time and help your pull requests get reviewed faster.

- **Explore Documentation**: Check out our detailed guides in the [`/docs`](./docs) folder:
  - [`ENGINEERING_PRINCIPLES.md`](./docs/ENGINEERING_PRINCIPLES.md) – Core design decisions and coding standards.
  - [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md) – High-level system design and data flows.
  - [`GIT_WORKFLOW.md`](./docs/GIT_WORKFLOW.md) – Detailed branch management and versioning standards.
  - [`PRODUCT_VISION.md`](./docs/PRODUCT_VISION.md) – Platform goals and feature roadmaps.
- **Understand the Project Structure**:
  - `app/` – Main web application (React, Vite, TypeScript, TailwindCSS/Vanilla CSS).
  - `supabase/` – Database schemas, row-level security (RLS) policies, and edge functions.
  - `docs/` – Technical documentation and architecture diagrams.

---

## 3. Development Environment

Follow these steps to set up your local workspace:

### 1. Fork & Clone
Fork the repository on GitHub, then clone your fork locally:
```bash
git clone https://github.com/YOUR-USERNAME/ZYR0.git
cd ZYR0
```

### 2. Install Dependencies
Navigate into the `app` directory and install project packages:
```bash
cd app
npm install
```

### 3. Environment Setup
Copy the environment template file to `.env`:
```bash
cp .env.example .env
```
Fill in your local or staging Supabase credentials in `app/.env`:
```env
VITE_SUPABASE_URL=https://your-supabase-instance.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server
Start the local Vite dev server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`. You're ready to start building!

---

## 4. Choosing Work

To keep our efforts aligned and avoid overlapping work:

- **Browse Issues**: Look through open [GitHub Issues](https://github.com/ilyaskhan12Q/ZYR0/issues).
- **Pick Beginner Issues**: If you are new to the codebase, look for issues labeled `good first issue` or `help wanted`.
- **Discuss First**: For large feature requests, UI redesigns, or architectural changes, please open an issue or comment on an existing one to discuss your proposed approach with maintainers *before* writing code.
- **Claim an Issue**: Leave a quick comment on the issue you wish to work on so maintainers can assign it to you.

---

## 5. Branch Strategy

Always create a dedicated feature branch off the latest `main` branch. **Never commit directly to `main`**.

Use clear, descriptive branch names prefixed with the category of work:

- `feature/` – New features or user-facing enhancements (e.g., `feature/student-portfolio-export`)
- `fix/` – Bug fixes or cleanups (e.g., `fix/offer-letter-pdf-print`)
- `docs/` – Documentation updates (e.g., `docs/contributing-guide`)
- `refactor/` – Code refactoring without behavioral changes (e.g., `refactor/analytics-hooks`)
- `performance/` – Speed, bundle size, or query optimizations (e.g., `performance/seo-prerender`)
- `seo/` – Search engine optimization enhancements (e.g., `seo/meta-tags-audit`)

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

---

## 6. Engineering Workflow

We follow a systematic, disciplined approach to engineering. Every task should progress through these seven steps:

```
Understand ➔ Investigate ➔ Plan ➔ Implement ➔ Verify ➔ Commit ➔ Open PR
```

1. **Understand**: Grasp the user requirement, domain logic, and desired outcome thoroughly.
2. **Investigate**: Trace the codebase, analyze component hierarchies, data schemas, and API handlers.
3. **Plan**: Outline your changes, edge cases, and potential impact on existing modules.
4. **Implement**: Write clean, modular, and self-documenting code that adheres to project patterns.
5. **Verify**: Test your changes locally, check responsive behavior, and run production builds.
6. **Commit**: Make clean, logical, and atomic commits with clear messages.
7. **Open PR**: Submit a pull request with full details and visual evidence.

> 💡 **Core Principle**: Always resolve the **root cause** of an issue rather than patching symptoms with temporary workarounds or hardcoded data fallback hacks.

---

## 7. Coding Standards

To maintain a clean and maintainable codebase, please follow these guidelines:

- **TypeScript Rigor**: Always define proper types and interfaces. Avoid `any` or implicit type casting.
- **Component Design**: Build modular, reusable components. Keep components focused on a single responsibility.
- **Respect Architecture**: Keep data-fetching, state management, and UI rendering cleanly separated. Use Supabase client services for data interactions.
- **No Hardcoded Data**: ZYR0 is database-backed. Do not introduce hardcoded mock statistics or fake growth numbers. Handle empty states gracefully.
- **Styling**: Follow existing styling patterns using custom CSS tokens and utility classes. Keep UI modern, responsive, and accessible.
- **Zero Bloat**: Do not add external dependencies without maintainer approval. Prefer native browser APIs and lightweight utilities.

---

## 8. Verification Checklist

Before staging and committing your work, verify that your changes pass all local quality checks:

- [ ] **Type Check**: Run `npx tsc -b` inside `app/` and ensure there are **0** TypeScript errors.
- [ ] **Build Validation**: Run `npm run build` inside `app/` to ensure Vite bundling and SEO pre-rendering succeed cleanly.
- [ ] **Manual UI Testing**: Test your changes across desktop, tablet, and mobile viewports.
- [ ] **Regression Testing**: Verify that related features and pages remain completely functional.
- [ ] **Clean Code**: Remove unused imports, console log statements, and leftover debug code.

---

## 9. Versioning

ZYR0 follows [Semantic Versioning](https://semver.org/) (`vMAJOR.MINOR.PATCH`).

- **Patch (`x.x.+1`)**: Bug fixes, minor visual cleanups, and performance tweaks.
- **Minor (`x.+1.0`)**: New features, new dashboard pages, or schema updates.
- **Major (`+1.0.0`)**: Breaking architectural changes or major platform overhauls.

Version bumps are managed in `app/package.json`. If your contribution marks a distinct release milestone, maintainers will guide you on updating the version number.

---

## 10. CHANGELOG

Every meaningful change must be documented in [`CHANGELOG.md`](./CHANGELOG.md). We adhere to the [Keep a Changelog](https://keepachangelog.com/) standard.

Add your entry under the current release section using one of the standard categories:

- `### Added` for new features or capabilities.
- `### Changed` for changes in existing functionality.
- `### Fixed` for bug fixes and cleanups.
- `### Refactored` for structural code improvements.
- `### Removed` for removed features or deprecated code.

---

## 11. Commit Messages

We value a clean, readable Git history. Write small, atomic commits that focus on a single logical change. Use the imperative mood (e.g., "Add feature" instead of "Added feature").

### Commit Message Format
```
<type>(<scope>): <short description>
```

### Good Examples
- `feat(student-dashboard): add real-time application status tracker`
- `fix(auth): handle expired token refreshes gracefully`
- `docs(contributing): add comprehensive contributor guide`
- `refactor(analytics): compute dynamic monthly telemetry from database`
- `perf(seo): optimize sitemap generation and static pre-rendering`

---

## 12. Pull Requests

When you are ready to submit your work, open a Pull Request against the `main` branch.

### What every PR should contain:
1. **Title**: Concise summary following the commit convention (e.g., `feat(mentor): implement feedback modal`).
2. **Description**: Clear breakdown of *what* changed and *why*.
3. **Linked Issue**: Reference related issues (e.g., `Closes #42`).
4. **Visual Evidence**: Screenshots or short video clips for any UI or styling changes.
5. **Testing Details**: Summary of manual tests and build validations performed.
6. **Breaking Changes**: Explicit note if your PR changes any database schema, API signature, or environment variables.

---

## 13. Code Review Process

Code review is a friendly, collaborative process focused on maintaining software quality and sharing knowledge.

- **Constructive Feedback**: Maintainers may ask for code refactoring, improved variable naming, edge-case handling, or documentation updates.
- **Iterative Updates**: Make requested changes directly on your branch and push them—the PR will update automatically.
- **Be Patient**: Maintainers review PRs as quickly as possible. Feel free to ping the PR if you haven't received feedback after a few days.

---

## 14. Community & Expectations

We are committed to fostering a welcoming, inclusive, and respectful environment for everyone.

- **Be Respectful**: Treat fellow contributors, reviewers, and maintainers with kindness and empathy.
- **Be Constructive**: Give clear, actionable feedback and be receptive to suggestions.
- **Collaborate**: Ask questions when you're stuck! The team and community are here to help.

---

## 15. Thank You!

Your time, energy, and expertise are what make ZYR0 possible. We are excited to see what you build!

If you have any questions or need guidance, don't hesitate to reach out on GitHub. Let's build the future of career platform technology together! 🚀
