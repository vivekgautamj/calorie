import { supabase } from '../supabase'
import { nanoid } from 'nanoid'

// Clash type definition
export interface Clash {
  id: string
  title: string
  description: string
  options: ClashOption[]
  slug: string
  user_id: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  show_cta: boolean
  show_results: boolean
  cta_text?: string
  cta_url?: string
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface  ClashOption {
  id: string
  title: string
  image_url?: string
}

// Input type for creating clashes
export interface CreateClashInput {
  title: string
  description: string
  options: ClashOption[]
  user_id: string
  status?: 'active' | 'expired'
  show_cta?: boolean
  show_results?: boolean
  cta_text?: string
  cta_url?: string
  expires_at?: string
  slug?: string
}

// Input type for updating clashes
export interface UpdateClashInput {
  title?: string
  description?: string
  options?: ClashOption[]
  status?: 'draft' | 'active' | 'paused' | 'completed'
  show_cta?: boolean
  show_results?: boolean
  cta_text?: string
  cta_url?: string
  expires_at?: string
}

// Create clash
export async function createClash(input: CreateClashInput): Promise<Clash> {
  try {
    // Validate input
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Title is required')
    }
    
    if (!input.options || input.options.length < 2) {
      throw new Error('At least 2 options are required')
    }
    
    if (!input.user_id) {
      throw new Error('User ID is required')
    }

    let slug = nanoid(5)

   
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('clashes')
      .insert({
        title: input.title.trim(),
        description: input.description?.trim() || '',
        options: input.options,
        slug,
        user_id: input.user_id,
        status: input.status || 'draft',
        show_cta: input.show_cta || false,
        show_results: input.show_results !== false, // Default to true
        cta_text: input.cta_text || null,
        cta_url: input.cta_url || null,
        expires_at: input.expires_at || null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating clash:', error)
      throw new Error(`Failed to create clash: ${error.message}`)
    }

    console.log('Clash created:', data)
    return data
  } catch (error) {
    console.error('Error in createClash:', error)
    throw error
  }
}

// Get clash by ID
export async function getClashById(id: string): Promise<Clash | null> {
  try {
    if (!id) {
      throw new Error('Clash ID is required')
    }

    const { data, error } = await supabase
      .from('clashes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Clash not found
      }
      console.error('Error fetching clash:', error)
      throw new Error(`Failed to fetch clash: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in getClashById:', error)
    throw error
  }
}

// Get clash by slug
export async function getClashBySlug(slug: string): Promise<Clash | null> {
  try {
    if (!slug) {
      throw new Error('Slug is required')
    }

    const { data, error } = await supabase
      .from('clashes')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Clash not found
      }
      console.error('Error fetching clash by slug:', error)
      throw new Error(`Failed to fetch clash: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error in getClashBySlug:', error)
    throw error
  }
}

// Get clashes by user ID
export async function getClashesByUserId(userId: string): Promise<Clash[]> {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('clashes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user clashes:', error)
      throw new Error(`Failed to fetch clashes: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error in getClashesByUserId:', error)
    throw error
  }
}

// Update clash
export async function updateClash(id: string, input: UpdateClashInput): Promise<Clash> {
  try {
    if (!id) {
      throw new Error('Clash ID is required')
    }

    // Check if clash exists and user owns it
    const existingClash = await getClashById(id)
    if (!existingClash) {
      throw new Error('Clash not found')
    }

    const updateData: Partial<UpdateClashInput> & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    }

    // Only update provided fields
    if (input.title !== undefined) {
      updateData.title = input.title.trim()
    }
    if (input.description !== undefined) {
      updateData.description = input.description.trim()
    }
    if (input.options !== undefined) {
      updateData.options = input.options
    }
    if (input.status !== undefined) {
      updateData.status = input.status
    }
    if (input.show_cta !== undefined) {
      updateData.show_cta = input.show_cta
    }
    if (input.show_results !== undefined) {
      updateData.show_results = input.show_results
    }
    if (input.cta_text !== undefined) {
      updateData.cta_text = input.cta_text
    }
    if (input.cta_url !== undefined) {
      updateData.cta_url = input.cta_url
    }
    if (input.expires_at !== undefined) {
      updateData.expires_at = input.expires_at
    }

    const { data, error } = await supabase
      .from('clashes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating clash:', error)
      throw new Error(`Failed to update clash: ${error.message}`)
    }

    console.log('Clash updated:', data)
    return data
  } catch (error) {
    console.error('Error in updateClash:', error)
    throw error
  }
}

// Delete clash
export async function deleteClash(id: string, userId: string): Promise<void> {
  try {
    if (!id) {
      throw new Error('Clash ID is required')
    }

    if (!userId) {
      throw new Error('User ID is required')
    }

    // Check if clash exists and user owns it
    const existingClash = await getClashById(id)
    if (!existingClash) {
      throw new Error('Clash not found')
    }

    if (existingClash.user_id !== userId) {
      throw new Error('Unauthorized to delete this clash')
    }

    const { error } = await supabase
      .from('clashes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting clash:', error)
      throw new Error(`Failed to delete clash: ${error.message}`)
    }

    console.log('Clash deleted:', id)
  } catch (error) {
    console.error('Error in deleteClash:', error)
    throw error
  }
} 