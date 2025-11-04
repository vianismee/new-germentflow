import { Metadata } from 'next'
import { Suspense } from 'react'
import { WorkOrderList } from '@/components/work-orders/work-order-list'
import { WorkOrderStats } from '@/components/work-orders/work-order-stats'
import { Wrench } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Work Orders | GarmentFlow',
  description: 'Manage work orders and track production progress',
}

export default function WorkOrdersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Wrench className="h-8 w-8" />
            Work Orders
          </h2>
          <p className="text-muted-foreground">
            Manage production work orders and track progress through 8-stage workflow.
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <WorkOrderStats />
      </Suspense>

      <Suspense fallback={<div>Loading work orders...</div>}>
        <WorkOrderList />
      </Suspense>
    </div>
  )
}