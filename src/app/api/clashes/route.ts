import { NextRequest, NextResponse } from 'next/server'
import { createClash, CreateClashInput } from '@/lib/db/clashes'
import { auth } from '@/auth'
import { supabase } from '@/lib/supabase'
import { nanoid } from 'nanoid'
import zod, { z } from 'zod'

// Zod schema for clash creation
const createClashSchema = z.object({
  title: z.string().min(1, 'Title is required and must be at least 1 character'),
  description: z.string().optional(),
  options: z.array(z.object({
    text: z.string().min(1, 'Option text is required and must be at least 1 character'),
    image_url: z.string().url().optional().or(z.literal('')),
  })).min(2, 'At least 2 options are required').max(4, 'Maximum 4 options allowed'),
  status: z.enum(['active', 'expired']).optional().default('active'),
  show_cta: z.boolean().optional().default(false),
  show_results: z.boolean().optional().default(true),
  cta_text: z.string().optional(),
  cta_url: z.string().url().optional().or(z.literal('')),
  expires_at: z.string().datetime().optional().or(z.literal('')),
})

// GET - Fetch user's clashes
export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user ID from session
    const userId = (session.user as any).userId
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      )
    }

    const { data: clashes, error } = await supabase
      .from('clashes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      
    if (error) {
      console.error('Error fetching clashes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch clashes' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Clashes retrieved successfully',
        clashes 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in GET /api/clashes:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new clash
export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user ID from session
    const userId = (session.user as any).userId
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    // Validate with Zod schema
    const validationResult = createClashSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ')
      
      return NextResponse.json(
        { error: `Validation failed: ${errors}` },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // Prepare clash input
    const clashInput: CreateClashInput = {
      title: validatedData.title.trim(),
      description: validatedData.description?.trim() || '',
      options: validatedData.options.map((option, index) => ({
        id: `option-${index + 1}`,
        title: option.text.trim(),
        image_url: option.image_url,
      })),
      user_id: userId,
      status: validatedData.status as 'active' | 'expired',
      show_cta: validatedData.show_cta,
      show_results: validatedData.show_results,
      cta_text: validatedData.cta_text,
      cta_url: validatedData.cta_url,
      expires_at: validatedData.expires_at ,
      slug: nanoid(5),
    }

    // Create the clash
    const clash = await createClash(clashInput)

    return NextResponse.json(
      { 
        message: 'Clash created successfully',
        clash 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error in POST /api/clashes:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

//delete clash clash 