import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { analyzeNutrition, generateChatResponse } from '@/lib/ai'
import { createChatMessage, createNutritionEntry, getChatMessagesByUser } from '@/lib/db/nutrition'

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

    const { message } = await request.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Save user message
    await createChatMessage({
      user_id: userId,
      message,
      is_user: true,
    })

    let aiResponse = ''
    let nutritionData = null

    try {
      // Send current message to LLM and get JSON response
      const analysis = await analyzeNutrition(message)
      
      // If LLM returns nutrition data, save it directly
      if (analysis && analysis.calories > 0) {
        // Save nutrition data directly from LLM response
        const nutritionEntry = await createNutritionEntry({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          food_name: analysis.food_name,
          quantity: 1,
          unit: 'serving',
          calories: analysis.calories,
          protein: analysis.protein,
          carbs: analysis.carbs,
          fat: analysis.fat,
          fiber: analysis.fiber,
          sugar: analysis.sugar,
          sodium: analysis.sodium,
          type: 'food',
        })

        // Store nutrition data for frontend widget (separate from chat)
        nutritionData = {
          nutrition_entry_id: nutritionEntry.id,
          calories: analysis.calories,
          protein: analysis.protein,
          carbs: analysis.carbs,
          fat: analysis.fat,
          fiber: analysis.fiber,
          sugar: analysis.sugar,
          sodium: analysis.sodium,
          suggestion: analysis.suggestion
        }

        // Simple confirmation - no nutrition data in text, only in widget
        aiResponse = `Added ${analysis.food_name} to your daily nutrition!`
      } else {
        // LLM determined this is not nutrition tracking
        aiResponse = "I couldn't understand what food you're referring to. Please be more specific about what you ate."
      }
    } catch (error) {
      console.error('Error analyzing with LLM:', error)
      // Graceful fallback - don't crash, just inform user
      aiResponse = "I'm having trouble analyzing your food input right now. Please try again or be more specific about what you ate."
    }

    // Save AI response as chat message (separate from nutrition entry)
    await createChatMessage({
      user_id: userId,
      message: aiResponse,
      is_user: false,
      nutrition_data: nutritionData, // This is just a reference, not the actual nutrition entry
    })

    return NextResponse.json({
      response: aiResponse,
      nutritionData,
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const messages = await getChatMessagesByUser(userId, 50)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 