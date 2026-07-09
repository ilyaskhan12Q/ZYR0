-- =============================================
-- Migration 017: GitHub Submission Validation & Duplicate Detection
-- Enforces format correctness and prevents different students from submitting the same repository.
-- =============================================

-- 1. Helper function to extract "username/repository" from a GitHub URL
CREATE OR REPLACE FUNCTION public.extract_github_repo(url text)
RETURNS text AS $$
DECLARE
  matches text[];
BEGIN
  IF url IS NULL OR url = '' THEN
    RETURN NULL;
  END IF;
  
  matches := regexp_match(url, '^https?://(?:www\.)?github\.com/([a-zA-Z0-9_-]+)/([a-zA-Z0-9_.-]+)');
  IF matches IS NOT NULL AND array_length(matches, 1) = 2 THEN
    RETURN lower(matches[1] || '/' || matches[2]);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Trigger function to validate format and check duplicates
CREATE OR REPLACE FUNCTION public.validate_github_submission()
RETURNS TRIGGER AS $$
DECLARE
  repo_path text;
  duplicate_student_id uuid;
  duplicate_username text;
BEGIN
  IF NEW.github_url IS NOT NULL AND NEW.github_url <> '' THEN
    -- A. Trim whitespace
    NEW.github_url := trim(NEW.github_url);

    -- B. Format validation (must start with github.com and contain user/repo)
    IF NOT (NEW.github_url ~* '^https?://(?:www\.)?github\.com/[a-zA-Z0-9_-]+/[a-zA-Z0-9_.-]+') THEN
      RAISE EXCEPTION 'Invalid GitHub URL. Must be in the format: https://github.com/username/repository';
    END IF;

    -- C. Extract username/repo path
    repo_path := public.extract_github_repo(NEW.github_url);
    
    IF repo_path IS NOT NULL THEN
      -- D. Check if any other student has submitted a URL with the same repo path
      SELECT student_id INTO duplicate_student_id
      FROM public.task_submissions
      WHERE id <> NEW.id -- exclude this submission row itself (for updates)
        AND student_id <> NEW.student_id -- must be a different student
        AND public.extract_github_repo(github_url) = repo_path
      LIMIT 1;

      IF duplicate_student_id IS NOT NULL THEN
        -- Resolve username of duplicate student for a helpful error message
        SELECT email INTO duplicate_username 
        FROM auth.users 
        WHERE id = duplicate_student_id;

        RAISE EXCEPTION 'This GitHub repository has already been submitted by another student. Plagiarism is strictly prohibited.';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Bind BEFORE trigger on INSERT and UPDATE
DROP TRIGGER IF EXISTS check_github_submission ON public.task_submissions;

CREATE TRIGGER check_github_submission
  BEFORE INSERT OR UPDATE OF github_url ON public.task_submissions
  FOR EACH ROW EXECUTE FUNCTION public.validate_github_submission();
