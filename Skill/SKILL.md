---
name: html-layout
description: Create or improve HTML and frontend layouts for web pages, dashboards, forms, landing pages, and app screens. Use when Codex needs to design responsive semantic HTML, React JSX layout, Tailwind CSS structure, reusable UI sections, or polished page composition from a user request, wireframe, screenshot, or existing frontend code.
---

# HTML Layout

Use this skill to produce clean, responsive, accessible layouts that can be dropped into a web project or adapted to the existing frontend stack.

## Workflow

1. Inspect the target project before editing.
2. Identify the framework, styling system, component library, route structure, and existing layout conventions.
3. Build the actual usable screen first, not a marketing explanation of the screen.
4. Prefer semantic structure: `header`, `nav`, `main`, `section`, `aside`, `footer`, `form`, `table`, and lists where appropriate.
5. Keep the layout responsive with stable constraints: grids, flex rules, `minmax`, `max-width`, aspect ratios, and predictable spacing.
6. Reuse existing components, tokens, icons, utility helpers, and naming patterns.
7. Verify that text, buttons, cards, tables, and form controls do not overlap or overflow on mobile and desktop.

## Layout Rules

- Use one primary layout system per region: grid for page structure, flex for local alignment.
- Keep repeated content in cards only when each card represents a distinct item.
- Do not nest cards inside cards unless the existing design system already does this for a clear reason.
- Use compact, scannable layouts for dashboards, admin tools, CRM screens, medical systems, and operational apps.
- Use generous visual rhythm for editorial, portfolio, product, and public-facing pages.
- Keep hero sections focused on the product, place, person, or offer in the first viewport.
- Put controls near the content they affect.
- Use tables for dense comparable records, not card grids.
- Use tabs for sibling views, menus for option sets, toggles for binary settings, sliders or steppers for numeric values, and icon buttons for common tools.

## Styling Guidance

- Prefer the project's existing design tokens and Tailwind configuration.
- Use restrained color palettes with clear contrast and state changes.
- Avoid one-note palettes dominated by a single hue.
- Avoid decorative gradient blobs, orbs, and purely atmospheric backgrounds.
- Keep border radii at `8px` or less for cards and controls unless the project already uses a different system.
- Use readable type scale. Do not scale font size directly with viewport width.
- Keep letter spacing at `0` unless matching an existing brand rule.

## Accessibility

- Preserve keyboard navigation and visible focus states.
- Use labels for inputs and accessible names for icon-only buttons.
- Keep heading order logical.
- Use sufficient color contrast for text and interactive states.
- Do not rely on color alone to communicate status.

## React And Tailwind

When working in React:

- Create small local components only when they remove meaningful repetition.
- Keep data arrays near the component when they are static mock data for layout.
- Use `lucide-react` icons when available in the project.
- Use existing shadcn/ui or local UI components before writing raw controls.
- Keep class names readable and grouped by purpose: layout, spacing, typography, color, effects.

## Verification

Before finishing:

1. Run the relevant formatter, linter, typecheck, or build command when available.
2. For frontend changes, open the page in a browser when practical.
3. Check at least one desktop and one mobile viewport.
4. Fix layout shifts, overflow, clipping, unreadable text, and broken interactive states.
