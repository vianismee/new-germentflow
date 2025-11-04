'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  Package,
  Shirt,
  Settings,
  Shield,
  Zap,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface ProductionStage {
  id: string
  stage: string
  startedAt?: string | Date | null
  completedAt?: string | Date | null
  duration?: number | null
  notes?: string | null
}

interface ProductionStageTrackerProps {
  stages: ProductionStage[]
  currentStage: string
  workOrderId: string
}

const STAGE_CONFIG = {
  order_processing: {
    label: 'Order Processing',
    description: 'Processing order details and requirements',
    icon: FileText,
    color: 'blue'
  },
  material_procurement: {
    label: 'Material Procurement',
    description: 'Sourcing and preparing materials',
    icon: Package,
    color: 'yellow'
  },
  cutting: {
    label: 'Cutting',
    description: 'Cutting fabric according to patterns',
    icon: Shirt,
    color: 'purple'
  },
  sewing_assembly: {
    label: 'Sewing & Assembly',
    description: 'Sewing and assembling garment pieces',
    icon: Settings,
    color: 'orange'
  },
  quality_control: {
    label: 'Quality Control',
    description: 'Inspecting finished garments',
    icon: Shield,
    color: 'green'
  },
  finishing: {
    label: 'Finishing',
    description: 'Final touches and packaging',
    icon: Zap,
    color: 'pink'
  },
  dispatch: {
    label: 'Dispatch',
    description: 'Preparing for shipment',
    icon: Truck,
    color: 'indigo'
  },
  delivered: {
    label: 'Delivered',
    description: 'Order successfully delivered',
    icon: CheckCircle,
    color: 'emerald'
  }
}

const STAGE_ORDER = [
  'order_processing',
  'material_procurement',
  'cutting',
  'sewing_assembly',
  'quality_control',
  'finishing',
  'dispatch',
  'delivered'
]

export function ProductionStageTracker({ stages, currentStage, workOrderId }: ProductionStageTrackerProps) {
  const currentStageIndex = STAGE_ORDER.indexOf(currentStage)
  const completedStagesCount = STAGE_ORDER.slice(0, currentStageIndex).filter(stage =>
    stages.some(s => s.stage === stage && s.completedAt)
  ).length

  const overallProgress = (completedStagesCount / STAGE_ORDER.length) * 100

  const getStageStatus = (stage: string) => {
    const stageData = stages.find(s => s.stage === stage)
    const stageIndex = STAGE_ORDER.indexOf(stage)
    const isCompleted = stageData?.completedAt
    const isCurrent = stage === currentStage
    const isUpcoming = stageIndex > currentStageIndex

    if (isCompleted) return 'completed'
    if (isCurrent) return 'current'
    if (isUpcoming) return 'upcoming'
    return 'pending'
  }

  const getStageIcon = (stage: string, status: string) => {
    const config = STAGE_CONFIG[stage as keyof typeof STAGE_CONFIG]
    const Icon = config?.icon || FileText

    if (status === 'completed') {
      return <Icon className="h-5 w-5 text-green-600" />
    } else if (status === 'current') {
      return <Icon className="h-5 w-5 text-blue-600 animate-pulse" />
    } else {
      return <Icon className="h-5 w-3 text-gray-400" />
    }
  }

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 border-green-300 text-green-800'
      case 'current': return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'upcoming': return 'bg-gray-50 border-gray-200 text-gray-500'
      default: return 'bg-gray-50 border-gray-200 text-gray-400'
    }
  }

  const formatDuration = (minutes?: number | null) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Production Stages
        </CardTitle>
        <CardDescription>
          Track the progress of your order through production stages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {completedStagesCount} of {STAGE_ORDER.length} stages completed
          </p>
        </div>

        <Separator />

        {/* Stage Timeline */}
        <div className="space-y-4">
          {STAGE_ORDER.map((stage, index) => {
            const status = getStageStatus(stage)
            const config = STAGE_CONFIG[stage as keyof typeof STAGE_CONFIG]
            const stageData = stages.find(s => s.stage === stage)

            return (
              <div key={stage} className="relative">
                {/* Connection Line */}
                {index < STAGE_ORDER.length - 1 && (
                  <div className={`absolute left-6 top-12 w-0.5 h-8 ${
                    status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                  }`} />
                )}

                <div className="flex items-start space-x-4">
                  {/* Stage Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    status === 'completed' ? 'bg-green-100 border-2 border-green-300' :
                    status === 'current' ? 'bg-blue-100 border-2 border-blue-300 animate-pulse' :
                    'bg-gray-100 border-2 border-gray-200'
                  }`}>
                    {getStageIcon(stage, status)}
                  </div>

                  {/* Stage Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{config?.label}</h4>
                        <p className="text-xs text-muted-foreground">{config?.description}</p>
                      </div>
                      <Badge className={getStageColor(status)}>
                        {status === 'completed' ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Done
                          </span>
                        ) : status === 'current' ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            In Progress
                          </span>
                        ) : (
                          'Pending'
                        )}
                      </Badge>
                    </div>

                    {/* Stage Details */}
                    {stageData && (
                      <div className="mt-2 p-3 bg-muted/30 rounded space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Started:</span>
                          <span>{stageData.startedAt ? formatDate(stageData.startedAt) : 'Not started'}</span>
                        </div>
                        {stageData.completedAt && (
                          <>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Completed:</span>
                              <span>{formatDate(stageData.completedAt)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Duration:</span>
                              <span>{formatDuration(stageData.duration)}</span>
                            </div>
                          </>
                        )}
                        {stageData.notes && (
                          <div className="mt-2 pt-2 border-t text-xs">
                            <span className="text-muted-foreground">Notes: </span>
                            <span>{stageData.notes}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Current Stage Alert */}
                    {status === 'current' && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="flex items-center space-x-2 text-sm text-blue-800">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">Currently in {config?.label}</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          {stageData?.notes || 'Processing...'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Work Order Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Work Order ID:</span>
            <span className="font-mono">{workOrderId}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}