'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getWorkOrders } from '@/lib/actions/work-orders'
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users
} from 'lucide-react'

interface WorkOrderStats {
  total: number
  inProgress: number
  completed: number
  overdue: number
  todayStarted: number
  assigned: number
}

export function WorkOrderStats() {
  const [stats, setStats] = useState<WorkOrderStats>({
    total: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    todayStarted: 0,
    assigned: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getWorkOrders()
        if (result.success && result.data) {
          const workOrders = result.data
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const calculatedStats: WorkOrderStats = {
            total: workOrders.length,
            inProgress: workOrders.filter(wo => wo.currentStage !== 'delivered').length,
            completed: workOrders.filter(wo => wo.currentStage === 'delivered').length,
            overdue: workOrders.filter(wo => {
              if (wo.currentStage === 'delivered') return false
              if (wo.estimatedCompletion) {
                return new Date(wo.estimatedCompletion) < new Date()
              }
              return false
            }).length,
            todayStarted: workOrders.filter(wo => {
              const createdAt = new Date(wo.createdAt)
              createdAt.setHours(0, 0, 0, 0)
              return createdAt.getTime() === today.getTime()
            }).length,
            assigned: workOrders.filter(wo => wo.assignedTo).length,
          }

          setStats(calculatedStats)
        }
      } catch (error) {
        console.error('Error fetching work order stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Total Work Orders',
      value: stats.total,
      icon: Wrench,
      description: 'All work orders in system',
      color: 'text-blue-600',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      description: 'Currently being processed',
      color: 'text-orange-600',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      description: 'Successfully delivered',
      color: 'text-green-600',
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      description: 'Past estimated completion',
      color: 'text-red-600',
    },
    {
      title: 'Started Today',
      value: stats.todayStarted,
      icon: TrendingUp,
      description: 'New work orders today',
      color: 'text-purple-600',
    },
    {
      title: 'Assigned',
      value: stats.assigned,
      icon: Users,
      description: 'Assigned to workers',
      color: 'text-indigo-600',
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}