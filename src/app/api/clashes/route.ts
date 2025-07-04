import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabase } from '@/lib/supabase'

// GET - Fetch user's clashes/AB tests
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || !(session.user as any).userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('clashes')
      .select('*')
      .eq('user_id', (session.user as any).userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching clashes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch clashes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ clashes: data })
  } catch (error) {
    console.error('Error in GET /api/clashes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new clash/AB test
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || !(session.user as any).userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, thumbnail_a, thumbnail_b } = body

    if (!title || !thumbnail_a || !thumbnail_b) {
      return NextResponse.json(
        { error: 'Title and both thumbnails are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('clashes')
      .insert({
        user_id: (session.user as any).userId,
        title,
        description,
        thumbnail_a,
        thumbnail_b,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating clash:', error)
      return NextResponse.json(
        { error: 'Failed to create clash' },
        { status: 500 }
      )
    }

    return NextResponse.json({ clash: data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/clashes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 