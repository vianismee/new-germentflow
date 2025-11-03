# GarmentFlow V2 Project Specification

## Project Overview

**Project Name:** GarmentFlow V2
**Version:** 2.0
**Category:** Manufacturing Execution System (MES) for Garment Industry
**Status:** Active Development

**Description:** A comprehensive production management system for garment manufacturers that tracks, manages, and optimizes the entire production workflow from sales orders to delivery with real-time visibility and data-driven insights.

## Tech Stack

### Frontend Framework
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript (strict mode)
- **UI Components:** React 19
- **Styling:** Tailwind CSS v4
- **Component Library:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React, Tabler Icons
- **Build Tool:** Turbopack
- **Path Aliases:** `@/*` → `./`

### Backend & Database
- **Database:** PostgreSQL via Supabase
- **ORM:** Drizzle ORM v0.44.5
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime subscriptions
- **Storage:** Supabase Storage for file uploads
- **Driver:** Node Postgres (pg)

### Development Tools
- **Package Manager:** npm
- **Linting:** ESLint v9 with Next.js config
- **Database Tools:** Drizzle Kit (generate, push, migrate, studio)
- **Environment:** dotenv for configuration

### Key Dependencies
- **Forms:** React Hook Form v7.62.0 + Zod v4.1.3 validation
- **Tables:** Tanstack React Table v8.21.3
- **Charts:** Recharts v2.15.4
- **Drag & Drop:** dnd-kit v6.3.1 ecosystem
- **Date Handling:** date-fns v4.1.0
- **Notifications:** Sonner v2.0.7
- **Theming:** next-themes v0.4.6
- **Supabase Client:** @supabase/supabase-js

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard
│   ├── sales-orders/      # Sales order management
│   ├── sign-in/          # Authentication pages
│   └── page.tsx          # Root page
├── components/           # Reusable UI components
│   └── ui/              # shadcn/ui components
├── lib/                 # Utility libraries
│   ├── auth.ts          # Supabase authentication
│   ├── auth-client.ts   # Client-side auth hooks
│   ├── utils.ts         # General utilities
│   └── supabase/        # Supabase client configuration
├── db/                  # Database configuration
│   ├── index.ts         # Database connection
│   └── schema/          # Drizzle schemas
│       ├── business.ts  # Business logic tables
│       └── profiles.ts  # User profile extensions
├── openspec/            # Specification management
│   ├── project.md       # This file
│   ├── specs/           # Current capabilities
│   └── changes/         # Change proposals
└── prd.md               # Product Requirements Document
```

## Database Architecture

### Authentication Schema (Supabase Auth)
- `auth.users` - Supabase built-in user authentication
- `auth.sessions` - Supabase managed user sessions
- `user_profiles` - Extended user profile information with roles
- `user_roles` - Role definitions and permissions table

### Business Schema (Planned)
The following tables will be implemented per the PRD:
- `customers` - Customer management
- `sales_orders` - Sales order tracking
- `so_items` - Sales order line items
- `work_orders` - Production work orders
- `production_stages` - 8-stage workflow definition
- `production_logs` - Stage transition tracking
- `quality_control` - Quality inspection data
- `deliveries` - Shipping and delivery tracking
- `roles` - User role management
- `inventory` - Material inventory (V2 feature)
- `inventory_transactions` - Inventory tracking (V2 feature)

## Development Workflow

### Database Commands
```bash
npm run db:generate      # Generate migrations
npm run db:push         # Push schema to database
npm run db:migrate      # Run migrations
npm run db:studio       # Open Drizzle Studio
npm run db:reset        # Reset database
```

### Docker Environment
```bash
npm run db:up           # Start PostgreSQL
npm run db:down         # Stop PostgreSQL
npm run db:dev          # Start development DB
```

### Development Server
```bash
npm run dev             # Start with Turbopack
npm run build           # Production build
npm run start           # Start production server
```

## Core Business Capabilities

### 1. Production Management
- **8-Stage Workflow:** Order Processing → Material Procurement → Cutting → Sewing/Assembly → Quality Control → Finishing → Dispatch → Delivered
- **Real-time Tracking:** Live production status updates
- **Work Order Management:** Create and track production orders
- **Stage Analytics:** Performance metrics per production stage

### 2. Sales Order Management
- **Full CRUD Operations:** Create, read, update, delete sales orders
- **Customer Integration:** Link orders to customer database
- **Order Items:** Multiple products per order with specifications
- **Status Tracking:** Draft → Processing → Completed

### 3. Quality Control
- **Inspection Management:** Quality checks per work order
- **Pass/Repair/Reject:** Three-tier quality assessment
- **Quality Metrics:** Pass/fail rates and trend analysis
- **Inspector Assignment:** Track who performed inspections

### 4. Customer Relationship Management
- **Customer Database:** Contact information and history
- **Order History:** Track all customer orders
- **Communication Logs:** Interaction tracking
- **Analytics:** Purchase patterns and satisfaction metrics

### 5. Dashboard & Analytics
- **Real-time Overview:** Live production statistics
- **Multi-tab Interface:** Overview, Production, Analytics tabs
- **Interactive Charts:** Recharts-based data visualization
- **Time Filtering:** 7d, 30d, 90d, 1y ranges

## Development Conventions

### Code Style
- **TypeScript:** Strict mode enabled
- **Components:** Functional components with hooks
- **Styling:** Tailwind CSS with utility-first approach
- **UI Components:** Use shadcn/ui components as base
- **Forms:** React Hook Form with Zod validation

### File Naming
- **Pages:** `page.tsx` for Next.js App Router
- **Components:** PascalCase (e.g., `ProductionChart.tsx`)
- **Utilities:** camelCase (e.g., `formatDate.ts`)
- **Schemas:** kebab-case where appropriate (e.g., `business.ts`)

### Import Conventions
```typescript
// External libraries
import { useState } from 'react';
import { z } from 'zod';

