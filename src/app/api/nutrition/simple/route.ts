import { NextRequest, NextResponse } from 'next/server'
import { simpleNutritionAnalysis } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { food } = await request.json()
    
    if (!food || typeof food !== 'string') {
      return NextResponse.json(
        { error: 'Food input is required' },
        { status: 400 }
      )
    }

    const nutrition = await simpleNutritionAnalysis(food)
    
    return NextResponse.json({
      success: true,
      nutrition,
      food: food
    })
  } catch (error) {
    console.error('Error in simple nutrition analysis:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze nutrition',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 