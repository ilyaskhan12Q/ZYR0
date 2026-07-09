# `docs/ENGINEERING_PRINCIPLES.md`

# Zyro Engineering Principles & Development Memory

> **Purpose**
>
> This document serves as the permanent engineering guideline for all future development of Zyro.
>
> Every AI coding agent (Claude Code, Codex, Cursor, etc.) **must read and follow this document before making any changes**.
>
> This document has higher priority than implementation convenience.

---

# Project Vision

Zyro is **NOT** a Learning Management System (LMS).

Zyro is **NOT** an online course platform.

Zyro is an **Internship & Workforce Readiness Platform**.

Our mission is to provide a structured environment where organizations can manage project-based internships and students can demonstrate practical skills through real-world work.

The platform exists to bridge the gap between academic learning and industry experience.

---

# Core Philosophy

Students learn independently.

Organizations evaluate practical work.

Mentors provide guidance.

Zyro manages the internship lifecycle.

We are **not responsible for teaching**.

We are responsible for providing a professional internship experience.

---

# Primary Workflow (Never Break)

```
Student

↓

Browse Internship

↓

Apply

↓

Company Reviews Application

↓

Accepted

↓

Offer Letter Generated

↓

Student Accepts Offer

↓

Internship Workspace Opens

↓

Task Assigned

↓

Student Builds Project

↓

Student Submits GitHub Repository

↓

Mentor Reviews Submission

↓

Revision / Approval

↓

(Optional Quiz)

↓

Final Evaluation

↓

Certificate Generated

↓

Certificate Verification

↓

Internship Completed
```

Every new feature should strengthen this workflow.

Never redesign this flow unless explicitly instructed.

---

# Platform Scope

## Zyro DOES

* Internship Management
* Student Management
* Company Management
* Mentor Management
* Admin Management
* Applications
* Offer Letters
* Internship Workspace
* Task Management
* GitHub Submission
* Mentor Reviews
* Progress Tracking
* Optional Quizzes
* Digital Certificates
* Certificate Verification
* Notifications
* Analytics

---

## Zyro DOES NOT

* Host video courses
* Teach programming
* Replace YouTube
* Replace Coursera
* Replace Udemy
* Replace LMS systems
* Store student source code
* Become a social media platform

---

# Student Responsibilities

Students are responsible for

* Learning independently
* Researching solutions
* Building projects
* Writing documentation
* Managing GitHub repositories
* Solving assigned problems

---

# Company Responsibilities

Companies are responsible for

* Creating internships
* Creating project tasks
* Reviewing submissions
* Providing feedback
* Evaluating interns
* Completing final assessments

---

# Mentor Responsibilities

Mentors

* Review GitHub repositories
* Request revisions
* Approve submissions
* Evaluate progress
* Score interns
* Approve completion

---

# Zyro Responsibilities

Zyro provides

* Infrastructure
* Authentication
* Dashboards
* Internship lifecycle
* Task tracking
* Progress tracking
* Certificates
* Offer letters
* Verification
* Notifications

---

# GitHub First Principle

Student projects should NEVER be uploaded to Zyro.

Students submit

* GitHub Repository URL

Optional

* Live Demo URL

Optional

* Documentation URL

Advantages

* No storage costs
* Professional workflow
* Public portfolio
* Commit history
* Real software engineering practices

---

# Current MVP Features

## Completed

* Authentication
* Google OAuth
* LinkedIn OAuth
* Role-Based Authentication
* Student Dashboard
* Company Dashboard
* Admin Dashboard
* Internship Listings
* Internship Applications
* Profile Management
* Responsive UI
* Supabase Integration
* GitHub Version Control
* Automatic Deployment
* Landing Pages
* Public Pages
* Protected Routes
* Database Integration
* Production Deployment

---

# Features Remaining

## High Priority

### Offer Letter System

* Offer Letter Generation
* PDF Generation
* Storage
* Email Delivery
* Dashboard Download
* Acceptance / Rejection
* Offer Status Tracking

---

### Internship Workspace

* Internship Overview
* Timeline
* Task Board
* Progress Tracking
* Submission History
* Mentor Feedback
* Workspace Navigation

---

### Task Management

