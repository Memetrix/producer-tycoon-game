-- Disable email confirmation for testing
-- This allows users to sign up and immediately log in without email verification
-- Note: This is for testing only. For production, you should enable email confirmation.

-- Update auth settings to disable email confirmation
UPDATE auth.config 
SET enable_signup = true;

-- Note: Email confirmation is controlled in Supabase Dashboard under Authentication > Providers > Email
-- You need to manually disable "Confirm email" in the dashboard for this to work
-- This script is just a reminder of what needs to be done

SELECT 'Email confirmation should be disabled in Supabase Dashboard' as reminder;
SELECT 'Go to: Authentication > Providers > Email > Confirm email = OFF' as instructions;
