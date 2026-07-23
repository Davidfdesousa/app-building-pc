# Design System: Steam

## 1. Visual Theme & Atmosphere

Steam uses a dark, utilitarian storefront aesthetic built around dense game discovery. The interface feels like a control panel for browsing a very large catalog: subdued chrome, image-led merchandising, compact metadata, and clear visual emphasis on price, ranking, and call-to-action states.

- Overall feeling: Dark, technical, commerce-driven, and gamer-centric.
- Visual density: High; many links, categories, cards, prices, rankings, and promotional modules coexist in the same view.
- Brand posture: Functional and established rather than trendy; confident, platform-like, and utility-first.
- Signature motifs: Deep navy backgrounds, square-edged modules, compact uppercase navigation, capsule-style game art, and dense sale/event merchandising.

### Key Characteristics

- Dark-first marketplace UI
- Image-led product discovery
- Compact information hierarchy
- Rectangular, low-radius components

## 2. Color Palette & Roles

Observed branding data indicates a dark color scheme. Some exported text tokens conflict with the visible dark UI, so explicit light text values from component evidence are treated as higher-confidence for readable text usage.

| Role | Semantic Name | Value | Usage |
| --- | --- | --- | --- |
| Primary action | Steam Action Blue | #386483 | Primary buttons, active commerce actions, selected emphasis |
| Accent | Steel Slate | #3D4450 | Secondary emphasis, structural contrast, subdued chrome |
| Surface | Store Panel Navy | #1C2836 | Secondary surfaces, dark buttons, panel backgrounds |
| Text | Frost White / Mist Text | #FFFFFF / #C6D4DF | Readable text on dark surfaces; white for strong contrast, mist for softer labels |
| Border | Gunmetal Line | #313943 | Input borders, rings, separators, low-contrast structure |

### Primary

- Deep Background Navy `#0F1924` is the global page backdrop.
- Store Panel Navy `#1C2836` is used for secondary surfaces and dark button treatments.

### Interactive

- Primary CTA uses Steam Action Blue `#386483` with Mist Text `#C6D4DF`.
- Secondary CTA uses Store Panel Navy `#1C2836` with white text `#FFFFFF`; focus and field boundaries use Gunmetal Line `#313943`.

### Neutral Scale

- `#0F1924` — darkest background layer
- `#1C2836` — panel and secondary control layer
- `#3D4450` — structural neutral for contrast, inactive states, and subdued emphasis

### Surface & Overlay

- Surface token: Store Panel Navy `#1C2836`
- Overlay token: `rgba(0, 0, 0, 0.24)` used in the observed primary button shadow

### Theme Modes

Only dark mode is evidenced in the provided branding export and page content.

#### Light Mode

- Background: Not observed
- Surface: Not observed
- Text: Not observed
- Accent: Not observed
- Notes: No supported light theme is evidenced in the provided data.

#### Dark Mode

- Background: Deep Background Navy `#0F1924`
- Surface: Store Panel Navy `#1C2836`
- Text: White `#FFFFFF` and Mist Text `#C6D4DF`
- Accent: Steam Action Blue `#386483`
- Notes: Firecrawl explicitly reports `colorScheme: dark`. Exported `textPrimary` and `link` values of `#0F1924` appear inconsistent with the visible dark UI and should be treated as low-confidence artifacts.

### Shadows & Depth

- Observed: Borders and rings are subtle, with Gunmetal Line `#313943` doing most of the separation work.
- Observed: Primary button shadow is `0 3px 6px 0 rgba(0, 0, 0, 0.24)`.
- Inferred: Focus treatment is likely contrast- or border-based rather than a bright glowing ring.

## 3. Typography Rules

Steam’s typography is compact and UI-led. The system prioritizes catalog density and scanability over expressive editorial type. Large promotional presence often comes from artwork itself rather than oversized live HTML headings.

### Font Family

- Primary: Motiva Sans
- Monospace: Not evidenced
- OpenType Features: Not evidenced

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Hero headline | Motiva Sans | 12px observed in sampled HTML; larger display scale is likely image-based | 700 inferred | 1.2 inferred | Normal | Promotional emphasis often lives inside game artwork rather than live text |
| Section heading | Motiva Sans | 12px | 700 inferred | 1.3 inferred | Slightly tightened / neutral | Used for dense storefront section labels and navigation group titles |
| Body | Motiva Sans | 11px | 400 inferred | 1.4 inferred | Normal | Compact catalog text, supporting metadata, review and price context |
| Label / Eyebrow | Motiva Sans | 11px | 700 inferred | 1.2 inferred | Slight positive tracking | Common for uppercase nav labels, event flags, and category markers |
| Caption / Meta | Motiva Sans | 11px | 400 inferred | 1.3 inferred | Normal | Reviews, rankings, release dates, discount labels, and utility text |

