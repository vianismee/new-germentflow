## MODIFIED Requirements

### Requirement: Work Order Management
The system SHALL provide work order management for tracking production through configurable stages.

#### Scenario: Work order creation from sales order
- **WHEN** a production manager creates a work order from a sales order
- **THEN** the system SHALL generate unique work order number
- **AND** the system SHALL set initial stage to "Order Processing"
- **AND** the system SHALL link work order to sales order and customer
- **AND** if the sales order contains Sample ID references, the system SHALL pull process stage configuration from the approved sample requests

#### Scenario: Work order creation from sample request
- **WHEN** a production manager creates a work order from an approved sample request
- **THEN** the system SHALL generate unique work order number
- **AND** the system SHALL set initial stage to "Order Processing"
- **AND** the system SHALL automatically configure process stages based on sample request configuration
- **AND** the system SHALL include static processes: Cutting & Sewing
- **AND** the system SHALL include additional processes selected in the sample request

#### Scenario: Dynamic Process Stage Configuration
- **WHEN** configuring process stages for a work order
- **THEN** the system SHALL always include static stages: Order Processing, Material Procurement, Cutting, Sewing/Assembly, Quality Control, Finishing, Dispatch, Delivered
- **AND** the system SHALL add additional process stages based on sample request configuration:
  - Embroidery (inserted after Cutting, before Sewing/Assembly)
  - DTF Printing (inserted after Cutting, before Sewing/Assembly)
  - Jersey Printing (inserted before Cutting)
  - Sublimation (inserted after Sewing/Assembly)
  - DTF Sublimation (inserted after Sewing/Assembly)
- **AND** the system SHALL display the complete stage workflow in correct sequence
- **AND** the system SHALL highlight which stages are static vs. dynamic

#### Scenario: Manual Stage Timing Entry
- **WHEN** managing work order stage transitions
- **THEN** the system SHALL provide manual "Start Time" and "Finish Time" entry fields for each stage
- **AND** the system SHALL allow users to input actual start and finish times instead of automatic timestamps
- **AND** the system SHALL validate that start time is before finish time
- **AND** the system SHALL allow empty time fields for stages not yet started
- **AND** the system SHALL calculate duration based on entered times
- **AND** the system SHALL require user authentication for time entry modifications

#### Scenario: Enhanced Stage Transition Management
- **WHEN** a worker advances work order to next stage
- **THEN** the system SHALL require user authentication
- **AND** the system SHALL prompt for manual start and finish time entry if not already provided
- **AND** the system SHALL log transition timestamp and user
- **AND** the system SHALL prevent skipping stages except by admin users
- **AND** the system SHALL support optional notes for each transition
- **AND** the system SHALL validate all required time fields are entered before stage completion

#### Scenario: Production pipeline visualization
- **WHEN** viewing work orders dashboard
- **THEN** the system SHALL display Kanban-style pipeline showing all work orders
- **AND** the system SHALL show dynamic process stages based on each work order's configuration
- **AND** the system SHALL allow drag-and-drop stage transitions
- **AND** the system SHALL show work order capacity per stage
- **AND** the system SHALL identify bottlenecks with visual indicators
- **AND** the system SHALL display manual timing information for each stage

### Requirement: Production Analytics
The system SHALL provide production performance analytics with manual timing data.

#### Scenario: Stage efficiency metrics
- **WHEN** viewing production analytics
- **THEN** the system SHALL calculate average time per stage based on manual entries
- **AND** the system SHALL display completion rates by stage
- **AND** the system SHALL show capacity utilization metrics
- **AND** the system SHALL provide trend analysis over time periods
- **AND** the system SHALL identify efficiency patterns for static vs. dynamic stages