import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

export interface SimpleNutritionAnalysis {
  protein: number
  fat: number
  fiber: number
  carbs: number
  calories: number
  sugar: number
  sodium: number
  exercise: null | {
    name: string
    duration: number
    calories_burned: number
    intensity: 'low' | 'moderate' | 'high'
  }
  suggestion: string
}

export interface AIRecommendation {
  type: 'hydration' | 'nutrition' | 'exercise' | 'recovery' | 'motivation'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  actionable: boolean
  action_text?: string
}

// Simple nutrition prompt for clean JSON
const simpleNutritionPrompt = `
SYSTEM: You are a JSON-only nutrition analyzer. You must respond with ONLY valid JSON, no other text.

INPUT: Analyze the user's food/exercise input and return nutrition data.

OUTPUT FORMAT: Return ONLY this JSON structure, no other text:

{
  "protein": number,
  "fat": number,
  "fiber": number,
  "carbs": number,
  "calories": number,
  "sugar": number,
  "sodium": number,
  "exercise": null | {
    "name": "string",
    "duration": number,
    "calories_burned": number,
    "intensity": "low|moderate|high"
  },
  "suggestion": "string"
}

RULES:
- Return ONLY the JSON object above
- No explanations, no markdown, no extra text
- Use realistic nutritional values
- For Indian foods, use appropriate estimates
- If exercise mentioned, fill exercise object, otherwise set to null

FOOD ESTIMATES:
- 1 roti: 80 calories, 2.5g protein, 15g carbs, 1g fat
- 1 cup dal: 230 calories, 18g protein, 40g carbs, 1g fat, 15g fiber
- 1 cup rice: 200 calories, 4g protein, 45g carbs, 0.5g fat
- 1 cup yogurt: 150 calories, 8g protein, 12g carbs, 8g fat

USER INPUT: `

const chatPrompt = `
You are a friendly, encouraging AI nutritionist and fitness coach with expertise in Indian and global cuisine. Help users track their food and exercise with enthusiasm and helpful insights.

IMPORTANT: You are ONLY a nutrition and fitness assistant. If users ask about anything unrelated to nutrition, fitness, health, or food tracking, politely decline and redirect them to nutrition/fitness topics.

Guidelines:
- Be warm, encouraging, and supportive - celebrate their healthy choices!
- Provide specific, actionable nutrition tips and insights
- Use emojis occasionally to make responses more engaging
- Always acknowledge their input before providing analysis
- Suggest healthy alternatives or improvements when relevant
- Ask follow-up questions to encourage more tracking
- Provide context about nutritional benefits
- Keep responses conversational but informative
- Use positive reinforcement for good choices
- If asked about non-nutrition topics (code, general questions, etc.), politely say: "I'm your AI nutritionist and fitness coach! I'm here to help with your nutrition and fitness goals. Let's focus on your health journey. What have you eaten or exercised today?"

For EXERCISE inputs, provide:
1. Acknowledge their workout enthusiastically
2. Provide the exercise analysis
3. Give specific recommendations for:
   - Hydration (what to drink, how much)
   - Recovery (stretching, rest tips)
   - Next workout suggestions (complementary exercises)
   - Nutrition timing (pre/post workout meals)
4. Motivate them for consistency

For FOOD inputs, provide:
1. Acknowledge their food choice enthusiastically
2. Provide the nutritional analysis
3. Add helpful insights about the food
4. Suggest related healthy choices
5. Encourage continued tracking

Previous conversation context:
{context}

Current user message: {message}

Respond in a warm, conversational tone. Make users feel good about their choices and motivated to continue tracking!
`

// Enhanced exercise recommendation prompt
const exerciseRecommendationPrompt = `
You are a fitness coach and nutritionist. Based on the user's exercise, provide personalized recommendations.

Exercise: {exercise}
Duration: {duration}
Intensity: {intensity}
Type: {exercise_type}

Provide recommendations in this JSON format:
{
  "hydration": {
    "immediate": "string (what to drink now)",
    "next_hours": "string (hydration plan for next few hours)",
    "amount": "string (recommended amount)"
  },
  "recovery": {
    "stretching": "string (specific stretches)",
    "rest_tips": "string (recovery advice)",
    "timing": "string (when to rest)"
  },
  "next_workout": {
    "suggestion": "string (what to do next)",
    "timing": "string (when to do it)",
    "reason": "string (why this is good)"
  },
  "nutrition": {
    "pre_workout": "string (what to eat before next workout)",
    "post_workout": "string (what to eat after this workout)",
    "timing": "string (when to eat)"
  },
  "motivation": "string (encouraging message)"
}

Make recommendations specific, actionable, and motivating.
`

