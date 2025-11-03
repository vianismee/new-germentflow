## Why

GarmentFlow V1 needs to be implemented from the current starter template to provide a functional production management system for garment manufacturers. The current codebase has excellent foundation (Next.js 15, Drizzle ORM, Better Auth, shadcn/ui) but lacks the core business logic, database schema, and UI components specific to garment manufacturing workflow management.

## What Changes

- **Database Schema**: Implement complete business logic schema for customers, sales orders, work orders, production stages, quality control, and deliveries
- **Authentication Enhancement**: Implement Supabase Auth with role-based access control for different user types (admin, production manager, quality inspector, etc.)
- **Core UI Components**: Create garment-manufacturing-specific components for production tracking, order management, and quality control
- **Dashboard Redesign**: Transform current generic dashboard into production command center with real-time metrics
- **Sales Order Management**: Implement full CRUD operations for sales orders with customer integration
- **Work Order System**: Create 8-stage production workflow management with visual tracking
- **Quality Control Module**: Build inspection interface with pass/repair/reject workflow
- **Customer Management**: Develop customer database and relationship management features
- **Navigation & Routing**: Update app navigation and routing for production management features

## Impact

- **Affected specs**: All new capabilities (sales-orders, work-orders, quality-control, customers, dashboard)
- **Affected code**:
  - Database layer (`db/schema/`) - new business schemas
  - App routing (`app/`) - new pages and layouts
  - Components (`components/`) - new business-specific components
  - Authentication (`lib/auth.ts`) - replace Better Auth with Supabase Auth
  - Dashboard (`app/dashboard/`) - complete redesign for production metrics
- **Breaking changes**: None (adding new capabilities to existing foundation)

## Success Criteria

- Complete 8-stage production workflow implementation
- Real-time dashboard with production metrics
- Full sales order and work order management
- Quality control inspection system
- Customer management with order history
- Role-based user permissions
- Responsive design for desktop and tablet use in factory environments