# Security update: Next.js 16 + React 19 (0 npm vulnerabilities)

1. Copy these files over your aruvi folder (same paths, overwrite).
2. Stop the dev server, then run in the aruvi folder:
     Remove-Item -Recurse -Force node_modules, .next
     npm install --legacy-peer-deps
     npm run dev
3. Test: /shop, a product page, /admin login, and a Razorpay test payment.
4. Then:
     git add -A
     git commit -m "Upgrade to Next.js 16 and React 19; fix all npm audit findings"
     git push
