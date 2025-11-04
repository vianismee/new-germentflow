import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { CustomerForm } from '@/components/customers/customer-form'
import { getCustomerById } from '@/lib/actions/customers'

interface EditCustomerPageProps {
  params: {
    id: string
  }
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const result = await getCustomerById(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Suspense fallback={<div>Loading customer for editing...</div>}>
        <CustomerForm customer={result.data} isEdit={true} />
      </Suspense>
    </div>
  )
}