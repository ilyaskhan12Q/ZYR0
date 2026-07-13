# `docs/ARCHITECTURE.md`

# Zyro Architecture Documentation

> **Purpose**
>
> This document defines the architectural standards of the Zyro platform.
>
> Every contributor and AI coding agent must read this document before modifying the codebase.
>
> The goal is to maintain a clean, scalable, and production-ready architecture throughout the lifetime of the project.

---

# Architecture Philosophy

Zyro follows a **modular, feature-oriented architecture**.

Every feature should be:

* Modular
* Reusable
* Strongly typed
* Easy to test
* Easy to maintain
* Independent where possible

The architecture should prioritize long-term maintainability over short-term convenience.

---

# Technology Stack

## Frontend

* Vite (Single Page Application)
* React 19
* React Router v7
* TypeScript
* Tailwind CSS
* shadcn/ui

---

## Backend

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Storage
* Edge Functions (when required)

---

## Deployment

* GitHub
* Vercel

---

# High-Level System Architecture

```text
Client (Browser)
        │
        ▼
Vite React SPA (React Router v7)
        │
        ├──────── Authentication / Context
        │
        ├──────── Client-side SDK (Service Layer)
        │
        ▼
Supabase
│
├── PostgreSQL
├── Auth
├── Storage
└── Row Level Security
```

---

# Feature Modules

The application is divided into independent feature modules.

Examples include:

* Authentication
* Student
* Company
* Mentor
* Admin
* Internship
* Application
* Offer Letter
* Task Management
* Certificate
* Notifications
* Analytics

Features should remain isolated as much as possible.

---

# Folder Organization Principles

The repository should separate:

* Pages
* Components
* Features
* Services
* Utilities
* Types
* Hooks
* Database
* Documentation

Business logic should never live inside UI components.

---

# Component Architecture

Components should be divided into:

## UI Components

Reusable visual elements.

Examples:

* Button
* Input
* Dialog
* Table
* Badge

---

## Shared Components

Reusable business-independent components.

Examples:

* Navbar
* Sidebar
* Breadcrumbs
* Data Table
* Pagination

---

## Feature Components

Components that belong to a single feature.

Examples:

* Internship Card
* Task List
* Offer Letter Preview
* Certificate Viewer

Feature components should not be reused across unrelated modules unless they become generic enough.

---

# Business Logic

Business logic must not be embedded inside React components.

Business logic belongs in:

* Services (Supabase client calls API layer)
* Utility functions
* Custom hooks

UI components should primarily render data and respond to user interaction.

---

# Database Principles

The database should be fully normalized.

Always use:

* UUID primary keys
* Foreign keys
* Indexes
* Row Level Security
* Timestamps

Avoid:

* Duplicate data
* Circular relationships
* Unnecessary nullable fields
* Business logic in the database unless required

---

# Authentication

Authentication is managed by Supabase Auth.

Authorization must always be enforced using:

* Row Level Security
* Role checks
* Protected routes

Never rely solely on frontend authorization.

---

# Storage

Supabase Storage should contain only platform assets.

Examples:

* Certificates
* Offer Letters
* Images
* Documents

Never store:

* Student project ZIP files
* Source code
* Large videos

Student projects remain on GitHub.

---

# Routing Principles

Use React Router v7 declarative client-side routes consistently.

Protected areas should require authentication via ProtectedRoute.

Role-specific pages should only be accessible to authorized users.

Avoid duplicate routes.

Avoid inconsistent URL patterns.

---

# State Management

Prefer:

* Local component state
* React Context (e.g. AuthContext)
* Client-side API caching (`cache.ts`)

Introduce global state only when necessary.

Avoid unnecessary complexity.

---

# API Principles

When APIs are required:

* Keep them RESTful and predictable
* Validate inputs
* Return typed responses
* Handle errors gracefully
* Never expose sensitive information

Prefer extending existing APIs over creating duplicates.

---

# Error Handling

Every feature should handle:

* Authentication failures
* Authorization failures
* Validation errors
* Network errors
* Database failures
* Storage failures

Errors should be user-friendly while preserving useful logs for debugging.

---

# Security Principles

Always:

* Validate user input
* Enforce authorization
* Respect Row Level Security
* Protect sensitive data
* Sanitize output where appropriate

Never trust client-side validation alone.

---

# UI Consistency

Maintain:

* Existing design system
* Existing spacing
* Existing typography
* Existing colors
* Existing navigation
* Existing interaction patterns

Do not redesign unrelated UI.

---

# Performance Guidelines

Prefer:

* Lazy loading of portal bundles and page routes
* Client-side query caching with TTL
* Efficient database queries
* Pagination for large datasets
* Component reuse

Avoid premature optimization.

---

# Feature Development Workflow

Every feature development and bug correction must follow the official repository branching strategy defined in the [Git Workflow & Branching Strategy](file:///home/ilyaskhan/Projects/zyro-kim/docs/GIT_WORKFLOW.md).

The development sequence is:

1. Create a feature or bugfix branch off `develop` following naming conventions.
2. Design the solution
3. Extend existing modules
4. Reuse existing components
5. Implement backend logic
6. Implement frontend
7. Validate
8. Test
9. Document

Do not skip steps.

---

# Code Standards

Always:

* Use TypeScript
* Use meaningful names
* Keep functions focused
* Keep components small
* Write readable code
* Remove unused code
* Reuse existing utilities

Never:

* Use `any`
* Ignore lint errors
* Ignore type errors
* Duplicate logic
* Leave dead code
* Mix presentation and business logic

---

# Documentation

Every significant feature should include:

* Database changes
* Routing changes
* API changes
* Component changes
* Validation checklist

Documentation should evolve with the project.

---

# Future Expansion

The architecture should support future modules without major restructuring.

Examples:

* AI Career Assistant
* Resume Review
* Interview Preparation
* University Portal
* Hiring Pipeline
* Organization Management
* Advanced Analytics
* Multi-Tenant Support

These additions should integrate into the existing architecture rather than replacing it.

---

# Guiding Principle

Every contribution should leave the codebase in a better state than it was found.

When implementing a feature, ask:

* Can I reuse something that already exists?
* Does this fit the current architecture?
* Is this the simplest maintainable solution?
* Will another developer understand this six months from now?
* Does this preserve consistency across the platform?

If the answer to any of these questions is "no", reconsider the implementation before writing code.
