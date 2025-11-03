import { getCurrentUser } from './auth';
import { redirect } from 'next/navigation';

export type Permission = string;
export type Role = string;

// Define role-based permissions
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: ['*'], // All permissions
  'production-manager': [
    'sales_orders:read',
    'sales_orders:write',
    'work_orders:read',
    'work_orders:write',
    'customers:read',
    'quality_control:read',
    'dashboard:read',
    'production:read',
    'production:write'
  ],
  'quality-inspector': [
    'work_orders:read',
    'quality_control:read',
    'quality_control:write',
    'customers:read',
    'dashboard:read'
  ],
  viewer: [
    'sales_orders:read',
    'work_orders:read',
    'customers:read',
    'quality_control:read',
    'dashboard:read'
  ]
};

export function hasPermission(userRole: string, requiredPermission: string): boolean {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];

  // Admin has all permissions
  if (userPermissions.includes('*')) {
    return true;
  }

  // Check for exact permission match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Check for wildcard permissions (e.g., 'sales_orders:*' matches 'sales_orders:read')
  const [resource] = requiredPermission.split(':');
  const wildcardPermission = `${resource}:*`;
  return userPermissions.includes(wildcardPermission);
}

export function hasRole(userRole: string, requiredRole: string): boolean {
  // Admin can access everything
  if (userRole === 'admin') {
    return true;
  }

  return userRole === requiredRole;
}

export function hasAnyRole(userRole: string, requiredRoles: string[]): boolean {
  // Admin can access everything
  if (userRole === 'admin') {
    return true;
  }

  return requiredRoles.includes(userRole);
}

// Middleware functions for route protection
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return user;
}

export async function requirePermission(permission: Permission) {
  const user = await requireAuth();

  if (!hasPermission(user.role!, permission)) {
    redirect('/unauthorized');
  }

  return user;
}

export async function requireRole(role: Role) {
  const user = await requireAuth();

  if (!hasRole(user.role!, role)) {
    redirect('/unauthorized');
  }

  return user;
}

export async function requireAnyRole(roles: Role[]) {
  const user = await requireAuth();

  if (!hasAnyRole(user.role!, roles)) {
    redirect('/unauthorized');
  }

  return user;
}

// Helper function to check permissions on the client side
export function checkPermission(userRole: string, permission: string): boolean {
  return hasPermission(userRole, permission);
}

export function checkRole(userRole: string, role: string): boolean {
  return hasRole(userRole, role);
}

// Permission constants for easy reference
export const PERMISSIONS = {
  // Sales Orders
  SALES_ORDERS_READ: 'sales_orders:read',
  SALES_ORDERS_WRITE: 'sales_orders:write',

  // Work Orders
  WORK_ORDERS_READ: 'work_orders:read',
  WORK_ORDERS_WRITE: 'work_orders:write',

  // Customers
  CUSTOMERS_READ: 'customers:read',
  CUSTOMERS_WRITE: 'customers:write',

  // Quality Control
  QUALITY_CONTROL_READ: 'quality_control:read',
  QUALITY_CONTROL_WRITE: 'quality_control:write',

  // Dashboard
  DASHBOARD_READ: 'dashboard:read',

  // Production
  PRODUCTION_READ: 'production:read',
  PRODUCTION_WRITE: 'production:write',
} as const;

// Role constants
export const ROLES = {
  ADMIN: 'admin',
  PRODUCTION_MANAGER: 'production-manager',
  QUALITY_INSPECTOR: 'quality-inspector',
  VIEWER: 'viewer',
} as const;