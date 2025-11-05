import { Metadata } from 'next'
import { Suspense } from 'react'
import { QualityControlDashboard } from '@/components/quality-control/quality-control-dashboard'
import { QualityControlList } from '@/components/quality-control/quality-control-list'
import { QualityControlStats } from '@/components/quality-control/quality-control-stats'

export const metadata: Metadata = {
  title: 'Quality Control | GarmentFlow',
  description: 'Manage quality control inspections, track defects, and ensure product standards',
}

export default function QualityControlPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quality Control</h2>
          <p className="text-muted-foreground">
            Manage quality inspections, track issues, and maintain product standards.
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <QualityControlStats />
      </Suspense>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<div>Loading inspections...</div>}>
            <QualityControlList />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<div>Loading dashboard...</div>}>
            <QualityControlDashboard />
          </Suspense>
        </div>
      </div>
    </div>
  )
}