"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getQualityMetrics } from "@/lib/actions/quality-control"
import { CheckCircle, XCircle, AlertCircle, Clock, TrendingUp, Activity } from "lucide-react"

export function QualityControlStats() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const result = await getQualityMetrics()
      if (result.success && result.data) {
        setMetrics(result.data)
      } else {
        setError(result.error || "Failed to load metrics")
      }
    } catch (err) {
      setError("Failed to load metrics")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return null
  }

  const cards = [
    {
      title: "Total Inspections",
      value: metrics.totalInspections.toLocaleString(),
      icon: Activity,
      description: "All time inspections",
      color: "text-blue-600"
    },
    {
      title: "Pass Rate",
      value: `${metrics.passRate.toFixed(1)}%`,
      icon: CheckCircle,
      description: `${metrics.passedInspections} passed`,
      color: "text-green-600"
    },
    {
      title: "Repair Rate",
      value: `${metrics.repairRate.toFixed(1)}%`,
      icon: AlertCircle,
      description: `${metrics.repairedInspections} need repair`,
      color: "text-yellow-600"
    },
    {
      title: "Reject Rate",
      value: `${metrics.rejectRate.toFixed(1)}%`,
      icon: XCircle,
      description: `${metrics.rejectedInspections} rejected`,
      color: "text-red-600"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}