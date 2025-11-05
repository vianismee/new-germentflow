import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { QualityControlList } from '@/components/quality-control/quality-control-list'
import { Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Quality Control | GarmentFlow',
  description: 'Manage quality control inspections and maintain product standards.',
}

export default function QualityControlPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quality Control</h2>
          <p className="text-muted-foreground">
            Manage quality inspections and maintain product standards.
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading inspections...</div>}>
        <QualityControlList />
      </Suspense>
    </div>
  )
}