"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  MoreHorizontal,
  Eye,
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Filter
} from "lucide-react"
import { getQualityInspections, getWorkOrdersForQualityControl } from "@/lib/actions/quality-control"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import Link from "next/link"

interface QualityInspection {
  id: string
  workOrderId: string
  workOrderNumber?: string
  productName?: string
  quantity?: number
  customerName?: string
  stage: string
  status: "pending" | "pass" | "repair" | "reject"
  inspectedBy?: string
  inspectionDate: Date
  totalQuantity: number
  passedQuantity: number
  repairedQuantity: number
  rejectedQuantity: number
  issues?: any
  repairNotes?: string
  finalStatus?: "pending" | "pass" | "repair" | "reject"
  createdAt: Date
  updatedAt: Date
}

export function QualityControlList() {
  const { toast } = useToast()
  const [inspections, setInspections] = useState<QualityInspection[]>([])
  const [workOrdersForQC, setWorkOrdersForQC] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchInspections()
    fetchWorkOrdersForQC()
  }, [currentPage, statusFilter, stageFilter, searchQuery])

  const fetchInspections = async () => {
    try {
      setLoading(true)
      const result = await getQualityInspections({
        page: currentPage,
        limit: 20,
        status: statusFilter !== "all" ? statusFilter : undefined,
        stage: stageFilter !== "all" ? stageFilter : undefined,
        search: searchQuery || undefined
      })

      if (result.success && result.data) {
        setInspections(result.data)
        setTotalPages(result.pagination?.totalPages || 1)
        setTotalCount(result.pagination?.total || 0)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch inspections",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch inspections",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkOrdersForQC = async () => {
    try {
      const result = await getWorkOrdersForQualityControl()
      if (result.success && result.data) {
        setWorkOrdersForQC(result.data)
      }
    } catch {
      console.error("Failed to fetch work orders for QC")
    }
  }

  const getStatusBadge = (status: string, passed?: number, repaired?: number, rejected?: number, total?: number) => {
    // Create a more descriptive status based on the quantities
    if (passed === total) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          All Passed
        </Badge>
      )
    }

    if (rejected === total) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          All Rejected
        </Badge>
      )
    }

    if (repaired === total) {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          All Repaired
        </Badge>
      )
    }

    // Mixed result - show detailed breakdown
    const statusConfig = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
      pass: { label: "Mostly Passed", className: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      repair: { label: "Mixed Result", className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertCircle },
      reject: { label: "Issues Found", className: "bg-red-100 text-red-800 border-red-200", icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <div className="flex items-center gap-1">
        <Badge className={`${config.className} flex items-center gap-1`}>
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
        {total && passed !== undefined && (
          <Badge variant="outline" className="text-xs">
            {passed}/{total}
          </Badge>
        )}
      </div>
    )
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

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "MMM dd, yyyy")
  }

  const formatDateTime = (date: string | Date) => {
    return format(new Date(date), "MMM dd, yyyy 'at' h:mm a")
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Inspections...</CardTitle>
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Quality Inspections ({totalCount})</CardTitle>
              </div>
              <CardDescription>
                Track and manage quality control inspections across all production stages.
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/quality-control/select-wo">
                <Plus className="mr-2 h-4 w-4" />
                New Inspection
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inspections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Status: {statusFilter === "all" ? "All" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Statuses
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pass")}>
                    Passed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("repair")}>
                    Repair Required
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("reject")}>
                    Rejected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Stage: {stageFilter === "all" ? "All" : stageFilter.replace(/_/g, " ")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStageFilter("all")}>
                    All Stages
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStageFilter("cutting")}>
                    Cutting
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStageFilter("sewing_assembly")}>
                    Sewing & Assembly
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStageFilter("quality_control")}>
                    Quality Control
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStageFilter("finishing")}>
                    Finishing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStageFilter("dispatch")}>
                    Dispatch
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Work Orders Ready for QC */}
          {workOrdersForQC.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-yellow-800">Work Orders Ready for Inspection</h4>
                  <p className="text-sm text-yellow-600">
                    {workOrdersForQC.length} work order{workOrdersForQC.length !== 1 ? "s" : ""} pending quality control
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href="/quality-control/new">
                    Start Inspection
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Inspections Table */}
          {inspections.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                {searchQuery || statusFilter !== "all" || stageFilter !== "all"
                  ? "No matching inspections found"
                  : "No quality inspections yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" || stageFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start your first quality inspection to track product quality"}
              </p>
              {!(searchQuery || statusFilter !== "all" || stageFilter !== "all") && (
                <Button asChild>
                  <Link href="/quality-control/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Start First Inspection
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Inspection Date</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inspections.map((inspection) => (
                    <TableRow key={inspection.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Button variant="link" className="h-auto p-0 font-medium text-left" asChild>
                          <Link href={`/quality-control/${inspection.id}`}>
                            {inspection.workOrderNumber}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{inspection.productName}</div>
                          <div className="text-sm text-muted-foreground">
                            {inspection.quantity} units
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{inspection.customerName}</div>
                      </TableCell>
                      <TableCell>
                        {getStageBadge(inspection.stage)}
                      </TableCell>
                      <TableCell>
                        {inspection.totalQuantity ? (
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-green-600">{inspection.passedQuantity || 0}</span>
                            <span>/</span>
                            <span className="text-orange-600">{inspection.repairedQuantity || 0}</span>
                            <span>/</span>
                            <span className="text-red-600">{inspection.rejectedQuantity || 0}</span>
                            <span className="text-muted-foreground ml-1">
                              ({inspection.totalQuantity})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(
                          inspection.status,
                          inspection.passedQuantity,
                          inspection.repairedQuantity,
                          inspection.rejectedQuantity,
                          inspection.totalQuantity
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(inspection.inspectionDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/quality-control/${inspection.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalCount)} of {totalCount} inspections
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}