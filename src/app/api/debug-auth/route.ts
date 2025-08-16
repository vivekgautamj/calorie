import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'No session found',
        session: null 
      })
    }

    console.log('Debug session:', {
      email: session.user.email,
      name: session.user.name,
      supabaseUserId: (session.user as any).supabaseUserId
    })

    // Check if user exists in Supabase
    const { createOrUpdateUser } = await import('@/lib/supabase')
    let userData
    try {
      userData = await createOrUpdateUser({
        email: session.user.email!,
        name: session.user.name || 'Unknown User',
        image: session.user.image || undefined,
      })
      console.log('User data:', userData)
    } catch (error) {
      console.error('Error creating/updating user:', error)
      return NextResponse.json({ 
        error: 'Failed to create/update user',
        session: session.user,
        userError: error 
      })
    }

    // Get nutrition entries count
    const { supabase } = await import('@/lib/supabase')
    const { data: nutritionEntries, error: nutritionError } = await supabase
      .from('nutrition_entries')
      .select('id, created_at, type, food_name, calories')
      .eq('user_id', userData.user_id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (nutritionError) {
      console.error('Error fetching nutrition entries:', nutritionError)
    }

    // Get nutrition goals count
    const { data: nutritionGoals, error: goalsError } = await supabase
      .from('nutrition_goals')
      .select('id, created_at, daily_calories, daily_protein')
      .eq('user_id', userData.user_id)
      .order('created_at', { ascending: false })

    if (goalsError) {
      console.error('Error fetching nutrition goals:', goalsError)
    }

    // Get chat messages count
    const { data: chatMessages, error: chatError } = await supabase
      .from('chat_messages')
      .select('id, created_at, message, is_user')
      .eq('user_id', userData.user_id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (chatError) {
      console.error('Error fetching chat messages:', chatError)
    }

    return NextResponse.json({
      session: {
        email: session.user.email,
        name: session.user.name,
        supabaseUserId: userData.user_id
      },
      userData,
      nutritionEntries: {
        count: nutritionEntries?.length || 0,
        recent: nutritionEntries || [],
        error: nutritionError
      },
      nutritionGoals: {
        count: nutritionGoals?.length || 0,
        all: nutritionGoals || [],
        error: goalsError
      },
      chatMessages: {
        count: chatMessages?.length || 0,
        recent: chatMessages || [],
        error: chatError
      }
    })
  } catch (error) {
    console.error('Error in debug API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error 
    }, { status: 500 })
  }
} 