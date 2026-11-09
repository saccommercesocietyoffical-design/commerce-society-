ST. ANTHONY'S COLLEGE COMMERCE SOCIETY WEBSITE

HOW TO VIEW
1. Extract this ZIP file.
2. Open the extracted folder.
3. Double-click index.html. It will open in your browser.
4. Keep index.html, styles.css and script.js in the same folder.

BEFORE PUBLISHING
- Replace the generic descriptions with information approved by the school/society.
- Add the official school logo and approved event photographs.
- Replace the contact placeholder and email link with official contact details.
- Add confirmed event dates and venues only.
- Check with the school before publishing student photos or personal contact details.

FILES
- index.html: website content
- styles.css: layout and visual design
- script.js: mobile navigation and current year
- assets/: place approved images/logo here

This is a starter website. It does not contain verified school contact details, official logos,
event dates or photographs. Google Fonts requires an internet connection; the site otherwise
works as a local HTML website.

LOGO
- Your supplied Commerce Society logo is included at assets/school-logo.png.jpg and displayed in the header, footer and hero area.

LANGUAGES
- Switch between English and Sinhala using EN / සිං in the navigation.

SOCIETY TEAM
- A four-person Society Team section is included in both English and Sinhala pages.
- Replace the 'Name to be added' / 'නම ඇතුළත් කිරීමට නියමිතයි' placeholders with approved names.
- The roles shown are Teacher-in-Charge, President, Secretary and Treasurer.

ADMIN PHOTO UPLOAD — SUPABASE SETUP REQUIRED
1. Create a Supabase project at https://supabase.com/.
2. In Supabase > SQL Editor, run supabase_setup.sql.
3. In Supabase Authentication settings, disable public sign-ups.
4. In Authentication > Users, create the admin account yourself.
5. In supabase-config.js, replace the placeholders with the Supabase Project URL and anon/public key.
   Never use a service_role key in website files.
6. Deploy the complete website folder. Open /admin/ on your published website.
7. Sign in, select a Society Team role, choose a JPG/PNG/WebP photo up to 5 MB, and upload.
8. The uploaded photo will automatically appear on the English and Sinhala pages.

Only upload photos approved for public display by the school and the people shown.
The photo upload feature will not work until Supabase is configured and the website is deployed.

DESIGN UPDATE
The website and admin panel now use colours sampled from the school crest: deep espresso brown, crest gold and warm ivory.
