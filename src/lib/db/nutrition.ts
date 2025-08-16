import { supabase } from '../supabase'

// Nutrition entry type definition
export interface NutritionEntry {
  id: string
  user_id: string // UUID from users table
  date: string
  food_name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  type: 'food' | 'exercise'
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  created_at: string
  updated_at: string
}

// Chat message type definition
export interface ChatMessage {
  id: string
  user_id: string // UUID from users table
  message: string
  is_user: boolean
  nutrition_data?: {
    nutrition?: NutritionEntry
    exercise?: NutritionEntry | null
    suggestion?: string
  } | null
  created_at: string
}

// User nutrition goals
export interface NutritionGoals {
  id: string
  user_id: string // UUID from users table
  daily_calories: number
  daily_protein: number
  daily_carbs: number
  daily_fat: number
  daily_fiber: number
  weight_goal?: 'lose' | 'maintain' | 'gain'
  target_weight?: number
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'
  weight?: number
  height?: number
  age?: number
  gender?: 'male' | 'female'
  created_at: string
  updated_at: string
}

// Input type for creating nutrition entries
export interface CreateNutritionEntryInput {
  user_id: string // UUID from users table
  date: string
  food_name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  type: 'food' | 'exercise'
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
}

// Input type for creating chat messages
export interface CreateChatMessageInput {
  user_id: string // UUID from users table
  message: string
  is_user: boolean
  nutrition_data?: {
    nutrition?: NutritionEntry
    exercise?: NutritionEntry | null
    suggestion?: string
  } | null
}

// Input type for creating nutrition goals
export interface CreateNutritionGoalsInput {
  user_id: string // UUID from users table
  daily_calories: number
  daily_protein: number
  daily_carbs: number
  daily_fat: number
  daily_fiber: number
  weight_goal?: 'lose' | 'maintain' | 'gain'
  target_weight?: number
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'
  weight?: number
  height?: number
  age?: number
  gender?: 'male' | 'female'
}

// Create nutrition entry
export async function createNutritionEntry(input: CreateNutritionEntryInput): Promise<NutritionEntry> {
  try {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('nutrition_entries')
      .insert({
        ...input,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating nutrition entry:', error)
      throw new Error(`Failed to create nutrition entry: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in createNutritionEntry:', error)
    throw error
  }
}

// Get nutrition entries by user and date
export async function getNutritionEntriesByDate(userId: string, date: string): Promise<NutritionEntry[]> {
  try {
    const { data, error } = await supabase
      .from('nutrition_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching nutrition entries:', error)
      throw new Error(`Failed to fetch nutrition entries: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error in getNutritionEntriesByDate:', error)
    throw error
  }
}

// Get nutrition entries by user and date range
export async function getNutritionEntriesByDateRange(userId: string, startDate: string, endDate: string): Promise<NutritionEntry[]> {
  try {
    const { data, error } = await supabase
      .from('nutrition_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching nutrition entries:', error)
      throw new Error(`Failed to fetch nutrition entries: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error in getNutritionEntriesByDateRange:', error)
    throw error
  }
}

// Create chat message
export async function createChatMessage(input: CreateChatMessageInput): Promise<ChatMessage> {
  try {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        ...input,
        created_at: now,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating chat message:', error)
      throw new Error(`Failed to create chat message: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in createChatMessage:', error)
    throw error
  }
}

// Get chat messages by user
export async function getChatMessagesByUser(userId: string, limit: number = 50): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching chat messages:', error)
      throw new Error(`Failed to fetch chat messages: ${error.message}`)
    }

    return (data || []).reverse()
  } catch (error) {
    console.error('Error in getChatMessagesByUser:', error)
    throw error
  }
}

// Get or create nutrition goals
export async function getOrCreateNutritionGoals(userId: string): Promise<NutritionGoals> {
  try {
    console.log('Getting or creating nutrition goals for user:', userId)
    
    // First try to get existing goals
    const { data: existingGoals, error: fetchError } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching nutrition goals:', fetchError)
      throw new Error(`Failed to fetch nutrition goals: ${fetchError.message}`)
    }

    if (existingGoals) {
      console.log('Found existing nutrition goals:', existingGoals.id)
      return existingGoals
    }

    console.log('No existing goals found, creating default goals for user:', userId)

    // Create default goals if none exist
    const defaultGoals: CreateNutritionGoalsInput = {
      user_id: userId,
      daily_calories: 2000,
      daily_protein: 150,
      daily_carbs: 250,
      daily_fat: 65,
      daily_fiber: 25,
      weight_goal: 'maintain',
      activity_level: 'moderately_active',
    }

    const now = new Date().toISOString()

    const { data: newGoals, error: createError } = await supabase
      .from('nutrition_goals')
      .insert({
        ...defaultGoals,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating nutrition goals:', createError)
      throw new Error(`Failed to create nutrition goals: ${createError.message}`)
    }

    console.log('Created new nutrition goals:', newGoals.id)
    return newGoals
  } catch (error) {
    console.error('Error in getOrCreateNutritionGoals:', error)
    throw error
  }
}

// Update nutrition goals
export async function updateNutritionGoals(userId: string, goals: Partial<CreateNutritionGoalsInput>): Promise<NutritionGoals> {
  try {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('nutrition_goals')
      .update({
        ...goals,
        updated_at: now,
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating nutrition goals:', error)
      throw new Error(`Failed to update nutrition goals: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in updateNutritionGoals:', error)
    throw error
  }
}

// Calculate daily totals
export function calculateDailyTotals(entries: NutritionEntry[]) {
  return entries.reduce((totals, entry) => {
    if (entry.type === 'food') {
      totals.calories += entry.calories
      totals.protein += entry.protein
      totals.carbs += entry.carbs
      totals.fat += entry.fat
      totals.fiber += entry.fiber
      totals.sugar += entry.sugar
      totals.sodium += entry.sodium
    } else if (entry.type === 'exercise') {
      // Exercise burns calories, so subtract them
      totals.calories -= entry.calories
    }
    return totals
  }, {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  })
} 