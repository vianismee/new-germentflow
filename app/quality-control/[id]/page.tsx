import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { QualityInspectionDetail } from '@/components/quality-control/quality-inspection-detail'
import { getQualityInspectionById } from '@/lib/actions/quality-control'

interface QualityInspectionPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata(
  { params }: QualityInspectionPageProps
): Promise<Metadata> {
  const { id } = await params
  const inspection = await getQualityInspectionById(id)

  if (!inspection.success || !inspection.data) {
    return {
      title: 'Quality Inspection Not Found | GarmentFlow',
    }
  }

  return {
    title: `QC Inspection ${inspection.data.workOrderNumber} | GarmentFlow`,
    description: `Quality control inspection for ${inspection.data.productName}`,
  }
}

export default async function QualityInspectionPage({ params }: QualityInspectionPageProps) {
  const { id } = await params
  const result = await getQualityInspectionById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Suspense fallback={<div>Loading inspection details...</div>}>
        <QualityInspectionDetail inspection={result.data} />
      </Suspense>
    </div>
  )
}