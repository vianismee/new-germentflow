import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { CustomerDetailEnhanced } from '@/components/customers/customer-detail-enhanced'
import { getCustomerById } from '@/lib/actions/customers'

interface CustomerPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CustomerPage({ params }: CustomerPageProps) {
  const { id } = await params
  const result = await getCustomerById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Suspense fallback={<div>Loading customer details...</div>}>
        <CustomerDetailEnhanced customer={result.data} />
      </Suspense>
    </div>
  )
}