// Configuration for authentication behavior
export const AUTH_CONFIG = {
  // Set to true to enable auto-confirmation during signup (no email verification required)
  // Set to false to require email verification
  AUTO_CONFIRM_SIGNUP: process.env.AUTO_CONFIRM_SIGNUP === 'true' || process.env.NODE_ENV === 'development',

  // Role hierarchy for permission checking
  ROLE_HIERARCHY: {
    admin: 3,
    'production-manager': 2,
    'quality-inspector': 1,
    viewer: 0
  } as const,

  // Default redirect paths after authentication
  REDIRECTS: {
    afterSignIn: '/dashboard',
    afterSignOut: '/sign-in',
    afterSignUp: '/dashboard'
  } as const
}