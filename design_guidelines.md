# Digital Wallet Application - Design Guidelines

## Design Approach

**Selected Approach:** Design System (Hybrid of Stripe Dashboard + Material Design)

**Justification:** This is a utility-focused financial application where trust, clarity, and efficiency are paramount. Drawing inspiration from Stripe's clean dashboard aesthetic combined with Material Design's robust component patterns ensures a professional, trustworthy interface optimized for frequent financial transactions.

**Key Design Principles:**
1. **Trust Through Clarity:** Every transaction, balance, and action must be immediately understandable
2. **Efficiency First:** Common actions (deposit, transfer) should be accessible within 1-2 clicks
3. **Information Hierarchy:** Financial data presented with clear visual weight and scannable layouts
4. **State Communication:** Transaction status, wallet type, and payment modes clearly differentiated

---

## Typography

**Font Families:**
- Primary: Inter (via Google Fonts) - clean, professional, excellent readability for financial data
- Monospace: JetBrains Mono - for transaction IDs, amounts, timestamps

**Hierarchy:**
- **Dashboard Title/Headers:** text-3xl font-semibold (48px equivalent)
- **Balance Display:** text-5xl font-bold tracking-tight (large numerical prominence)
- **Section Headers:** text-xl font-semibold (20px)
- **Card Titles/Labels:** text-base font-medium (16px)
- **Transaction Details:** text-sm font-normal (14px)
- **Timestamps/Metadata:** text-xs font-normal (12px) with reduced opacity
- **Currency/Amounts:** font-mono font-semibold for numerical consistency

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, 8, 12, 16** (e.g., p-4, gap-6, mb-8)

**Grid Structure:**
- Dashboard: 12-column responsive grid
- Desktop (lg): Sidebar (3 cols) + Main Content (9 cols)
- Tablet (md): Collapsed sidebar + Full-width content
- Mobile: Single column stack

**Container Widths:**
- Main dashboard: max-w-7xl mx-auto
- Forms/Modals: max-w-md
- Transaction tables: w-full with horizontal scroll on mobile

**Vertical Rhythm:**
- Page sections: py-8 lg:py-12
- Cards: p-6
- Form groups: space-y-4
- List items: py-4 with dividers

---

## Component Library

### Navigation & Layout

**Top Navigation Bar:**
- Fixed header with backdrop-blur effect
- Height: h-16
- Contains: Logo (left), Wallet type badge, User menu with balance preview (right)
- Subtle bottom border for definition

**Sidebar Navigation (Desktop):**
- Width: Fixed at 256px on desktop
- Links with icons (Heroicons): Dashboard, Transfer, Transactions, Settings
- Active state with subtle shift and increased font weight
- Collapsible on tablet/mobile into hamburger menu

