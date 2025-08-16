import { NextRequest, NextResponse } from 'next/server';
import { getClashBySlug } from '@/lib/db/dashboard';
import { supabase } from '@/lib/supabase';

// Simple rate limiting using IP
const voteCache = new Map<string, { count: number; timestamp: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxVotes = 5; // Max 5 votes per IP per window

  const cached = voteCache.get(ip);
  if (!cached) {
    voteCache.set(ip, { count: 1, timestamp: now });
    return false;
  }

  // Reset if window has passed
  if (now - cached.timestamp > windowMs) {
    voteCache.set(ip, { count: 1, timestamp: now });
    return false;
  }

  // Check if limit exceeded
  if (cached.count >= maxVotes) {
    return true;
  }

  // Increment count
  cached.count++;
  return false;
}

// Generate simple fingerprint from request data
function generateFingerprint(req: NextRequest): string {
  const data = [
    req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    req.headers.get('user-agent') || 'unknown',
    req.headers.get('accept-language') || 'unknown',
  ].join('|');
  
  // Simple hash (in production, use crypto)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many votes. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const optionId = formData.get('optionId') as string;

    if (!optionId) {
      return NextResponse.json(
        { error: 'Option ID is required' },
        { status: 400 }
      );
    }

    // Get clash data
    const { slug } = await params;
    const clash = await getClashBySlug(slug);
    if (!clash) {
      return NextResponse.json(
        { error: 'Clash not found' },
        { status: 404 }
      );
    }

    // Check if clash is active
    const isExpired = clash.expires_at ? new Date() > new Date(clash.expires_at) : false;
    if (clash.status === 'completed' || isExpired) {
      return NextResponse.json(
        { error: 'This vote is no longer active' },
        { status: 400 }
      );
    }

    // Validate option exists
    const option = clash.options.find((opt: any) => opt.id === optionId);
    if (!option) {
      return NextResponse.json(
        { error: 'Invalid option' },
        { status: 400 }
      );
    }

    // Generate fingerprint for duplicate vote detection
    const fingerprint = generateFingerprint(request);

    // Check if this fingerprint has already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('clash_id', clash.id)
      .eq('device_fingerprint', fingerprint)
      .single();

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted on this poll' },
        { status: 400 }
      );
    }

    // Find the option index
    const optionIndex = clash.options.findIndex((opt: any) => opt.id === optionId);

    // Save vote to database
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        clash_id: clash.id,
        option_index: optionIndex,
        device_fingerprint: fingerprint,
        user_agent: request.headers.get('user-agent') || 'unknown'
      });

    if (voteError) {
      console.error('Error saving vote:', voteError);
      return NextResponse.json(
        { error: 'Failed to save vote' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Vote recorded successfully',
        optionId,
        clashId: clash.id
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Frame-Options': 'ALLOWALL',
          'Content-Security-Policy': "frame-ancestors 'self' *"
        }
      }
    );

  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const clash = await getClashBySlug(slug);
    if (!clash) {
      return NextResponse.json(
        { error: 'Clash not found' },
        { status: 404 }
      );
    }

    // Get vote results if show_results is true
    let results = null;
    if (clash.show_results) {
      const { data: votesData } = await supabase
        .from('votes')
        .select('option_index')
        .eq('clash_id', clash.id);

      if (votesData && votesData.length > 0) {
        const totalVotes = votesData.length;
        const voteCounts: Record<number, number> = {};
        
        // Count votes per option
        votesData.forEach((vote: any) => {
          const optionIndex = vote.option_index;
          voteCounts[optionIndex] = (voteCounts[optionIndex] || 0) + 1;
        });

        // Calculate percentages
        results = clash.options.map((option: any, index: number) => ({
          optionIndex: index,
          totalVotes: voteCounts[index] || 0,
          percentage: totalVotes > 0 ? Math.round(((voteCounts[index] || 0) / totalVotes) * 100) : 0
        }));
      }
    }

    return NextResponse.json(
      { 
        clash: {
          id: clash.id,
          title: clash.title,
          description: clash.description,
          status: clash.status,
          expires_at: clash.expires_at,
          options: clash.options,
          show_results: clash.show_results,
          show_cta: clash.show_cta,
          cta_text: clash.cta_text,
          cta_url: clash.cta_url
        },
        results
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Frame-Options': 'ALLOWALL',
          'Content-Security-Policy': "frame-ancestors 'self' *"
        }
      }
    );

  } catch (error) {
    console.error('Error fetching clash:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 