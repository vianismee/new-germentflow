'use client'

import { useState } from 'react'
import {
  getQualityInspections,
  getQualityMetrics,
  getWorkOrdersForQualityControl,
  getQualityInspectors,
  getQualityInspectionById
} from '@/lib/actions/quality-control'
import { getWorkOrders, finishProductionStage } from '@/lib/actions/work-orders'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Eye,
  BarChart3,
  Users,
  List
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export default function QualityControlDebugPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Data states
  const [inspections, setInspections] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [workOrdersForQC, setWorkOrdersForQC] = useState<any>(null)
  const [allWorkOrders, setAllWorkOrders] = useState<any>(null)
  const [inspectors, setInspectors] = useState<any>(null)
  const [singleInspection, setSingleInspection] = useState<any>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [inspectionId, setInspectionId] = useState('')
  const [workOrderIdForUpdate, setWorkOrderIdForUpdate] = useState('')

  const fetchAllInspections = async () => {
    setLoading(true)
    try {
      const result = await getQualityInspections({
        page: 1,
        limit: 50,
        search: searchQuery || undefined
      })
      setInspections(result)
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

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const result = await getQualityMetrics()
      setMetrics(result)
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch metrics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkOrdersForQC = async () => {
    setLoading(true)
    try {
      const result = await getWorkOrdersForQualityControl()
      setWorkOrdersForQC(result)
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch work orders for QC",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchInspectors = async () => {
    setLoading(true)
    try {
      const result = await getQualityInspectors()
      setInspectors(result)
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch inspectors",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAllWorkOrders = async () => {
    setLoading(true)
    try {
      const result = await getWorkOrders()
      setAllWorkOrders(result)
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch all work orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSingleInspection = async () => {
    if (!inspectionId.trim()) {
      toast({
        title: "Error",
        description: "Please enter an inspection ID",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await getQualityInspectionById(inspectionId.trim())
      setSingleInspection(result)
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch inspection",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateWorkOrderToQC = async () => {
    if (!workOrderIdForUpdate.trim()) {
      toast({
        title: "Error",
        description: "Please enter a work order ID",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // First finish the current stage to move to quality control
      const result = await finishProductionStage(
        workOrderIdForUpdate.trim(),
        'sewing_assembly', // Assuming the current stage is sewing_assembly
        'debug-user', // Debug user ID
        'Manually moved to quality control for debugging'
      )

      if (result.success) {
        toast({
          title: "Success",
          description: "Work order updated to quality control stage",
        })
        // Refresh the data
        await fetchAllWorkOrders()
        await fetchWorkOrdersForQC()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update work order",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update work order",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchAllInspections(),
        fetchMetrics(),
        fetchWorkOrdersForQC(),
        fetchInspectors(),
        fetchAllWorkOrders()
      ])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock
      },
      pass: {
        label: "Pass",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle
      },
      repair: {
        label: "Repair",
        className: "bg-orange-100 text-orange-800 border-orange-200",
        icon: AlertCircle
      },
      reject: {
        label: "Reject",
        className: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "MMM dd, yyyy 'at' h:mm a")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quality Control Debug</h1>
        <Button onClick={fetchAllData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Fetch All Data'}
        </Button>
      </div>

      <Tabs defaultValue="inspections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="inspections" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Inspections
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="workorders" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Work Orders for QC
          </TabsTrigger>
          <TabsTrigger value="allworkorders" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            All Work Orders
          </TabsTrigger>
          <TabsTrigger value="inspectors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Inspectors
          </TabsTrigger>
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Single Inspection
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inspections">
          <Card>
            <CardHeader>
              <CardTitle>Quality Inspections</CardTitle>
              <CardDescription>Raw inspection data from database</CardDescription>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search inspections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={fetchAllInspections} disabled={loading} variant="outline">
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {inspections && (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Total: {inspections.pagination?.total || 0} inspections |
                    Page: {inspections.pagination?.page || 1} of {inspections.pagination?.totalPages || 1}
                  </div>

                  {inspections.data && inspections.data.length > 0 ? (
                    <div className="space-y-2">
                      {inspections.data.map((inspection: any) => (
                        <div key={inspection.id} className="border rounded p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{inspection.workOrderNumber}</div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(inspection.status)}
                              <Badge variant="outline">{inspection.stage}</Badge>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Product: {inspection.productName} | Customer: {inspection.customerName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Inspection Date: {formatDate(inspection.inspectionDate)}
                          </div>
                          {inspection.issues && (
                            <div className="text-xs bg-red-50 p-2 rounded">
                              <strong>Issues:</strong> {JSON.stringify(inspection.issues, null, 2)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No inspections found
                    </div>
                  )}

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Raw Response Data:</h4>
                    <pre className="text-xs overflow-auto max-h-96 bg-gray-100 p-4 rounded">
                      {JSON.stringify(inspections, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics</CardTitle>
              <CardDescription>Quality control statistics and KPIs</CardDescription>
              <Button onClick={fetchMetrics} disabled={loading} variant="outline">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Metrics
              </Button>
            </CardHeader>
            <CardContent>
              {metrics && (
                <div className="space-y-4">
                  {metrics.success && metrics.data ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-green-50 p-4 rounded">
                        <div className="text-2xl font-bold text-green-700">{metrics.data.passedInspections}</div>
                        <div className="text-sm text-green-600">Passed</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded">
                        <div className="text-2xl font-bold text-red-700">{metrics.data.rejectedInspections}</div>
                        <div className="text-sm text-red-600">Rejected</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded">
                        <div className="text-2xl font-bold text-orange-700">{metrics.data.repairedInspections}</div>
                        <div className="text-sm text-orange-600">Repaired</div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded">
                        <div className="text-2xl font-bold text-yellow-700">{metrics.data.pendingInspections}</div>
                        <div className="text-sm text-yellow-600">Pending</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-4 rounded mb-4">
                      <div className="text-red-700">Error: {metrics.error}</div>
                    </div>
                  )}

                  <h4 className="font-medium mb-2">Raw Response Data:</h4>
                  <pre className="text-xs overflow-auto max-h-96 bg-gray-100 p-4 rounded">
                    {JSON.stringify(metrics, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workorders">
          <Card>
            <CardHeader>
              <CardTitle>Work Orders Ready for Quality Control</CardTitle>
              <CardDescription>Work orders that are currently at quality control stage</CardDescription>
              <Button onClick={fetchWorkOrdersForQC} disabled={loading} variant="outline">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Work Orders
              </Button>
            </CardHeader>
            <CardContent>
              {workOrdersForQC && (
                <div className="space-y-4">
                  {workOrdersForQC.success && workOrdersForQC.data ? (
                    <div className="space-y-2">
                      {workOrdersForQC.data.map((wo: any) => (
                        <div key={wo.id} className="border rounded p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{wo.workOrderNumber}</div>
                            <Badge variant="outline">{wo.priority}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Product: {wo.productName} | Customer: {wo.customerName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Quantity: {wo.quantity} | Stage: {wo.currentStage}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-red-50 p-4 rounded">
                      <div className="text-red-700">Error: {workOrdersForQC.error}</div>
                    </div>
                  )}

                  <h4 className="font-medium mb-2">Raw Response Data:</h4>
                  <pre className="text-xs overflow-auto max-h-96 bg-gray-100 p-4 rounded">
                    {JSON.stringify(workOrdersForQC, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allworkorders">
          <Card>
            <CardHeader>
              <CardTitle>All Work Orders</CardTitle>
              <CardDescription>All work orders in the system with their current stages</CardDescription>
              <div className="flex gap-2">
                <Button onClick={fetchAllWorkOrders} disabled={loading} variant="outline">
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh All Work Orders
                </Button>
              </div>

              {/* Debug: Update Work Order to QC */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Debug: Move Work Order to Quality Control</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter work order ID..."
                    value={workOrderIdForUpdate}
                    onChange={(e) => setWorkOrderIdForUpdate(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={updateWorkOrderToQC} disabled={loading} variant="outline">
                    Move to QC
                  </Button>
                </div>
                <p className="text-xs text-yellow-600 mt-2">
                  This will complete the sewing_assembly stage and move the work order to quality control.
                  Only use for debugging purposes.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {allWorkOrders && (
                <div className="space-y-4">
                  {allWorkOrders.success && allWorkOrders.data ? (
                    <>
                      <div className="text-sm text-muted-foreground mb-4">
                        Total Work Orders: {allWorkOrders.data.length}
                      </div>

                      {/* Group by current stage */}
                      <div className="space-y-4">
                        {[
                          'order_processing',
                          'material_procurement',
                          'cutting',
                          'sewing_assembly',
                          'quality_control',
                          'finishing',
                          'dispatch',
                          'delivered'
                        ].map(stage => {
                          const stageWorkOrders = allWorkOrders.data.filter((wo: any) => wo.currentStage === stage);
                          if (stageWorkOrders.length === 0) return null;

                          return (
                            <div key={stage} className="border rounded p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium capitalize">
                                  {stage.replace(/_/g, ' ')}
                                </h4>
                                <Badge variant={stage === 'quality_control' ? 'destructive' : 'outline'}>
                                  {stageWorkOrders.length} work order{stageWorkOrders.length !== 1 ? 's' : ''}
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                {stageWorkOrders.map((wo: any) => (
                                  <div key={wo.id} className="bg-gray-50 p-3 rounded border">
                                    <div className="flex items-center justify-between">
                                      <div className="font-medium">{wo.workOrderNumber}</div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline">Priority {wo.priority}</Badge>
                                        {wo.priority <= 3 && (
                                          <Badge variant="destructive">Urgent</Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      Product: {wo.productName} • Customer: {wo.customerName}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Quantity: {wo.quantity} • Created: {formatDate(wo.createdAt)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="bg-red-50 p-4 rounded">
                      <div className="text-red-700">Error: {allWorkOrders.error}</div>
                    </div>
                  )}

                  <h4 className="font-medium mb-2">Raw Response Data:</h4>
                  <pre className="text-xs overflow-auto max-h-96 bg-gray-100 p-4 rounded">
                    {JSON.stringify(allWorkOrders, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspectors">
          <Card>
            <CardHeader>
              <CardTitle>Quality Inspectors</CardTitle>
              <CardDescription>Users with quality inspector permissions</CardDescription>
              <Button onClick={fetchInspectors} disabled={loading} variant="outline">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Inspectors
              </Button>
            </CardHeader>
            <CardContent>
              {inspectors && (
                <div className="space-y-4">
                  {inspectors.success && inspectors.data ? (
                    <div className="space-y-2">
                      {inspectors.data.map((inspector: any) => (
                        <div key={inspector.userId} className="border rounded p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{inspector.userId}</div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{inspector.role}</Badge>
                              <Badge className={inspector.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {inspector.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-red-50 p-4 rounded">
                      <div className="text-red-700">Error: {inspectors.error}</div>
                    </div>
                  )}

                  <h4 className="font-medium mb-2">Raw Response Data:</h4>
                  <pre className="text-xs overflow-auto max-h-96 bg-gray-100 p-4 rounded">
                    {JSON.stringify(inspectors, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Single Inspection Lookup</CardTitle>
              <CardDescription>Fetch a specific inspection by ID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter inspection ID..."
                  value={inspectionId}
                  onChange={(e) => setInspectionId(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={fetchSingleInspection} disabled={loading}>
                  <Search className="mr-2 h-4 w-4" />
                  Fetch
                </Button>
              </div>

              {singleInspection && (
                <div className="space-y-4">
                  {singleInspection.success && singleInspection.data ? (
                    <div className="border rounded p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{singleInspection.data.workOrderNumber}</div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(singleInspection.data.status)}
                          <Badge variant="outline">{singleInspection.data.stage}</Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Product: {singleInspection.data.productName}</div>
                        <div>Customer: {singleInspection.data.customerName}</div>
                        <div>Quantity: {singleInspection.data.quantity}</div>
                        <div>Inspection Date: {formatDate(singleInspection.data.inspectionDate)}</div>
                        <div>Inspector ID: {singleInspection.data.inspectedBy}</div>
                      </div>
                      {singleInspection.data.issues && (
                        <div className="bg-red-50 p-3 rounded">
                          <strong>Issues:</strong>
                          <pre className="text-xs mt-2">{JSON.stringify(singleInspection.data.issues, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-50 p-4 rounded">
                      <div className="text-red-700">Error: {singleInspection.error}</div>
                    </div>
                  )}

                  <h4 className="font-medium mb-2">Raw Response Data:</h4>
                  <pre className="text-xs overflow-auto max-h-96 bg-gray-100 p-4 rounded">
                    {JSON.stringify(singleInspection, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}