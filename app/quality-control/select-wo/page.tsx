import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play } from 'lucide-react'
import { WOInspectionSelection } from '@/components/quality-control/wo-inspection-selection'

export const metadata: Metadata = {
  title: 'Select Work Order for Inspection | GarmentFlow',
  description: 'Choose a work order to start quality inspection.',
}

export default function SelectWOPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/quality-control">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Select Work Order for Inspection</h2>
            <p className="text-muted-foreground">
              Choose a work order to start quality inspection process.
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<div>Loading work orders...</div>}>
        <WOInspectionSelection />
      </Suspense>
    </div>
  )
}