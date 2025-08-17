import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabase } from '@/lib/supabase';
import { createOrUpdateUser } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId = (session.user as any).supabaseUserId;
    
    if (!userId) {
      console.log('No Supabase user ID found, attempting to create user...');
      try {
        const userData = await createOrUpdateUser({
          email: session.user.email!,
          name: session.user.name || 'Unknown User',
          image: session.user.image || undefined,
        });
        userId = userData.user_id;
        (session.user as any).supabaseUserId = userId;
        console.log('User created successfully, new ID:', userId);
      } catch (error) {
        console.error('Failed to create user:', error);
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
      }
    }

    const { data: health, error } = await supabase
      .from('users')
      .select('age, height, weight, gender')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user health data:', error);
      return NextResponse.json({ error: 'Failed to fetch health data' }, { status: 500 });
    }

    return NextResponse.json({ health });
  } catch (error) {
    console.error('Error in user-health API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId = (session.user as any).supabaseUserId;
    
    if (!userId) {
      console.log('No Supabase user ID found, attempting to create user...');
      try {
        const userData = await createOrUpdateUser({
          email: session.user.email!,
          name: session.user.name || 'Unknown User',
          image: session.user.image || undefined,
        });
        userId = userData.user_id;
        (session.user as any).supabaseUserId = userId;
        console.log('User created successfully, new ID:', userId);
      } catch (error) {
        console.error('Failed to create user:', error);
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
      }
    }

    const body = await request.json();
    const { age, height, weight, gender } = body;

    const { error } = await supabase
      .from('users')
      .update({
        age,
        height,
        weight,
        gender,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user health data:', error);
      return NextResponse.json({ error: 'Failed to update health data' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in user-health PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 