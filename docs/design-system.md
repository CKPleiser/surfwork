# SurfWork Design Kit

**Version:** 1.0.0
**Philosophy:** Handcrafted, coastal, calm — designed for surf culture, not corporate startups.

---

## 📐 Design Tokens

### Colors

Our color palette is warm, soft, and natural — inspired by coastal environments.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#006D5B` | Primary actions, links, brand elements |
| `--color-primary-hover` | `#0C8572` | Hover state for primary elements |
| `--color-accent` | `#F2E6C8` | Accent highlights, warm emphasis |
| `--color-background` | `#FAFAF8` | Page background, off-white |
| `--color-surface` | `#FFFFFF` | Cards, modals, elevated surfaces |
| `--color-border` | `#E6E3DD` | Default borders, dividers |
| `--color-text-primary` | `#1B1B18` | Primary text, headings |
| `--color-text-secondary` | `#56544F` | Secondary text, captions |
| `--color-success` | `#49A078` | Success states, confirmations |
| `--color-destructive` | `#DA5C5C` | Errors, destructive actions |

**Tailwind Usage:**
```jsx
<div className="bg-primary text-white">
<p className="text-text-secondary">
<button className="bg-accent hover:bg-accent-hover">
```

---

### Typography

**Font Families:**
- **Heading:** Space Grotesk (weights: 600–700)
- **Body:** Inter (weights: 400–500)

**Type Scale:**

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--text-xs` | 12px | 16px | Fine print, labels |
| `--text-sm` | 14px | 20px | Small body text |
| `--text-base` | 16px | 24px | Default body text |
| `--text-lg` | 18px | 28px | Large body text |
| `--text-xl` | 20px | 28px | Small headings |
| `--text-2xl` | 24px | 32px | Medium headings |
| `--text-3xl` | 32px | 40px | Large headings |
| `--text-4xl` | 48px | 56px | Hero headings |

**Tailwind Usage:**
```jsx
<h1 className="font-heading text-4xl font-semibold">
<p className="font-body text-base">
<small className="text-sm text-text-secondary">
```

---

### Spacing

4px grid system for consistent vertical rhythm.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tiny gaps |
| `--space-2` | 8px | Small gaps |
| `--space-3` | 12px | Compact spacing |
| `--space-4` | 16px | Default spacing |
| `--space-6` | 24px | Medium spacing |
| `--space-8` | 32px | Large spacing |
| `--space-12` | 48px | Extra large spacing |
| `--space-section` | 80px | Section vertical padding |

**Tailwind Usage:**
```jsx
<div className="space-y-4">
<section className="py-section">
<div className="gap-6">
```

---

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Chips, small elements |
| `--radius-md` | 12px | Cards, inputs |
| `--radius-lg` | 20px | Large cards, modals |
| `--radius-full` | 9999px | Pills, circular elements |

**Tailwind Usage:**
```jsx
<div className="rounded-md">
<button className="rounded-full">
```

---

### Shadows

Subtle, organic shadows that feel handcrafted.

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 1px rgba(0,0,0,0.04)` | Subtle depth |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Default cards |
| `--shadow-md` | `0 4px 8px rgba(0,0,0,0.08)` | Hover states |
| `--shadow-lg` | `0 8px 16px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-primary` | `0 2px 8px rgba(0,109,91,0.15)` | Primary button hover |

**Tailwind Usage:**
```jsx
<div className="shadow-sm hover:shadow-md">
<button className="shadow-primary">
```

---

## 🎨 Components

### Button

**Variants:** `primary`, `secondary`, `text`, `destructive`, `success`
**Sizes:** `sm`, `md`, `lg`, `icon`

**Usage:**
```jsx
import { Button } from "@/components/ui/button";

<Button variant="primary" size="md">
  Browse Jobs
</Button>

<Button variant="secondary">
  Post a Job
</Button>

<Button variant="text">
  Learn More
</Button>
```

**States:**
- Hover: Lifts `-1px` with shadow increase
- Active: Returns to baseline
- Disabled: Reduced opacity (40%)
- Focus: Ring with `--color-focus-ring`

---

### Input

Clean, accessible form input with focus states.

**Usage:**
```jsx
import { Input } from "@/components/ui/input";

<Input type="text" placeholder="Your email" />
<Input type="email" error={true} />
```

**States:**
- Hover: `shadow-sm`
- Focus: Ring with `--color-focus`
- Error: Red border with destructive ring
- Disabled: Reduced opacity, no interaction

---

### Card

Cards with optional handcrafted styling and paper texture.

**Variants:** `default`, `handcrafted`, `flat`

**Usage:**
```jsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";

<Card variant="handcrafted" textured>
  <CardHeader>
    <CardTitle>Surf Coach</CardTitle>
    <CardDescription>Bali, Indonesia</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Amazing opportunity...</p>
  </CardContent>
</Card>
```

**Handcrafted Features:**
- Slight rotation (`-0.5deg`, `0.3deg`)
- Hover: Straightens and lifts
- Paper texture overlay (optional)

