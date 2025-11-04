import { Suspense } from 'react'
import { SalesOrderList } from '@/components/sales-orders/sales-order-list'
import { SalesOrderStats } from '@/components/sales-orders/sales-order-stats'
import { ShoppingCart } from 'lucide-react'

export default function SalesOrdersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Sales Orders
          </h2>
          <p className="text-muted-foreground">
            Manage sales orders and track order processing.
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <SalesOrderStats />
      </Suspense>

      <Suspense fallback={<div>Loading sales orders...</div>}>
        <SalesOrderList />
      </Suspense>
    </div>
  )
}