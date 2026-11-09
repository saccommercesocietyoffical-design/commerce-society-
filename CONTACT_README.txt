CONTACT INBOX SETUP
1. Open Supabase Dashboard > SQL Editor.
2. Copy ALL of CONTACT_SETUP.sql and click Run.
3. Upload the updated website files/folders to the SAME GitHub repository, preserving paths (en/, si/, admin/, etc.).
4. Wait for GitHub Pages deployment. Open English or Sinhala website Contact section and send a test message.
5. Sign in to /admin/ with the existing authorized society admin account. Contact Inbox will show messages and Delete buttons.
SECURITY: Only admin may SELECT/DELETE via RLS. Public may INSERT only. Do not publish a service_role key. Add CAPTCHA/rate limiting if spam becomes a problem.
