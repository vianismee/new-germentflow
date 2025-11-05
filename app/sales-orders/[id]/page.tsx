import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { SalesOrderDetail } from '@/components/sales-orders/sales-order-detail'
import { getSalesOrderById } from '@/lib/actions/sales-orders'

interface SalesOrderPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SalesOrderPage({ params }: SalesOrderPageProps) {
  const { id } = await params
  const result = await getSalesOrderById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Suspense fallback={<div>Loading order details...</div>}>
        <SalesOrderDetail order={result.data} />
      </Suspense>
    </div>
  )
}