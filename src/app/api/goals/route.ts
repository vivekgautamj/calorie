import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getNutritionGoals, updateNutritionGoals, createNutritionGoals, createOrUpdateNutritionGoals } from '@/lib/db/nutrition'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the correct user ID from session
    const supabaseUserId = (session.user as any).supabaseUserId

    // If we don't have a Supabase user ID, try to create the user first
    if (!supabaseUserId) {
      console.log('No Supabase user ID found, attempting to create user...')
      try {
        const { createOrUpdateUser } = await import('@/lib/supabase')
        const userData = await createOrUpdateUser({
          email: session.user.email!,
          name: session.user.name || 'Unknown User',
          image: session.user.image || undefined,
        })
        // Update the session with the new user ID
        ;(session.user as any).supabaseUserId = userData.user_id
        console.log('User created successfully, new ID:', userData.user_id)
      } catch (error) {
        console.error('Failed to create user:', error)
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
      }
    }

    // Use the Supabase user ID
    const userId = (session.user as any).supabaseUserId
    console.log('Getting goals for user:', userId)

    // Get goals (don't create automatically)
    const goals = await getNutritionGoals(userId)
    console.log('Goals retrieved:', goals?.id || 'none')

    return NextResponse.json({ goals })
  } catch (error) {
    console.error('Error in goals GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the correct user ID from session
    const supabaseUserId = (session.user as any).supabaseUserId

    // If we don't have a Supabase user ID, try to create the user first
    if (!supabaseUserId) {
      console.log('No Supabase user ID found, attempting to create user...')
      try {
        const { createOrUpdateUser } = await import('@/lib/supabase')
        const userData = await createOrUpdateUser({
          email: session.user.email!,
          name: session.user.name || 'Unknown User',
          image: session.user.image || undefined,
        })
        // Update the session with the new user ID
        ;(session.user as any).supabaseUserId = userData.user_id
        console.log('User created successfully, new ID:', userData.user_id)
      } catch (error) {
        console.error('Failed to create user:', error)
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
      }
    }

    // Use the Supabase user ID
    const userId = (session.user as any).supabaseUserId

    const body = await request.json()

    // Validate required fields
    const requiredFields = ['daily_calories', 'daily_protein', 'daily_carbs', 'daily_fat']
    for (const field of requiredFields) {
      if (typeof body[field] !== 'number' || body[field] < 0) {
        return NextResponse.json(
          { error: `${field} must be a positive number` },
          { status: 400 }
        )
      }
    }

    // Create or update nutrition goals (UPSERT - ensures only one entry per user)
    const newGoals = await createOrUpdateNutritionGoals(userId, {
      user_id: userId,
      daily_calories: body.daily_calories,
      daily_protein: body.daily_protein,
      daily_carbs: body.daily_carbs,
      daily_fat: body.daily_fat,
      daily_fiber: 25, // Default fiber value
      target_weight: body.target_weight,
      weight_goal: body.weight_goal,
      activity_level: body.activity_level,
    })

    return NextResponse.json({ goals: newGoals })
  } catch (error) {
    console.error('Error creating nutrition goals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the correct user ID from session
    const supabaseUserId = (session.user as any).supabaseUserId

    // If we don't have a Supabase user ID, try to create the user first
    if (!supabaseUserId) {
      console.log('No Supabase user ID found, attempting to create user...')
      try {
        const { createOrUpdateUser } = await import('@/lib/supabase')
        const userData = await createOrUpdateUser({
          email: session.user.email!,
          name: session.user.name || 'Unknown User',
          image: session.user.image || undefined,
        })
        // Update the session with the new user ID
        ;(session.user as any).supabaseUserId = userData.user_id
        console.log('User created successfully, new ID:', userData.user_id)
      } catch (error) {
        console.error('Failed to create user:', error)
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
      }
    }

    // Use the Supabase user ID
    const userId = (session.user as any).supabaseUserId

    const body = await request.json()

    // Validate required fields
    const requiredFields = ['daily_calories', 'daily_protein', 'daily_carbs', 'daily_fat', 'daily_fiber']
    for (const field of requiredFields) {
      if (typeof body[field] !== 'number' || body[field] < 0) {
        return NextResponse.json(
          { error: `${field} must be a positive number` },
          { status: 400 }
        )
      }
    }

    // Validate optional fields
    if (body.weight_goal && !['lose', 'maintain', 'gain'].includes(body.weight_goal)) {
      return NextResponse.json(
        { error: 'weight_goal must be one of: lose, maintain, gain' },
        { status: 400 }
      )
    }

    if (body.activity_level && !['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'].includes(body.activity_level)) {
      return NextResponse.json(
        { error: 'activity_level must be one of: sedentary, lightly_active, moderately_active, very_active, extremely_active' },
        { status: 400 }
      )
    }

    // Use UPSERT to ensure only one entry per user
    const updatedGoals = await createOrUpdateNutritionGoals(userId, {
      user_id: userId,
      ...body,
    })

    return NextResponse.json({ goals: updatedGoals })
  } catch (error) {
    console.error('Error updating nutrition goals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 