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

    // Get recent chat context
    const recentMessages = await getChatMessagesByUser(userId, 10)
    const context = recentMessages
      .map(msg => `${msg.is_user ? 'User' : 'AI'}: ${msg.message}`)
      .join('\n')

    // Check if message contains nutrition information
    const nutritionKeywords = [
      'ate', 'eaten', 'consumed', 'had', 'breakfast', 'lunch', 'dinner', 'snack',
      'calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium',
      'ran', 'walked', 'exercised', 'workout', 'gym', 'yoga', 'pilates'
    ]

    // More specific patterns that indicate actual food/exercise tracking
    const trackingPatterns = [
      /(?:ate|had|consumed|eaten)\s+(?:a|an|some|my|the)?\s+(.+)/i,
      /(?:drank|had)\s+(?:a|an|some|my|the)?\s+(.+)/i,
      /(?:exercised|worked out|did)\s+(?:for\s+)?(\d+)\s*(?:minutes?|mins?)/i,
      /(?:ran|walked|cycled|swam)\s+(?:for\s+)?(\d+)\s*(?:minutes?|mins?|km|miles?)/i,
      /(?:went to|did)\s+(?:the\s+)?(?:gym|yoga|pilates|workout)/i
    ]

    const hasNutritionInfo = nutritionKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    )

    // Check if this is actually a tracking message, not just conversation
    const isTrackingMessage = trackingPatterns.some(pattern => pattern.test(message)) ||
      message.toLowerCase().includes('add') ||
      message.toLowerCase().includes('track') ||
      message.toLowerCase().includes('log')

    let aiResponse = ''
    let nutritionData = null

    if (hasNutritionInfo && isTrackingMessage) {
      try {
        // Analyze nutrition with simple JSON
        const analysis = await analyzeNutrition(message)
        
        // Always save nutrition data (even if exercise is null)
        const nutritionEntry = await createNutritionEntry({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          food_name: 'User Input', // Generic name since we don't have specific food name
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

        // If exercise data exists, save it too
        let exerciseEntry = null
        if (analysis.exercise) {
          exerciseEntry = await createNutritionEntry({
            user_id: userId,
            date: new Date().toISOString().split('T')[0],
            food_name: analysis.exercise.name,
            quantity: analysis.exercise.duration,
            unit: 'minutes',
            calories: analysis.exercise.calories_burned,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            type: 'exercise',
          })
        }

        // Store both nutrition and exercise data
        nutritionData = {
          nutrition: nutritionEntry,
          exercise: exerciseEntry,
          suggestion: analysis.suggestion
        }

        // Create a structured response based on the analysis
        if (analysis.exercise) {
          aiResponse = `✅ Added to your log:\n\n🍽️ **Food:** ${message}\n- Calories: ${analysis.calories}\n- Protein: ${analysis.protein}g\n- Carbs: ${analysis.carbs}g\n- Fat: ${analysis.fat}g\n\n🏃‍♂️ **Exercise:** ${analysis.exercise.name}\n- Duration: ${analysis.exercise.duration} minutes\n- Calories burned: ${analysis.exercise.calories_burned}\n- Intensity: ${analysis.exercise.intensity}\n\n💡 **Suggestion:** ${analysis.suggestion}`
        } else {
          aiResponse = `✅ Added to your log:\n\n🍽️ **Food:** ${message}\n- Calories: ${analysis.calories}\n- Protein: ${analysis.protein}g\n- Carbs: ${analysis.carbs}g\n- Fat: ${analysis.fat}g\n- Fiber: ${analysis.fiber}g\n- Sugar: ${analysis.sugar}g\n- Sodium: ${analysis.sodium}mg\n\n💡 **Suggestion:** ${analysis.suggestion}`
        }
      } catch (error) {
        console.error('Error analyzing nutrition:', error)
        aiResponse = "I understand you mentioned food or exercise, but I'm having trouble analyzing the nutritional information. Could you please be more specific about what you ate or what exercise you did?"
      }
    } else {
      // Generate general chat response without creating nutrition entries
      aiResponse = await generateChatResponse(message, context)
    }

    // Save AI response
    await createChatMessage({
      user_id: userId,
      message: aiResponse,
      is_user: false,
      nutrition_data: nutritionData,
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