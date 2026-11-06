# Aruvi Store

A storefront for cloud and DevOps study kits (e-books, cheat sheet bundles, templates, planners). Customers browse products, pay through Razorpay, and receive digital downloads by email. An admin area manages products and orders.

## Tech stack

* **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion
* **Backend:** Next.js route handlers and server actions
* **Database:** Supabase (PostgreSQL)
* **Payments:** Razorpay
* **Email:** Nodemailer (SMTP)
* **CI:** GitHub Actions (install, dependency audit, production build)

## How a purchase works

```text
Browser ──► POST /api/razorpay/order     price is checked against the products table
        ──► Razorpay checkout (customer pays)
        ──► POST /api/checkout/complete
              1. verify Razorpay signature (HMAC-SHA256)
              2. ask Razorpay for the order and confirm it is paid
              3. read product and download link from the database (not from the request)
              4. save order in Supabase, skip if this payment was already processed
              5. email the download link (digital products)
```

## Security decisions

* **No secrets in git.** `.env*` is ignored; `.env.example` lists the variables.
* **Admin login uses a signed, expiring session cookie** (HMAC), never the password itself. Admin is disabled if `ADMIN_ACCESS_KEY` or `ADMIN_SESSION_SECRET` is missing (no default password).
* **Admin-only API routes** (`GET /api/orders`, `GET /api/users`, `POST /api/products`) return 401 without a valid admin session.
* **Server-side payment verification.** The server never trusts the price, payment status or download link sent by the browser.
* **Idempotent order creation**, so a repeated request cannot resend emails or create duplicate orders.
* **Email content is HTML-escaped** and links must be `https`.

## Run locally

```bash
npm install --legacy-peer-deps
cp .env.example .env.local     # fill in your own test keys (use rzp_test_ keys)
npm run dev                    # http://localhost:3000
```

Create the database tables by running `supabase-schema.sql` in the Supabase SQL editor, then run `supabase-seed.sql` to load the demo catalog (replace the placeholder download links with your own).

## Environment variables

See [`.env.example`](.env.example). Set the same variables in your hosting dashboard.

## Known limitations (and what I would do next)

* Download links are stored on the product row and returned by the public products API. Better: private storage with short-lived signed URLs, issued only after payment.
* No rate limiting on the admin login. Better: an edge rate limiter or a managed auth provider.
* Single shared admin key. Better: per-user admin accounts (Supabase Auth).
* No automated tests yet. Next: unit tests for the payment verification logic.
