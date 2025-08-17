import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug onboarding API called');
    
    const session = await auth();
    console.log('Session:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      email: session?.user?.email,
      supabaseUserId: (session?.user as any)?.supabaseUserId
    });

    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'No session found',
        step: 'session_check'
      });
    }

    let userId = (session.user as any).supabaseUserId;
    console.log('Current userId:', userId);

    if (!userId) {
      console.log('No userId in session, attempting to create user...');
      try {
        const { createOrUpdateUser } = await import('@/lib/supabase');
        const userData = await createOrUpdateUser({
          email: session.user.email!,
          name: session.user.name || 'Unknown User',
          image: session.user.image || undefined,
        });
        userId = userData.user_id;
        console.log('User created with ID:', userId);
      } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ 
          error: 'Failed to create user',
          step: 'user_creation',
          details: error
        });
      }
    }

    // Check if user exists in database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ 
        error: 'Failed to fetch user',
        step: 'user_fetch',
        details: userError
      });
    }

    console.log('User found:', user);

    // Check if nutrition goals exist
    const { data: goals, error: goalsError } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (goalsError && goalsError.code !== 'PGRST116') {
      console.error('Error fetching goals:', goalsError);
      return NextResponse.json({ 
        error: 'Failed to fetch goals',
        step: 'goals_fetch',
        details: goalsError
      });
    }

    console.log('Goals found:', goals);

    return NextResponse.json({
      success: true,
      user,
      goals,
      hasGoals: !!goals,
      onboarding_completed: user.onboarding_completed || false
    });

  } catch (error) {
    console.error('Error in debug onboarding API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      step: 'general',
      details: error
    });
  }
} 