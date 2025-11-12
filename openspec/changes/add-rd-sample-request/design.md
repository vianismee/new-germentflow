## Context

This change introduces a new Research & Development sample request workflow that fundamentally changes the customer order flow from:
```
Customer → Sales Order → Work Order → QC → Delivery
```
To:
```
Customer → R&D Sample Request → Sales Order → Work Order
```

The system needs to support sample creation, approval workflows, dynamic process configuration, and seamless integration between sample requests, sales orders, and work orders. This affects the entire production management flow and introduces new business logic for handling pre-production sample development.

## Goals / Non-Goals

**Goals:**
- Enable customers to review and approve product samples before bulk production
- Provide systematic tracking of sample development through R&D stages
- Allow dynamic process configuration based on sample requirements
- Improve production planning by capturing technical specifications in sample phase
- Maintain backward compatibility with existing sales order and work order flows
- Support manual timing entry for better production tracking accuracy

**Non-Goals:**
- Complete redesign of existing production stages (we're enhancing, not replacing)
- Advanced sample revision management (basic revision status only)
- Complex pricing calculations for sample development
- Integration with external design software
- Multi-tenant customer portals

## Decisions

### Database Schema Design
- **Decision**: Use separate tables for sample requests, material requirements, and process configurations
- **Rationale**: Provides better normalization and allows for complex many-to-many relationships between samples and materials/processes
- **Alternatives considered**: Storing materials and processes as JSON fields (rejected for queryability)

### Process Stage Configuration
- **Decision**: Implement static + dynamic process stage model
- **Rationale**: Some processes (Cutting, Sewing) are always required, while others (printing, embroidery) are optional and sample-dependent
- **Alternatives considered**: Fully configurable stages (rejected for complexity) or fully static stages (rejected for flexibility)

### Status Flow Management
- **Decision**: Implement linear status flow for samples: Draft → On Review → Approved → Revision → Canceled
- **Rationale**: Provides clear business process while allowing for revision cycles
- **Alternatives considered**: Complex state machine (rejected for over-engineering)

### Manual Timing Entry
- **Decision**: Replace automatic timestamps with manual Start/Finish entry for work order stages
- **Rationale**: Production environments often have irregular timing that manual entry captures better than automatic timestamps
- **Alternatives considered**: Hybrid approach (rejected for user confusion) or keeping automatic only (rejected for business requirements)

## Risks / Trade-offs

### Data Consistency Risk
- **Risk**: Sample request data might become inconsistent with sales order data over time
- **Mitigation**: Implement immutable sample snapshots at sales order creation time
- **Trade-off**: Increased storage usage for data consistency

### User Experience Complexity
- **Risk**: New workflow adds complexity to sales order creation process
- **Mitigation**: Provide guided workflows and smart defaults based on existing data
- **Trade-off**: Initial learning curve vs. long-term efficiency gains

### Performance Impact
- **Risk**: Dynamic process configuration could slow down work order dashboard loading
- **Mitigation**: Cache process configurations and use efficient database queries
- **Trade-off**: Increased memory usage for better performance

### Backward Compatibility
- **Risk**: Existing sales orders and work orders might not work with new system
- **Mitigation**: Implement migration scripts and maintain old workflows alongside new ones
- **Trade-off**: Code complexity vs. smooth transition

## Migration Plan

### Phase 1: Foundation (Weeks 1-2)
1. Create database schema for sample requests
2. Implement basic CRUD operations for sample requests
3. Create sample request creation and management UI
4. Test basic sample request functionality

### Phase 2: Integration (Weeks 3-4)
1. Update work order system to support manual timing
2. Implement dynamic process stage configuration
3. Update sales order system to support sample integration
4. Test sample to sales order to work order flow

### Phase 3: Dashboard and Analytics (Week 5)
1. Build R&D dashboard for sample tracking
2. Update existing dashboards to show new data
3. Implement enhanced analytics with manual timing data
4. Test complete end-to-end workflow

### Phase 4: Migration and Rollout (Week 6)
1. Create database migration scripts
2. Migrate any existing relevant data
3. User training and documentation
4. Production deployment with rollback plan

### Rollback Plan
- Keep old workflow endpoints available with feature flags
- Database migrations designed to be reversible
- Ability to disable sample request integration temporarily
- Data export capabilities for manual intervention if needed

## Open Questions

### Technical Questions
- [ ] Should sample requests support versioning for tracking multiple revisions?
- [ ] How should we handle sample requests that are approved but never converted to sales orders?
- [ ] Do we need audit logging for all status changes beyond user/timestamp?
- [ ] Should material requirements support vendor-specific information?

### Business Logic Questions
- [ ] Should there be time limits on how long an approved sample remains valid?
- [ ] How should we handle customer rejection of approved samples during sales order creation?
- [ ] Do we need approval workflows for status changes beyond basic authentication?
- [ ] Should sample requests support cost tracking and pricing?

### Integration Questions
- [ ] How should we handle the transition period where some orders use old workflow?
- [ ] Do we need notifications when sample requests change status?
- [ ] Should sample requests integrate with inventory management for material availability?
- [ ] How should we handle reports and analytics that span both old and new workflows?