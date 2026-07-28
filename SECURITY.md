# Security Policy

ZYR0 takes the security of our platform, user data, and infrastructure seriously. We appreciate the contributions of security researchers and developers who help keep our ecosystem safe.

## Supported Versions

Only the latest release on the `main` branch is actively supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 0.16.x  | Yes                |
| < 0.16  | No                 |

## Reporting a Vulnerability

If you discover a security vulnerability within ZYR0, please do **not** disclose it publicly via public GitHub issues or discussions.

Instead, please report vulnerabilities privately by contacting the core development team:

- **Email**: security@zyroo.dpdns.org (or open a private security advisory on GitHub)
- **Response Time**: We aim to acknowledge vulnerability reports within 48 hours and provide a fix or mitigation timeline within 5 business days.

Please include the following information in your report:
- A description of the vulnerability and its potential impact.
- Step-by-step instructions or proof-of-concept script to reproduce the issue.
- Affected components (e.g., Supabase RLS policies, Auth middleware, API service layers, Edge Functions).

## Security Best Practices in ZYR0

ZYR0 enforces a defense-in-depth security model:

- **Row Level Security (RLS)**: Enforced on all Supabase PostgreSQL tables. Database queries verify user role and identity at the database level.
- **Environment Isolation**: Secret keys (such as `SUPABASE_SERVICE_ROLE_KEY`) are kept on server environments and never exposed to client-side bundles.
- **Input Sanitization**: All user inputs, task submissions, and URLs are validated before processing.
- **Authentication**: Handled via Supabase Auth using secure JWTs and HTTPS-only cookie sessions.

Thank you for helping us maintain a safe platform for students, companies, and mentors.
