# GoMax App — Backend

The app is wired to a real Supabase backend (project: `dealer-crm`,
ref `phbvjhwimvzoaxjartzn`, region `ap-south-1`).

## What's there
- **Auth**: phone OTP (masons/dealers/salesmen) via `supabase.auth.signInWithOtp`
  / `verifyOtp`. Admin uses email+password (`supabase.auth.signInWithPassword`),
  gated on `profiles.role = 'admin'`.
- **Schema**: `profiles`, `dealer_business_details`, `products`, `scan_activity`,
  `orders` + `order_items`, `ledger_transactions`, `challenges` +
  `challenge_progress`, `badges` + `user_badges`, `scratch_cards` +
  `user_scratch_cards`, `redemption_requests`, `beat_plan`, `dcr_entries`,
  `fraud_flags`, `referrals`. Full RLS on every table — everyone reads/writes
  only their own rows; admins (role='admin') see everything.
- **Code**: `src/lib/supabase.ts` (client), `src/lib/database.types.ts`
  (generated types), `src/services/*.ts` (one file per domain), and
  `src/hooks/useSupabaseData.ts` (fetch hooks screens use directly).
  `src/state/AppContext.tsx` now backs its state with the real session +
  profile row instead of local mock state.

## Setup
1. `.env` already has the project URL + anon key committed (anon key is
   safe to expose — every table is RLS-protected). Copy `.env.example` if
   you ever need to point at a different project.
2. `npm install && npx expo start`.

## Known gaps / next steps
- **SMS delivery**: phone OTP calls Supabase's Auth API, but no SMS
  provider (Twilio, MSG91, etc.) is configured yet in Supabase Auth
  settings, so OTPs won't actually arrive on a real phone until one is
  wired up in the Supabase dashboard (Authentication → Providers → Phone).
  Until then, use Supabase's test phone numbers for dev.
- **First admin account**: create one via `supabase.auth.signUp` (or the
  Supabase dashboard → Authentication → Add user) with an email+password,
  then run:
  ```sql
  update public.profiles set role = 'admin' where id = '<the new user's uuid>';
  ```
- **Salesman monthly target**: not modeled in the schema yet (hardcoded to
  ₹250,000 client-side in `SalesmanHomeScreen`/`ProfileScreen`) — add a
  `monthly_target` column to `profiles` (or a separate `targets` table) if
  this needs to be real per-salesman data.
- **Dealer credit fields on beat_plan**: `beat_plan` rows don't carry
  outstanding/credit-limit — that lives on `dealer_business_details` and
  only resolves if `beat_plan.dealer_id` is linked to a real dealer profile.
- **Shop photo upload**: `dealer_business_details.shop_photo_url` is set to
  the placeholder string `'pending-upload'` when a dealer marks "has shop
  photo" — actual image upload to Supabase Storage isn't wired up.
