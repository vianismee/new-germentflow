"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getQualityMetrics, getWorkOrdersForQualityControl } from "@/lib/actions/quality-control"
import { AlertTriangle, TrendingUp, Activity, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react"

export function QualityControlDashboard() {
  const [metrics, setMetrics] = useState<any>(null)
  const [workOrdersForQC, setWorkOrdersForQC] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [metricsResult, workOrdersResult] = await Promise.all([
        getQualityMetrics(),
        getWorkOrdersForQualityControl()
      ])

      if (metricsResult.success && metricsResult.data) {
        setMetrics(metricsResult.data)
      }

      if (workOrdersResult.success && workOrdersResult.data) {
        setWorkOrdersForQC(workOrdersResult.data)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading Dashboard...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getQualityLevel = (passRate: number) => {
    if (passRate >= 95) return { level: "Excellent", color: "text-green-600", bgColor: "bg-green-100" }
    if (passRate >= 90) return { level: "Good", color: "text-blue-600", bgColor: "bg-blue-100" }
    if (passRate >= 80) return { level: "Fair", color: "text-yellow-600", bgColor: "bg-yellow-100" }
    return { level: "Poor", color: "text-red-600", bgColor: "bg-red-100" }
  }

  const qualityLevel = metrics ? getQualityLevel(metrics.passRate) : null

  return (
    <div className="space-y-6">
      {/* Quality Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quality Overview
          </CardTitle>
          <CardDescription>
            Current quality control status and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qualityLevel && (
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Quality Level</div>
                <div className={`text-lg font-bold ${qualityLevel.color}`}>
                  {qualityLevel.level}
                </div>
              </div>
              <Badge className={`${qualityLevel.bgColor} ${qualityLevel.color}`}>
                {metrics.passRate.toFixed(1)}% Pass Rate
              </Badge>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Pass Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={metrics?.passRate || 0} className="w-20" />
                <span className="text-sm text-muted-foreground">
                  {metrics?.passRate.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Repair Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={metrics?.repairRate || 0} className="w-20" />
                <span className="text-sm text-muted-foreground">
                  {metrics?.repairRate.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Reject Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={metrics?.rejectRate || 0} className="w-20" />
                <span className="text-sm text-muted-foreground">
                  {metrics?.rejectRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Work Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Inspections
          </CardTitle>
          <CardDescription>
            Work orders ready for quality control inspection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workOrdersForQC.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No work orders pending inspection
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {workOrdersForQC.slice(0, 5).map((workOrder) => (
                <div key={workOrder.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium">{workOrder.workOrderNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {workOrder.productName} • {workOrder.quantity} units
                    </div>
                  </div>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    Priority {workOrder.priority}
                  </Badge>
                </div>
              ))}
              {workOrdersForQC.length > 5 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    And {workOrdersForQC.length - 5} more...
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspections by Stage */}
      {metrics?.inspectionsByStage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Inspections by Stage
            </CardTitle>
            <CardDescription>
              Quality control distribution across production stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.inspectionsByStage).map(([stage, count]) => {
                const stageLabels: Record<string, string> = {
                  cutting: "Cutting",
                  sewing_assembly: "Sewing & Assembly",
                  quality_control: "Quality Control",
                  finishing: "Finishing",
                  dispatch: "Dispatch"
                }

                const label = stageLabels[stage] || stage.replace(/_/g, " ")
                const total = Object.values(metrics.inspectionsByStage).reduce((sum: number, val) => sum + (val as number), 0)
                const percentage = total > 0 ? ((count as number) / total) * 100 : 0

                return (
                  <div key={stage} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{count as number}</span>
                      <span className="text-xs text-muted-foreground">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quality Alert */}
      {(metrics?.rejectRate && metrics.rejectRate > 10) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Quality Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-800">
              Reject rate is above 10%. Consider reviewing production processes and quality standards.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}