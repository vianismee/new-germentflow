import { RDDashboard } from "@/components/rd-dashboard/rd-dashboard";
import { ProtectedRoute } from "@/components/protected-route";

export default function RDDashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6">
        <RDDashboard />
      </div>
    </ProtectedRoute>
  );
}