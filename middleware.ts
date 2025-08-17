import { auth } from "./src/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

interface ExtendedUser {
  userId?: string;
}

// Main middleware function
export default async function middleware(request: NextRequest) {
  // Skip middleware for Auth.js routes to prevent interference
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }
  
  // Second: Additional API route protection (only for /api routes)
  if (request.nextUrl.pathname.startsWith('/api/') && 
      !request.nextUrl.pathname.startsWith('/api/auth/')) {
    
    try {
      // Get the verified session (Auth.js already verified it)
      const session = await auth()
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      
      // Additional check: ensure user has userId
      if (!(session.user as ExtendedUser).userId) {
        return NextResponse.json(
          { error: 'User profile not found' },
          { status: 401 }
        )
      }
      
    } catch (error) {
      console.error('Session verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }
  }
  
  // Continue to the route
  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}