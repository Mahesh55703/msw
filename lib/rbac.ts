import { verifySession } from '@/lib/session'

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR'

export type Permission =
  | 'dashboard:view'
  | 'enquiries:manage'
  | 'pages:view'
  | 'pages:edit'
  | 'pages:publish'
  | 'pages:rollback'
  | 'services:view'
  | 'services:edit'
  | 'services:publish'
  | 'industries:view'
  | 'industries:edit'
  | 'industries:publish'
  | 'articles:view'
  | 'articles:edit'
  | 'articles:publish'
  | 'guides:manage'
  | 'checklists:manage'
  | 'faqs:manage'
  | 'team:manage'
  | 'careers:manage'
  | 'media:manage'
  | 'users:view'
  | 'users:manage'
  | 'roles:manage'
  | 'super_admin:manage'
  | 'configuration:manage'
  | 'security:manage'

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    'dashboard:view',
    'enquiries:manage',
    'pages:view', 'pages:edit', 'pages:publish', 'pages:rollback',
    'services:view', 'services:edit', 'services:publish',
    'industries:view', 'industries:edit', 'industries:publish',
    'articles:view', 'articles:edit', 'articles:publish',
    'guides:manage', 'checklists:manage', 'faqs:manage',
    'team:manage', 'careers:manage', 'media:manage',
    'users:view', 'users:manage', 'roles:manage', 'super_admin:manage',
    'configuration:manage', 'security:manage'
  ],
  ADMIN: [
    'dashboard:view',
    'enquiries:manage',
    'pages:view', 'pages:edit', 'pages:publish', 'pages:rollback',
    'services:view', 'services:edit', 'services:publish',
    'industries:view', 'industries:edit', 'industries:publish',
    'articles:view', 'articles:edit', 'articles:publish',
    'guides:manage', 'checklists:manage', 'faqs:manage',
    'team:manage', 'careers:manage', 'media:manage',
    // ADMIN has NO user management, role management, super_admin, configuration, or security permissions
  ],
  EDITOR: [
    'dashboard:view',
    // Editor view/edit permissions, but NO publish/rollback
    'pages:view', 'pages:edit',
    'services:view', 'services:edit',
    'industries:view', 'industries:edit',
    'articles:view', 'articles:edit',
    'guides:manage', 'checklists:manage', 'faqs:manage',
    'team:manage', 'careers:manage', 'media:manage'
    // EDITOR cannot manage users, publish, rollback, etc.
  ]
}

export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export async function requirePermission(permission: Permission) {
  const session = await verifySession()
  if (!session.isAuth) {
    throw new Error('UNAUTHORIZED')
  }

  if (!hasPermission(session.role as Role, permission)) {
    throw new Error('FORBIDDEN')
  }

  return session
}
