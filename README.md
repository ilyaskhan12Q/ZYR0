<p align="center">
  <a href="https://github.com/ilyaskhan12Q/ZYR0">
    <img src="app/public/zyro-logo.png" alt="ZYR0 Logo" width="160" />
  </a>
</p>

<h1 align="center">ZYR0</h1>

<p align="center">
  <strong>A modern, transparent, and project-driven internship and workforce readiness platform.</strong>
</p>

<p align="center">
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/version-v0.38.1-blue.svg" alt="Version" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Proprietary-red.svg" alt="License" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61dafb.svg?logo=react" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-3178c6.svg?logo=typescript" alt="TypeScript" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7-646cff.svg?logo=vite" alt="Vite" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg?logo=supabase" alt="Supabase" /></a>
</p>

---

## Overview

**ZYR0** bridges the gap between academic education and practical industry experience. Millions of students graduate annually with strong theoretical foundations but limited opportunity to demonstrate real-world engineering capability. Concurrently, organizations face administrative overhead when managing remote, project-based internship programs and candidate evaluations.

ZYR0 solves this challenge by delivering a centralized ecosystem where companies host structured internships, delegate practical tasks, track candidate progress, and evaluate submissions. Students work on real projects hosted on public GitHub repositories, receive structured rubric-based feedback from mentors, and earn cryptographically verifiable digital certificates upon program completion.

### Target Audiences

- **Students**: Build proof-of-work engineering portfolios through real projects, earn verified credentials, and accelerate career entry.
- **Organizations**: Streamline internship management from application review to automated offer letter distribution and task evaluation.
- **Mentors**: Guide interns through structured code reviews, rubric-based task scoring, and direct feedback loops.
- **Educational Institutions**: Monitor student internship outcomes, practical skills acquisition, and completion statistics with total transparency.

---

## Core Features

### Premium Visual Identity & Dynamic Hero System
- **Enterprise Display Typography**: Powered by **Sora** display font paired with **Inter** body typography for an authoritative brand identity.
- **Spring-Animated Text Rotating Engine**: Dynamic phrase rotator built with spring physics and accessibility fallbacks.
- **High-Performance Canvas Particle System**: Light-weight, 60 FPS HTML5 2D Canvas particles (`CanvasParticles`) respecting device constraints and reduced motion settings.
- **Glassmorphism UI & Accent Glows**: Custom HSL color tokens featuring Emerald → Cyan → Indigo gradients and layered ambient glows.

### Modular Task Management & Review Workspace
- **KPI Metrics Header**: Real-time task statistics tracking active, completed, and pending submissions with tab-based filtering.
- **Advanced Multi-Criterion Filtering**: Filter by search terms, task status, priority levels, and sort orders with instant grid/table view toggles.
- **Single & Bulk Task Delegation**: Delegate assignments to individual interns or bulk-assign to all active interns with automated notifications.
- **PR-Style Split-Pane Review Drawer**: Dedicated evaluation interface for mentors featuring rubric-based scoring, inline code review, and structured feedback templates.

### Offer Letter Management & High-Fidelity Printing
- **High-Fidelity Document Rendering**: Automated generation of official offer letters complete with company branding, security seals, and owner signatures.
- **Offline Canvas QR Code Generation**: Instant, network-independent canvas-rendered QR verification badges embedded into every document.
- **Print Layout Isolation**: Purpose-built `@media print` rules ensuring pixel-perfect browser-native printing (`window.print()`) and PDF export without UI clutter.

### Verifiable Digital Credentials & Certificate Engine
- **Cryptographically Signed Certificates**: Publicly verifiable digital certificates issued to interns upon successful program completion.
- **High-Fidelity A4 Landscape Layout**: Professional certificate rendering featuring guilloché borders, security seals, and supervisor signature blocks.
- **Dynamic Signature & Logo Integration**: Real-time embedding of mentor/supervisor signatures and official company logos from database profiles.
- **Public Verification Endpoint**: Direct verification endpoint (`/verify-certificate/:code`) allowing employers and institutions to validate certificate authenticity.

