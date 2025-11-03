## ADDED Requirements

### Requirement: Production Command Center Dashboard
The system SHALL provide a comprehensive dashboard for real-time production oversight.

#### Scenario: Real-time production overview
- **WHEN** production manager views dashboard
- **THEN** the system SHALL display live sales order statistics (active, completed, pending)
- **AND** the system SHALL show work order tracking by production stage
- **AND** the system SHALL present customer metrics and growth indicators
- **AND** the system SHALL visualize production pipeline with current bottlenecks

#### Scenario: Multi-tab analytics interface
- **WHEN** using dashboard tabs
- **THEN** the system SHALL provide Overview tab with key performance indicators
- **AND** the system SHALL offer Production tab with stage-by-stage monitoring
- **AND** the system SHALL include Analytics tab with performance trends and system health
- **AND** the system SHALL maintain tab state and user preferences

#### Scenario: Interactive dashboard controls
- **WHEN** interacting with dashboard
- **THEN** the system SHALL support time range filtering (7d, 30d, 90d, 1y)
- **AND** the system SHALL provide live update toggle with real-time data refresh
- **AND** the system SHALL allow stage filtering for focused analysis
- **AND** the system SHALL offer manual refresh functionality

#### Scenario: Visual metrics and indicators
- **WHEN** viewing dashboard metrics
- **THEN** the system SHALL display animated progress indicators for production stages
- **AND** the system SHALL use color-coded status badges for quick status recognition
- **AND** the system SHALL provide interactive charts with tooltips and legends
- **AND** the system SHALL show capacity utilization with target vs actual comparisons

### Requirement: Performance Analytics
The system SHALL provide detailed production performance analytics.

#### Scenario: Production efficiency metrics
- **WHEN** analyzing production performance
- **THEN** the system SHALL calculate average production time per order
- **AND** the system SHALL display stage efficiency comparisons
- **AND** the system SHALL show resource utilization and capacity metrics
- **AND** the system SHALL identify production bottlenecks with recommendations

#### Scenario: Quality and delivery analytics
- **WHEN** reviewing quality metrics
- **THEN** the system SHALL display quality pass rates and trends
- **AND** the system SHALL show on-time delivery performance
- **AND** the system SHALL provide customer satisfaction indicators
- **AND** the system SHALL correlate quality issues with production stages