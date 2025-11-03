"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-client";
import { checkPermission, checkRole, hasAnyRole } from "@/lib/permissions";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
  role?: string;
  roles?: string[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  permission,
  role,
  roles,
  fallback
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    let authorized = true;

    // Check specific permission
    if (permission) {
      authorized = checkPermission(user.role!, permission);
    }

    // Check specific role
    if (authorized && role) {
      authorized = checkRole(user.role!, role);
    }

    // Check if user has any of the required roles
    if (authorized && roles) {
      authorized = hasAnyRole(user.role!, roles);
    }

    setIsAuthorized(authorized);
  }, [user, loading, permission, role, roles, router]);

  if (loading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook for client-side permission checking
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: string) => {
    if (!user?.role) return false;
    return checkPermission(user.role, permission);
  };

  const hasRole = (role: string) => {
    if (!user?.role) return false;
    return checkRole(user.role, role);
  };

  const hasAnyRole = (roles: string[]) => {
    if (!user?.role) return false;
    return roles.includes(user.role);
  };

  return {
    user,
    hasPermission,
    hasRole,
    hasAnyRole,
    isAdmin: user?.role === 'admin',
    isProductionManager: user?.role === 'production-manager',
    isQualityInspector: user?.role === 'quality-inspector',
    isViewer: user?.role === 'viewer',
  };
}