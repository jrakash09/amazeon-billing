# Amazeon Shopping Billing System - Design Guidelines

## Design Approach
**Selected Approach:** Design System-Based (Material Design principles)
**Justification:** This is a data-dense business application requiring consistent, scannable interfaces for inventory management, invoicing, and reporting. Material Design provides excellent patterns for forms, tables, and dashboard layouts.

## Typography System
**Font Family:** Inter (via Google Fonts CDN) for all interface elements
- **Headings:** 
  - Page titles: text-3xl font-bold
  - Section headers: text-xl font-semibold
  - Card titles: text-lg font-medium
- **Body Text:**
  - Default: text-base font-normal
  - Table data: text-sm
  - Labels: text-sm font-medium
  - Helper text: text-xs text-gray-600

## Layout & Spacing System
**Spacing Units:** Tailwind units of 2, 4, 6, and 8 (p-2, m-4, gap-6, h-8)
- Component padding: p-6
- Card spacing: gap-6
- Form field gaps: space-y-4
- Section margins: my-8

**Layout Structure:**
- **Login Pages:** Centered card (max-w-md) on full viewport
- **Dashboard Layout:** 
  - Sidebar navigation: w-64 fixed left
  - Main content: ml-64 with max-w-7xl container
  - Top bar: h-16 sticky with user info

## Component Specifications

### Navigation
**Sidebar (Admin & User):**
- Fixed left sidebar (w-64, h-screen)
- Logo at top (h-16 with p-4)
- Navigation items with icons (Font Awesome via CDN)
- Active state: slightly emphasized background
- Role indicator at bottom

### Dashboard Cards
**Stats Cards (3-column grid on desktop):**
- Grid: grid-cols-1 md:grid-cols-3 gap-6
- Card structure: rounded-lg shadow-md p-6
- Metric value: text-3xl font-bold
- Label: text-sm uppercase tracking-wide

### Forms & Invoice Entry
**Form Layout:**
- Two-column grid for paired fields: grid-cols-1 md:grid-cols-2 gap-4
- Full-width for text areas and item selection
- Input height: h-10
- Button height: h-10 or h-12 for primary actions

**Invoice Screen:**
- Auto-generated invoice number displayed prominently at top (text-2xl)
- Customer details section: 2-column grid
- Items table: Full-width responsive table
- Action buttons: Fixed bottom bar on mobile, inline on desktop

### Tables (Inventory, Sales Reports)
**Table Structure:**
- Striped rows for readability
- Header: font-semibold with bottom border
- Cell padding: px-4 py-3
- Sticky header on scroll
- Action buttons in last column (icons only, sm size)

### Buttons & Actions
**Button Hierarchy:**
- Primary action: h-10 px-6 rounded-md font-medium
- Secondary: Same size with outlined style
- Icon buttons: h-8 w-8 for table actions
- "Generate Bill" button: Large, prominent (h-12 w-full md:w-auto)

### Modals & Overlays
**Modal Structure:**
- Max width: max-w-2xl for forms, max-w-4xl for inventory management
- Padding: p-6
- Header with close button (h-16)
- Footer with actions (right-aligned on desktop)

### Data Visualization
**Dashboard Charts:**
- Card container with p-6
- Chart.js library via CDN for sales graphs
- Responsive: Full width on mobile, half-width on desktop for comparison views

## Responsive Breakpoints
- Mobile: Base (< 768px) - Single column, full-width cards
- Tablet: md (768px+) - 2-column grids, sidebar collapses to hamburger
- Desktop: lg (1024px+) - Full sidebar, 3-column stat grids

## Print Styles (Invoice)
**Print Layout:**
- Remove navigation and sidebars
- Max-width: 210mm (A4)
- Invoice header: Company name + invoice number
- Clean table with borders
- Signature area at bottom

## Accessibility
- Form labels: Always visible, associated with inputs
- Error states: Red text with icon indicators
- Focus states: Clear outline on all interactive elements
- Keyboard navigation: Tab order follows visual flow

## Icons
**Icon Library:** Font Awesome 6 (via CDN)
- Navigation: fa-solid icons (dashboard, inventory, file-invoice)
- Actions: fa-regular icons (edit, trash, download)
- Status: fa-solid icons (check, times, exclamation)

## Images
**No hero images needed** - This is a business application focused on functionality. Only include:
- Company logo in sidebar (h-12, square or horizontal)
- Empty state illustrations for inventory/reports (use placeholder comments)

## Key UI Patterns
- **Login Page:** Clean, centered card with logo above
- **Dashboard:** Sidebar + top bar + content grid
- **Invoice Entry:** Progressive form with live calculation preview
- **Admin Inventory:** Filterable table with inline edit/delete
- **Reports:** Tabbed interface for different report types