"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Eye, Edit, Trash2, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface SampleRequest {
  id: string;
  sampleId: string;
  customerId: string;
  sampleName: string;
  color: string;
  status: string;
  totalOrderQuantity: number;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
}

interface StatusCount {
  status: string;
  count: number;
}

interface RecentStatusChange {
  id: string;
  sampleId: string;
  sampleName: string;
  previousStatus: string;
  newStatus: string;
  changeReason: string;
  changedAt: string;
  customer: {
    name: string;
  };
}

interface DashboardData {
  samples: SampleRequest[];
  overview: {
    statusCounts: StatusCount[];
    totalSamples: number;
    materialSummary: { materialType: string; count: number }[];
    processStageUsage: { processStage: string; count: number }[];
  };
  recentActivity: RecentStatusChange[];
}

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    icon: Edit,
    color: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  },
  on_review: {
    label: "On Review",
    icon: Clock,
    color: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 hover:bg-green-200",
  },
  revision: {
    label: "Revision",
    icon: AlertCircle,
    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  },
  canceled: {
    label: "Canceled",
    icon: XCircle,
    color: "bg-red-100 text-red-800 hover:bg-red-200",
  },
};

export function RDDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchDashboardData();

    // Set up polling for real-time updates (every 10 seconds)
    const interval = setInterval(() => {
      fetchDashboardData(false); // Silent refresh without loading indicator
    }, 10000);

    return () => clearInterval(interval);
  }, [searchTerm, statusFilter, refreshKey]);

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/rd-dashboard?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch dashboard data");

      const result = await response.json();
      setData(result.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleCreateSample = () => {
    router.push("/rd-dashboard/new-sample");
  };

  const handleDeleteSample = async (sampleId: string) => {
    if (!confirm("Are you sure you want to delete this sample request?")) {
      return;
    }

    // Optimistic update: immediately remove from UI
    const previousData = data;

    if (data?.samples) {
      const updatedSamples = data.samples.filter(sample => sample.id !== sampleId);

      setData({
        ...data,
        samples: updatedSamples
      });
    }

    try {
      const response = await fetch(`/api/sample-requests/${sampleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setData(previousData);
        const error = await response.json();
        throw new Error(error.error || "Failed to delete sample request");
      }

      toast.success("Sample request deleted successfully!");
      // Trigger a full refresh to ensure consistency
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      // Revert optimistic update on error
      setData(previousData);
      console.error("Error deleting sample request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete sample request");
    }
  };

  const handleStatusChange = async (sampleId: string, newStatus: string) => {
    // Optimistic update: immediately update the UI
    const previousData = data;

    if (data?.samples) {
      const updatedSamples = data.samples.map(sample =>
        sample.id === sampleId
          ? { ...sample, status: newStatus, updatedAt: new Date().toISOString() }
          : sample
      );

      setData({
        ...data,
        samples: updatedSamples
      });
    }

    try {
      const response = await fetch(`/api/sample-requests/${sampleId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          changeReason: `Status changed to ${newStatus} from dashboard`,
        }),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setData(previousData);
        const error = await response.json();
        throw new Error(error.error || "Failed to update status");
      }

      toast.success(`Status updated to ${newStatus}!`);
      // Trigger a full refresh to ensure consistency
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      // Revert optimistic update on error
      setData(previousData);
      console.error("Error updating status:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    if (!config) return <Badge variant="secondary">{status}</Badge>;

    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getStatusCounts = () => {
    if (!data?.overview.statusCounts) return [];
    return Object.entries(STATUS_CONFIG).map(([status, config]) => {
      const count = data.overview.statusCounts.find(c => c.status === status)?.count || 0;
      return { status, count, config };
    });
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading R&D Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">R&D Dashboard</h1>
          <p className="text-muted-foreground">Manage sample requests and track development progress</p>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {format(lastUpdated, "MMM dd, yyyy HH:mm:ss")}
          </p>
        </div>
        <Button onClick={handleCreateSample}>Create Sample</Button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {getStatusCounts().map(({ status, count, config }) => {
          const Icon = config.icon;
          return (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {config.label}
                    </p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Requests</CardTitle>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Sample ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {data?.samples && data.samples.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sample ID</TableHead>
                  <TableHead>Sample Name</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.samples.map((sample) => (
                  <TableRow key={sample.id}>
                    <TableCell className="font-mono">{sample.sampleId}</TableCell>
                    <TableCell className="font-medium">{sample.sampleName}</TableCell>
                    <TableCell>{sample.customer?.name || "-"}</TableCell>
                    <TableCell>{sample.color || "-"}</TableCell>
                    <TableCell>
                      <Select value={sample.status} onValueChange={(value) => handleStatusChange(sample.id, value)}>
                        <SelectTrigger className="w-32">
                          {getStatusBadge(sample.status)}
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                            <SelectItem key={status} value={status}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {format(new Date(sample.updatedAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement view details functionality
                            toast.info("View details functionality coming soon");
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {sample.status === "draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement edit functionality
                              toast.info("Edit functionality coming soon");
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSample(sample.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No sample requests found</p>
              <Button variant="outline" className="mt-4" onClick={handleCreateSample}>
                Create your first sample request
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {data?.recentActivity && data.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{activity.sampleName}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.customer?.name} • {activity.sampleId}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {activity.previousStatus && (
                        <>
                          {getStatusBadge(activity.previousStatus)}
                          <span>→</span>
                        </>
                      )}
                      {getStatusBadge(activity.newStatus)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(activity.changedAt), "MMM dd, HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}