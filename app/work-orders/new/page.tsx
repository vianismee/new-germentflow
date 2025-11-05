import { Metadata } from 'next'
import { Suspense } from 'react'
import { WorkOrderNewPage } from '@/components/work-orders/work-order-new'

export const metadata: Metadata = {
  title: 'Create Work Orders | GarmentFlow',
  description: 'Convert approved sales orders to work orders',
}

export default function NewWorkOrderPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Suspense fallback={<div>Loading work order creation page...</div>}>
        <WorkOrderNewPage />
      </Suspense>
    </div>
  )
}