import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function createOrUpdateUser(userData: {
  email: string
  name: string
  image?: string
  country?: string
}) {
  try {
    console.log('Creating/updating user with data:', { email: userData.email, name: userData.name })
    
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          user_email: userData.email,
          name: userData.name,
          image: userData.image,
          updated_at: new Date().toISOString(),
          country: userData.country || 'US',
          timezone: 'UTC',
          subscription_status: 'free',
        },
        {
          onConflict: 'user_email',
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating/updating user:', error)
      throw error
    }

    console.log('User successfully created/updated:', { user_id: data.user_id, user_email: data.user_email })

    return data
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error)
    throw error
  }
}