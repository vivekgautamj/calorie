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
You are a nutrition expert. Analyze the user's input and return ONLY a valid JSON object.

Rules:
1. Return ONLY valid JSON, no other text
2. Use standard nutritional values
3. For Indian foods, use appropriate data
4. Be conservative with estimates

Return this exact JSON structure:
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
  "suggestion": "string (helpful tip or recommendation)"
}

If input contains exercise, fill the exercise object. If only food, set exercise to null.

Common Indian food estimates:
- 1 roti: 80 calories, 2.5g protein, 15g carbs, 1g fat
- 1 cup dal: 230 calories, 18g protein, 40g carbs, 1g fat, 15g fiber
- 1 cup rice: 200 calories, 4g protein, 45g carbs, 0.5g fat
- 1 cup yogurt: 150 calories, 8g protein, 12g carbs, 8g fat

User input: `

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

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    // Use the simple prompt for clean JSON
    const result = await model.generateContent(simpleNutritionPrompt + input)
    const response = await result.response
    const text = response.text().trim()
    
    // Try to parse the response as JSON directly
    let analysis
    try {
      analysis = JSON.parse(text)
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI')
      }
      analysis = JSON.parse(jsonMatch[0])
    }
    
    // Validate the response structure
    if (!analysis.protein || !analysis.fat || !analysis.carbs || !analysis.calories) {
      throw new Error('Invalid nutrition analysis structure')
    }
    
    return analysis
  } catch (error) {
    console.error('Error analyzing nutrition:', error)
    throw new Error('Failed to analyze nutrition input')
  }
}

// Generate exercise recommendations
export async function generateExerciseRecommendations(
  exercise: string,
  duration: number,
  intensity: string,
  exerciseType: string
): Promise<any> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error('Google Gemini API key not configured')
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = exerciseRecommendationPrompt
      .replace('{exercise}', exercise)
      .replace('{duration}', duration.toString())
      .replace('{intensity}', intensity)
      .replace('{exercise_type}', exerciseType)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()
    
    // Try to parse JSON directly
    try {
      return JSON.parse(text)
    } catch (parseError) {
      // Extract JSON if needed
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format')
      }
      return JSON.parse(jsonMatch[0])
    }
  } catch (error) {
    console.error('Error generating exercise recommendations:', error)
    throw new Error('Failed to generate exercise recommendations')
  }
}

// Simple nutrition analysis for basic responses
export async function simpleNutritionAnalysis(input: string): Promise<any> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error('Google Gemini API key not configured')
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const simplePrompt = `
Analyze this food input and return ONLY a JSON object with basic nutrition info:
"${input}"

Return ONLY this JSON format:
{
  "protein": number,
  "calories": number,
  "carbs": number,
  "fat": number,
  "fiber": number
}
`
    
    const result = await model.generateContent(simplePrompt)
    const response = await result.response
    const text = response.text().trim()
    
    // Try to parse JSON directly
    try {
      return JSON.parse(text)
    } catch (parseError) {
      // Extract JSON if needed
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format')
      }
      return JSON.parse(jsonMatch[0])
    }
  } catch (error) {
    console.error('Error in simple nutrition analysis:', error)
    throw new Error('Failed to analyze nutrition')
  }
}

export async function generateChatResponse(
  message: string, 
  context: string = ''
): Promise<string> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return 'I apologize, but the AI nutritionist is not properly configured. Please check your API key setup.'
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = chatPrompt
      .replace('{context}', context)
      .replace('{message}', message)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating chat response:', error)
    return 'I apologize, but I\'m having trouble processing your request right now. Please try again.'
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