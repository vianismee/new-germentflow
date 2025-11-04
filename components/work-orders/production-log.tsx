'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, CheckCircle, User, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface ProductionStage {
  id: string
  workOrderId: string
  stage: string
  startedAt: Date
  completedAt?: Date | null
  duration?: number | null
  notes?: string | null
  userId: string
  createdAt: Date
}

interface ProductionLogProps {
  stageHistory: ProductionStage[]
}

const stageLabels: Record<string, string> = {
  order_processing: 'Order Processing',
  material_procurement: 'Material Procurement',
  cutting: 'Cutting',
  sewing_assembly: 'Sewing & Assembly',
  quality_control: 'Quality Control',
  finishing: 'Finishing',
  dispatch: 'Dispatch',
  delivered: 'Delivered',
}

export function ProductionLog({ stageHistory }: ProductionLogProps) {
  if (stageHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No production history available yet.
        </p>
      </div>
    )
  }

  const sortedHistory = [...stageHistory].sort((a, b) =>
    new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  )

  return (
    <div className="space-y-4">
      {sortedHistory.map((stage, index) => {
        const isCompleted = !!stage.completedAt
        const duration = stage.duration ||
          (isCompleted ? Math.floor((new Date(stage.completedAt!).getTime() - new Date(stage.startedAt).getTime()) / (1000 * 60)) : null)

        return (
          <div key={stage.id} className="relative">
            {index < sortedHistory.length - 1 && (
              <div className="absolute left-4 top-8 w-0.5 h-full bg-border"></div>
            )}

            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full border-2 ${
                isCompleted
                  ? 'bg-green-100 border-green-300'
                  : 'bg-blue-100 border-blue-300'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-blue-600" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">
                      {stageLabels[stage.stage] || stage.stage.replace('_', ' ')}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(stage.startedAt), 'MMM dd, yyyy h:mm a')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={isCompleted ? "default" : "secondary"} className="text-xs">
                      {isCompleted ? 'Completed' : 'In Progress'}
                    </Badge>
                    {duration && (
                      <span className="text-xs text-muted-foreground">
                        {Math.floor(duration / 60)}h {duration % 60}m
                      </span>
                    )}
                  </div>
                </div>

                {isCompleted && (
                  <div className="text-xs text-muted-foreground">
                    Completed: {format(new Date(stage.completedAt!), 'MMM dd, yyyy h:mm a')}
                  </div>
                )}

                {stage.notes && (
                  <div className="text-xs bg-muted/50 p-2 rounded border">
                    <p className="font-medium mb-1">Notes:</p>
                    <p className="text-muted-foreground">{stage.notes}</p>
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>Operator ID: {stage.userId}</span>
                </div>
              </div>
            </div>

            {index < sortedHistory.length - 1 && <Separator className="mt-4" />}
          </div>
        )
      })}
    </div>
  )
}