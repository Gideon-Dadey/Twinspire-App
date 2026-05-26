# TwinSpire design system

The TwinSpire design system lives in [`packages/ui`](../packages/ui) and is published to all
apps via the `@twinspire/ui` workspace package. It is built on Tailwind CSS, Radix Primitives,
Shadcn-style component recipes, Framer Motion, and Lucide icons.

```
┌─────────────────────────────────────────────────────────────┐
│ Tokens (TS + CSS vars + Tailwind preset)                    │
├─────────────────────────────────────────────────────────────┤
│ Utilities (cn, hooks, formatters)                           │
├─────────────────────────────────────────────────────────────┤
│ Primitives (Button, Input, Dialog, Sheet, Tabs, …)          │
├─────────────────────────────────────────────────────────────┤
│ Motion (FadeIn, Reveal, Stagger, PageTransition + presets)  │
├─────────────────────────────────────────────────────────────┤
│ Commerce composables (ProductCard, PriceTag, RatingStars…)  │
└─────────────────────────────────────────────────────────────┘
```

## Importing

```ts
import {
  Button,
  Card,
  Money,
  PriceTag,
  ProductCard,
  Reveal,
  Toaster,
  toast,
  TooltipProvider,
} from '@twinspire/ui';
```

The package exports:

| Entry point                          | What it ships                                              |
| ------------------------------------ | ---------------------------------------------------------- |
| `@twinspire/ui`                      | Components, composables, hooks, tokens, motion             |
| `@twinspire/ui/tokens`               | TypeScript-only design tokens                              |
| `@twinspire/ui/tailwind-preset`      | Tailwind preset (colors, fonts, animations, keyframes)     |
| `@twinspire/ui/styles/globals.css`   | CSS variables (light + dark) + base layer normalizations   |

## Foundations

### Tokens

Tokens are defined once in [`packages/ui/src/tokens.ts`](../packages/ui/src/tokens.ts) and mirrored
to:

1. **CSS variables** in [`src/styles/globals.css`](../packages/ui/src/styles/globals.css) (HSL
   components so Tailwind alpha modifiers — `bg-primary/40` — work).
2. **Tailwind theme** in [`tailwind.preset.cjs`](../packages/ui/tailwind.preset.cjs).

The token surface area covers:

* `palette` — `primary` (TwinSpire Blue `#0055FF`), `secondary` (Onyx `#111827`), `accent`
  (Voltage Orange `#F97316`), `neutral`, plus status (`success`, `warning`, `danger`, `info`).
