"use client";

import React, { useState, useEffect } from "react";
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
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Form schema
const materialRequirementSchema = z.object({
  materialType: z.string().min(1, "Material type is required"),
  specifications: z.string().optional(),
});

const formSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  sampleName: z.string().min(1, "Sample name is required"),
  color: z.string().optional(),
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

const PROCESS_STAGES = [
  { id: "embroidery", label: "Embroidery" },
  { id: "dtf_printing", label: "DTF Printing" },
  { id: "jersey_printing", label: "Jersey Printing" },
  { id: "sublimation", label: "Sublimation" },
  { id: "dtf_sublimation", label: "DTF Sublimation" },
];

export default function NewSamplePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [materialRequirements, setMaterialRequirements] = useState([
    { materialType: "", specifications: "" }
  ]);
  const [selectedProcessStages, setSelectedProcessStages] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      sampleName: "",
      color: "",
      notes: "",
      materialRequirements: materialRequirements,
      processStages: selectedProcessStages,
    },
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      const data = await response.json();
      setCustomers(data.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const addMaterialRequirement = () => {
    const newRequirement = { materialType: "", specifications: "" };
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
          materialRequirements: materialRequirements.filter(req => req.materialType),
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
      router.push("/rd-dashboard");

    } catch (error) {
      console.error("Error creating sample request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create sample request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/rd-dashboard");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading customers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Sample Request</h1>
          <p className="text-muted-foreground">Fill in the details below to create a sample request</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sample Request Details</CardTitle>
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
                  onClick={handleBack}
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
    </div>
  );
}