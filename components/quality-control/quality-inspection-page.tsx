"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QualityInspectionForm, InspectionFormData } from "@/components/quality-control/quality-inspection-form"
import { getWorkOrdersForQualityControl, createQualityInspection } from "@/lib/actions/quality-control"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function QualityInspectionPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchWorkOrders()
  }, [])

  const fetchWorkOrders = async () => {
    try {
      setLoading(true)
      const result = await getWorkOrdersForQualityControl()
      if (result.success && result.data) {
        setWorkOrders(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch work orders",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch work orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: InspectionFormData) => {
    setSubmitting(true)
    try {
      // TODO: Get actual user ID from authentication
      const inspectorId = "system-user" // Temporary user ID for testing

      const result = await createQualityInspection(data, inspectorId)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        router.push("/quality-control")
        return { success: true, message: result.message }
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return { success: false, error: result.error }
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to create inspection",
        variant: "destructive",
      })
      return { success: false, error: "Failed to create inspection" }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/quality-control">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading Work Orders...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/quality-control">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quality Control
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            New Quality Inspection
          </h1>
          <p className="text-muted-foreground">
            Record quality control inspection results
          </p>
        </div>
      </div>

      {/* Available Work Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Available Work Orders for Inspection</CardTitle>
          <CardDescription>
            Work orders currently at quality control stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workOrders.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-2">No Work Orders Ready</h3>
              <p className="text-muted-foreground mb-4">
                All work orders have been inspected or no work orders have reached quality control stage.
              </p>
              <Button asChild>
                <Link href="/quality-control">
                  View Quality Control Dashboard
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {workOrders.map((workOrder) => (
                <div key={workOrder.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{workOrder.workOrderNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {workOrder.productName} • {workOrder.quantity} units
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Customer: {workOrder.customerName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Priority {workOrder.priority}
                      </Badge>
                      {workOrder.priority <= 3 && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspection Form */}
      {workOrders.length > 0 && (
        <QualityInspectionForm
          workOrders={workOrders}
          onSubmit={handleSubmit}
          loading={submitting}
        />
      )}
    </div>
  )
}