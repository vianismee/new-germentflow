## Why

The current customer order flow lacks a formal Research & Development phase for sample creation and approval before proceeding to sales orders. This leads to inefficiencies where customers cannot review and approve product samples before committing to bulk orders, and there's no systematic way to track sample development progress.

## What Changes

- **NEW R&D Sample Request Module**: Add a complete sample request management system with material requirements, color selection, and process stage configuration
- **Dynamic Work Order Processes**: Modify Work Order system to support static processes (Cutting & Sewing) plus configurable additional processes based on R&D selections
- **Manual Work Order Tracking**: Add Start & Finish manual entry fields to Work Order stages instead of automatic timing
- **Sales Order Integration**: Enable Sales Orders to pull data from approved sample requests and support multiple sample IDs per order
- **Sample Request Dashboard**: Create a tracking dashboard for sample requests with statuses: Draft, On Review, Approved, Revision, Canceled
- **Process Configuration System**: Add a checklist system for R&D to select additional processes (Embroidery, DTF Printing, Jersey Printing, Sublimation, DTF Sublimation)

## Impact

- **Affected specs**:
  - `work-orders` - Adding manual timing fields and dynamic process stages
  - `sales-orders` - Adding sample data integration and multi-sample support
- **New capabilities needed**:
  - `sample-requests` - Complete R&D sample management system
  - `rd-dashboard` - Sample request tracking interface
- **Affected code**:
  - Work Order creation and management components
  - Sales Order form and data handling
  - New R&D Sample Request interface
  - Dashboard components for sample tracking
  - Process configuration and selection components