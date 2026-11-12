---
name: Institutional RM Ledger
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002109'
  on-tertiary-container: '#009842'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system targets Tier-1 commercial, corporate, and private banking Relationship Managers (RMs), onboarding operations analysts, and compliance directors. Its operating environment is fast-paced, high-risk, and document-dense. The interface serves as a command ledger for tracking complex institutional client onboarding packages (e.g., entity formation documents, beneficial ownership registers, AML/KYC verifications, and regulatory disclosures), along with automated, audit-logged client chasing correspondence.

The design movement is **Precision Institutional / Modern Financial Utility**. It prioritizes zero ambiguity, immediate visual verification, and high cognitive throughput:
- **Atmosphere:** Rigorous, unhurried, silent competence. It avoids recreational whitespace, playful micro-interactions, decorative gradient meshes, or generative AI gimmicks.
- **Data Integrity:** Strict vertical and horizontal tabular registration, prominent status encoding, and uncompromising typographic hierarchy.
- **Clarity over Expression:** Interactive states are direct, deterministic, and unmistakably distinct from passive reading states.

## Colors

The palette establishes institutional trust through disciplined deep-slate neutrals, complemented by functional semantic anchors for document lifecycle statuses:

### Primary & Functional Accents
- **Canvas & Surface Base:** Pure light environment (`#f8fafc` canvas background, `#ffffff` for elevated sheets, cards, and data tables).
- **Primary Ink & Structures (`#0f172a` / `#1e293b`):** Defines headers, active rows, structural dividers, and primary command buttons.
- **System Action & Trust Accent (`#0284c7` / `#2563eb`):** Reserved strictly for interactive link elements, client chasing triggers, active tab selections, and keyboard focus states.

### Status Semantics (Unambiguous Lifecycle Mapping)
Status tokens must never rely solely on hue; they must pair with explicit text labels and tabular indicator icons:
- **Received / Verified:** `#16a34a` (fill/badge text), `#dcfce7` (soft container base), `#15803d` (deep edge/border). Signifies validated and legally sufficient documentation.
- **Pending Review / Confirm Unconfirmed:** `#d97706` (text/fill), `#fef3c7` (soft container base), `#b45309` (deep edge/border). Indicates pending analyst audit or discrepancies requiring RM clearance.
- **Missing / Action Required:** `#64748b` (slate text/fill), `#f1f5f9` (soft container base), `#475569` (border). Represents un-submitted mandatory documents ready for client chase sequences.
- **Critical Block / Expired:** `#dc2626` (text), `#fee2e2` (container), `#b91c1c` (border). For sanctions hits, invalid legal signatures, or past-cutoff deadlines.

## Typography

Typography prioritizes extreme legible density and structured data parsing:
- **Headings & Body (`Hanken Grotesk`):** Contemporary neo-grotesque with robust stroke definition and high x-height. Ensures swift skimming across multi-column data views without visual fatigue.
- **Data & Identifiers (`JetBrains Mono`):** Applied to document IDs, entity reference codes, timestamps, chasing cadences, and tabular values.
- **Tabular Numerics:** All numerals in data grids, tracker ledgers, and counters must enforce CSS OpenType feature settings: `font-feature-settings: "tnum" 1, "zero" 1`. This aligns numeric values vertically across adjacent records.

## Layout & Spacing

The layout is built for complex financial operations running primarily on 1080p, 1440p, and multi-monitor financial desk setups, with functional responsive accommodation down to tablet viewports for mobile executives:

- **Layout Philosophy:** Fluid-grid master-detail split layout. The left/central pane hosts the primary client entity ledger and document tracker table; the right collateral pane (width: 420px fixed) handles real-time chase email authoring, audit history, and direct PDF previews.
- **Rhythm & Grid:** Built on an intentional 4px baseline system (`0.25rem`), tuned for dense data layouts rather than consumer marketing layouts. Row heights are constrained to 40px (compact) or 48px (standard).
- **Breakpoints:**
  - `Desktop (>= 1280px)`: Full 12-column or dual-pane workspace. Section margins: `2rem`; inner grid gutters: `1.5rem`.
  - `Tablet (768px - 1279px)`: Collateral chase drawer transitions to an overlay sheet. Margins: `1.5rem`; gutters: `1rem`.
  - `Mobile (< 768px)`: Single-column ledger view with document card rows and sticky primary action bars. Margins: `1rem`.

