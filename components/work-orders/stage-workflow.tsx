'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Play, CheckCircle, Clock, RotateCcw, AlertCircle, FileText, Package, Settings, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { startProductionStage, finishProductionStage } from '@/lib/actions/work-orders'
import { useToast } from '@/hooks/use-toast'

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

interface StageWorkflowProps {
  workOrderId: string
  currentStage: 'order_processing' | 'material_procurement' | 'cutting' | 'sewing_assembly' | 'quality_control' | 'finishing' | 'dispatch' | 'delivered'
  stageHistory: ProductionStage[]
  onStageUpdate: (newStage: string) => void
  loading?: boolean
}

const stages = [
  {
    key: 'order_processing',
    label: 'Order Processing',
    description: 'Review order and prepare production plan',
    icon: FileText,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    key: 'material_procurement',
    label: 'Material Procurement',
    description: 'Order and receive required materials',
    icon: Package,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    key: 'cutting',
    label: 'Cutting',
    description: 'Cut fabric according to specifications',
    icon: RotateCcw,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    key: 'sewing_assembly',
    label: 'Sewing & Assembly',
    description: 'Sew and assemble garment components',
    icon: Settings,
    color: 'bg-pink-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  {
    key: 'quality_control',
    label: 'Quality Control',
    description: 'Inspect for quality and standards compliance',
    icon: AlertCircle,
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  {
    key: 'finishing',
    label: 'Finishing',
    description: 'Apply finishing touches and final preparations',
    icon: Settings,
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  {
    key: 'dispatch',
    label: 'Dispatch',
    description: 'Package and prepare for delivery',
    icon: Package,
    color: 'bg-teal-500',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Order completed and delivered to customer',
    icon: CheckCircle,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
]

export function StageWorkflow({ workOrderId, currentStage, stageHistory, onStageUpdate, loading }: StageWorkflowProps) {
  const { toast } = useToast()
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [stageLoading, setStageLoading] = useState<string | null>(null)

  const currentStageIndex = stages.findIndex(stage => stage.key === currentStage)
  const progressPercentage = ((currentStageIndex + 1) / stages.length) * 100

  const getStageStatus = (stageKey: string) => {
    const stageIndex = stages.findIndex(s => s.key === stageKey)
    const currentIndex = stages.findIndex(s => s.key === currentStage)
    const history = getStageHistory(stageKey)

    // Check if stage is completed in history
    if (history && history.completedAt) {
      return 'completed'
    }
    // Check if stage is currently running (started but not completed)
    else if (history && !history.completedAt) {
      return 'running'
    }
    // Check if stage is the current stage based on work order
    else if (stageIndex === currentIndex) {
      return 'current'
    }
    // Otherwise it's pending
    else {
      return 'pending'
    }
  }

  const getStageHistory = (stageKey: string) => {
    return stageHistory.find(history => history.stage === stageKey)
  }

  const handleStageStart = async (stageKey: string) => {
    setStageLoading(stageKey)
    try {
      // TODO: Get actual user ID from authentication
      const userId = 'system-user' // Temporary user ID for testing
      const result = await startProductionStage(workOrderId, stageKey, userId)

      if (result.success) {
        toast({
          title: 'Stage Started',
          description: result.message,
        })
        // Real-time updates will refresh the data automatically
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start stage',
        variant: 'destructive',
      })
    } finally {
      setStageLoading(null)
    }
  }

  const handleStageFinish = async (stageKey: string) => {
    setStageLoading(stageKey)
    try {
      // TODO: Get actual user ID from authentication
      const userId = 'system-user' // Temporary user ID for testing
      const result = await finishProductionStage(workOrderId, stageKey, userId)

      if (result.success) {
        toast({
          title: 'Stage Completed',
          description: result.message,
        })
        // Real-time updates will refresh the data automatically
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to finish stage',
        variant: 'destructive',
      })
    } finally {
      setStageLoading(null)
    }
  }

  const handleStageClick = (stageKey: string) => {
    const currentIndex = stages.findIndex(s => s.key === currentStage)
    const clickedIndex = stages.findIndex(s => s.key === stageKey)

    // Can only move to next stage or restart from current
    if (clickedIndex === currentIndex + 1 || clickedIndex === currentIndex) {
      setSelectedStage(stageKey)
      onStageUpdate(stageKey)
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">
            {currentStageIndex + 1} of {stages.length} stages
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Stages */}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage.key)
          const history = getStageHistory(stage.key)
          const StageIcon = stage.icon
          const isNextStage = index === currentStageIndex + 1
          const isLoading = stageLoading === stage.key

          return (
            <Card
              key={stage.key}
              className={cn(
                "transition-all duration-200",
                status === 'running' && `${stage.bgColor} ${stage.borderColor} border-2`,
                status === 'current' && `${stage.bgColor} ${stage.borderColor} border-2`,
                status === 'completed' && 'bg-green-50 border-green-200',
                status === 'pending' && 'bg-gray-50 border-gray-200',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      "p-2 rounded-full",
                      status === 'running' && stage.color,
                      status === 'current' && stage.color,
                      status === 'completed' && 'bg-green-500',
                      status === 'pending' && 'bg-gray-300'
                    )}>
                      <StageIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{stage.label}</h3>
                        {status === 'running' && (
                          <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Running
                          </Badge>
                        )}
                        {status === 'current' && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                        {status === 'completed' && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                        {isNextStage && (
                          <Badge variant="outline" className="text-xs">
                            Next
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {stage.description}
                      </p>

                      {history && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Started: {new Date(history.startedAt).toLocaleString()}</span>
                          </div>
                          {history.completedAt && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle className="h-3 w-3" />
                              <span>Completed: {new Date(history.completedAt).toLocaleString()}</span>
                            </div>
                          )}
                          {history.duration && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span className="font-medium">
                                Duration: {Math.floor(history.duration / 60)}h {history.duration % 60}m
                              </span>
                            </div>
                          )}
                          {history.notes && (
                            <div className="text-xs text-muted-foreground mt-1 p-2 bg-background rounded">
                              {history.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStageStart(stage.key)}
                        disabled={isLoading || loading}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    )}
                    {status === 'running' && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleStageFinish(stage.key)}
                        disabled={isLoading || loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Finish
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {currentStage === 'delivered' && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800 mb-1">Work Order Completed</h3>
            <p className="text-sm text-green-600">
              This work order has been successfully delivered and marked as complete.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}