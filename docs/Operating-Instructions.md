# Zyro Development Operating Instructions

Before implementing any feature, follow this workflow exactly.

## Phase 1 — Repository Analysis

Read the entire repository before making any modifications.

Understand:

* Project structure
* Routing
* Layout hierarchy
* Authentication flow
* Authorization and role permissions
* Database schema
* Existing Supabase integration
* Reusable components
* UI component library
* Shared utilities
* Services
* Hooks
* Existing coding conventions
* Existing design patterns

Do **not** modify any files during this phase.

---

## Phase 2 — Feature Analysis

Read the requested feature carefully.

Determine:

* Which existing modules are affected
* Which existing components can be reused
* Whether new database tables are actually necessary
* Whether existing APIs can be extended instead of creating new ones
* Whether routing changes are required
* Whether new pages are necessary or if existing pages should be extended

Avoid introducing unnecessary complexity.

---

## Phase 3 — Implementation Plan

Before writing code, provide a report containing:

1. Summary of the current architecture
2. Files that will be modified
3. Files that will be created
4. Database changes
5. Routing changes
6. API changes
7. Component hierarchy
8. Security considerations
9. Potential risks
10. Validation strategy

Do not begin implementation until this analysis is complete.

---

## Phase 4 — Implementation

Implement the feature while following these rules:

* Reuse existing components whenever possible.
* Never duplicate business logic.
* Never duplicate routes.
* Never redesign existing UI unless requested.
* Keep components small and focused.
* Follow existing naming conventions.
* Follow existing folder structure.
* Respect existing authentication and authorization.
* Respect Row Level Security policies.
* Use strong TypeScript typing.
* Never use `any`.
* Never disable linting or type checking.
* Keep the implementation production-ready.

---

## Phase 5 — Validation

Before considering the feature complete, verify:

* Project builds successfully
* TypeScript passes
* ESLint passes
* Authentication works
* Authorization works
* Routing works
* Database queries work
* Responsive design is preserved
* Dark mode is preserved
* Existing functionality has not been broken

Fix any issues before proceeding.

---

## Phase 6 — Completion Report

After implementation, provide:

* Summary of the feature
* Files created
* Files modified
* Database migrations
* New API endpoints
* New components
* Manual testing checklist
* Suggested Git commit message

---

## Engineering Principles

Always optimize for:

* Maintainability
* Simplicity
* Readability
* Reusability
* Scalability
* Security
* Performance

Avoid:

* Over-engineering
* Duplicate code
* Duplicate routes
* Unnecessary abstractions
* Unrelated refactoring
* Breaking existing functionality
* Making assumptions without inspecting the codebase

Treat this repository as a production SaaS application. Every change should integrate naturally with the existing architecture and be indistinguishable from the original codebase.