* `typography` — Inter (sans), Geist (display), Geist Mono (mono), 2xs → 9xl scale.
* `spacing` — 0–96 (rem-based), aligned with Tailwind defaults.
* `radii` — `xs`–`4xl`, `full`.
* `shadows` — `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `inner`, `glow` (brand glow ring).
* `screens` — `xs` (320px) through `3xl` (1920px).
* `zIndex` — semantic stops (`dropdown`, `modal`, `popover`, `toast`, …).
* `motion` — Tailwind-aligned `duration` and `easing` tokens.

The Tailwind preset additionally exposes:

* `bg-gradient-hero`, `bg-gradient-card`, `bg-shimmer-bg`
* `animate-fade-in / fade-out / slide-up / slide-down / scale-in / shimmer / pulse-soft / marquee`
* `transition-duration-fast/moderate/slow/…` and `ease-spring`, `ease-out-expo`
* `aspect-product` (4 / 5) and `aspect-banner` (21 / 9)

### Dark mode

Dark mode is toggled by the `dark` class on `<html>` (managed by `next-themes`). The frontend's
`<ThemeProvider>` (in `apps/frontend/src/components/providers/theme-provider.tsx`) wires this up
with `attribute="class"` + `enableSystem` + `disableTransitionOnChange`.

CSS variables flip in `:root` vs `.dark`. The frontend layout already loads
`@twinspire/ui/styles/globals.css` via `apps/frontend/src/app/globals.css`.

## Utilities

| Export              | Location                                  | What it does                                 |
| ------------------- | ----------------------------------------- | -------------------------------------------- |
| `cn(...classes)`    | `lib/cn.ts`                               | `clsx + tailwind-merge` class merger         |
| `useMediaQuery`     | `lib/hooks/use-media-query.ts`            | SSR-safe match-media subscription            |
| `useIsMobile/Tablet/Desktop` | same                              | Breakpoint helpers                            |
| `usePrefersReducedMotion`    | same                              | Respect OS motion preferences                 |
| `useControllableState`       | `lib/hooks/use-controllable-state.ts`     | Controlled/uncontrolled state hybrid          |
| `useDebouncedValue`          | `lib/hooks/use-debounced-value.ts`        | Debounced reactive value                      |
| `useCopyToClipboard`         | `lib/hooks/use-copy-to-clipboard.ts`      | Clipboard copy with success flag              |
| `useMounted`                 | `lib/hooks/use-mounted.ts`                | Hydration-safe boolean                        |

Money / number / date formatting still live in [`@twinspire/utils`](../packages/utils/src/format.ts)
and are re-used by the commerce composables.

## Primitives

Shadcn-style recipes wrapping Radix Primitives. All ship with:

* `cn`-based composition (override-friendly Tailwind class merging).
* Keyboard accessible defaults (Radix takes care of ARIA roles + focus management).
* `data-state` attribute hooks for motion / animation classes.
* `focus-visible:ring-ring ring-offset-background` for consistent focus rings.

Shipped primitives:

```
Accordion           Alert (variants)        AlertDialog
AspectRatio         Avatar                  Badge (variants)
Button (CVA)        Card (.Header/.Title…)   Checkbox
Dialog              DropdownMenu             EmptyState
FormField (a11y)    Input (with addons)      Kbd
Label               Popover                  Progress
RadioGroup          ScrollArea               Select
Separator           Sheet (side variants)    Skeleton (shimmer)
Slider              Spinner                  Switch
Tabs                Textarea                 Toaster (Sonner)
Tooltip
```

### `Button`

`Button` is a `class-variance-authority` recipe. It accepts:

* `variant`: `default | destructive | outline | secondary | ghost | link | accent | success`
* `size`: `xs | sm | md | lg | xl | icon | icon-sm | icon-lg`
* `rounded`: `default | full | none`
* `loading`: shows a spinner and sets `aria-busy`
* `leftIcon` / `rightIcon`: render alongside children
* `asChild`: forward props to a custom child (Next/Link, Tooltip trigger, …)

```tsx
<Button asChild size="xl" rounded="full" rightIcon={<ArrowRight />}>
  <Link href="/deals">Shop today's deals</Link>
</Button>
```

### `FormField`

Accessible field wrapper — wires `htmlFor`, `aria-describedby`, and `aria-invalid`
automatically, then clones the child input with the right ids:

```tsx
<FormField id="email" label="Email" required error={errors.email?.message}>
  <Input type="email" {...register('email')} />
