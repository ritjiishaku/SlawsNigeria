# Design System Rules — SlawsNigeria AI Assistant

> Source: SNG-PRD-AI-001 v3.0 + Brand direction from stakeholder discovery
> These rules govern all UI decisions in the mobile app and admin panel.
> Brand identity: bold, modern, impressive. Inspired by Shein and Kajabi.
> Primary audience: women aged 20–70.

---

## 1. Colour Palette

Use these exact values. Never introduce new colours without product owner approval.

### Primary — Royal Purple
```
hex:   #6B21A8
rgb:   rgb(107, 33, 168)
usage: Primary CTAs, brand headers, Slaws chat bubble (outgoing),
       navigation active states, key UI elements
```

### Secondary — Warm Gold
```
hex:   #D97706
rgb:   rgb(217, 119, 6)
usage: VIP event labels, subscription badges, milestone celebrations,
       secondary CTAs, highlights
```

### Tertiary — Modern Rose
```
hex:   #F43F5E
rgb:   rgb(244, 63, 94)
usage: Women's Store category, promotional banners, product highlights,
       urgent notifications
```

### Neutral — Warm Cream
```
hex:   #FAFAF9
rgb:   rgb(250, 250, 249)
usage: App background, card surfaces, chat bubbles (incoming),
       content areas
```

### Neutral Variant — Warm Charcoal
```
hex:   #1C1917
rgb:   rgb(28, 25, 23)
usage: Primary body text, dark card backgrounds, footers, headers on light surfaces
```

### Supporting Tints (do not use as primary — accents only)
```
purple-100: #F3E8FF   — subtle purple backgrounds, info callouts
purple-200: #E9D5FF   — hover states on purple elements
gold-100:   #FEF3C7   — warning/amber backgrounds
gold-200:   #FDE68A   — amber highlights
rose-100:   #FFE4E6   — subtle rose backgrounds
gray-100:   #F3F4F6   — dividers, disabled states
gray-400:   #9CA3AF   — placeholder text, secondary captions
```

---

## 2. Typography

### Font Stack
- Primary: **Roboto** (Google Fonts) — all body copy and UI text
- Display: **Poppins** (Google Fonts) — headings, brand moments only

```typescript
// src/app/theme/typography.ts
export const typography = {
  display: {
    fontFamily: 'Poppins_700Bold',
    sizes: { xl: 32, lg: 28, md: 24 },
  },
  heading: {
    fontFamily: 'Poppins_600SemiBold',
    sizes: { xl: 22, lg: 20, md: 18, sm: 16 },
  },
  body: {
    fontFamily: 'Roboto_400Regular',
    sizes: { lg: 16, md: 14, sm: 12 },
  },
  bodyStrong: {
    fontFamily: 'Roboto_700Bold',
    sizes: { lg: 16, md: 14, sm: 12 },
  },
  caption: {
    fontFamily: 'Roboto_400Regular',
    sizes: { md: 11, sm: 10 },
  },
  price: {
    fontFamily: 'Roboto_700Bold',
    sizes: { lg: 20, md: 16, sm: 14 },
    color: '#6B21A8',  // Always purple for price display
  },
};
```

### Rules
- Body text minimum size: **14sp** (accessibility — suits users aged 20–70)
- Price values always use `price` font style and purple colour
- Never use font size below 11sp
- Line height: body = 1.6, headings = 1.3

---

## 3. Spacing System

8-point grid. All spacing values must be multiples of 4.

```typescript
// src/app/theme/spacing.ts
export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
  xxxl: 64,
};
```

---

## 4. Border Radius

```typescript
export const radius = {
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  full: 9999,  // pills and avatars
};
```

---

## 5. Shadows

```typescript
export const shadows = {
  sm: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#6B21A8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 10,
  },
};
```

---

## 6. Component Standards

### Buttons

Three variants only. Use no others.

| Variant | Background | Text | Use |
|---|---|---|---|
| `primary` | `#6B21A8` | White | Main CTAs: "Subscribe", "Book Event", "Send" |
| `secondary` | `#D97706` | White | Secondary actions: "View VIP Options" |
| `ghost` | Transparent | `#6B21A8` | Tertiary: "Learn More", "Back" |

```typescript
// All buttons: height 52, border radius 12, font Roboto_700Bold 16
// Loading state: show spinner, disable press, reduce opacity to 0.7
// Disabled state: opacity 0.4, no press feedback
```

### Chat Bubbles (Slaws AI interface)

```
User message:  background #6B21A8, text white, align right, radius [16,16,4,16]
Slaws message: background #FAFAF9, text #1C1917, align left, radius [16,16,16,4],
               border 1px #E5E7EB
```

### Cards

```
background: #FFFFFF
border: 1px solid #F3F4F6
border-radius: 12
padding: 16
shadow: shadows.sm
```

### Input Fields

```
background: #FAFAF9
border: 1.5px solid #E5E7EB
border-radius: 8
height: 52
padding horizontal: 16
font: Roboto_400Regular 15
focus border: #6B21A8
error border: #F43F5E
placeholder color: #9CA3AF
```

### Subscription Badge

```
background: linear-gradient(135deg, #6B21A8, #D97706)
text: white, Roboto_700Bold 12
border-radius: 999 (pill)
padding: 4 12
```

### VIP Label

```
background: #D97706
text: white, Inter_700Bold 11
border-radius: 4
padding: 2 8
```

---

## 7. Navigation Structure (Mobile App)

```
Bottom Tab Navigator (4 tabs):
  1. Home         — icon: home        — for all users
  2. Store        — icon: shopping-bag — Women's Store (subscriber-gated content)
  3. Events       — icon: calendar     — events listing
  4. Hub          — icon: academic-cap — Entrepreneur Hub (subscriber-gated)

Stack Navigator (per tab):
  Each tab has its own stack for deep navigation.

Modals:
  - Subscribe     — triggered whenever non-subscriber hits gated content
  - Volunteer Form
  - Payment / Checkout
  - Onboarding flow (shown once, on first login)
```

---

## 8. Access Control UI Patterns

### Non-subscriber gated content
- Show the content title and a blurred/locked preview
- Overlay a subscribe card with the exact copy:
  > "This content is available to SlawsNigeria subscribers.
  > It takes less than a minute to subscribe and unlock full access."
- Primary CTA button: "Subscribe Now" → opens Subscribe modal
- Never show a raw error message or 403 screen

### Subscriber badge
- Show a small purple badge "✓ Subscriber" in the profile header
- Premium content shows no lock icon for subscribers

---

## 9. Loading & Empty States

- Loading: use a skeleton screen (not a spinner) for list views and content cards
- Loading spinner (purple, 24px) for button actions and single-item fetches
- Empty state: illustration + headline + body copy + CTA
  - Do not leave blank screens
  - Empty states use Poppins_600SemiBold headline, Roboto body, primary button

---

## 10. Accessibility

- Minimum tap target size: 44×44 points
- All interactive elements have `accessibilityLabel` set
- Colour contrast ratio: minimum 4.5:1 for body text, 3:1 for large text
  (verified: #1C1917 on #FAFAF9 = 16.8:1 ✓)
- Support system font scaling (do not use fixed font sizes that block OS accessibility)
- All images have `accessibilityHint` or `accessible={false}` if decorative