---

### Chip

Small badges for labels, tags, and filters.

**Variants:** `default`, `selected`, `accent`, `success`, `destructive`

**Usage:**
```jsx
import { Chip } from "@/components/ui/chip";

<Chip variant="default">Surf Coach</Chip>
<Chip variant="selected">Accommodation</Chip>
<Chip variant="success" interactive onRemove={() => {}}>
  Remote
</Chip>
```

**Interactive Mode:**
- Hover: Scale up (`scale-105`)
- Click: Scale down (`scale-95`)
- Remove button (optional)

---

### Navbar

Minimal, sticky navigation with blur backdrop.

**Usage:**
```jsx
import { Navbar, NavbarNav, NavbarLink } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";

<Navbar>
  <NavbarNav>
    <NavbarLink href="/jobs" active>Browse Jobs</NavbarLink>
    <Button variant="secondary" size="sm">Post a Job</Button>
  </NavbarNav>
</Navbar>
```

**Features:**
- Sticky positioning (`sticky top-0`)
- Blur backdrop (`backdrop-blur-md`)
- Semi-transparent background (`bg-surface/80`)

---

### Footer

Compact, community-focused footer.

**Usage:**
```jsx
import { Footer, FooterLinks, FooterLink } from "@/components/ui/footer";
import { Heart } from "lucide-react";

<Footer
  tagline="Built by surf coaches — funded by donations"
  year={2025}
>
  <FooterLinks>
    <FooterLink href="/support" icon={<Heart className="h-4 w-4" />}>
      Support Surf Work
    </FooterLink>
    <FooterLink href="https://instagram.com/surfwork">
      Instagram
    </FooterLink>
  </FooterLinks>
</Footer>
```

---

### Search Bar

Featured search with role and location inputs.

**Usage:**
```jsx
import { SearchBar } from "@/components/ui/search-bar";

<SearchBar
  onSearch={(role, location) => {
    console.log({ role, location });
  }}
  rolePlaceholder="Role (e.g., surf coach)"
  locationPlaceholder="Location"
/>
```

**Features:**
- Decorative glow behind card
- Responsive layout (stacks on mobile)
- Gradient background
- Integrated search button

---

## 🎭 Motion System

### Duration Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Quick interactions |
| `--duration-normal` | 200ms | Default transitions |
| `--duration-moderate` | 250ms | Ripples, bounces |
| `--duration-slow` | 400ms | Page entrances, shakes |

### Easing Tokens

| Token | Curve | Usage |
|-------|-------|-------|
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default transitions |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful interactions |
| `--ease-smooth` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Smooth, organic motion |

### Animations

**Available Classes:**
```jsx
<div className="animate-fade-up">           // Entrance from below
<div className="animate-fade-down">         // Dropdown entrance
<div className="animate-shake">             // Error feedback
<div className="animate-ripple">            // Button press
<div className="animate-check-pop">         // Success confirmation
<div className="stagger-item">              // List stagger effect
```

**Stagger Animation:**
List items automatically stagger with 80ms delays:
```jsx
<div className="grid gap-4">
  {jobs.map((job, i) => (
    <div key={i} className="stagger-item">
      {/* Content */}
    </div>
  ))}
</div>
```

---

## 🎯 Design Principles

### 1. Authenticity Over Polish
- Slight imperfections are welcome
- Handcrafted rotation on cards
- Organic spacing, not rigid grids

### 2. Calm Interactions
- Subtle hover effects
- Gentle transitions (150–400ms)
- No flashy gradients or neon

### 3. Coastal Aesthetics
- Warm, natural colors
- Paper grain textures
- Soft, organic shadows

### 4. One Primary Action
- Clear visual hierarchy
- Avoid button clutter
- Guide user attention naturally

### 5. Human Scale
- Feels approachable, not corporate
- Simple language and labels
- Community-first mindset

---

## 🚫 What to Avoid

❌ Gradients (except subtle backgrounds)
❌ Glassmorphism or heavy blur
❌ Neon colors or high saturation
❌ Overly complex animations
❌ Corporate UI patterns
❌ Rigid, perfect layouts

✅ Subtle textures
✅ Warm, natural colors
✅ Calm, organic motion
✅ Handcrafted imperfections
✅ Coastal, humble vibe

---

## 📦 File Structure

```
/styles
  tokens.css         # Design token definitions
  motion.css         # Animation tokens and keyframes

/components/ui
  button.tsx         # Button component
  input.tsx          # Input component
  card.tsx           # Card component family
  chip.tsx           # Chip/badge component
  navbar.tsx         # Navigation component
  footer.tsx         # Footer component
  search-bar.tsx     # Search bar component

/lib
  utils.ts           # Utility functions (cn, etc.)
```

---

## 🔄 Version History

**v1.0.0** (Current)
- Initial release
- Core component library
- Design token system
- Motion tokens and animations
- Handcrafted aesthetic system
