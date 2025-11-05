import { Suspense } from 'react'
import { QualityInspectionPage } from '@/components/quality-control/quality-inspection-page'

export default function NewQualityInspectionPage({
  searchParams,
}: {
  searchParams: { woId?: string }
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Suspense fallback={<div>Loading inspection form...</div>}>
        <QualityInspectionPage workOrderId={searchParams.woId} />
      </Suspense>
    </div>
  )
}