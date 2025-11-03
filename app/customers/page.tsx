import { Suspense } from 'react'
import { CustomerList } from '@/components/customers/customer-list'
import { CustomerStats } from '@/components/customers/customer-stats'
import { Users } from 'lucide-react'

export default function CustomersPage() {
  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Customers
          </h2>
          <p className="text-muted-foreground">
            Manage your customer database and track their information.
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <CustomerStats />
      </Suspense>

      <Suspense fallback={<div>Loading customers...</div>}>
        <CustomerList />
      </Suspense>
    </div>
  )
}