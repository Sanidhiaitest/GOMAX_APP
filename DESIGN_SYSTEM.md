# GoMax Design System

This is the reference for GoMax's shared UI building blocks: `src/theme/*` and
`src/components/*`. It exists so the next person touching the UI reaches for
an existing token/component instead of inventing a new one.

For a version that can never drift out of date, open the app and go to
**Splash screen → "Design system"** (dev builds only) — it mounts every
component below live, in every variant, with real props.

## Brand mandate

> "Make very premium UI... I don't want text-heavy things. I want everything
> to be iconographic, everything to be graphics, everything to be in pills."
> — founder brief

In practice: prefer an icon over a sentence, a `Pill` over a plain colored
`Text`, a `StatTile` over a table of numbers, and a subtle
reward/glow/haptic moment over a static confirmation. If you're writing a
paragraph of body copy on a dashboard-type screen, stop and ask whether it
could be a pill, a tile, or an icon instead.

## Colors — `src/theme/colors.ts`

All values come from the GoMax Figma file's variables (`get_design_context`,
fileKey `FeJTlIYATbYbRX82aBY17w`) or are documented one-off hex values pulled
directly from a specific screen's Figma spec. **If a new screen needs a color
not listed here, pull it from Figma — don't approximate.**

### Brand
| Token | Hex | For |
|---|---|---|
| `brandNavy` | `#001E42` | Logo-derived brand navy |
| `brandOrange` | `#F3987A` | Logo-derived brand orange (lighter than the M3 primary orange used in UI) |

### M3 "Primary" scale — buttons, links, accents
| Token | Hex | For |
|---|---|---|
| `primary700` | `#c05336` | Primary CTA background, focused-field border, links |
| `primary600` | `#e07554` | Lighter primary accent |
| `primary50` | `#fff8f5` | Primary-tinted surface (focused field background, selected role card) |

### M3 "Secondary" scale — headings, step indicators
| Token | Hex | For |
|---|---|---|
| `secondary800` | `#0a1c37` | Darkest heading/navy surface |
| `secondary700` | `#0f2a4e` | Header titles on onboarding screens |
| `secondary500` | `#1e508c` | Info-tone accents, step indicators |
| `secondary50` | `#f0f4fa` | Secondary-tinted surface |

### M3 "Neutral" scale
| Token | Hex | For |
|---|---|---|
| `neutral0` | `#ffffff` | Pure white |
| `neutral200` | `#e4e4e7` | Light borders (filled TextField) |
| `neutral300` | `#d4d4d8` | — |
| `neutral400` | `#a1a1aa` | Placeholder text, disabled icons |
| `neutral500` | `#71717a` | Secondary/muted text |
| `neutral600` | `#52525b` | Slightly darker muted text |
| `neutral950` | `#09090b` | Near-black text/icon on light surfaces |