### Principles

- Favor compact type to support high information density.
- Use uppercase labels sparingly but consistently for structural navigation and merchandising flags.
- Let game imagery carry emotional impact while typography handles utility, status, and commerce.

## 4. Component Stylings

Steam’s UI patterns are defined by marketplace components rather than editorial storytelling components. Product imagery, ranking data, discount blocks, and segmented navigation form the visual grammar.

### Buttons and Links

- Primary CTA: Flat rectangular button in Steam Action Blue `#386483`, with Mist Text `#C6D4DF`, square corners, and a restrained drop shadow.
- Secondary CTA: Dark rectangular button in Store Panel Navy `#1C2836`, white text `#FFFFFF`, no obvious shadow.
- Text links: Dense and numerous; often presented in utility rows, horizontal nav lists, and metadata clusters. Top-level labels frequently appear uppercase.
- Hover and active feel: Inferred to be restrained and contrast-based, using color shifts more than motion or playful transforms.

### Cards and Containers

- Surface style: Dark panels or art-first capsules with metadata stacked below or alongside.
- Radius: Mostly square; system-level default is `0px`, with some inputs at `2px`.
- Border: Minimal; subtle dark outlines and separators are favored over strong strokes.
- Shadow or elevation: Very light overall; most catalog items feel flat, with selective shadow on stronger calls to action.
- Internal spacing: Tight and efficient, optimized for showing many items per row.

### Inputs and Interactive Controls

- Input treatment: Transparent background, white text, Gunmetal Line `#313943` border.
- Focus behavior: Inferred subtle border/contrast emphasis rather than a prominent glow.
- Selection states: Inferred to rely on darker/lighter fill shifts and adjacent chrome, not rounded chips or pill toggles.

### Navigation

- Structure: Multi-tiered navigation with brand header, store/community segmentation, utility actions, and a responsive hamburger menu.
- Background treatment: Solid dark chrome on deep navy.
- Link style: Compact, often uppercase for major sections, with dense horizontal grouping.
- Sticky or scroll behavior: Not confirmed by the provided evidence.

### Image Treatment

- Screenshot treatment: Product capsules and promotional art dominate; imagery is the primary attention driver.
- Photography or illustration style: Mixed third-party game key art rather than a single unified illustration language.
- Border and radius treatment: Mostly hard-edged rectangular media with little to no decorative masking.

### Distinctive Components

- Featured product capsules with review sentiment, ranking, and pricing stacked into compact blocks
- Sale tiles with large discount percentages, original price, and discounted price hierarchy
- Dense segmented global navigation spanning Store, Community, About, Support, Install Steam, and Sign in

## 5. Layout Principles

### Spacing System

- Base unit: 8px
- Repeated spacing values: 8px, 16px, 24px, and larger multiples are a reasonable inference from the exported base unit and the storefront’s modular layout

### Grid & Container

- Grid logic: Wide storefront grid with horizontal carousels, merch rows, and repeating product capsules
- Max content width: Wide desktop canvas; exact numeric max width is not evidenced
- Section spacing: Moderate, enough to separate modules without reducing catalog density

### Whitespace Philosophy

- Whitespace philosophy: Functional rather than luxurious; used to separate modules, not to create an airy editorial layout
- Alignment tendencies: Strong left alignment with horizontally grouped navigation and card rows
- Content width behavior: Media and commerce modules expand wide on desktop to maximize product visibility

### Border Radius Scale

- Micro: 0px
- Standard: 2px
- Large: Not meaningfully observed; large-radius treatments do not define the system
- Pill: Not observed; avoid pill-shaped controls in Steam-like compositions

## 6. Depth & Elevation

| Level | Treatment | Use |
| --- | --- | --- |
| Flat | No shadow, dark fill, hard edges | Most panels, nav surfaces, and catalog modules |
| Ring | 1px Gunmetal Line `#313943` | Inputs, subtle separators, control boundaries |
| Card | Mostly flat dark surfaces; selective `0 3px 6px rgba(0,0,0,0.24)` shadow | Higher-priority CTAs and emphasized control surfaces |
| Focus | Subtle border or contrast shift, inferred | Keyboard and active control emphasis |

### Depth Principles

- Surface hierarchy: Created mainly through layered dark values, not heavy shadows.
- Shadow language: Restrained and pragmatic; depth is secondary to content density.
- Blur, glass, or overlay behavior: No glassmorphism evidenced; overlays appear conventional and dark.
- When depth is used versus avoided: Use depth sparingly for actions and emphasis; avoid excessive elevation on commodity catalog tiles.

## 7. Do's and Don'ts

### Do

