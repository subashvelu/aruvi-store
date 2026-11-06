# Aruvi: first-time setup (fresh repo, fresh history)

1. Create a NEW empty GitHub repo named `aruvi-store` (do not fork or reuse the old one).
2. In this folder:
     git init -b main
     git add -A
     git commit -m "Initial commit: Aruvi study kit store"
     git remote add origin https://github.com/subashvelu/aruvi-store.git
     git push -u origin main
3. Supabase: create a NEW project. Run `supabase-schema.sql`, then `supabase-seed.sql`.
4. Razorpay: use TEST mode keys (rzp_test_...). No KYC needed.
5. Local run:
     cp .env.example .env.local     # fill in your own values
     npm install --legacy-peer-deps
     npm run dev
6. Hosting (Vercel): add the same variables under Environment Variables.
7. Replace the placeholder download links in the products with your own files.

Never commit .env or .env.local (already in .gitignore).