</FormField>
```

The error message is rendered with `role="alert"` for screen-reader announcement.

## Motion

Motion utilities live in `@twinspire/ui` (re-exported from `motion/`). They wrap Framer Motion
with project-default easings/durations and respect `prefers-reduced-motion`.

| Export        | What it is                                                       |
| ------------- | ---------------------------------------------------------------- |
| `presets`     | `fadeIn`, `slideUp`, `slideInLeft/Right`, `scaleIn`, `pop`, …    |
| `springs`     | `soft`, `snappy`, `bouncy`                                       |
| `<FadeIn>`    | Fades in on mount                                                |
| `<Reveal>`    | Slides up on scroll-into-view (first time)                       |
| `<Stagger>` + `<StaggerItem>` | Stagger children when the container enters view  |
| `<PageTransition pageKey>`    | Wrap route children for cross-fade transitions   |

Each motion component checks `useReducedMotion` (Framer) or `usePrefersReducedMotion` and falls
back to a static `<div>` for users who opt out.

## Commerce composables

| Component            | Notes                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------- |
| `<Money>`            | Renders `Money` or `(amount, currency)` via `formatMoney` from `@twinspire/utils`.       |
| `<PriceTag>`         | Current price + optional compare-at + computed discount; sized `sm/md/lg/xl`.            |
| `<RatingStars>`      | Decimal-precise fill, accessible label (`role="img"`), optional value/count.             |
| `<StockBadge>`       | Maps `StockStatus` (`in_stock`, `low_stock`, …) to the appropriate Badge variant.        |
| `<ProductCard>`      | Composes image, badges, price tag, rating, stock, CTA, and wishlist toggle.              |
| `<ProductCardSkeleton>` | Shimmering loading state with the same layout.                                        |
| `<CategoryCard>`     | Square or full-bleed tile, hover lift, optional image + product count.                   |
| `<QuantityStepper>`  | Controlled/uncontrolled, clamped to `min`/`max`, keyboard accessible.                    |
| `<Breadcrumb>`       | Accessible breadcrumb with custom link component + chevron/slash separators.             |

`<ProductCard>` accepts a `linkComponent` and `imageComponent` prop so the Next.js storefront
can pass `next/link` and `next/image` while Storybook / tests use plain `<a>` / `<img>`.

## Storybook

Storybook 8 is configured in [`packages/ui/.storybook`](../packages/ui/.storybook) with:

* **Addons**: `essentials`, `interactions`, `a11y`, `themes`, `links`
* **Builder**: `@storybook/react-vite`
* **Theme switcher**: `withThemeByClassName` (light ↔ dark via `.dark`)
* **A11y**: axe-core through `@storybook/addon-a11y`

```bash
pnpm --filter @twinspire/ui storybook        # http://localhost:6006
pnpm --filter @twinspire/ui storybook:build  # static build to storybook-static/
```

Stories ship for Foundations (`tokens.stories.tsx`), Primitives (`Button`, `Badge`, `Input`,
`Dialog`), Motion presets, and Commerce composables (`ProductCard`, `PriceTag`,
`RatingStars`, `QuantityStepper`).

## Testing

`packages/ui` uses **Jest 29 + jsdom + Testing Library + user-event**.

```bash
pnpm --filter @twinspire/ui test          # one-off
pnpm --filter @twinspire/ui test:watch    # watch mode
```

Tests focus on behaviour and accessibility (`role`, `aria-*`, keyboard) rather than markup
snapshots. Covered today:

* `cn()` Tailwind merger
* `<Button>` (loading, disabled, refs, variants)
* `<Badge>` (variants)
* `<FormField>` (a11y wiring: label, description, error, `aria-invalid`)
* `<Money>` (formatting + strikethrough)
* `<PriceTag>` (current + compare-at + discount)
* `<RatingStars>` (clamping + a11y label)
* `<QuantityStepper>` (clamping + callbacks)
* `<ProductCard>` (link, CTA, wishlist toggle, OOS state)

## Frontend integration

`apps/frontend/tailwind.config.ts` consumes the preset:

```ts
import preset from '@twinspire/ui/tailwind-preset';
export default { presets: [preset], content: [...] };
```

`apps/frontend/src/app/globals.css` already imports
`@twinspire/ui/styles/globals.css`, so the CSS variables and base layer are available app-wide.

The root layout wires `<TooltipProvider>` and `<Toaster>` from `@twinspire/ui`:

```tsx
<ThemeProvider>
  <QueryProvider>
    <TooltipProvider delayDuration={300} skipDelayDuration={150}>
      {children}
    </TooltipProvider>
    <Toaster />
  </QueryProvider>
</ThemeProvider>
```

Marketing sections on the home page (`Hero`, `CategoryGrid`, `FeaturedProducts`) are wired with
`<Reveal>`, `<Stagger>`, and `<ProductCard>` to showcase the system.

## Conventions

1. **Composition over flags** — primitives are intentionally small. Compose them (e.g.
   `Card + Money + PriceTag + RatingStars + StockBadge`) rather than adding kitchen-sink props.
2. **Forward refs everywhere** — every primitive uses `React.forwardRef` so it plays nicely with
   Radix `asChild`, Tooltip triggers, and React Hook Form.
3. **Class merging via `cn`** — never inline-conditional className strings. Always go through
   `cn()` so consumer overrides win deterministically.
4. **`data-state` for motion** — animate on Radix's `data-state="open|closed"` rather than
   measuring React state.
5. **A11y is non-negotiable** — every interactive primitive has a visible focus ring, ARIA roles
   via Radix, and a label/`sr-only` fallback.
6. **Respect motion preferences** — every motion primitive short-circuits when
   `prefers-reduced-motion: reduce`.
