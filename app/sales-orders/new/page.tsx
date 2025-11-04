import { Suspense } from 'react'
import { SalesOrderForm } from '@/components/sales-orders/sales-order-form'

export default function NewSalesOrderPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Suspense fallback={<div>Loading form...</div>}>
        <SalesOrderForm />
      </Suspense>
    </div>
  )
}