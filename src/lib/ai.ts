import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

export interface SimpleNutritionAnalysis {
  food_name: string
  protein: number
  fat: number
  fiber: number
  carbs: number
  calories: number
  sugar: number
  sodium: number
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
SYSTEM: You are a nutrition expert. Analyze the user's input and respond appropriately.

INPUT: Analyze the user's message and determine if it's food tracking or general conversation.

OUTPUT RULES:
- If the user is tracking food: Return JSON with nutrition data
- If the user is asking questions or chatting: Return JSON with calories: 0 to indicate no tracking
- ALWAYS include food_name in the JSON response

NUTRITION TRACKING JSON FORMAT:
{
  "food_name": "string (REQUIRED - extract from user input)",
  "protein": number,
  "fat": number,
  "fiber": number,
  "carbs": number,
  "calories": number,
  "sugar": number,
  "sodium": number,
  "suggestion": "string"
}

EXAMPLES:
- "I ate 2 roti and dal" → {"food_name": "2 Roti and Dal", "calories": 310, "protein": 20.5, "carbs": 55, "fat": 2, "fiber": 15, "sugar": 2, "sodium": 300, "suggestion": "Good combination of carbs and protein"}
- "What should I eat?" → {"food_name": "No food tracked", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0, "sugar": 0, "sodium": 0, "suggestion": ""}
- "Have you eaten today?" → {"food_name": "No food tracked", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0, "sugar": 0, "sodium": 0, "suggestion": ""}
- "I had breakfast with eggs" → {"food_name": "Eggs", "calories": 140, "protein": 12, "carbs": 1, "fat": 10, "fiber": 0, "sugar": 1, "sodium": 140, "suggestion": "Great protein source for breakfast"}

FOOD NAME EXTRACTION RULES:
- ALWAYS extract and include food_name from the user's input
- Use clear, descriptive names (e.g., "Roti and Dal", "Chicken Rice", "Apple")
- For multiple items, combine them naturally (e.g., "2 Roti and Dal", "Eggs and Toast")
- Include quantities when mentioned (e.g., "2 Apples", "1 Cup Rice")
- If no food is mentioned, use "No food tracked"
- Keep it concise but descriptive

COMMON FOOD ESTIMATES:
- 1 roti: 80 calories, 2.5g protein, 15g carbs, 1g fat
- 1 cup dal: 230 calories, 18g protein, 40g carbs, 1g fat, 15g fiber
- 1 cup rice: 200 calories, 4g protein, 45g carbs, 0.5g fat
- 1 cup yogurt: 150 calories, 8g protein, 12g carbs, 8g fat
- 1 egg: 70 calories, 6g protein, 0.5g carbs, 5g fat
- 1 apple: 95 calories, 0.5g protein, 25g carbs, 0.3g fat, 4g fiber
- 1 banana: 105 calories, 1.3g protein, 27g carbs, 0.4g fat, 3g fiber
- 1 cup milk: 150 calories, 8g protein, 12g carbs, 8g fat
- 1 cup coffee: 2 calories, 0.3g protein, 0g carbs, 0g fat

CRITICAL: Always return valid JSON with food_name field included.

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
    
    // Use the simple prompt for clean JSON with generation config
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: simpleNutritionPrompt + input }] }],
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent output
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 500,
      }
    })
    
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
    if (!analysis.food_name || typeof analysis.food_name !== 'string') {
      console.error('Invalid nutrition analysis structure - missing or invalid food_name:', analysis)
      throw new Error('Invalid nutrition analysis structure - missing required food_name field')
    }
    
    if (analysis.calories > 0 && (!analysis.protein || !analysis.fat || !analysis.carbs)) {
      console.error('Invalid nutrition analysis structure - missing nutrition values:', analysis)
      throw new Error('Invalid nutrition analysis structure - missing required nutrition fields')
    }
    
    console.log('Parsed analysis:', analysis)
    return analysis
  } catch (error) {
    console.error('Error in analyzeNutrition:', error)
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