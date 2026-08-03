# GoMax App — Backend (V1)

Live Supabase project: `dealer-crm`, ref `phbvjhwimvzoaxjartzn`, region `ap-south-1`.

## V1 scope
Four roles: **Dealer, Contractor, Applicator, Admin.**
Referral hierarchy (enforced by a DB trigger, not just the UI):
Dealer → Contractor or Applicator · Contractor → Applicator only ·
Applicator → Applicator only. Only Dealer/Admin may sign up with no referrer.

## Core mechanics
- **Coupon scan** (`scan_coupon(code)`): row-locks the coupon, burns it, credits
  the Applicator's Points, then cascades commission up to 4 referral levels —
  each level gets 10% of the level directly below it (compounding, not flat).
  All in one atomic Postgres function, immune to double-scan races.
- **Points redemption** (`request_points_redemption(amount)`): ₹500 min,
  ₹5,000 max per request, ₹15,000 max per calendar month — enforced
  server-side, not just in the UI.
- **Runs** are earned only from challenges, the spin wheel (8 segments,
  3 spins/day — matches the pre-existing SpinWheelScreen design exactly),
  and scratch cards. Spent only in the gift catalogue.
- **Gift redemption** (`redeem_gift(gift_id)`): atomic stock + balance check.
  Fulfilment lifecycle: pending → shipped → delivered, with an optional
  proof URL, managed from Admin → Gifts.
- **Admin** has full-access ledger search (`getUserLedgerByMobile`) — every
  scan, commission entry, points/runs ledger line, redemption, and gift
  claim for any one person, for dispute resolution.

## Auth
Mobile number + self-chosen password (via a synthetic-email trick so it
rides on real Supabase Auth/RLS without needing phone OTP confirmation).
Signup (`complete_signup(...)`) takes role, name, mobile, city, address,
bank/UPI, a security question from a **fixed 5-question list**, and a
referral code — validated and role-gated in one atomic call.

Forgot password requires **both** a valid OTP and the correct security
answer (`request_password_reset_otp` + `reset_password_with_otp`).

## Known gaps
- **No SMS provider configured yet.** `request_password_reset_otp` returns
  the code directly in `dev_otp` so the flow is testable end-to-end. Remove
  that field from the RPC response once Twilio/MSG91 is wired up in
  Supabase Auth settings.
- **No admin account exists yet.** Sign up once via email+password in the
  Supabase dashboard (Authentication → Add user), then:
  ```sql
  update public.profiles set role = 'admin' where id = '<the new user''s uuid>';
  ```
- **Coupon batch upload has no UI yet.** Coupons need to be inserted into
  the `coupons` table (code + points_value) some other way for now —
  e.g. directly via SQL or a CSV import script — before applicators can
  scan anything real.
- This is a hard cut from the previous version — the old Dealer(shop)/
  Salesman ordering, ledger, and beat-plan features are fully removed
  (not just hidden) since they're out of scope for this phase; the old
  `dealer_business_details`, `orders`, `order_items`, `ledger_transactions`,
  `beat_plan`, `dcr_entries`, `redemption_requests`, `referrals`,
  `fraud_flags`, `products`, `scan_activity` tables still exist in Supabase
  (harmless, unused) in case a future version wants to revive that flow.

## Team / Ledger / Admin Directory (added after initial V1)
- **My Team** (`get_my_downline()`): every person in a user's downline, unlimited
  depth, with per-person commission the viewer has earned specifically from
  that person's own scans — not just a flat total.
- **Full Ledger**: Points and Runs now have a complete transaction history
  screen (scan credits, commission credits, redemption debits / challenge,
  spin, scratch credits, gift debits) — not just the redemption-request list.
- **Admin bootstrap**: `admin_account_exists()` + `bootstrap_admin_account()`.
  First admin only — the setup screen (reachable from Splash → "Staff / Admin
  login" when no admin exists yet) locks itself out permanently once one
  admin account exists. Adding a *second* admin isn't built yet — needs a
  manual SQL promote for now, same as documented above.
- **Admin Directory** (was "Applicators" tab, renamed): flat list of every
  user in the system with their direct upline resolved, for hierarchy
  visibility. A visual org-chart/tree view is not built — flat list only,
  per the "start simple" decision.