**Dashboard Layout:**
- Hero-less design (financial dashboard doesn't need hero imagery)
- Immediate data presentation above the fold

### Core Financial Components

**Balance Card (Primary):**
- Prominently placed at top of dashboard
- Large balance display with currency symbol
- Wallet type indicator (Basic/Premium badge)
- Quick action buttons: Deposit, Transfer (equal width, side-by-side)
- Elevated appearance with subtle shadow

**Quick Stats Row:**
- 3-column grid (2-column on tablet, stacked on mobile)
- Metrics: Total Transactions, Successful Transfers, Available Methods
- Each stat in its own card with icon, number (large), and label (small)
- Spacing: gap-6

**Payment Method Selector:**
- Horizontal card-style buttons for UPI, Card, Wallet Balance
- Each method shows icon + label
- Selected state with distinct border treatment
- Grid: grid-cols-3 (stacks to grid-cols-1 on mobile)

**Transaction History Table:**
- Full-width responsive table
- Columns: Date/Time | Description | Payment Method | Amount | Status
- Row hover state for interactivity
- Status badges with distinct styling (Success, Failed, Pending)
- Pagination controls at bottom
- Mobile: Card-based layout replacing table rows

### Forms & Inputs

**Deposit/Transfer Forms:**
- Modal overlay with centered form card (max-w-md)
- Input fields: Full-width with consistent height (h-12)
- Labels: Above inputs with text-sm font-medium
- Amount input: Large text-2xl with currency prefix
- Recipient selection: Searchable dropdown for transfers
- Form spacing: space-y-6 between field groups

**Input States:**
- Default: Subtle border
- Focus: Increased border weight with ring treatment
- Error: Border treatment with error text below (text-sm)
- Disabled: Reduced opacity

### Data Display

**Transaction Cards (Mobile):**
- Stacked cards replacing table rows
- Top row: Amount (large) + Status badge
- Second row: Payment method icon + label
- Bottom: Timestamp (small, muted)
- Dividers between cards
- Spacing: space-y-4

**Analytics Section (Optional Dashboard Widget):**
- 2-column layout on desktop
- Left: Daily total (large number display)
- Right: Payment type breakdown (simple list with percentages)
- Can be expanded into charts if needed

**Empty States:**
- Centered content with icon (96px size)
- Heading + descriptive text
- CTA button to initiate first action
- Applied to: No transactions, No payment methods

### Interactive Elements

**Buttons:**
- Primary: Solid with rounded corners (rounded-lg), px-6 py-3
- Secondary: Outline variant
- Text-only: For tertiary actions
- Icon buttons: Square 40px for actions in tight spaces
- Loading state: Spinner replacing button text

**Badges:**
- Wallet Type: Subtle with border, uppercase text-xs tracking-wide
- Transaction Status: Pill-shaped with semantic styling
- Payment Method: Icon + text combination

**Modals/Overlays:**
- Backdrop with blur effect
- Card-style container with rounded-xl corners
- Close button: Top-right corner (icon button)
- Actions: Bottom-aligned, right-justified button group

### Feedback & States

**Success Confirmation:**
- Toast notification: Slide in from top-right
- Green accent with checkmark icon
- Auto-dismiss after 5 seconds
- Shows transaction ID for reference

**Error Handling:**
- Inline validation errors below inputs
- Alert banner for InsufficientFundsException (prominent, non-dismissible until resolved)
- Failed transaction highlighted in history

**Loading States:**
- Skeleton loaders for transaction history (shimmer effect)
- Spinner for balance refresh
- Button disabled state during form submission

---

## Accessibility & Quality Standards

- All interactive elements: Minimum touch target 44px
- Form inputs: Associated labels with htmlFor
- Keyboard navigation: Full tab order support with focus indicators
- ARIA labels: For icon-only buttons and status indicators
- Contrast: All text meets WCAG AA standards (managed through proper styling, not color specs)

---

## Animations

**Minimal, Purposeful Motion:**
- Page transitions: None (instant load)
- Modal open/close: Subtle fade + scale (200ms ease)
- Balance update: Number count-up animation (500ms)
- Toast notifications: Slide-in from edge (300ms ease-out)
- NO scroll animations, parallax, or decorative motion

---

## Images

**No Hero Image Required** - This is a dashboard application focused on functionality

**Iconography:**
- Use Heroicons (outline style for navigation, solid for emphasis)
- Payment method icons: 24px consistent sizing
- Status indicators: 16px icons in badges
- Empty state illustrations: 96px simple line icons

**Avatar/Profile:**
- User avatar in top navigation (40px circle)
- Default: Initials on subtle background if no image uploaded

---

## Responsive Behavior

**Breakpoints:**
- Mobile: < 768px (single column, stacked cards)
- Tablet: 768px - 1024px (2-column where appropriate, sidebar collapses)
- Desktop: > 1024px (full sidebar, 3-column stats, expanded table)

**Mobile-Specific Adaptations:**
- Bottom navigation bar replacing sidebar
- Transaction table → Card list transformation
- Balance card: Sticky at top during scroll
- Quick actions: Full-width stacked buttons

---

This design creates a professional, trustworthy financial dashboard that prioritizes clarity and efficiency while maintaining visual polish through consistent spacing, typography hierarchy, and purposeful component design.