### Stale-While-Revalidate (SWR) Caching & Instant Sync
- **Service-Layer SWR Caching**: In-memory caching engine reducing redundant Supabase queries while guaranteeing fresh data delivery.
- **Targeted Cache Invalidation**: Automatic cache-purging (`clearCache`) across public, student, company, and admin portals upon internship, task, or application state changes.

### Database-Backed Dynamic Telemetry & Analytics
- **Live Platform Metrics**: 100% database-backed telemetry tracking application volumes, active internships, user growth, and completion rates.
- **Zero-Placeholder Architecture**: Stripped-down mock metrics ensuring all dashboard analytics reflect real PostgreSQL data.

### Official Community & Social Connectivity
- **Official Brand Connectivity**: Integrated CTAs for the official **[ZYR0 LinkedIn Profile](https://linkedin.com/company/zyr0-co)** and **[WhatsApp Channel](https://whatsapp.com/channel/0029Vb8m3OK5Ui2W8xNLgy0F)** across navigation headers, footers, and contact sections.

### Mobile Performance & SEO Engine
- **Per-Page Route Code Splitting**: Sub-15 kB initial page loads across portal routes with lazy-loaded vendor chunks (e.g., Recharts).
- **Pre-Rendered Static SEO**: Automated script (`generate-seo.js`) generating static HTML files with JSON-LD Organization, FAQPage, and ContactPage schemas.

---

## Tech Stack

### Frontend Architecture
- **Framework**: [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Language**: [TypeScript 5.9](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) + Custom CSS Design Tokens
- **UI & Motion**: [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/), and [Framer Motion](https://www.framer.com/motion/)

### Backend & Database
- **Platform**: [Supabase](https://supabase.com/) (PostgreSQL with Row-Level Security)
- **Authentication**: Supabase Auth (JWT & Role-Based Access Control)
- **Storage**: Supabase Storage buckets for resumes, avatars, and platform assets
- **Hosting & Edge**: [Vercel](https://vercel.com/) + Supabase Edge Functions

### Quality & Tooling
- **Build System**: Vite & TypeScript Compiler (`tsc`)
- **Linting & Code Standards**: ESLint 9 + PostCSS + Tailwind Animate
- **SEO Engine**: Pre-rendering script generating static pages and dynamic meta tags

---

## Project Structure

```text
zyro-kim/
├── app/                        # Main web application frontend
│   ├── public/                 # Static web assets & pre-rendered SEO pages
│   ├── scripts/                # Automated SEO & sitemap pre-rendering scripts
│   │   └── generate-seo.js
│   ├── src/
│   │   ├── components/         # Reusable UI & feature components
│   │   │   ├── common/         # Buttons, modals, spinners, and badges
│   │   │   ├── company/        # Verification gate & company widgets
│   │   │   ├── navigation/     # Public/Dashboard headers, footers, & social CTAs
│   │   │   ├── tasks/          # Modular task management workspace & review drawer
│   │   │   └── ui/             # Radix UI primitives & text animation engines
│   │   ├── config/             # Site configuration (`site.ts`) & social links
│   │   ├── contexts/           # React context providers (AuthContext)
│   │   ├── lib/                # Utility helpers & request deduplication registry
│   │   ├── pages/              # Portal views (Student, Company, Mentor, Admin, Public)
│   │   ├── services/           # Supabase service layer with SWR caching
│   │   └── types/              # TypeScript interfaces & database schemas
│   ├── package.json            # Node.js dependencies & npm scripts
│   └── vite.config.ts          # Vite build, chunking, & alias configuration
├── branding/                   # Official logo assets, social graphics, & identity
├── docs/                       # Architecture, engineering specs, & performance reports
│   ├── ARCHITECTURE.md
│   ├── ENGINEERING_PRINCIPLES.md
│   ├── FEATURE_STATUS.md
│   ├── GIT_WORKFLOW.md
│   ├── OPTIMISTIC_UPDATES.md
│   ├── PRODUCT_VISION.md
│   ├── REQUEST_DEDUPLICATION.md
│   ├── STALE_WHILE_REVALIDATE.md
│   ├── SUPABASE_EMAIL_TEMPLATES.md
│   └── performance/            # Mobile audit reports & benchmarking data
├── supabase/                   # Database migrations, RLS policies, & Edge Functions
├── CHANGELOG.md                # Detailed release history and version tracking
├── CONTRIBUTING.md             # Guidelines for community contributions
├── LICENSE                     # Proprietary license — all rights reserved
├── README.md                   # Project overview & documentation
└── SECURITY.md                 # Vulnerability disclosure & security policies
```

---

## Quick Start

### Prerequisites

Ensure your environment meets the following requirements:
- **Node.js**: `v18.0.0` or higher (v20+ recommended)
- **npm**: `v9.0.0` or higher
- **Git**: `v2.30.0` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ilyaskhan12Q/ZYR0.git
   cd ZYR0
   ```

2. **Install project dependencies**:
   ```bash
   cd app
   npm install
   ```

### Environment Configuration

Create a `.env` file in the `app/` directory by copying the example environment file:

```bash
cp .env.example .env
```

Configure your Supabase URL, Anonymous Key, and optional social links in `app/.env`:

```env
VITE_SUPABASE_URL=https://your-supabase-instance.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_LINKEDIN_COMPANY_URL=https://linkedin.com/company/zyr0-co
VITE_WHATSAPP_CHANNEL_URL=https://whatsapp.com/channel/0029Vb8m3OK5Ui2W8xNLgy0F
```

### Development Server

Start the local Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Production Build & Pre-Rendering

To compile TypeScript code, generate optimized production assets, and execute the static SEO pre-rendering pipeline:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## Documentation

For technical details, architectural blueprints, and engineering standards, explore the [`/docs`](./docs) directory:

- **[Product Vision](./docs/PRODUCT_VISION.md)** — Core mission, target audience, and platform roadmap.
- **[Architecture Guide](./docs/ARCHITECTURE.md)** — System architecture, database patterns, and service boundaries.
- **[Engineering Principles](./docs/ENGINEERING_PRINCIPLES.md)** — Code quality benchmarks, type safety rules, and performance standards.
- **[Optimistic Updates](./docs/OPTIMISTIC_UPDATES.md)** — Frontend state synchronization and caching strategy.
- **[Request Deduplication](./docs/REQUEST_DEDUPLICATION.md)** — API request deduplication registry and performance optimization.
- **[Stale-While-Revalidate Caching](./docs/STALE_WHILE_REVALIDATE.md)** — SWR caching patterns and automatic cache invalidation.
- **[Feature Status](./docs/FEATURE_STATUS.md)** — Current status and implementation breakdown of core features.
- **[Git Workflow](./docs/GIT_WORKFLOW.md)** — Branching model, commit conventions, and pull request policies.
- **[Security Policy](./SECURITY.md)** — Vulnerability reporting channels and row-level security implementation.
- **[Changelog](./CHANGELOG.md)** — Release history and detailed feature changes.

---

## Contributing

We welcome contributions from the developer community! Whether fixing a bug, enhancing UI accessibility, or proposing a new feature, your help is appreciated.

Please review **[CONTRIBUTING.md](./CONTRIBUTING.md)** before opening a pull request to ensure adherence to our branching conventions, commit standards, and code formatting rules.

---

## Security

Security is fundamental to ZYR0. If you discover a security vulnerability or security defect, please report it privately according to our **[SECURITY.md](./SECURITY.md)** guidelines rather than opening a public issue.

---

## License

This project is proprietary software. All rights reserved. See the **[LICENSE](./LICENSE)** for the full terms. Third-party open-source libraries used within this project remain under their respective licenses.

---

## Acknowledgements

ZYR0 is made possible through open-source software built by amazing communities, including React, Vite, Supabase, Tailwind CSS, Radix UI, Lucide, and TypeScript. We extend our sincere gratitude to all open-source maintainers.

---

## From the Core Team

> ZYR0 was founded on a straightforward belief: **practical engineering capability should be demonstrated through real proof of work, not just academic credentials.** We view software development as a craft rooted in clarity, accountability, and continuous improvement.

We are deeply grateful to everyone who tests, uses, or contributes to ZYR0. Every bug report, code submission, and feedback note brings us closer to shaping the future of workforce readiness.

