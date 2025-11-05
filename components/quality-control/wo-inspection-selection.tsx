"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Play,
  Package,
  User,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react"
import { getWorkOrdersForQualityControl } from "@/lib/actions/quality-control"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import Link from "next/link"

interface WorkOrder {
  id: string
  workOrderNumber: string
  productName?: string
  quantity?: number
  customerName?: string
  currentStage: string
  priority?: number
  createdAt: Date
  updatedAt: Date
  inspectionId?: string
  inspectionStatus?: string
  hasInspection?: boolean
}

export function WOInspectionSelection() {
  const { toast } = useToast()
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchWorkOrders()
  }, [])

  const fetchWorkOrders = async () => {
    try {
      setLoading(true)
      const result = await getWorkOrdersForQualityControl()

      if (result.success && result.data) {
        const processedData = result.data.map((wo: any) => ({
          ...wo,
          hasInspection: wo.inspectionId ? true : false
        }))

        setWorkOrders(processedData)
        console.log('Fetched work orders:', processedData) // Debug log
      } else {
        console.error('API Error:', result.error)
        toast({
          title: "Error",
          description: result.error || "Failed to fetch work orders",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Fetch Error:', error)
      toast({
        title: "Error",
        description: "Failed to fetch work orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStageBadge = (stage: string) => {
    const stageConfig: Record<string, { label: string; color: string }> = {
      cutting: { label: "Cutting", color: "bg-orange-100 text-orange-800" },
      sewing_assembly: { label: "Sewing & Assembly", color: "bg-pink-100 text-pink-800" },
      quality_control: { label: "Quality Control", color: "bg-yellow-100 text-yellow-800" },
      finishing: { label: "Finishing", color: "bg-indigo-100 text-indigo-800" },
      dispatch: { label: "Dispatch", color: "bg-teal-100 text-teal-800" }
    }

    const config = stageConfig[stage] || { label: stage, color: "bg-gray-100 text-gray-800" }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority?: number) => {
    if (!priority) return null

    const priorityConfig = {
      1: { label: "Low", color: "bg-blue-100 text-blue-800" },
      2: { label: "Normal", color: "bg-green-100 text-green-800" },
      3: { label: "High", color: "bg-orange-100 text-orange-800" },
      4: { label: "Urgent", color: "bg-red-100 text-red-800" },
      5: { label: "Critical", color: "bg-purple-100 text-purple-800" }
    }

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig[2]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "MMM dd, yyyy")
  }

  const formatDateTime = (date: string | Date) => {
    return format(new Date(date), "MMM dd, yyyy 'at' h:mm a")
  }

  // Filter work orders based on search
  const filteredWorkOrders = workOrders.filter(wo =>
    wo.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wo.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wo.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const WorkOrderTable = ({ data, showStartButton = true }: { data: WorkOrder[], showStartButton?: boolean }) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Work Order</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Status</TableHead>
            {showStartButton && <TableHead className="text-right">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showStartButton ? 8 : 7} className="text-center py-8">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Package className="h-8 w-8" />
                  <p>No work orders found</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((wo) => (
              <TableRow key={wo.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{wo.workOrderNumber}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{wo.productName}</div>
                      <div className="text-sm text-muted-foreground">Qty: {wo.quantity}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {wo.customerName}
                  </div>
                </TableCell>
                <TableCell>
                  {getStageBadge(wo.currentStage)}
                </TableCell>
                <TableCell>
                  {getPriorityBadge(wo.priority)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(wo.createdAt)}
                  </div>
                </TableCell>
                <TableCell>
                  {wo.hasInspection ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Inspected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Pending</span>
                    </div>
                  )}
                </TableCell>
                {showStartButton && (
                  <TableCell className="text-right">
                    <Button asChild size="sm">
                      <Link href={`/quality-control/new?woId=${wo.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        Start Inspection
                      </Link>
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Work Orders...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search work orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Work Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Work Orders in Quality Control Stage
          </CardTitle>
          <CardDescription>
            Work orders currently at quality control stage ready for inspection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkOrderTable data={filteredWorkOrders} showStartButton={true} />
        </CardContent>
      </Card>

      {/* Empty State */}
      {workOrders.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No Work Orders in Quality Control</h3>
                <p className="text-muted-foreground">
                  There are currently no work orders at the quality control stage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}