* Create Tasks
* Assign Tasks
* Due Dates
* Difficulty
* Acceptance Criteria
* Estimated Duration
* Task Status

---

### GitHub Submission

* Repository URL Submission
* Live Demo URL
* Notes
* Submission History
* Validation

---

### Mentor Review

* Review Submission
* Approve
* Reject
* Request Revision
* Feedback
* Score

---

### Quiz System (Optional)

* Quiz Creation
* Quiz Assignment
* Quiz Submission
* Results

---

### Certificate System

* Automatic Generation
* QR Verification
* Public Verification Page
* Certificate Download

---

### Notifications

* Application Updates
* Offer Letters
* Task Assignments
* Submission Reviews
* Certificate Issued

---

### Analytics

Student Analytics

Company Analytics

Admin Analytics

Internship Reports

---

# Development Priorities

Always implement features in this order.

1. Infrastructure

2. Database

3. Authentication

4. Authorization

5. Backend Logic

6. API

7. Frontend

8. Validation

9. Testing

10. Documentation

Never reverse this order.

---

# Engineering Rules

## Before Coding

Always

* Read repository
* Understand architecture
* Inspect routing
* Inspect layouts
* Inspect authentication
* Inspect reusable components
* Inspect existing patterns
* Reuse existing code

Never assume.

---

## Before Creating

Always ask

Does this already exist?

Can it be reused?

Can it be extended?

Avoid duplication.

---

## Components

Prefer

Reusable Components

Avoid

Large components

Duplicate UI

Copy/Paste

---

## Routing

Never

Duplicate routes

Break navigation

Hardcode URLs

Create inconsistent layouts

Always

Use existing routing conventions.

---

## Database

Never

Duplicate tables

Duplicate relationships

Store unnecessary data

Always

Normalize data

Use UUID

Use Foreign Keys

Use RLS

Create indexes

---

## Authentication

Never bypass authentication.

Never expose protected routes.

Always respect role permissions.

---

## Storage

Never store

Student ZIP files

Student source code

Large videos

Always store

Offer Letters

Certificates

Images

Documents

Projects remain on GitHub.

---

## Code Quality

Never

Use "any"

Disable TypeScript

Ignore lint errors

Ignore build errors

Leave dead code

Create unused components

Duplicate logic

Always

Strong typing

Reusable code

Readable code

Small components

Clean architecture

---

## UI Principles

Maintain

Existing Design System

Existing Theme

Existing Navigation

Existing Typography

Existing Spacing

Never redesign the UI unless requested.

---

# Validation Checklist

Every feature must pass

* Type Check
* Build
* Lint
* Authentication
* Authorization
* Database Validation
* Responsive Design
* Dark Mode
* Accessibility
* Error Handling

If any item fails

Do not proceed.

---

# AI Agent Instructions

Every coding session must follow this process.

## Phase 1

Analyze repository.

Do not code.

---

## Phase 2

Understand existing architecture.

---

## Phase 3

Create implementation plan.

---

## Phase 4

Wait for approval if architecture changes are required.

---

## Phase 5

Implement feature.

---

## Phase 6

Validate implementation.

---

## Phase 7

Provide report

* Files Created
* Files Modified
* Database Changes
* Routes Changed
* Components Added
* Validation Results
* Manual Testing Steps
* Suggested Commit Message

---

# Things To Avoid

Do NOT

* Over-engineer
* Add unnecessary features
* Create duplicate pages
* Create duplicate APIs
* Break routing
* Break authentication
* Ignore RLS
* Store source code
* Introduce inconsistent UI
* Mix business logic into components
* Ignore project conventions
* Make unrelated changes while implementing a feature

Stay focused on the requested scope.

---

# Long-Term Vision

Zyro should remain modular and scalable.

Future modules may include

* AI Career Assistant
* Resume Review
* Interview Preparation
* Company Hiring Pipeline
* University Portal
* Industry Partnerships
* Advanced Analytics
* Multi-Organization Support

These future features must never compromise the simplicity and maintainability of the current internship management system.

---

# Final Principle

Every pull request should answer one question:

> **Does this feature make the internship experience more structured, more professional, and easier to manage without increasing unnecessary complexity?**

If the answer is **no**, reconsider the implementation before writing code.
