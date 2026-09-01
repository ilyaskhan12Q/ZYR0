-- Performance indexes for frequently queried columns
-- These indexes improve query performance for common access patterns

CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_internships_company_id ON internships(company_id);
CREATE INDEX IF NOT EXISTS idx_certificates_company_id ON certificates(company_id);
CREATE INDEX IF NOT EXISTS idx_workspace_events_student_id ON workspace_events(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
