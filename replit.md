# Amazeon Shopping - Billing System

## Project Overview
A comprehensive web-based billing system for Amazeon Shopping with role-based access control (Admin/User), automated invoice generation, inventory management, expense tracking, and sales reporting.

## Features Implemented

### Authentication & Authorization
- Dual role system: Admin (Manager) and User (Shop Staff)
- Secure username/password authentication using Passport.js
- Session-based authentication with PostgreSQL session store
- Role-based access control for routes and features

### User (Shop Staff) Features
- Dashboard with today's sales and last 7 days sales breakdown
- B2C invoice creation with automatic AZ series numbering (AZ+MMYY+NN format)
- Product selection from inventory with quantity and custom rate options
- GST calculation: 5% or 18% (inclusive for cash, additional for online)
- Real-time invoice total calculation

### Admin (Manager) Features
- Comprehensive dashboard showing:
  - Today's sales
  - Week's sales (last 7 days)
  - Month's sales
  - Total expenses for current month
  - B2C vs B2B invoice counts
  - Recent invoices list
- B2C invoice creation (same as User)
- B2B invoice creation with separate AZB series numbering (AZB+MMYY+NN)
- GST number collection for B2B invoices
- Inventory management (CRUD operations for products)
- Expense tracker with categories
- Sales reports with Excel download featuring:
  - Total sales summary
  - B2C vs B2B breakdown with percentages
  - Product-wise sales analysis
  - Category-wise sales analysis

### Invoice Numbering Logic
- **B2C Invoices**: AZ + MMYY + NN
  - Example: AZ112501 (November 2025, 1st invoice of the day)
- **B2B Invoices**: AZB + MMYY + NN
  - Example: AZB112501 (November 2025, 1st B2B invoice of the day)
- Auto-increments daily per invoice type

### GST Calculation Logic
- **Cash Payment**: GST is inclusive in the total
  - GST Amount = (Item Amount × GST Rate) / (1 + GST Rate)
  - Total Amount = Subtotal (which already includes GST)
- **Online Payment**: GST is additional to the base price
  - GST Amount = Item Amount × GST Rate
  - Total Amount = Subtotal + GST Amount

## Technology Stack

### Frontend
- React with TypeScript
- Wouter for routing
- TanStack Query (React Query) for data fetching
- Shadcn UI components with Tailwind CSS
- Orange and white theme (Amazeon branding)
- React Hook Form with Zod validation
- XLSX for Excel report generation

### Backend
- Express.js with TypeScript
- PostgreSQL database (Neon-backed)
- Drizzle ORM for type-safe database queries
- Passport.js with local strategy for authentication
- Session management with connect-pg-simple

## Database Schema

### Tables
1. **users**: User accounts with roles (admin/user)
2. **products**: Inventory items with name, category, rate, GST rate
3. **invoices**: Invoice records with customer details, totals, and type (B2C/B2B)
4. **invoice_items**: Line items for each invoice
5. **expenses**: Business expense records

### Key Relationships
- Users → Invoices (one-to-many)
- Users → Expenses (one-to-many)
- Invoices → Invoice Items (one-to-many)
- Products → Invoice Items (one-to-many)

## Project Structure
```
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── hooks/          # Custom hooks (useAuth)
│   │   └── lib/            # Utilities and config
├── server/                  # Backend Express application
│   ├── auth.ts             # Authentication setup
│   ├── db.ts               # Database connection
│   ├── storage.ts          # Data access layer
│   ├── routes.ts           # API endpoints
│   └── seed.ts             # Database seeding script
└── shared/                  # Shared code between frontend and backend
    └── schema.ts           # Database schema and Zod types
```

## API Endpoints

### Authentication
- POST `/api/register` - Register new user
- POST `/api/login` - Login
- POST `/api/logout` - Logout
- GET `/api/user` - Get current user

### Products
- GET `/api/products` - List all products
- POST `/api/products` - Create product (admin only)
- PATCH `/api/products/:id` - Update product (admin only)
- DELETE `/api/products/:id` - Delete product (admin only)

### Invoices
- GET `/api/invoices` - List all invoices
- GET `/api/invoices/:id` - Get invoice with items
- POST `/api/invoices` - Create invoice

### Expenses
- GET `/api/expenses` - List expenses (admin only)
- POST `/api/expenses` - Create expense (admin only)
- DELETE `/api/expenses/:id` - Delete expense (admin only)

### Statistics & Reports
- GET `/api/stats/user` - User dashboard stats
- GET `/api/stats/admin` - Admin dashboard stats
- GET `/api/reports/sales` - Sales report data (admin only)
- GET `/api/reports/sales/download` - Download Excel report (admin only)

## Getting Started

1. The database is automatically provisioned and seeded with 25 sample products
2. Register a new account (choose Admin or User role)
3. For Admin: Access all features including inventory, expenses, and reports
4. For User: Create invoices and view sales dashboard

## Sample Products
The system comes pre-loaded with 25 products across categories:
- Electronics (smartphones, laptops, tablets, etc.)
- Accessories (mouse, keyboard, chargers, etc.)
- Wearables (smartwatches, fitness trackers)
- Furniture (chairs, desks)
- Storage devices

## Design System
- **Primary Color**: Orange (#FF6B00 - Amazeon brand color)
- **Theme**: Clean, professional orange and white palette
- **Typography**: Inter font family
- **Components**: Shadcn UI with custom orange theme
- **Layout**: Sidebar navigation with role-based menu items
