import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No session found' });
    }

    const userId = (session.user as any).supabaseUserId;
    
    if (!userId) {
      return NextResponse.json({ error: 'No user ID found' });
    }

    // Get user data
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch user', details: error });
    }

    return NextResponse.json({
      success: true,
      user,
      onboarding_completed: user.onboarding_completed
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error });
  }
} 