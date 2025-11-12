## ADDED Requirements

### Requirement: Sample Request Management
The system SHALL provide R&D sample request management for creating and tracking product samples before production.

#### Scenario: Create new sample request
- **WHEN** an R&D user creates a new sample request
- **THEN** the system SHALL generate unique Sample ID
- **AND** the system SHALL allow customer selection from existing customer database
- **AND** the system SHALL capture sample name (e.g., Poloshirt)
- **AND** the system SHALL support multiple material requirements
- **AND** the system SHALL provide color picker integration
- **AND** the system SHALL allow selection of additional process stages via checkbox

#### Scenario: Material requirements management
- **WHEN** adding material requirements to a sample request
- **THEN** the system SHALL support multiple material items
- **AND** the system SHALL capture material type
- **AND** the system SHALL validate material data before saving
- **AND** the system SHALL allow editing of material requirements

#### Scenario: Process stage configuration
- **WHEN** configuring process stages for a sample request
- **THEN** the system SHALL display static processes: Cutting & Sewing
- **AND** the system SHALL provide checkbox options for additional processes:
  - Embroidery
  - DTF Printing
  - Jersey Printing
  - Sublimation
  - DTF Sublimation
- **AND** the system SHALL validate at least one additional process is selected
- **AND** the system SHALL save selected processes for Work Order generation

#### Scenario: Sample request status management
- **WHEN** tracking a sample request
- **THEN** the system SHALL support status progression: Draft → On Review → Approved → Revision → Canceled
- **AND** the system SHALL require authentication for status changes
- **AND** the system SHALL log status change timestamps and users
- **AND** the system SHALL prevent status changes from Approved/Canceled

#### Scenario: Sample request modification
- **WHEN** editing a sample request in Draft status
- **THEN** the system SHALL allow modification of all sample details
- **AND** the system SHALL prevent edits when sample is in On Review, Approved, Revision, or Canceled status
- **AND** the system SHALL maintain audit trail of all changes

### Requirement: Sample Request Dashboard
The system SHALL provide dashboard interface for tracking sample requests.

#### Scenario: Sample request tracking table
- **WHEN** viewing the R&D dashboard
- **THEN** the system SHALL display table of all sample requests with columns:
  - Sample ID
  - Customer Name
  - Sample Name
  - Status
  - Creation Date
  - Last Modified
- **AND** the system SHALL provide filtering by status and customer
- **AND** the system SHALL provide search functionality by Sample ID or Sample Name
- **AND** the system SHALL show visual indicators for each status

#### Scenario: Sample request details view
- **WHEN** clicking on a sample request in the dashboard
- **THEN** the system SHALL display complete sample details
- **AND** the system SHALL show material requirements list
- **AND** the system SHALL display selected process stages
- **AND** the system SHALL provide status change controls for authorized users
- **AND** the system SHALL show sample request history and timeline