// Simple nutrition analysis with clean JSON
export async function analyzeNutrition(input: string): Promise<SimpleNutritionAnalysis> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error('Google Gemini API key not configured')
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
    // Use the simple prompt for clean JSON
    const result = await model.generateContent(simpleNutritionPrompt + input)
    const response = await result.response
    const text = response.text().trim()
    
    console.log('Raw AI response:', text)
    
    // Try to parse the response as JSON directly
    let analysis
    try {
      analysis = JSON.parse(text)
    } catch (parseError) {
      console.log('Direct JSON parsing failed, trying to extract JSON...')
      // If direct parsing fails, try to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('No JSON found in response:', text)
        throw new Error('Invalid response format from AI - no JSON found')
      }
      try {
        analysis = JSON.parse(jsonMatch[0])
      } catch (extractError) {
        console.error('JSON extraction failed:', extractError)
        console.error('Extracted text:', jsonMatch[0])
        throw new Error('Invalid JSON format in AI response')
      }
    }
    
    // Validate the response structure
    if (!analysis.protein || !analysis.fat || !analysis.carbs || !analysis.calories) {
      console.error('Invalid nutrition analysis structure:', analysis)
      throw new Error('Invalid nutrition analysis structure - missing required fields')
    }
    
    console.log('Parsed analysis:', analysis)
    return analysis
  } catch (error) {
    console.error('Error in analyzeNutrition:', error)
    throw error
  }
}

// Generate personalized exercise recommendations
export async function generateExerciseRecommendations(exercise: string, duration: number, intensity: string, exerciseType: string): Promise<AIRecommendation[]> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error('Google Gemini API key not configured')
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
    const prompt = exerciseRecommendationPrompt
      .replace('{exercise}', exercise)
      .replace('{duration}', duration.toString())
      .replace('{intensity}', intensity)
      .replace('{exercise_type}', exerciseType)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()
    
    // Try to parse the response as JSON
    let recommendations
    try {
      recommendations = JSON.parse(text)
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI')
      }
      recommendations = JSON.parse(jsonMatch[0])
    }
    
    return recommendations
  } catch (error) {
    console.error('Error generating exercise recommendations:', error)
    throw error
  }
}

// Generate chat response
export async function generateChatResponse(message: string, context: string): Promise<string> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error('Google Gemini API key not configured')
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
    const prompt = chatPrompt
      .replace('{context}', context)
      .replace('{message}', message)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating chat response:', error)
    throw error
  }
}

export function extractNutritionFromText(text: string): string[] {
  // Simple regex to identify potential food/exercise mentions
  const foodPatterns = [
    /\b\d+\s*(?:grams?|g|ounces?|oz|cups?|tablespoons?|tbsp|teaspoons?|tsp|pieces?|slices?|servings?)\s+of\s+\w+/gi,
    /\b(?:ate|eaten|consumed|had)\s+\w+/gi,
    /\b\d+\s+\w+\s+(?:apple|banana|bread|rice|chicken|fish|beef|pork|vegetables?|fruits?|nuts?|seeds?|grains?|dairy|milk|yogurt|cheese|eggs?|beans?|lentils?|pasta|noodles?|soup|salad|sandwich|burger|pizza|cake|cookie|chocolate|candy|ice\s+cream|smoothie|juice|water|coffee|tea|soda|beer|wine|alcohol)/gi,
    /\b(?:breakfast|lunch|dinner|snack|meal)\s+(?:of|with|including)\s+\w+/gi
  ]
  
  const exercisePatterns = [
    /\b(?:ran|walked|jogged|cycled|biked|swam|exercised|worked\s+out|gym|yoga|pilates|strength\s+training|cardio|weight\s+training|running|walking|cycling|swimming|elliptical|treadmill|exercise|workout)\s+(?:for\s+)?\d+\s*(?:minutes?|mins?|hours?|hrs?)/gi,
    /\b\d+\s*(?:minutes?|mins?|hours?|hrs?)\s+(?:of\s+)?(?:running|walking|cycling|swimming|exercise|workout|gym|yoga|pilates)/gi
  ]
  
  const matches: string[] = []
  
  foodPatterns.forEach(pattern => {
    const found = text.match(pattern)
    if (found) matches.push(...found)
  })
  
  exercisePatterns.forEach(pattern => {
    const found = text.match(pattern)
    if (found) matches.push(...found)
  })
  
  return matches
} 