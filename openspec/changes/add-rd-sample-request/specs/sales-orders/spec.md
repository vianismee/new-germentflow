## MODIFIED Requirements

### Requirement: Sales Order Management
The system SHALL provide comprehensive sales order management capabilities with sample request integration.

#### Scenario: Create new sales order from sample request
- **WHEN** a production manager creates a new sales order
- **THEN** the system SHALL allow customer selection from existing customer database
- **AND** the system SHALL provide option to add Sample IDs from approved sample requests for the selected customer
- **AND** the system SHALL display available approved sample requests for the selected customer
- **AND** the system SHALL allow multiple Sample ID selection for inclusion in a single sales order
- **AND** the system SHALL automatically populate product details from selected sample requests
- **AND** the system SHALL capture order date and target delivery date
- **AND** the system SHALL support multiple order items with product specifications

#### Scenario: Sample ID integration in sales orders
- **WHEN** adding Sample IDs to a sales order
- **THEN** the system SHALL pull sample name from the approved sample request
- **AND** the system SHALL pull material requirements from the sample request
- **AND** the system SHALL pull color specifications from the sample request
- **AND** the system SHALL pull process stage configuration from the sample request
- **AND** the system SHALL allow the sales user to input Total Order Quantity
- **AND** the system SHALL provide input fields for Quantity per Size breakdown (e.g., L: 50, XL: 50)
- **AND** the system SHALL validate that size quantities sum to total order quantity

#### Scenario: Sales order item management with sample data
- **WHEN** managing items in a sales order created from sample requests
- **THEN** the system SHALL display each Sample ID as a separate line item
- **AND** the system SHALL show sample details including name, material, and color
- **AND** the system SHALL allow editing of quantity information while preserving sample specifications
- **AND** the system SHALL support design file attachments in addition to sample request data
- **AND** the system SHALL validate item data before saving
- **AND** the system SHALL maintain link between sales order item and original sample request

#### Scenario: Sales order status tracking
- **WHEN** viewing a sales order
- **THEN** the system SHALL display current status (Draft, Processing, Completed)
- **AND** the system SHALL show associated Sample IDs with links to sample request details
- **AND** the system SHALL show associated work orders and their production stages
- **AND** the system SHALL provide order history and timeline
- **AND** the system SHALL indicate which work orders were created from which sample requests

#### Scenario: Sales order modification
- **WHEN** editing a sales order in Draft status
- **THEN** the system SHALL allow modification of all order details
- **AND** the system SHALL allow addition or removal of Sample ID line items
- **AND** the system SHALL prevent edits when order is in Processing or Completed status
- **AND** the system SHALL maintain audit trail of all changes

#### Scenario: Multi-sample order creation
- **WHEN** a customer has multiple approved sample requests
- **THEN** the system SHALL allow creation of a single sales order containing multiple Sample IDs
- **AND** the system SHALL display each sample as a separate line item with individual quantity specifications
- **AND** the system SHALL calculate total order value as sum of all sample line items
- **AND** the system SHALL support separate work order generation for each sample line item

### Requirement: Customer Integration with Sample History
The system SHALL integrate sales orders with customer management and sample request history.

#### Scenario: Customer selection with sample context
- **WHEN** creating a sales order
- **THEN** the system SHALL provide searchable customer dropdown
- **AND** the system SHALL display customer contact information and order history
- **AND** the system SHALL show customer's approved sample requests for easy selection
- **AND** the system SHALL allow adding new customers from order creation flow

#### Scenario: Customer sample and order history
- **WHEN** viewing a customer profile
- **THEN** the system SHALL display all associated sales orders
- **AND** the system SHALL display all associated sample requests with status
- **AND** the system SHALL show order status and delivery information
- **AND** the system SHALL provide order filtering and search capabilities
- **AND** the system SHALL show relationships between sample requests and resulting sales orders