import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    console.log('Onboarding API called');
    const session = await auth();
    if (!session?.user?.email) {
      console.log('No session found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log('Onboarding request body:', body);
    
    const { 
      gender, 
      age, 
      weight, 
      height, 
      target_weight,
      onboarding_completed 
    } = body;

    // Get or create user using the existing function
    let userId = (session.user as any).supabaseUserId;
    console.log('Current userId:', userId);
    
    // Always ensure user exists in database
    if (!userId) {
      try {
        console.log('Creating new user...');
        const { createOrUpdateUser } = await import('@/lib/supabase');
        const userData = await createOrUpdateUser({
          email: session.user.email!,
          name: session.user.name || 'Unknown User',
          image: session.user.image || undefined,
        });
        userId = userData.user_id;
        // Update the session with the new user ID
        (session.user as any).supabaseUserId = userId;
        console.log('User created with ID:', userId);
      } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
      }
    }

    console.log('Updating user with data:', { gender, age, weight, height, onboarding_completed });

    // Prepare update data for users table, only include fields that are provided
    const userUpdateData: any = {
      onboarding_completed,
      updated_at: new Date().toISOString(),
    };

    if (gender !== undefined) userUpdateData.gender = gender;
    if (age !== undefined) userUpdateData.age = age;
    if (weight !== undefined) userUpdateData.weight = weight;
    if (height !== undefined) userUpdateData.height = height;

    // Use UPSERT to ensure the user exists and update the data
    const { error: userUpdateError } = await supabase
      .from('users')
      .upsert({
        user_id: userId,
        user_email: session.user.email!,
        name: session.user.name || 'Unknown User',
        image: session.user.image || undefined,
        ...userUpdateData,
      }, {
        onConflict: 'user_id'
      });

    if (userUpdateError) {
      console.error('Error updating user:', userUpdateError);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    // If target_weight is provided, also update nutrition_goals table
    if (target_weight !== undefined) {
      try {
        const { createOrUpdateNutritionGoals } = await import('@/lib/db/nutrition');
        await createOrUpdateNutritionGoals(userId, {
          user_id: userId,
          daily_calories: 2000, // Default values
          daily_protein: 150,
          daily_carbs: 250,
          daily_fat: 65,
          daily_fiber: 25,
          target_weight,
          weight_goal: 'maintain', // Default weight goal
          activity_level: 'moderately_active', // Default activity level
        });
        console.log('Nutrition goals updated with target weight');
      } catch (error) {
        console.error('Error updating nutrition goals:', error);
        // Don't fail the entire request if nutrition goals update fails
      }
    }

    console.log('User updated successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in onboarding API:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).supabaseUserId;
    if (!userId) {
      return NextResponse.json({ onboarding_completed: false });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ onboarding_completed: false });
    }

    return NextResponse.json({ onboarding_completed: user.onboarding_completed || false });
  } catch (error) {
    console.error('Error in onboarding GET API:', error);
    return NextResponse.json({ onboarding_completed: false });
  }
} 