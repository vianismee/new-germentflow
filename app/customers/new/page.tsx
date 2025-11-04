import { CustomerForm } from '@/components/customers/customer-form'

export default function NewCustomerPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <CustomerForm />
    </div>
  )
}