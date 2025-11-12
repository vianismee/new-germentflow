"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Form schema
const materialRequirementSchema = z.object({
  materialType: z.string().min(1, "Material type is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  specifications: z.string().optional(),
});

const formSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  sampleName: z.string().min(1, "Sample name is required"),
  color: z.string().optional(),
  totalOrderQuantity: z.string().optional(),
  notes: z.string().optional(),
  materialRequirements: z.array(materialRequirementSchema),
  processStages: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface SampleRequestFormProps {
  customers: Customer[];
  onSuccess?: () => void;
  initialData?: Partial<FormValues>;
}

const PROCESS_STAGES = [
  { id: "embroidery", label: "Embroidery" },
  { id: "dtf_printing", label: "DTF Printing" },
  { id: "jersey_printing", label: "Jersey Printing" },
  { id: "sublimation", label: "Sublimation" },
  { id: "dtf_sublimation", label: "DTF Sublimation" },
];

const MATERIAL_UNITS = ["meters", "kilograms", "yards", "pieces", "rolls", "boxes"];

export function SampleRequestForm({
  customers,
  onSuccess,
  initialData
}: SampleRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [materialRequirements, setMaterialRequirements] = useState(
    initialData?.materialRequirements || [{ materialType: "", quantity: "", unit: "", specifications: "" }]
  );
  const [selectedProcessStages, setSelectedProcessStages] = useState<string[]>(
    initialData?.processStages || []
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: initialData?.customerId || "",
      sampleName: initialData?.sampleName || "",
      color: initialData?.color || "",
      totalOrderQuantity: initialData?.totalOrderQuantity || "",
      notes: initialData?.notes || "",
      materialRequirements: materialRequirements,
      processStages: selectedProcessStages,
    },
  });

  const addMaterialRequirement = () => {
    const newRequirement = { materialType: "", quantity: "", unit: "", specifications: "" };
    setMaterialRequirements([...materialRequirements, newRequirement]);
  };

  const removeMaterialRequirement = (index: number) => {
    const updated = materialRequirements.filter((_, i) => i !== index);
    setMaterialRequirements(updated);
    form.setValue("materialRequirements", updated);
  };

  const updateMaterialRequirement = (index: number, field: string, value: string) => {
    const updated = materialRequirements.map((req, i) =>
      i === index ? { ...req, [field]: value } : req
    );
    setMaterialRequirements(updated);
    form.setValue("materialRequirements", updated);
  };

  const toggleProcessStage = (stageId: string) => {
    const updated = selectedProcessStages.includes(stageId)
      ? selectedProcessStages.filter(id => id !== stageId)
      : [...selectedProcessStages, stageId];

    setSelectedProcessStages(updated);
    form.setValue("processStages", updated);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/sample-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          materialRequirements: materialRequirements.filter(req => req.materialType && req.quantity && req.unit),
          processStages: selectedProcessStages.map((stage, index) => ({
            processStage: stage,
            sequence: index + 1,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create sample request");
      }

      const result = await response.json();
      toast.success("Sample request created successfully!");
      form.reset();
      setMaterialRequirements([{ materialType: "", quantity: "", unit: "", specifications: "" }]);
      setSelectedProcessStages([]);
      onSuccess?.();

    } catch (error) {
      console.error("Error creating sample request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create sample request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Sample Request</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sampleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sample Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Poloshirt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Navy Blue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalOrderQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Order Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Material Requirements */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Material Requirements</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMaterialRequirement}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </div>

              <div className="space-y-3">
                {materialRequirements.map((requirement, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="Material type"
                        value={requirement.materialType}
                        onChange={(e) => updateMaterialRequirement(index, "materialType", e.target.value)}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Quantity"
                        value={requirement.quantity}
                        onChange={(e) => updateMaterialRequirement(index, "quantity", e.target.value)}
                      />
                    </div>
                    <div className="w-20">
                      <Select
                        value={requirement.unit}
                        onValueChange={(value) => updateMaterialRequirement(index, "unit", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {MATERIAL_UNITS.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Specifications (optional)"
                        value={requirement.specifications}
                        onChange={(e) => updateMaterialRequirement(index, "specifications", e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMaterialRequirement(index)}
                      disabled={materialRequirements.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Process Stages */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Additional Process Stages
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Static processes (Cutting & Sewing) are always included. Select additional processes below:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PROCESS_STAGES.map((stage) => (
                  <div key={stage.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={stage.id}
                      checked={selectedProcessStages.includes(stage.id)}
                      onCheckedChange={() => toggleProcessStage(stage.id)}
                    />
                    <label
                      htmlFor={stage.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {stage.label}
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedProcessStages.map((stageId) => {
                  const stage = PROCESS_STAGES.find(s => s.id === stageId);
                  return stage ? (
                    <Badge key={stageId} variant="secondary">
                      {stage.label}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or requirements..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Sample Request"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}