- Use dark navy surfaces with steel-blue accents and low-radius geometry.
- Keep typography compact and utility-oriented, especially for metadata-heavy commerce modules.
- Let product imagery and sale pricing do the visual selling, with UI chrome staying subdued.

### Don't

- Don’t introduce soft, playful, highly rounded SaaS-style components.
- Don’t rely on bright multicolor accents for core UI structure.
- Don’t open up the layout so much that the storefront loses its dense, catalog-driven character.

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
| --- | --- | --- |
| Mobile | <768px inferred | Hamburger navigation appears, header branding compresses, content stacks into narrower rows, and utility navigation condenses |
| Tablet | 768px–1023px inferred | Fewer cards per row, simplified nav grouping, tighter merchandising layout |
| Desktop | 1024px+ inferred | Full multi-row global nav, wide product rails, dense horizontal merchandising, broader catalog visibility |

### Touch Targets

- Keep tappable areas larger than the visible text suggests, especially for nav items and product capsules.
- Maintain clear separation between adjacent commerce actions like install, sign-in, price tiles, and card links.

### Collapsing Strategy

- Desktop behavior: Preserve the full layered header and broad multi-item merchandising rows.
- Tablet behavior: Reduce visible items per row and simplify secondary nav clusters.
- Mobile behavior: Collapse global navigation into a hamburger/drawer pattern and stack or shorten merchandising strips.
- Breakpoint-driven component changes: Product rails should show fewer capsules, and metadata should compress before imagery does.
- Touch target and spacing adjustments: Increase hit areas while keeping the text scale compact and the visual density intact.

## 9. Agent Prompt Guide

### Quick Color Reference

- Primary CTA: Steam Action Blue `#386483`
- Background: Deep Background Navy `#0F1924`
- Heading text: White `#FFFFFF`
- Body text: Mist Text `#C6D4DF`
- Border or ring: Gunmetal Line `#313943`
- Accent: Steel Slate `#3D4450`

### Quick Summary

Build a dark, image-led game storefront with compact Motiva Sans typography and dense merchandising.
Use deep navy backgrounds, rectangular panels, and restrained blue-gray accents.
Keep corners mostly square, shadows minimal, and borders subtle.
Favor multi-row navigation, product capsules, discount blocks, review metadata, and rank/status labels.
Let game art carry emotion while the UI stays functional and commerce-first.
Avoid airy editorial spacing or playful rounded consumer-app styling.

### Example Component Prompts

- Hero: Create a dark Steam-like featured game module with wide key art, compact metadata, review sentiment, ranking, and a rectangular CTA in `#386483`.
- Card: Design a rectangular product capsule with hard edges, dense title/review/price metadata, and minimal shadow on a `#1C2836` surface.
- Navigation: Build a multi-tier dark navigation bar with uppercase primary sections, compact utility links, and a mobile hamburger fallback.
- Button or badge: Create a square-corner primary action button in `#386483` with `#C6D4DF` text, or a compact dark badge using `#1C2836` and white text.

### Ready-to-Use Prompt

Design this interface in a Steam-inspired storefront style: dark navy background `#0F1924`, secondary surfaces `#1C2836`, blue-gray CTA `#386483`, compact Motiva Sans typography, mostly square corners, subtle `#313943` borders, minimal shadow, dense product cards, and commerce-focused metadata like reviews, prices, and discounts.

### Iteration Guide

1. Start with dark rectangular structure and dense navigation before adding decorative styling.
2. Prioritize product imagery, pricing, and review metadata over large expressive type.
3. If a design feels too soft, bright, airy, or rounded, pull it back toward flatter, denser, darker utility styling.

## Optional Appendix: Interaction Patterns

- Scroll behavior: Not explicitly evidenced; likely conventional storefront scrolling with stacked merch sections.
- Hover behavior: Inferred subtle color and contrast changes rather than dramatic animation.
- Click behavior: Large linked product capsules and utility links encourage direct navigation.
- Animation tone: Restrained and utilitarian, if present.

## Optional Appendix: Content & Messaging Patterns

- Headline pattern: Product titles, event labels, and practical section names rather than brand-slogan storytelling
- CTA language: “Install Steam,” “Sign in,” “See More,” “Free To Play,” and other direct action labels
- Trust signal pattern: Review sentiment, review counts, discount percentage, regional ranking, price comparison
- Voice and tone: Modern, practical, gamer-oriented, and commerce-focused

## Optional Appendix: Observed Pages

- Homepage / Store front: Established dark theme, dense navigation, product capsule layout, sales modules, and utility CTAs
- Responsive header/footer content: Confirmed multi-tier nav, hamburger pattern, Install Steam action, language switcher, and dense footer/legal structure
- Discounts & Events / Featured & Recommended sections: Confirmed art-led promo tiles, stacked discount pricing, review/rank metadata, and modular merch composition