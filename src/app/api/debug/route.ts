import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    environment: {},
    supabase: {},
    network: {},
    errors: []
  }

  try {
    // 1. Check Environment Variables
    results.environment = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    }

    // 2. Test Network Connectivity
    try {
      const googleResponse = await fetch('https://accounts.google.com', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      })
      results.network.google = { success: true, status: googleResponse.status }
    } catch (error) {
      results.network.google = { success: false, error: error instanceof Error ? error.message : 'Unknown' }
      results.errors.push(`Google connectivity: ${error}`)
    }

    try {
      const supabaseResponse = await fetch('https://supabase.co', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      })
      results.network.supabase = { success: true, status: supabaseResponse.status }
    } catch (error) {
      results.network.supabase = { success: false, error: error instanceof Error ? error.message : 'Unknown' }
      results.errors.push(`Supabase connectivity: ${error}`)
    }

    // 3. Test Supabase Client
    if (results.environment.hasSupabaseUrl && results.environment.hasSupabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        // Test connection with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
        
        const queryPromise = supabase
          .from('users')
          .select('count')
          .limit(1)
        
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any
        
        results.supabase = {
          success: !error,
          error: error?.message || null,
          hasData: !!data
        }
      } catch (error) {
        results.supabase = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          hasData: false
        }
        results.errors.push(`Supabase client: ${error}`)
      }
    } else {
      results.supabase = {
        success: false,
        error: 'Missing environment variables',
        hasData: false
      }
    }

    return NextResponse.json({
      status: 'ok',
      ...results
    })

  } catch (error) {
    results.errors.push(`General error: ${error}`)
    return NextResponse.json({
      status: 'error',
      ...results,
      generalError: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 