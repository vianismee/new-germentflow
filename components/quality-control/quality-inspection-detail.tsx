"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getQualityInspectionById, updateQualityInspection } from "@/lib/actions/quality-control"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import Link from "next/link"
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Package,
  User,
  Calendar,
  FileText,
  MessageSquare
} from "lucide-react"

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
  issues?: any
  repairNotes?: string
  reinspectionDate?: Date | null
  finalStatus?: "pending" | "pass" | "repair" | "reject"
  createdAt: Date
  updatedAt: Date
  inspectorNotes?: string
}

interface QualityInspectionDetailProps {
  inspection: QualityInspection
}

export function QualityInspectionDetail({ inspection: initialInspection }: QualityInspectionDetailProps) {
  const { toast } = useToast()
  const [inspection, setInspection] = useState<QualityInspection>(initialInspection)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

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
        label: "Repair Required",
        className: "bg-orange-100 text-orange-800 border-orange-200",
        icon: AlertCircle
      },
      reject: {
        label: "Rejected",
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

  const handleSave = async () => {
    setLoading(true)
    try {
      // TODO: Implement save functionality
      toast({
        title: "Success",
        description: "Inspection updated successfully",
      })
      setIsEditing(false)
    } catch {
      toast({
        title: "Error",
        description: "Failed to update inspection",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const parsedIssues = inspection.issues ? JSON.parse(inspection.issues) : []

  return (
    <div className="space-y-6 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/quality-control">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quality Control
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {inspection.workOrderNumber}
              {getStatusBadge(inspection.status)}
              {getStageBadge(inspection.stage)}
            </h1>
            <p className="text-muted-foreground">
              Inspected on {formatDateTime(inspection.inspectionDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          {isEditing && (
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          {/* Inspection Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Inspection Details</CardTitle>
              <CardDescription>
                Quality control inspection information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Inspection Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Inspection ID:</span> {inspection.id}
                    </div>
                    <div>
                      <span className="font-medium">Work Order:</span>{' '}
                      <Button variant="link" className="h-auto p-0 text-left" asChild>
                        <Link href={`/work-orders/${inspection.workOrderId}`}>
                          {inspection.workOrderNumber}
                        </Link>
                      </Button>
                    </div>
                    <div>
                      <span className="font-medium">Inspection Date:</span>{' '}
                      {formatDateTime(inspection.inspectionDate)}
                    </div>
                    <div>
                      <span className="font-medium">Inspected By:</span>{' '}
                      {inspection.inspectedBy || "Not assigned"}
                    </div>
                    {inspection.reinspectionDate && (
                      <div>
                        <span className="font-medium">Reinspection Date:</span>{' '}
                        {formatDate(inspection.reinspectionDate)}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Product Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Product:</span> {inspection.productName}
                    </div>
                    <div>
                      <span className="font-medium">Quantity:</span>{' '}
                      <span className="text-lg font-bold text-primary ml-2">
                        {inspection.quantity}
                      </span>{' '}
                      units
                    </div>
                    <div>
                      <span className="font-medium">Customer:</span> {inspection.customerName}
                    </div>
                    <div>
                      <span className="font-medium">Stage:</span>{' '}
                      {getStageBadge(inspection.stage)}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{' '}
                      {getStatusBadge(inspection.status)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Issues */}
          {parsedIssues && parsedIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Quality Issues</CardTitle>
                <CardDescription>
                  Issues identified during inspection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {parsedIssues.map((issue: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Issue #{index + 1}</h4>
                          <Badge
                            className={
                              issue.severity === "minor"
                                ? "bg-yellow-100 text-yellow-800"
                                : issue.severity === "major"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {issue.severity?.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{issue.type}</Badge>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{issue.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {issue.position && (
                          <div>
                            <span className="font-medium">Position:</span> {issue.position}
                          </div>
                        )}
                        {issue.quantity && (
                          <div>
                            <span className="font-medium">Quantity:</span> {issue.quantity}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Repair Notes */}
          {inspection.repairNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Repair Notes
                </CardTitle>
                <CardDescription>
                  Instructions for fixing identified issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{inspection.repairNotes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inspector Notes */}
          {inspection.inspectorNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Inspector Notes
                </CardTitle>
                <CardDescription>
                  Additional observations from the inspector
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{inspection.inspectorNotes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:space-y-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/work-orders/${inspection.workOrderId}`}>
                  <Package className="mr-2 h-4 w-4" />
                  View Work Order
                </Link>
              </Button>
              {inspection.status === "repair" && inspection.reinspectionDate && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/quality-control/new?workOrder=${inspection.workOrderId}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Reinspection
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Inspection Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Issues</span>
                  <span className="text-sm">{parsedIssues.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Critical Issues</span>
                  <span className="text-sm text-red-600">
                    {parsedIssues.filter((i: any) => i.severity === "critical").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Major Issues</span>
                  <span className="text-sm text-orange-600">
                    {parsedIssues.filter((i: any) => i.severity === "major").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Minor Issues</span>
                  <span className="text-sm text-yellow-600">
                    {parsedIssues.filter((i: any) => i.severity === "minor").length}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Result</span>
                  {getStatusBadge(inspection.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}