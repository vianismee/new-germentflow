'use client'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface StageProgressProps {
  currentStage: 'order_processing' | 'material_procurement' | 'cutting' | 'sewing_assembly' | 'quality_control' | 'finishing' | 'dispatch' | 'delivered'
  className?: string
}

const stages = [
  { key: 'order_processing', label: 'Order', color: 'bg-blue-500' },
  { key: 'material_procurement', label: 'Material', color: 'bg-purple-500' },
  { key: 'cutting', label: 'Cutting', color: 'bg-orange-500' },
  { key: 'sewing_assembly', label: 'Sewing', color: 'bg-pink-500' },
  { key: 'quality_control', label: 'Quality', color: 'bg-yellow-500' },
  { key: 'finishing', label: 'Finishing', color: 'bg-indigo-500' },
  { key: 'dispatch', label: 'Dispatch', color: 'bg-teal-500' },
  { key: 'delivered', label: 'Delivered', color: 'bg-green-500' },
]

export function StageProgress({ currentStage, className }: StageProgressProps) {
  const currentStageIndex = stages.findIndex(stage => stage.key === currentStage)
  const progressPercentage = ((currentStageIndex + 1) / stages.length) * 100

  return (
    <div className={cn("w-full max-w-[200px]", className)}>
      <div className="mb-2">
        <Progress value={progressPercentage} className="h-2" />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {currentStageIndex + 1}/{stages.length}
        </span>
        <Badge variant="secondary" className="text-xs">
          {currentStage.replace('_', ' ')}
        </Badge>
      </div>
    </div>
  )
}