// Internal modules (use @ alias)
import { Button } from '@/components/ui/button';
import { db } from '@/db';
import { formatDate } from '@/lib/utils';
```

### Database Patterns
- **Schemas:** Use Drizzle ORM with PostgreSQL
- **Migrations:** Version-controlled with Drizzle Kit
- **Relations:** Proper foreign key constraints
- **Timestamps:** Use Drizzle's timestamp helpers

## Security & Authentication

### Authentication Strategy
- **Framework:** Supabase Auth with JWT-based auth
- **User Management:** Supabase built-in user management
- **Session Handling:** Secure JWT tokens with automatic refresh
- **Email Verification:** Built-in email verification flow
- **Social Login:** Support for OAuth providers (Google, GitHub, etc.)

### Authorization
- **Role-Based Access:** Different permissions per user role
- **Route Protection:** Middleware for protected routes
- **API Security:** Proper session validation on API calls

## Deployment Configuration

### Build Settings
- **Output Mode:** Standalone (Docker-ready)
- **Type Checking:** Strict TypeScript compilation
- **Optimization:** Turbopack for development and builds

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Performance Considerations

### Frontend Optimizations
- **Code Splitting:** Automatic with Next.js App Router
- **Image Optimization:** Next.js Image component
- **Bundle Size:** Monitor with build analysis
- **Loading States:** Proper loading and error handling

### Database Optimizations
- **Indexing:** Strategic indexes on foreign keys and queries
- **Connection Pooling:** Managed by PostgreSQL
- **Query Optimization:** Use Drizzle's query builder

## Testing Strategy

### Testing Types (Planned)
- **Unit Tests:** Jest for utility functions
- **Component Tests:** React Testing Library
- **Integration Tests:** Database and API testing
- **E2E Tests:** Playwright for critical user flows

## API Conventions

### REST Patterns
- **Route Structure:** `/api/` prefix for API routes
- **HTTP Methods:** Proper GET/POST/PUT/DELETE usage
- **Response Format:** Consistent JSON responses
- **Error Handling:** Proper HTTP status codes

### Real-time Features
- **Supabase Realtime:** Built-in real-time subscriptions for production updates
- **Live Dashboard:** Real-time production metrics and status updates
- **Optimistic UI:** Immediate feedback on user actions with rollback capability

## V2 Enhancement Plans

### New Features in V2
1. **User Management & Permissions** - Enhanced role-based access control
2. **Inventory Management** - Raw material tracking and stock monitoring
3. **Advanced Analytics** - Predictive analytics and performance benchmarking
4. **Mobile Support** - Progressive Web App capabilities
5. **Integration APIs** - RESTful endpoints for third-party integrations

### Architecture Evolution
- **Scalability:** Horizontal scaling considerations
- **Performance:** Caching strategies (Redis potential)
- **Monitoring:** Error tracking and performance metrics
- **Security:** Enhanced security patterns and audits

## Development Timeline

### Current Phase: Foundation (Weeks 1-4)
- ✅ Project setup with Next.js 15 + TypeScript
- 🔄 Authentication system migration to Supabase Auth
- ✅ Database setup with Drizzle ORM
- 🔄 Core business schema implementation
- 🔄 Basic dashboard structure

### Upcoming Phases
- **Phase 2:** Production management features
- **Phase 3:** Advanced features and analytics
- **Phase 4:** Integration and optimization

## Success Metrics

### Technical Metrics
- Page load time < 2 seconds
- API response time < 500ms
- 99.9% uptime target
- Error rate < 0.1%

### Business Metrics
- Production efficiency 20% improvement
- Quality scores 95% pass rate
- On-time delivery 90% rate
- User adoption 80% active rate

---

*This project specification serves as the authoritative reference for GarmentFlow V2 development. All changes should follow the OpenSpec workflow in the `openspec/` directory.*