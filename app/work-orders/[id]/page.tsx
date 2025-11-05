import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { WorkOrderDetail } from '@/components/work-orders/work-order-detail'
import { getWorkOrderById } from '@/lib/actions/work-orders'

interface WorkOrderPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata(
  { params }: WorkOrderPageProps
): Promise<Metadata> {
  const { id } = await params
  const workOrder = await getWorkOrderById(id)

  if (!workOrder.success || !workOrder.data) {
    return {
      title: 'Work Order Not Found | GarmentFlow',
    }
  }

  return {
    title: `Work Order ${workOrder.data.workOrderNumber} | GarmentFlow`,
    description: `Manage work order ${workOrder.data.workOrderNumber} for ${workOrder.data.productName}`,
  }
}

export default async function WorkOrderPage({ params }: WorkOrderPageProps) {
  const { id } = await params
  const workOrder = await getWorkOrderById(id)

  if (!workOrder.success || !workOrder.data) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <WorkOrderDetail workOrder={workOrder.data} />
    </div>
  )
}