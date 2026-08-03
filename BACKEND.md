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

## TDS / KYC compliance (Section 194R / recodified 393(1))
- ₹20,000/FY aggregate threshold per recipient, 10% TDS (20% without PAN),
  triggered when a redemption is approved or a gift is marked delivered.
- Role-tiered PAN/Aadhaar collection at signup: Dealer/Contractor get a more
  direct ask (they hit the threshold fast and are business-registered
  players who likely already have PAN); Applicators get a fully optional,
  plain-language nudge + a pointer to the free Aadhaar-based Instant e-PAN
  government service (~5-10 min, no paperwork) — never blocks anything.
- `tds_records` keeps a full audit trail per user per financial year.
  `get_tds_summary()` gives Admin an overview; individual events surface a
  plain-language alert to Admin ("Govt. rule... 10%/20% tax applies...").
- **This is a calculator + flagging system, not an automated filer.** It
  does not deduct money from a payout, deposit TDS, or file any return —
  verify the actual compliance process with a CA before relying on it.
- `gift_catalogue.market_value_inr` needs to be set per gift for TDS to be
  calculated on gift claims (defaults to skipped if null) — set this when
  building gift CRUD.

## Admin CRUD (gifts & challenges)
- Admin → Dashboard → "Manage Gift Catalogue" / "Manage Challenges" — create,
  edit, and hide (soft-delete via `active` toggle) both, from the app.
  No more direct-SQL seeding needed for day-to-day operation.
- Gift `market_value_inr` is settable here — required for TDS to calculate
  on gift claims (skipped if left blank).

## Business volume (My Team)
- `get_my_downline()` now also returns `business_volume`: the total ₹ value
  of coupons scanned by that person AND everyone in their own sub-team below
  them — not just the commission the viewer personally earned from them.
  This is the number to use for volume-based schemes/annual bonuses.
- The Team screen's top-line "Team business done" figure sums only direct
  reports' business_volume (each one's figure already rolls up everyone
  below them — summing all rows would double-count).

## Tier system (Bronze/Silver/Gold/Platinum)
- Real, not decorative — based on **lifetime Points earned** (scan +
  commission credits), not current balance, so redeeming Points never
  demotes someone.
- `tier_bands` table (Admin-editable via SQL for now — no dedicated editor
  screen yet): Bronze (0), Silver (2,000), Gold (5,000), Platinum (10,000
  lifetime points). Each band has a `perk_description` field, currently just
  descriptive text — no automated perk enforcement (e.g. no gift-catalogue
  gating by tier yet).
- `get_my_tier()` returns current tier, perks, and progress to next tier.
  Shown on Profile with a progress bar.
