import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createClient } from '@supabase/supabase-js'
import { customAlphabet } from 'nanoid'

// Security constants
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'image/svg+xml'
]

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 5)

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = (session.user as any).userId
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 })
    }

    // Parse and validate request body
    const body = await request.json()
    const { fileName, fileType, fileSize } = body
    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json({ error: 'Missing file information' }, { status: 400 })
    }
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, WEBP, SVG allowed' }, { status: 400 })
    }
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size too large. Maximum 5MB allowed' }, { status: 400 })
    }

    // Generate unique file path: current date + nanoid (5)
    const fileExt = fileName.split('.').pop()?.toLowerCase()
    const now = new Date()
    const yyyy = now.getFullYear().toString()
    const mm = (now.getMonth() + 1).toString().padStart(2, '0')
    const dd = now.getDate().toString().padStart(2, '0')
    const dateStr = `${yyyy}${mm}${dd}`
    const uniqueFileName = `${nanoid()}.${fileExt}`
    const filePath = `clash-options/${dateStr}/${uniqueFileName}`

    // Generate signed upload URL (valid for 60 seconds)
    const { data, error } = await supabaseAdmin.storage
      .from('clsh')
      .createSignedUploadUrl(filePath, { upsert: true })

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: error?.message || 'Failed to create signed URL' }, { status: 500 })
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/clsh/${filePath}`

    return NextResponse.json({
      signedUrl: data.signedUrl,
      filePath,
      publicUrl,
      bucketName: 'clsh',
      expiresIn: 60
    })
  } catch (error) {
    console.error('Error in upload-url API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 