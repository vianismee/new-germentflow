"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
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
}

export interface InspectionFormData {
  workOrderId: string
  stage: string
  status: "pass" | "repair" | "reject"
  issues: QualityIssue[]
  repairNotes?: string
  reinspectionRequired?: boolean
  reinspectionDate?: Date
  inspectorNotes?: string
}

interface QualityInspectionFormProps {
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

export function QualityInspectionForm({
  workOrders,
  onSubmit,
  loading = false,
  initialData
}: QualityInspectionFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<InspectionFormData>({
    workOrderId: initialData?.workOrderId || "",
    stage: initialData?.stage || "quality_control",
    status: initialData?.status || "pass",
    issues: initialData?.issues || [],
    repairNotes: initialData?.repairNotes || "",
    reinspectionRequired: initialData?.reinspectionRequired || false,
    reinspectionDate: initialData?.reinspectionDate,
    inspectorNotes: initialData?.inspectorNotes || ""
  })

  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null)

  const handleWorkOrderChange = (workOrderId: string) => {
    const workOrder = workOrders.find(wo => wo.id === workOrderId)
    setSelectedWorkOrder(workOrder)
    setFormData(prev => ({
      ...prev,
      workOrderId,
      stage: workOrder?.currentStage || "quality_control"
    }))
  }

  const handleStatusChange = (status: "pass" | "repair" | "reject") => {
    setFormData(prev => ({
      ...prev,
      status,
      // Clear issues if status is pass
      issues: status === "pass" ? [] : prev.issues,
      // Clear repair notes if status is not repair
      repairNotes: status === "repair" ? prev.repairNotes : ""
    }))
  }

  const addIssue = () => {
    const newIssue: QualityIssue = {
      id: Date.now().toString(),
      type: "",
      description: "",
      severity: "minor",
      position: "",
      quantity: 1
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

    if (formData.status !== "pass" && formData.issues.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one issue for failed inspections",
        variant: "destructive",
      })
      return
    }

    if (formData.status === "repair" && !formData.repairNotes) {
      toast({
        title: "Error",
        description: "Please provide repair notes",
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
      const result = await onSubmit(formData)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "repair":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "reject":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getSeverityBadge = (severity: string) => {
    const badges = {
      minor: "bg-yellow-100 text-yellow-800 border-yellow-200",
      major: "bg-orange-100 text-orange-800 border-orange-200",
      critical: "bg-red-100 text-red-800 border-red-200"
    }
    return badges[severity as keyof typeof badges] || badges.minor
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Work Order Selection */}
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
                  <span className="text-muted-foreground">Quantity:</span>
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

      {/* Inspection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Inspection Result</CardTitle>
          <CardDescription>
            Select the quality control outcome
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.status}
            onValueChange={(value) => handleStatusChange(value as "pass" | "repair" | "reject")}
            disabled={loading}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pass" id="pass" />
              <Label htmlFor="pass" className="flex items-center gap-2 cursor-pointer">
                {getStatusIcon("pass")}
                <span>Pass - No issues found</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="repair" id="repair" />
              <Label htmlFor="repair" className="flex items-center gap-2 cursor-pointer">
                {getStatusIcon("repair")}
                <span>Repair - Minor issues that can be fixed</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="reject" id="reject" />
              <Label htmlFor="reject" className="flex items-center gap-2 cursor-pointer">
                {getStatusIcon("reject")}
                <span>Reject - Major issues requiring rework</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Quality Issues */}
      {(formData.status === "repair" || formData.status === "reject") && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quality Issues</CardTitle>
                <CardDescription>
                  Document issues found during inspection
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIssue}
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Issue
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.issues.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                <p>No issues added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.issues.map((issue) => (
                  <div key={issue.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Issue #{formData.issues.indexOf(issue) + 1}</h4>
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
      {formData.status === "repair" && (
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
      {(formData.status === "repair" || formData.status === "reject") && (
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
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Inspection"}
        </Button>
      </div>
    </form>
  )
}