## Elevation & Depth

Visual hierarchy uses **low-contrast architectural outlines and subtle planar elevation** rather than soft ambient blurs or consumer drop-shadows:

- **Borders & Dividers:** The primary spatial separator is a crisp 1px border rendered in slate (`#e2e8f0` on pure white; `#cbd5e1` on hover/active states). This maintains structure across hundreds of table cells.
- **Planes & Surfaces:**
  - `Surface 0 (Canvas)`: `#f8fafc` — Background substrate.
  - `Surface 1 (Base Containers)`: `#ffffff` with a continuous `1px solid #e2e8f0` border.
  - `Surface 2 (Flyouts & Dropdowns)`: `#ffffff` with `0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)` and `1px solid #cbd5e1`.
  - `Surface 3 (Modal / Chase Sequence Overlays)`: `#ffffff` paired with a backdrop scrim of `rgba(15, 23, 42, 0.45)`.
- **Keyboard Navigation & Focus Rings:** Every interactive node carries an uncompromising, high-contrast, dual-ring accessibility outline: `box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #0284c7`.

## Shapes

The design uses a **Soft (Level 1)** radius discipline:
- Standard elements (inputs, buttons, status badges, table row highlights) feature an exact `0.25rem` (4px) corner radius.
- Cards, panels, and modals use `rounded-lg` at `0.5rem` (8px).
- Pill shapes are reserved exclusively for compact numeric counter badges (e.g., pending chase counts) to differentiate them from functional data tags.
- The crisp geometry reinforces institutional precision, maximizing active screen area by eliminating wasteful corner radii.

## Components

### Buttons
- **Primary Action (Send Chase / Verify Doc):** Background `#0f172a`, text `#ffffff`, border `1px solid #0f172a`. Hover: `#1e293b`. Pressed: `#020617`. Focus: standard dual-ring.
- **Secondary / Action Tool (Preview, Template Select):** Background `#ffffff`, text `#1e293b`, border `1px solid #e2e8f0`. Hover: `#f8fafc` with border `#cbd5e1`.
- **Destructive (Reject Doc / Revoke Access):** Background `#ffffff`, text `#dc2626`, border `1px solid #fecaca`. Hover: `#fef2f2`.

### Status Badges (Document Ledger Tags)
- Height: 22px. Padding: `2px 8px`. Font: `label-sm` (`JetBrains Mono`, 10px, uppercase).
- **Received:** Text `#15803d`, background `#f0fdf4`, border `1px solid #bbf7d0`. Left-aligned with an unbroken 6px dot indicator.
- **Confirm Unconfirmed:** Text `#b45309`, background `#fffbeb`, border `1px solid #fde68a`. Left-aligned with an amber warning glyph.
- **Missing:** Text `#475569`, background `#f1f5f9`, border `1px solid #e2e8f0`. Left-aligned with an empty ring glyph.

### Document Tracker Data Table
- **Header:** Height 36px, background `#f8fafc`, typography `label-sm`, text `#64748b`, uppercase, border-bottom `1px solid #cbd5e1`.
- **Row:** Height 44px, alternating hover background `#f8fafc`. Active/Selected row: background `#f0f9ff` with an active 2px left border strip in `#0284c7`.
- **Columns:** Fixed widths for Checkbox (36px), Doc ID (100px Mono), Category (140px), Requirement Name (flexible), Status Badge (130px), Last Action/Timestamp (120px Mono), Chasing Trigger (90px).

### Input Fields & Search Bars
- Background `#ffffff`, border `1px solid #cbd5e1`, padding `8px 12px`, typography `body-md`.
- Placeholder text `#94a3b8`.
- Focus: border `#0284c7` accompanied by the standard dual-ring focus shadow.

### Chase Email Composer Panel
- Fixed side panel embedded directly into the tracker workspace.
- **Context Strip:** Displays recipient entity, KYC officer on record, and auto-populated list of missing documents with copyable secure upload links.
- **Audit Ledger Sub-component:** Monospaced history log recording previous dispatch dates, recipient read receipts, and reminder intervals (e.g., `T-7`, `T-3`, `Final Escalation`).