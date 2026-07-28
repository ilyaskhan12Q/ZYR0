# ZYR0

> A modern, transparent, and project-driven internship and workforce readiness platform.

## Overview

ZYR0 bridges the gap between academic education and practical industry experience. Millions of students complete their education each year with strong theoretical knowledge but limited opportunity to demonstrate real-world engineering capability. Concurrently, organizations face administrative overhead when hosting and managing remote or project-based internship programs.

ZYR0 addresses this challenge by providing a centralized ecosystem where companies host structured internship opportunities, delegate practical tasks, track candidate progress, and evaluate submissions. Students work on real projects hosted on public GitHub repositories, receive structured feedback from mentors, and earn cryptographically verifiable digital certificates upon completion.

The platform serves four primary audiences:
- **Students**: Build proof-of-work portfolios through practical projects and verified achievements.
- **Organizations**: Streamline internship administration from candidate review to final performance evaluation.
- **Mentors**: Guide interns through code reviews, rubric-based task scoring, and structured feedback loops.
- **Educational Institutions**: Track student internship outcomes and practical skills acquisition with full transparency.

## Core Features

- **Role-Based Portals**: Tailored interfaces for Students, Companies, Mentors, and Administrators.
- **GitHub-First Submission Model**: Direct integration with public GitHub repositories for code review and submission tracking.
- **Structured Task Workspaces**: Responsive grid and tabular interfaces for delegating, tracking, and reviewing intern assignments.
- **Automated Offer Letter Workflows**: Digital offer letter generation, delivery tracking, and candidate acceptance flows.
- **PR-Style Review Drawer**: Split-pane code evaluation drawer for mentors with custom rubric scoring and structured feedback.
- **Verifiable Digital Credentials**: Cryptographically signed certificates with public verification endpoints.
- **Live Telemetry & Analytics**: Dynamic metrics tracking application volumes, active internships, and program completion rates.

## Tech Stack

### Frontend
- **Framework**: React 19 with Vite
- **Routing**: React Router v7
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS & Vanilla CSS Design Tokens
- **UI Primitives**: Radix UI & Lucide Icons

### Backend & Infrastructure
- **Database & Auth**: Supabase (PostgreSQL with Row-Level Security)
- **Authentication**: Supabase Auth (JWT & Role-Based Access Control)
- **Storage**: Supabase Storage for platform assets and generated documents
- **Deployment**: Vercel

### Tooling & Quality
- **Build System**: Vite & TypeScript compiler (`tsc`)
- **Linting & Formatting**: ESLint & PostCSS
- **SEO Engine**: Custom pre-rendering script for static page generation and dynamic metadata

## Project Structure

```text
zyro-kim/
├── app/                  # Main web application frontend
│   ├── src/
│   │   ├── components/   # Modular UI, layout, and feature components
│   │   ├── pages/        # Student, company, mentor, admin, and public views
│   │   ├── services/     # Supabase API services and query caching layer
│   │   ├── lib/          # Helper utilities and request deduplication registry
│   │   └── types/        # TypeScript interfaces and type definitions
│   ├── public/           # Static web assets and pre-rendered SEO files
│   └── package.json
├── branding/             # Brand logos, visual identity assets, and media
├── docs/                 # System architecture, workflows, and engineering specs
├── supabase/             # Database migrations, RLS policies, and seed data
├── CHANGELOG.md          # Release history and version updates
├── CONTRIBUTING.md       # Contribution guidelines and workflow rules
├── LICENSE               # Open-source MIT License terms
└── SECURITY.md           # Vulnerability reporting and security policies
```

## Quick Start

### Prerequisites

Ensure the following dependencies are installed on your environment:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: v2.30.0 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ilyaskhan12Q/ZYR0.git
   cd ZYR0
   ```

2. Navigate into the application directory and install packages:
   ```bash
   cd app
   npm install
   ```

### Environment Setup

Create a `.env` file inside the `app/` directory by copying the provided template:

```bash
cp .env.example .env
```

Configure your Supabase credentials in `app/.env`:

```env
VITE_SUPABASE_URL=https://your-supabase-instance.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Running Locally

Start the Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be available locally at `http://localhost:5173`.

### Production Build

To compile TypeScript code, generate the production asset bundle, and run the static SEO generation script:

```bash
npm run build
```

To preview the built production site locally:

```bash
npm run preview
```

## Documentation

Comprehensive engineering documentation is maintained in the [`/docs`](./docs) directory:

- **[Product Vision](./docs/PRODUCT_VISION.md)**: Product mission, core philosophy, and feature scope.
- **[Architecture Guide](./docs/ARCHITECTURE.md)**: System design, feature isolation principles, and data flow patterns.
- **[Engineering Principles](./docs/ENGINEERING_PRINCIPLES.md)**: Coding conventions, performance benchmarks, and quality gates.
- **[Git Workflow](./docs/GIT_WORKFLOW.md)**: Branching policy, commit message formatting, and PR requirements.
- **[Security Policy](./SECURITY.md)**: Vulnerability reporting guidelines and defense-in-depth security measures.
- **[Changelog](./CHANGELOG.md)**: Versioned history of features, optimizations, and fixes.

## Contributing

Contributions from the developer community are welcome. Whether you are addressing a bug, optimizing performance, or proposing a workflow improvement, your help is appreciated.

Please read **[CONTRIBUTING.md](./CONTRIBUTING.md)** before opening a pull request to understand our branching standards, code formatting expectations, and submission process.

## Security

We take security seriously. If you discover a vulnerability, please review our **[SECURITY.md](./SECURITY.md)** for private reporting channels and disclosure policies.

## License

This project is licensed under the MIT License. See the **[LICENSE](./LICENSE)** file for full terms and conditions.

## Acknowledgements

ZYR0 is built using tools and libraries created by the open-source community, including React, Vite, Supabase, Tailwind CSS, Radix UI, Lucide, and TypeScript. We appreciate the hard work of all maintainers whose tools make this platform possible.

## From the Developers

ZYR0 was founded on a straightforward belief: practical skills should be demonstrated through real work, not just academic credentials. We view software engineering as a discipline rooted in craft, clarity, and continuous iteration.

We are truly grateful to everyone who tests, uses, or contributes to ZYR0. Building high-quality software is a collaborative journey, and every feedback submission, bug fix, and feature contribution helps move the platform forward. We are excited about what lies ahead and look forward to shaping the future of workforce readiness together.