### Raw one-off hex — screen-specific, not Figma variables
These are named here (rather than left as inline literals) precisely so the
next screen that needs the same shade reuses the token instead of retyping
the hex.
| Token | Hex | For |
|---|---|---|
| `labelGray` | `#808080` | TextField label color |
| `inputBorder` | `#e0e0e0` | — |
| `inputPrefixBg` | `#ededed` | — |
| `skipGray` | `#595c5d` | — |
| `gradientNavyDeep` | `#002040` | Splash + Scan gradient stop |
| `gradientNavyIndigo` | `#041F61` | Login/OTP header gradient stop |
| `scanSuccessGreen` | `#14c87c` | ScanScreen "verified" status dot + history checkmark (dark UI — distinct from the light-surface `success` token) |
| `scanActiveTabText` | `#ff8a6b` | ScanScreen active Scan/History segment label |
| `scanCaptionLight` | `#e9e9f4` | ScanScreen caption text over the dark camera view |
| `warningBg` | `#fff4e0` | Shared warning-tinted icon/pill background (matches `Pill`'s internal `warning` tone bg) |

### Dark "Light/Neutral" collection — Scan + Wallet
| Token | Hex | For |
|---|---|---|
| `darkNeutral700` | `#474D6A` | — |
| `darkNeutral800` | `#121224` | — |

### Scan/Wallet screen-specific (Inter-typeset dark UI)
| Token | Hex | For |
|---|---|---|
| `walletBg` | `#0a1628` | Wallet dark background |
| `walletCard` | `#0d1f3c` | Wallet card surface |
| `walletPointsAccent` | `#c1440e` | Points figure accent |
| `walletRunsAccent` | `#2a8fa8` | Runs figure accent |
| `scanSubmitOrange` | `#cf4b29` | Scan manual-entry submit button |
| `scanHintBlue` | `#2e5475` | Scan bottom-sheet hint text |

### Generic semantic aliases — Home/Profile/KYC/no-Figma screens
Used by the shared components and any screen without an exact Figma
reference.
| Token | Hex | For |
|---|---|---|
| `navy900` / `navy800` / `navy700` | `#0a1c37` / `#0f2a4e` / `#1e508c` | Same values as the secondary scale, aliased for generic screens |
| `orange500` / `orange600` | `#c05336` / `#a8442a` | Same values as primary700/a darker shade, aliased for generic screens |
| `orange100` / `orange50` | `#fbe7dd` / `#fff8f5` | Orange-tinted surfaces |
| `textPrimary` | `#131B2E` | Default body/heading text |
| `textSecondary` | `#71717a` | Muted text |
| `textMuted` | `#a1a1aa` | Placeholder-level text |
| `textInverse` | `#FFFFFF` | Text on dark surfaces |
| `surface` | `#FFFFFF` | Default screen/card background |
| `surfaceMuted` | `#F4F5F7` | Muted screen background (dashboards), filled-field background |
| `border` | `#e4e4e7` | Default 1px card/field border |
| `borderFocus` | `#c05336` | Focused-field border |

### Base + semantic status
| Token | Hex | For |
|---|---|---|
| `white` / `black` | `#FFFFFF` / `#0A0A0A` | — |
| `success` | `#1FA855` | Success icon fills, result-modal accents |
| `whatsapp` | `#25D366` | WhatsApp-branded button variant |
| `danger` | `#DC2626` | Error icon fills, destructive actions |
| `warning` | `#D97706` | Warning icon fills |
| `overlay` | `rgba(11, 26, 51, 0.6)` | Modal/bottom-sheet backdrop |

### AA-contrast text/icon variants
`success` / `warning` / `danger` above read as low as ~2.8:1 when used **as
text or an icon on top of a light tint or white** — below the 4.5:1 WCAG AA
minimum. Use these instead whenever that's the case (they hold the same hue
at ~4.9–5.6:1):
| Token | Hex |
|---|---|
| `successText` | `#137a3d` |
| `warningText` | `#a3540a` |
| `dangerText` | `#b91c1c` |

`Pill`'s tone colors are already built on these (see Components below) — you
only need to reach for `successText`/`warningText`/`dangerText` directly
when *not* going through `Pill`.

## Typography — `src/theme/typography.ts`

There are **two type scales**. Both are exported from the same file; picking
the right one depends on which screen you're building.

