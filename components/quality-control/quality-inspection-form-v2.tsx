"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Plus, Trash2, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export interface QualityIssue {
  id: string
  type: string
  description: string
  severity: "minor" | "major" | "critical"
  position?: string
  quantity?: number
  category: "repair" | "reject"
}

export interface InspectionFormData {
  workOrderId: string
  stage: string
  status: "pass" | "repair" | "reject"
  totalQuantity: number
  passedQuantity: number
  repairedQuantity: number
  rejectedQuantity: number
  issues: QualityIssue[]
  repairNotes?: string
  reinspectionRequired?: boolean
  reinspectionDate?: Date
  inspectorNotes?: string
}

interface QualityInspectionFormV2Props {
  workOrders: any[]
  onSubmit: (data: InspectionFormData) => Promise<{ success: boolean; message?: string; error?: string }>
  loading?: boolean
  initialData?: Partial<InspectionFormData>
}

const ISSUE_TYPES = [
  "Stitching",
  "Fabric Defect",
  "Sizing Issue",
  "Color Problem",
  "Finishing",
  "Packaging",
  "Measurement Error",
  "Design Defect",
  "Material Issue",
  "Other"
]

export function QualityInspectionFormV2({
  workOrders,
  onSubmit,
  loading = false,
  initialData
}: QualityInspectionFormV2Props) {
  const { toast } = useToast()

  // Determine if we should show work order selection
  const showWorkOrderSelection = workOrders.length > 1 && !initialData?.workOrderId

  const [formData, setFormData] = useState<InspectionFormData>({
    workOrderId: initialData?.workOrderId || (workOrders.length === 1 ? workOrders[0]?.id : ""),
    stage: initialData?.stage || "quality_control",
    status: "pass", // Will be calculated based on quantities
    totalQuantity: initialData?.totalQuantity ?? (workOrders.length === 1 ? workOrders[0]?.quantity || 0 : 0),
    passedQuantity: initialData?.passedQuantity || 0,
    repairedQuantity: initialData?.repairedQuantity || 0,
    rejectedQuantity: initialData?.rejectedQuantity || 0,
    issues: initialData?.issues || [],
    repairNotes: initialData?.repairNotes || "",
    reinspectionRequired: initialData?.reinspectionRequired || false,
    reinspectionDate: initialData?.reinspectionDate,
    inspectorNotes: initialData?.inspectorNotes || ""
  })

  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(() => {
    if (initialData?.workOrderId) {
      return workOrders.find(wo => wo.id === initialData.workOrderId) || null
    }
    return workOrders.length === 1 ? workOrders[0] : null
  })

  const handleWorkOrderChange = (workOrderId: string) => {
    const workOrder = workOrders.find(wo => wo.id === workOrderId)
    setSelectedWorkOrder(workOrder)
    setFormData(prev => ({
      ...prev,
      workOrderId,
      stage: workOrder?.currentStage || "quality_control",
      totalQuantity: workOrder?.quantity || 0
    }))
  }

  const handleQuantityChange = (field: 'passedQuantity' | 'repairedQuantity' | 'rejectedQuantity', value: number) => {
    const newValue = Math.max(0, Math.min(value, formData.totalQuantity))
    setFormData(prev => ({ ...prev, [field]: newValue }))
  }

  const addIssue = (category: "repair" | "reject") => {
    const newIssue: QualityIssue = {
      id: Date.now().toString(),
      type: "",
      description: "",
      severity: "minor",
      position: "",
      quantity: 1,
      category
    }
    setFormData(prev => ({
      ...prev,
      issues: [...prev.issues, newIssue]
    }))
  }

  const updateIssue = (issueId: string, updates: Partial<QualityIssue>) => {
    setFormData(prev => ({
      ...prev,
      issues: prev.issues.map(issue =>
        issue.id === issueId ? { ...issue, ...updates } : issue
      )
    }))
  }

  const removeIssue = (issueId: string) => {
    setFormData(prev => ({
      ...prev,
      issues: prev.issues.filter(issue => issue.id !== issueId)
    }))
  }

  const getOverallStatus = () => {
    // If all passed
    if (formData.passedQuantity === formData.totalQuantity) return "pass"

    // If any rejected (rejects take priority)
    if (formData.rejectedQuantity > 0) return "reject"

    // If any repaired
    if (formData.repairedQuantity > 0) return "repair"

    // Default case - should not happen if validation works
    return "pass"
  }

  const validateQuantities = () => {
    const total = formData.passedQuantity + formData.repairedQuantity + formData.rejectedQuantity
    return total === formData.totalQuantity
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.workOrderId) {
      toast({
        title: "Error",
        description: "Please select a work order",
        variant: "destructive",
      })
      return
    }

    if (!validateQuantities()) {
      toast({
        title: "Error",
        description: "The sum of passed, repaired, and rejected quantities must equal the total quantity",
        variant: "destructive",
      })
      return
    }

    // Set the overall status based on quantities
    const overallStatus = getOverallStatus()
    const submissionData = { ...formData, status: overallStatus as "pass" | "repair" | "reject" }

    if ((formData.repairedQuantity > 0 || formData.rejectedQuantity > 0) && formData.issues.length === 0) {
      toast({
        title: "Error",
        description: "Please add issues for repaired or rejected items",
        variant: "destructive",
      })
      return
    }

    if (formData.reinspectionRequired && !formData.reinspectionDate) {
      toast({
        title: "Error",
        description: "Please select a reinspection date",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await onSubmit(submissionData)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit inspection",
        variant: "destructive",
      })
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
      pass: { label: "Mostly Passed", className: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      repair: { label: "Mixed Result", className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertCircle },
      reject: { label: "Issues Found", className: "bg-red-100 text-red-800 border-red-200", icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.repair
    const Icon = config.icon

    return (
      <div className="flex items-center gap-1">
        <Badge className={`${config.className} flex items-center gap-1`}>
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {passed}/{total}
        </Badge>
      </div>
    )
  }

  const getSeverityBadge = (severity: string) => {
    const badges = {
      minor: "bg-yellow-100 text-yellow-800 border-yellow-200",
      major: "bg-orange-100 text-orange-800 border-orange-200",
      critical: "bg-red-100 text-red-800 border-red-200"
    }
    return badges[severity as keyof typeof badges] || badges.minor
  }

  const currentOverallStatus = getOverallStatus()
  const isQuantityValid = validateQuantities()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Work Order Selection - Only show when multiple WOs and no pre-selection */}
      {showWorkOrderSelection && (
        <Card>
          <CardHeader>
            <CardTitle>Work Order Selection</CardTitle>
            <CardDescription>
              Select the work order to inspect
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="workOrder">Work Order</Label>
              <Select
                value={formData.workOrderId}
                onValueChange={handleWorkOrderChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a work order" />
                </SelectTrigger>
                <SelectContent>
                  {workOrders.map((workOrder) => (
                    <SelectItem key={workOrder.id} value={workOrder.id}>
                      {workOrder.workOrderNumber} - {workOrder.productName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedWorkOrder && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">{selectedWorkOrder.workOrderNumber}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Product:</span>
                    <p className="font-medium">{selectedWorkOrder.productName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Quantity:</span>
                    <p className="font-medium">{selectedWorkOrder.quantity} units</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Customer:</span>
                    <p className="font-medium">{selectedWorkOrder.customerName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stage:</span>
                    <Badge className="ml-2">
                      {selectedWorkOrder.currentStage?.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quality Control Results */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Control Results</CardTitle>
          <CardDescription>
            Enter the quantity of items for each result category
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Passed */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                Passed Quantity
              </Label>
              <Input
                type="number"
                value={formData.passedQuantity}
                onChange={(e) => handleQuantityChange('passedQuantity', parseInt(e.target.value) || 0)}
                min="0"
                max={formData.totalQuantity}
                disabled={loading}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Items that passed inspection
              </p>
            </div>

            {/* Repaired */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-orange-700">
                <AlertCircle className="h-4 w-4" />
                Repaired Quantity
              </Label>
              <Input
                type="number"
                value={formData.repairedQuantity}
                onChange={(e) => handleQuantityChange('repairedQuantity', parseInt(e.target.value) || 0)}
                min="0"
                max={formData.totalQuantity}
                disabled={loading}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Items with minor issues that can be repaired
              </p>
            </div>

            {/* Rejected */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-red-700">
                <XCircle className="h-4 w-4" />
                Rejected Quantity
              </Label>
              <Input
                type="number"
                value={formData.rejectedQuantity}
                onChange={(e) => handleQuantityChange('rejectedQuantity', parseInt(e.target.value) || 0)}
                min="0"
                max={formData.totalQuantity}
                disabled={loading}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Items with major issues requiring rework
              </p>
            </div>
          </div>

          {/* Quantity Validation */}
          <div className={`p-3 rounded-lg ${isQuantityValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Quantity Summary:
              </span>
              <span className={`text-sm ${isQuantityValid ? 'text-green-700' : 'text-red-700'}`}>
                {formData.passedQuantity + formData.repairedQuantity + formData.rejectedQuantity} / {formData.totalQuantity}
              </span>
            </div>
            {!isQuantityValid && (
              <p className="text-xs text-red-600 mt-1">
                Total must equal the work order quantity
              </p>
            )}
          </div>

          {/* Overall Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Overall Status:</span>
            {getStatusBadge(
              currentOverallStatus,
              formData.passedQuantity,
              formData.repairedQuantity,
              formData.rejectedQuantity,
              formData.totalQuantity
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quality Issues */}
      {(formData.repairedQuantity > 0 || formData.rejectedQuantity > 0) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quality Issues</CardTitle>
                <CardDescription>
                  Document issues found during inspection
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {formData.repairedQuantity > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addIssue("repair")}
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Repair Issue
                  </Button>
                )}
                {formData.rejectedQuantity > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addIssue("reject")}
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Reject Issue
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {formData.issues.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                <p>No issues added yet</p>
                <p className="text-sm mt-1">Add issues for repaired and rejected items</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.issues.map((issue) => (
                  <div key={issue.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Issue #{formData.issues.indexOf(issue) + 1}</h4>
                        <Badge variant={issue.category === "repair" ? "secondary" : "destructive"}>
                          {issue.category.toUpperCase()}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIssue(issue.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Issue Type</Label>
                        <Select
                          value={issue.type}
                          onValueChange={(value) => updateIssue(issue.id, { type: value })}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select issue type" />
                          </SelectTrigger>
                          <SelectContent>
                            {ISSUE_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Severity</Label>
                        <Select
                          value={issue.severity}
                          onValueChange={(value) => updateIssue(issue.id, { severity: value as any })}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minor">Minor</SelectItem>
                            <SelectItem value="major">Major</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={issue.description}
                        onChange={(e) => updateIssue(issue.id, { description: e.target.value })}
                        placeholder="Describe the issue in detail"
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Position (Optional)</Label>
                        <Input
                          value={issue.position || ""}
                          onChange={(e) => updateIssue(issue.id, { position: e.target.value })}
                          placeholder="e.g., Left sleeve, Collar"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <Label>Quantity Affected</Label>
                        <Input
                          type="number"
                          value={issue.quantity || 1}
                          onChange={(e) => updateIssue(issue.id, { quantity: parseInt(e.target.value) || 1 })}
                          min="1"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityBadge(issue.severity)}>
                        {issue.severity.toUpperCase()}
                      </Badge>
                      {issue.type && (
                        <Badge variant="outline">
                          {issue.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Repair Notes */}
      {formData.repairedQuantity > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Repair Notes</CardTitle>
            <CardDescription>
              Instructions for fixing the identified issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.repairNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, repairNotes: e.target.value }))}
              placeholder="Describe the repair steps needed..."
              disabled={loading}
              rows={4}
            />
          </CardContent>
        </Card>
      )}

      {/* Reinspection */}
      {(formData.repairedQuantity > 0 || formData.rejectedQuantity > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Reinspection</CardTitle>
            <CardDescription>
              Schedule follow-up inspection if needed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reinspection"
                checked={formData.reinspectionRequired}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, reinspectionRequired: checked as boolean }))
                }
                disabled={loading}
              />
              <Label htmlFor="reinspection">Reinspection Required</Label>
            </div>

            {formData.reinspectionRequired && (
              <div>
                <Label>Reinspection Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.reinspectionDate && "text-muted-foreground"
                      )}
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.reinspectionDate ? (
                        format(formData.reinspectionDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.reinspectionDate}
                      onSelect={(date) =>
                        setFormData(prev => ({ ...prev, reinspectionDate: date }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inspector Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Inspector Notes</CardTitle>
          <CardDescription>
            Additional notes or observations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.inspectorNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, inspectorNotes: e.target.value }))}
            placeholder="Add any additional notes or observations..."
            disabled={loading}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading || !isQuantityValid}>
          {loading ? "Submitting..." : "Submit Inspection"}
        </Button>
      </div>
    </form>
  )
}