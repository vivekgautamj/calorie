import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard-header";
import MobileNavWrapper from "@/components/mobile-nav-wrapper";
import { supabase } from "@/lib/supabase";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has completed onboarding (skip only checks this)
  const userId = (session.user as any).supabaseUserId;
  console.log('Dashboard layout - userId:', userId);
  
  if (userId) {
    // Check user onboarding status
    const { data: user, error } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .single();

    console.log('Dashboard layout - user data:', user);
    console.log('Dashboard layout - error:', error);

    // If user doesn't exist in database, try to create them or redirect to onboarding
    if (error && error.code === 'PGRST116') {
      console.log('User not found in database, attempting to create user...');
      try {
        const { createOrUpdateUser } = await import('@/lib/supabase');
        const userData = await createOrUpdateUser({
          email: session.user.email!,
          name: session.user.name || 'Unknown User',
          image: session.user.image || undefined,
        });
        console.log('User created successfully, redirecting to onboarding');
        redirect("/onboarding");
      } catch (createError) {
        console.error('Failed to create user:', createError);
        redirect("/onboarding");
      }
    }

    // If there's any other error, log it but don't redirect
    if (error) {
      console.error('Error fetching user:', error);
    }

    // Redirect to onboarding if onboarding is incomplete
    // Note: Users can skip and set nutrition goals later in profile
    if (user && user.onboarding_completed === false) {
      console.log('User has not completed onboarding, redirecting to onboarding');
      redirect("/onboarding");
    }
    
    // If onboarding_completed is null/undefined, allow access to dashboard
    // This handles cases where the user is in the middle of onboarding
    console.log('User can access dashboard, onboarding_completed:', user?.onboarding_completed);
  } else {
    // No userId in session, redirect to onboarding
    console.log('No userId in session, redirecting to onboarding');
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />

      <div className="flex flex-col gap-4">{children}</div>

      <MobileNavWrapper />
    </div>
  );
}
