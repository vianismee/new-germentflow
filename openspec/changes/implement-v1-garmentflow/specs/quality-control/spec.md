## ADDED Requirements

### Requirement: Quality Control Inspection
The system SHALL provide quality control inspection capabilities for work orders.

#### Scenario: Quality inspection creation
- **WHEN** a quality inspector starts inspection for a work order
- **THEN** the system SHALL require work order to be in "Quality Control" stage
- **AND** the system SHALL display work order details and specifications
- **AND** the system SHALL provide inspection form with quantity fields

#### Scenario: Three-tier quality assessment
- **WHEN** completing quality inspection
- **THEN** the system SHALL capture quantities for: Passed, Repaired, Rejected
- **AND** the system SHALL validate that total equals work order quantity
- **AND** the system SHALL require inspector notes for repairs and rejections
- **AND** the system SHALL support photo attachments for defect documentation

#### Scenario: Quality metrics tracking
- **WHEN** viewing quality control dashboard
- **THEN** the system SHALL calculate pass/fail rates
- **AND** the system SHALL display repair effectiveness metrics
- **AND** the system SHALL show quality trend analysis over time
- **AND** the system SHALL identify recurring quality issues

### Requirement: Inspector Management
The system SHALL manage quality inspector assignments and accountability.

#### Scenario: Inspector assignment
- **WHEN** assigning quality inspection
- **THEN** the system SHALL require logged-in user with quality inspector role
- **AND** the system SHALL track who performed each inspection
- **AND** the system SHALL maintain inspection history and timestamps

#### Scenario: Quality reports
- **WHEN** generating quality reports
- **THEN** the system SHALL filter by date range, inspector, or work order
- **AND** the system SHALL include defect categorization
- **AND** the system SHALL provide quality score calculations
- **AND** the system SHALL support PDF export for customer delivery