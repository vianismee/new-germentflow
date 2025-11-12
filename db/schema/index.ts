// Export all schemas from individual files
export * from "./business";

// Create and export DatabaseSchema type
import {
  customers,
  salesOrders,
  workOrders,
  productionStageHistory,
  qualityInspections,
  userRoles,
  sampleRequests,
  sampleMaterialRequirements,
  sampleProcessStages,
  sampleStatusHistory
} from "./business";
import type {
  customerStatusEnum,
  orderStatusEnum,
  productionStageEnum,
  qualityStatusEnum,
  sampleRequestStatusEnum,
  processStageEnum
} from "./business";

export type DatabaseSchema = {
  customers: typeof customers;
  salesOrders: typeof salesOrders;
  workOrders: typeof workOrders;
  productionStageHistory: typeof productionStageHistory;
  qualityInspections: typeof qualityInspections;
  userRoles: typeof userRoles;
  sampleRequests: typeof sampleRequests;
  sampleMaterialRequirements: typeof sampleMaterialRequirements;
  sampleProcessStages: typeof sampleProcessStages;
  sampleStatusHistory: typeof sampleStatusHistory;
  customer_status: typeof customerStatusEnum;
  order_status: typeof orderStatusEnum;
  production_stage: typeof productionStageEnum;
  quality_status: typeof qualityStatusEnum;
  sample_request_status: typeof sampleRequestStatusEnum;
  process_stage: typeof processStageEnum;
};