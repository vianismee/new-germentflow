import {
  pgTable,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  varchar,
  pgEnum,
  primaryKey
} from "drizzle-orm/pg-core";

// Enums
export const customerStatusEnum = pgEnum("customer_status", ["active", "inactive", "prospect"]);
export const orderStatusEnum = pgEnum("order_status", ["draft", "on_review", "approve", "cancelled"]);
export const productionStageEnum = pgEnum("production_stage", [
  "order_processing",
  "material_procurement",
  "cutting",
  "sewing_assembly",
  "quality_control",
  "finishing",
  "dispatch",
  "delivered"
]);
export const qualityStatusEnum = pgEnum("quality_status", ["pending", "pass", "repair", "reject"]);
export const sampleRequestStatusEnum = pgEnum("sample_request_status", ["draft", "on_review", "approved", "revision", "canceled"]);
export const processStageEnum = pgEnum("process_stage", [
  "embroidery",
  "dtf_printing",
  "jersey_printing",
  "sublimation",
  "dtf_sublimation"
]);

// Customers table
export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  address: text("address"),
  shippingAddress: text("shipping_address"),
  status: customerStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sales Orders table
export const salesOrders = pgTable("sales_orders", {
  id: text("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "restrict" }),
  orderDate: timestamp("order_date").defaultNow().notNull(),
  targetDeliveryDate: timestamp("target_delivery_date").notNull(),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  status: orderStatusEnum("status").default("draft").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sales Order Items table
export const salesOrderItems = pgTable("sales_order_items", {
  id: text("id").primaryKey(),
  salesOrderId: text("sales_order_id").notNull().references(() => salesOrders.id, { onDelete: "cascade" }),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  size: text("size"),
  color: text("color"),
  designFileUrl: text("design_file_url"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  specifications: text("specifications"), // JSON string for additional specifications
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Work Orders table
export const workOrders = pgTable("work_orders", {
  id: text("id").primaryKey(),
  workOrderNumber: varchar("work_order_number", { length: 50 }).notNull().unique(),
  salesOrderId: text("sales_order_id").notNull().references(() => salesOrders.id, { onDelete: "restrict" }),
  salesOrderItemId: text("sales_order_item_id").notNull().references(() => salesOrderItems.id, { onDelete: "restrict" }),
  currentStage: productionStageEnum("current_stage").default("order_processing").notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  estimatedCompletion: timestamp("estimated_completion"),
  priority: integer("priority").default(5).notNull(), // 1-10 priority scale
  assignedTo: text("assigned_to"), // User ID of assigned worker
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Production Stage History table
export const productionStageHistory = pgTable("production_stage_history", {
  id: text("id").primaryKey(),
  workOrderId: text("work_order_id").notNull().references(() => workOrders.id, { onDelete: "cascade" }),
  stage: productionStageEnum("stage").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // Duration in minutes
  notes: text("notes"),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Quality Control Inspections table
export const qualityInspections = pgTable("quality_inspections", {
  id: text("id").primaryKey(),
  workOrderId: text("work_order_id").notNull().references(() => workOrders.id, { onDelete: "cascade" }),
  stage: productionStageEnum("stage").notNull(),
  status: qualityStatusEnum("status").default("pending").notNull(),
  inspectedBy: text("inspected_by").notNull(),
  inspectionDate: timestamp("inspection_date").defaultNow().notNull(),
  totalQuantity: integer("total_quantity").notNull().default(0),
  passedQuantity: integer("passed_quantity").notNull().default(0),
  repairedQuantity: integer("repaired_quantity").notNull().default(0),
  rejectedQuantity: integer("rejected_quantity").notNull().default(0),
  issues: text("issues"), // JSON string for identified issues
  repairNotes: text("repair_notes"),
  reinspectionDate: timestamp("reinspection_date"),
  finalStatus: qualityStatusEnum("final_status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Customer Communications table
export const customerCommunications = pgTable("customer_communications", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  salesOrderId: text("sales_order_id").references(() => salesOrders.id, { onDelete: "cascade" }),
  workOrderId: text("work_order_id").references(() => workOrders.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // email, phone, sms, notification
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  direction: text("direction").notNull(), // inbound, outbound
  status: text("status").default("sent").notNull(), // sent, delivered, failed
  sentBy: text("sent_by").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Roles table (will be integrated with Supabase Auth)
export const userRoles = pgTable("user_roles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // Supabase user ID
  role: text("role").notNull(), // admin, production-manager, quality-inspector, viewer
  permissions: text("permissions"), // JSON string for additional permissions
  isActive: boolean("is_active").default(true).notNull(),
  assignedBy: text("assigned_by").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sample Requests table
export const sampleRequests = pgTable("sample_requests", {
  id: text("id").primaryKey(),
  sampleId: varchar("sample_id", { length: 50 }).notNull().unique(),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "restrict" }),
  sampleName: text("sample_name").notNull(),
  color: text("color"),
  status: sampleRequestStatusEnum("status").default("draft").notNull(),
  totalOrderQuantity: integer("total_order_quantity"),
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sample Material Requirements table
export const sampleMaterialRequirements = pgTable("sample_material_requirements", {
  id: text("id").primaryKey(),
  sampleRequestId: text("sample_request_id").notNull().references(() => sampleRequests.id, { onDelete: "cascade" }),
  materialType: text("material_type").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(), // e.g., meters, kilograms, yards
  specifications: text("specifications"), // Additional material specifications
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sample Process Stages table (junction table for many-to-many relationship)
export const sampleProcessStages = pgTable("sample_process_stages", {
  id: text("id").primaryKey(),
  sampleRequestId: text("sample_request_id").notNull().references(() => sampleRequests.id, { onDelete: "cascade" }),
  processStage: processStageEnum("process_stage").notNull(),
  sequence: integer("sequence").notNull(), // Order in which the process should be executed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sample Status History table
export const sampleStatusHistory = pgTable("sample_status_history", {
  id: text("id").primaryKey(),
  sampleRequestId: text("sample_request_id").notNull().references(() => sampleRequests.id, { onDelete: "cascade" }),
  previousStatus: sampleRequestStatusEnum("previous_status"),
  newStatus: sampleRequestStatusEnum("new_status").notNull(),
  changedBy: text("changed_by").notNull(),
  changeReason: text("change_reason"),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
});