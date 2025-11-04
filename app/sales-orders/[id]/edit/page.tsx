import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { SalesOrderForm } from '@/components/sales-orders/sales-order-form'
import { getSalesOrderById } from '@/lib/actions/sales-orders'

interface EditSalesOrderPageProps {
  params: {
    id: string
  }
}

export default async function EditSalesOrderPage({ params }: EditSalesOrderPageProps) {
  const result = await getSalesOrderById(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Suspense fallback={<div>Loading form...</div>}>
        <SalesOrderForm orderId={params.id} isEdit={true} />
      </Suspense>
    </div>
  )
}