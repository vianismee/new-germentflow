// Export all schemas from individual files
export * from "./business";

// Create and export DatabaseSchema type
import { customers, salesOrders, workOrders, productionStageHistory, qualityInspections, userRoles } from "./business";
import type {
  customerStatusEnum,
  orderStatusEnum,
  productionStageEnum,
  qualityStatusEnum
} from "./business";

export type DatabaseSchema = {
  customers: typeof customers;
  salesOrders: typeof salesOrders;
  workOrders: typeof workOrders;
  productionStageHistory: typeof productionStageHistory;
  qualityInspections: typeof qualityInspections;
  userRoles: typeof userRoles;
  customer_status: typeof customerStatusEnum;
  order_status: typeof orderStatusEnum;
  production_stage: typeof productionStageEnum;
  quality_status: typeof qualityStatusEnum;
};