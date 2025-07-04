import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function createOrUpdateUser(userData: {
  email: string
  name: string
  image?: string
}) {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          email: userData.email,
          name: userData.name,
          image: userData.image,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'email', // Use email as the conflict resolution key
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error creating/updating user:', error)
      throw error
    }

    console.log('User created/updated:', data)

    return data
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error)
    throw error
  }
}