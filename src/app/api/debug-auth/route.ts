import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    const debugInfo = {
      hasSession: !!session,
      sessionUser: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        supabaseUserId: (session.user as any).supabaseUserId
      } : null,
      timestamp: new Date().toISOString()
    }

    // Check if user exists in Supabase
    if (session?.user?.email) {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('user_email', session.user.email)
          .single()

        debugInfo.supabaseUser = {
          exists: !!userData,
          data: userData,
          error: userError?.message
        }

        // Check nutrition entries for this user
        if (userData?.user_id) {
          const { data: nutritionData, error: nutritionError } = await supabase
            .from('nutrition_entries')
            .select('*')
            .eq('user_id', userData.user_id)
            .limit(5)

          debugInfo.nutritionEntries = {
            count: nutritionData?.length || 0,
            sample: nutritionData,
            error: nutritionError?.message
          }
        }

      } catch (error) {
        debugInfo.supabaseError = error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 