### `m3Type` — Roboto, Material 3 static scale
Use on **onboarding-style screens**: Splash, Login, Signup, ForgotPassword,
AdminSetup, AdminLogin, Scan, Wallet, and the Admin dashboard/tab screens —
i.e. any screen built directly against a Figma frame with an exact M3 type
spec. Also used *inside* several shared components themselves (`Pill`,
`TextField`, `StatTile`, `SelectModal` do **not** use it — check each
component's source for its actual scale) because those components were
built to match the Figma-exact look.

Scale: `headlineLarge`, `headlineMedium`, `titleLarge`, `titleMedium`,
`titleMediumSemiBold`, `labelLarge`, `labelMedium`, `labelSmall`,
`labelSmallSemiBold`.

```ts
<Text style={m3Type.titleLarge}>Set up Admin account</Text>
```

### `typography` — Inter, generic scale
Use on screens with **no exact Figma reference** — Home, Profile, Team,
Ledger, Gifts, Challenges, and most Admin screens. Also the default scale for
the shared `Button` label and `SelectModal`.

Scale: `h1`, `h2`, `h3`, `body`, `bodyMedium`, `label`, `caption`, `button`.

```ts
<Text style={typography.h2}>My Team</Text>
```

### Rule of thumb
- Building a screen straight from a Figma frame with Roboto callouts? →
  `m3Type`.
- Building/extending a generic screen with no 1:1 Figma spec, or reusing an
  existing shared component that already picked a scale? → match whatever
  that screen/component already uses. **Don't mix both scales within the
  same screen** — several screens already lean on one or the other
  consistently; that consistency is what makes them each feel coherent.

`fontFamily` also exports plain family name strings (`interRegular`,
`robotoMedium`, etc.) plus legacy aliases (`heading`, `body`,
`bodyMedium`, `bodySemiBold`) used internally by the `typography` scale —
reach for the scale objects above rather than the raw family strings
directly.

## Spacing & Radius — `src/theme/spacing.ts`

```ts
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };
export const radius  = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };
```

Use `spacing.*` for every margin/padding/gap and `radius.*` for every
`borderRadius` in new code. A handful of screens (Scan in particular) use
literal pixel values instead — see **Known gaps** below for why those were
left alone.

## Components — `src/components/`

A barrel file exists at `src/components/index.ts` for single-line imports in
new code:
```ts
import { Button, Pill, Card } from '../../components';
```
(Existing screens still import each component from its own file path —
that's fine and was **not** rewritten; see "Barrel export" below.)

### `Button`
```ts
type Variant = 'primary' | 'secondary' | 'ghost' | 'whatsapp' | 'neutralDisabled';
{ label, onPress?, variant = 'primary', disabled?, loading?, icon?, fullWidth = true, roboto? }
```
- `variant`: `primary` (solid orange), `secondary` (orange outline), `ghost`
  (transparent), `whatsapp` (green, WhatsApp-branded actions), `neutralDisabled`
  (permanently-disabled look regardless of `disabled`).
- `icon` defaults to `arrow-forward`; pass `null` to hide it.
- `roboto`: use on onboarding-style (`m3Type`) screens — swaps the label font
  from the default `typography.button` (Inter) to Roboto Medium.
```tsx
// src/screens/onboarding/LoginScreen.tsx
<Button label={signingIn ? 'Signing in…' : 'Login'} onPress={onSubmit} disabled={!canSubmit} roboto />

// src/screens/admin/AdminRedemptionsScreen.tsx
<Button label="Approve" icon="checkmark" onPress={() => onDecide(req.id, 'approved')} />
<Button label="Reject" icon="close" variant="secondary" onPress={() => onDecide(req.id, 'rejected')} />
```

### `Card`
```ts
{ children, style?, padded = true }
```
White surface, `radius.lg`, 1px `border`. Set `padded={false}` to lay out
your own padding (e.g. when a full-bleed image needs to reach the card edge).
```tsx
<Card style={styles.summaryCard}>
  <Text style={styles.summaryLabel}>TOTAL COMMISSION FROM YOUR TEAM</Text>
</Card>
```

### `Pill`
```ts
type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'primary' | 'info';
{ label, tone = 'neutral', icon?, size = 'sm' | 'md' }
```
The app's single reusable status chip — per the brand mandate, this is what
every status/role/count should render as instead of plain colored text.
Every tone's foreground color is independently verified at ≥4.5:1 contrast
against its own background (see the `successText`/`warningText`/`dangerText`
note above — `Pill` already does this for you).
```tsx
// src/screens/team/TeamScreen.tsx
<Pill label={member.role} tone={ROLE_TONE[member.role] ?? 'neutral'} size="sm" />

// src/screens/admin/AdminDashboardScreen.tsx
<Pill label={String(pendingRedemptions.length)} tone="primary" size="sm" />
```

### `StatTile`
```ts
{ icon, value, label, iconColor = colors.primary700, iconBg = colors.primary50 }
```
Icon + big number + one short label, used across every dashboard-style
screen (Admin KPIs, Team totals) so a screen full of numbers never requires
reading paragraphs.
```tsx
// src/screens/admin/AdminDashboardScreen.tsx
<StatTile icon="scan-outline" value={String(kpiSummary.scansToday)} label="Scans today" iconColor={colors.secondary500} iconBg={colors.secondary50} />
```

### `Screen`
```ts
{ children, backgroundColor = colors.surface, style?, edges? }
```
Thin `SafeAreaView` wrapper — the standard top-level container for a screen.
`edges` defaults to `['top', 'left', 'right']` (no bottom inset, since most
screens sit above a bottom tab bar); pass all four edges for modal-presented
screens with no tab bar underneath.

### `TextField`
```ts
{ label?, leftIcon?, rightIcon?, onRightIconPress?, rightIconAccessibilityLabel?,
  prefix?, error?, variant = 'outline' | 'filled', containerStyle?, ...TextInputProps }
```
- `outline` (default): white/primary-focus field, matches the Figma text
  inputs (Login, Signup).
- `filled`: gray dropdown-style field.
- Always pass `rightIconAccessibilityLabel` when `onRightIconPress` is set —
  the component falls back to a generic `"Field action"` otherwise.
```tsx
// src/screens/onboarding/LoginScreen.tsx
<TextField
  label="PASSWORD"
  secureTextEntry={!showPassword}
  value={password}
  onChangeText={setPassword}
  rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
  onRightIconPress={() => setShowPassword((v) => !v)}
  rightIconAccessibilityLabel="Toggle password visibility"
/>
```

### `SelectModal`
```ts
{ visible, title, options: string[], selected?, onSelect, onClose }
```
A slide-up bottom-sheet single-select list.
```tsx
// src/screens/onboarding/SignupScreen.tsx
<SelectModal
  visible={questionModal}
  title="Select a security question"
  options={[...SECURITY_QUESTIONS]}
  selected={securityQuestion}
  onSelect={setSecurityQuestion}
  onClose={() => setQuestionModal(false)}
/>
```

### `BottomNav`
Custom `tabBar` renderer for `@react-navigation/bottom-tabs` (`BottomTabBarProps`).
Renders a raised, bordered circular "Scan" tab in the center when a route
named `Scan` is present, flanked by icon+label tabs for everything else.
Route→icon and route→label overrides live in the `ICONS`/`LABELS` maps at
the top of the file — add new tab routes there.
```tsx
// src/navigation/MainTabNavigator.tsx
<Tab.Navigator tabBar={(props) => <BottomNav {...props} />}>
```

### `GoMaxLogo`
```ts
{ variant = 'full-orange' | 'full-navy' | 'mark-orange' | 'mark-navy', width = 120, style? }
```
Aspect ratio is baked in per variant so you only ever need to pass `width`.
```tsx
<GoMaxLogo variant="full-orange" width={260} />
```

## Animations — `src/components/animations/`

Four primitives, each solving one distinct interaction problem. **Before
adding a new animation component, check whether one of these already covers
your case** — they were each purpose-built to avoid overlapping.

### `PressableScale` — press feedback (every tappable element)
```ts
{ children, style?, scaleTo = 0.96, haptics = true, disabled?, ...PressableProps }
```
Drop-in `Pressable` replacement: spring scale-down-on-press + a light haptic
tap. This is the baseline "everything feels responsive" primitive — reach
for it any time you'd otherwise use a plain `Pressable` for a primary
interactive element. Set `haptics={false}` for dense repeated taps (e.g. a
stepper). `Button` implements its own version of this same press animation
inline rather than wrapping `PressableScale` — if you're building a new
button-like component, prefer wrapping `PressableScale` over reimplementing
the spring logic again.
```tsx
// src/screens/engagement/SpinWheelScreen.tsx
<PressableScale onPress={onSpin} disabled={!canSpin} style={[styles.hub, !canSpin && styles.hubDisabled]}>
  <Ionicons name="sync" size={22} color={colors.white} />
</PressableScale>
```

### `GlowBorder` — ambient premium touch, not an unlock moment
```ts
{ children, style?, cornerRadius = radius.lg, borderWidth = 2, colorsSet?,
  backgroundColor = colors.white, speed = 3400, active = true }
```
A slow-rotating gradient sweep + soft breathing glow clipped to a rounded
rect — makes whatever it wraps read as the "premium CTA" on the screen. This
is for a **persistent, always-visible** high-value action (there's always
something worth drawing the eye to), not a one-off celebration. Set
`active={false}` to freeze it without unmounting (e.g. an off-screen tab).
```tsx
// src/screens/home/HomeScreen.tsx — the one live usage today
<GlowBorder cornerRadius={radius.md} borderWidth={2} backgroundColor={colors.surfaceMuted} speed={3800}>
  <PressableScale style={styles.scanCta} onPress={() => navigation.navigate('Scan')}>
    <Ionicons name="qr-code-outline" size={22} color={colors.white} />
    <Text style={styles.scanCtaText}>Scan a Coupon</Text>
  </PressableScale>
</GlowBorder>
```

### `RewardBurst` — the unlock moment's confetti
```ts
{ trigger, count = 22, colorsSet?, duration = 1100, style? }
```
A contained particle burst. Bump `trigger` (e.g. `Date.now()`) each time you
want it to fire; it unmounts itself when done. Wrap it in a
`position: relative` container sized to where the burst should be centered.
Fires on: spin wheel win, scratch card reveal, challenge claimed, redemption
success, gift claimed.
```tsx
// src/screens/engagement/SpinWheelScreen.tsx
<RewardBurst trigger={burstTrigger} colorsSet={[colors.orange500, colors.navy700, colors.orange600, colors.white]} />
```

### `UnlockReveal` — the unlock moment's reveal animation
```ts
{ visible, children, style?, glow = false, glowColor = colors.orange500 }
```
A spring scale+fade (+ optional glow flash) for a prize/reward appearing —
almost always paired with `RewardBurst` in the same result view. Use `glow`
for the biggest moments (redemption success, spin win); omit it for smaller
ones (a claimed-challenge pill).
```tsx
// src/screens/wallet/WalletScreen.tsx
<RewardBurst trigger={burstTrigger} count={18} />
<UnlockReveal visible={success} glow glowColor={colors.success}>
  <View style={styles.resultIcon}>
    <Ionicons name="checkmark" size={32} color={colors.white} />
  </View>
</UnlockReveal>
```

### Which one do I reach for?
| Situation | Use |
|---|---|
| Any tap needs to feel responsive | `PressableScale` |
| A persistent CTA should read as "the premium one" | `GlowBorder` |
| Something was just won/unlocked and should celebrate | `RewardBurst` + `UnlockReveal` together |

If none of these fit, that's a signal to extend one of the four rather than
add a fifth.

## Consistency pass (this task)

Fixed as trivial, same-appearance corrections in screens that were already
using the system correctly:
- Added `scanSuccessGreen`, `scanActiveTabText`, `scanCaptionLight`,
  `warningBg` tokens to `colors.ts` for hex values that were previously
  inline literals in `ScanScreen.tsx` / `AdminDashboardScreen.tsx`, and
  pointed those screens at the new tokens.
- Replaced a handful of literal `4`/`32` px values with the equivalent
  `spacing.xs`/`spacing.xxxl` token, and two literal `8` px `borderRadius`
  values with `radius.sm`, in `HomeScreen`, `LoginScreen`, `TeamScreen`,
  `AdminApplicatorsScreen`, `GiftCatalogueScreen`, and `SignupScreen` —
  each sat directly alongside an existing token use in the same style block.
- Added `accessibilityRole="button"` + `accessibilityLabel` to icon-only
  back buttons (and Scan's icon-only torch/back/submit buttons) that had no
  accessible name — the same `arrow-back`/`chevron-back` pattern repeated
  identically across `AdminSetupScreen`, `ForgotPasswordScreen`,
  `SignupScreen`, `ScratchCardScreen`, `ChallengesScreen`, `LedgerScreen`,
  `TeamScreen`, and `ScanScreen`.

## Known gaps

- **`ScanScreen.tsx`** is intentionally pixel-exact to its Figma frame
  (see its "Node 41:1262" comment) and leans on inline `rgba(255,255,255,x)`
  translucent overlays for its dark glass-panel look (header pills, segment
  control, history rows) rather than named tokens, plus a couple of
  one-off pixel values (`padding: 5`, `borderRadius: 14`) that don't match
  any existing spacing/radius step. This wasn't touched beyond the raw-hex
  fix above — tokenizing a whole translucency system is a bigger design
  call (naming, whether other dark screens should share it) than this
  pass's scope covers.
- **`Pill`'s tone background hexes** (`#e6f7ec`, `#fff4e0`, `#fdeaea`,
  `#eaf1fb`) live as literals inside `Pill.tsx` itself rather than as
  exported `colors.*` tokens, with a comment explaining they were verified
  directly against those exact values for AA contrast. `warningBg` was
  pulled out as a token only because a screen was duplicating that exact
  literal outside the component; the other three tones aren't duplicated
  elsewhere today, so they were left as-is rather than speculatively
  exporting tokens nothing else uses yet.
- No screen in this codebase was found to have "invented its own separate
  style approach" badly enough to need a rewrite — Login, Signup, Team, and
  the Admin screens (the newly-merged auth/referral/admin surfaces) all
  already consume `colors`/`spacing`/`radius`/`m3Type` (or `typography`) and
  the shared components correctly. If a future screen does go off-system,
  flag it here rather than silently rewriting it.

## Barrel export

`src/components/index.ts` now exists for single-line imports
(`import { Button, Pill, Card } from '../../components'`) — it re-exports
every shared component plus everything in `animations/`. It did **not**
exist before this pass; existing screens' deep imports (e.g.
`from '../../components/Button'`) were left untouched since rewriting every
screen's imports is pure mechanical churn with real diff risk and no
user-facing benefit. Use the barrel for new code going forward.
