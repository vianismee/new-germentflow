import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { WorkOrderDetail } from '@/components/work-orders/work-order-detail'
import { getWorkOrderById } from '@/lib/actions/work-orders'

interface WorkOrderPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata(
  { params }: WorkOrderPageProps
): Promise<Metadata> {
  const workOrder = await getWorkOrderById(params.id)

  if (!workOrder.success) {
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
  const workOrder = await getWorkOrderById(params.id)

  if (!workOrder.success) {
    notFound()
  }

  return <WorkOrderDetail workOrder={workOrder.data} />
}