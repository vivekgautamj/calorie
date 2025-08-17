"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { User, UserCheck, SkipForward, Save } from "lucide-react";
import { toast } from "sonner";

interface OnboardingData {
  gender: 'male' | 'female' | null;
  age: number;
  weight: number;
  height: number;
  target_weight: number;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
}

export default function Onboarding() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Debug logging
  console.log('Onboarding component loaded, session:', session);
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    gender: null,
    age: 25,
    weight: 70,
    height: 170,
    target_weight: 70,
    daily_calories: 2000,
    daily_protein: 150,
    daily_carbs: 250,
    daily_fat: 65,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [hasSkipped, setHasSkipped] = useState(false);

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!session?.user?.email) {
        console.log('No session found, waiting for authentication...');
        setIsCheckingStatus(false);
        return;
      }
      
      // If user has skipped, don't check status again
      if (hasSkipped) {
        console.log('User has skipped, not checking status');
        setIsCheckingStatus(false);
        return;
      }
      
      try {
        console.log('Checking onboarding status for user:', session.user.email);
        const response = await fetch('/api/onboarding');
        
        if (!response.ok) {
          console.error('Failed to check onboarding status:', response.status);
          setIsCheckingStatus(false);
          return;
        }
        
        const data = await response.json();
        console.log('Onboarding status check:', data);
        
        if (data.onboarding_completed) {
          console.log('User has already completed onboarding, redirecting to dashboard');
          window.location.href = '/dashboard';
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkOnboardingStatus();
  }, [session?.user?.email, hasSkipped]);

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setData(prev => ({ ...prev, gender }));
  };

  const handleSave = async () => {
    console.log('Save button clicked, session:', session);
    
    if (!session?.user?.email) {
      toast.error("Please log in first");
      return;
    }

    // Validate required data
    if (!data.gender) {
      toast.error("Please select your gender");
      return;
    }

    console.log('Saving data:', data);
    setIsLoading(true);
    
    try {
      console.log('Step 1: Saving nutrition goals...');
      // Save nutrition goals
      const goalsResponse = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          daily_calories: data.daily_calories,
          daily_protein: data.daily_protein,
          daily_carbs: data.daily_carbs,
          daily_fat: data.daily_fat,
          target_weight: data.target_weight,
        }),
      });

      console.log('Goals response status:', goalsResponse.status);
      
      if (!goalsResponse.ok) {
        const errorText = await goalsResponse.text();
        console.error("Goals API error:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Failed to save goals");
        } catch (parseError) {
          throw new Error(`Failed to save goals: ${errorText}`);
        }
      }

      console.log('Step 2: Saving onboarding data...');
      // Mark onboarding as complete and save health data
      const onboardingResponse = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: data.gender,
          age: data.age,
          weight: data.weight,
          height: data.height,
          target_weight: data.target_weight,
          onboarding_completed: true,
        }),
      });

      console.log('Onboarding response status:', onboardingResponse.status);

      if (!onboardingResponse.ok) {
        const errorText = await onboardingResponse.text();
        console.error("Onboarding API error:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Failed to save onboarding data");
        } catch (parseError) {
          throw new Error(`Failed to save onboarding data: ${errorText}`);
        }
      }

      console.log('Step 3: Success! Redirecting...');
      toast.success("Welcome! Your profile is set up.");
      console.log('Redirecting to dashboard after successful save...');
      setShouldRedirect(true);
      // Force a hard redirect to ensure the layout picks up the updated onboarding status
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    console.log('Skip button clicked, session:', session);
    
    if (!session?.user?.email) {
      console.log('No session, redirecting to dashboard');
      window.location.href = "/dashboard";
      return;
    }

    setIsLoading(true);
    try {
      console.log('Step 1: Marking onboarding as completed...');
      
      // Mark onboarding as completed even when skipping
      const onboardingResponse = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: null,
          age: 25,
          weight: 70,
          height: 170,
          onboarding_completed: true,
        }),
      });

      console.log('Onboarding response status:', onboardingResponse.status);

      if (!onboardingResponse.ok) {
        const errorText = await onboardingResponse.text();
        console.error("Failed to mark onboarding as completed:", errorText);
        // Still redirect even if API fails, but show a warning
        toast.error("Warning: Could not save skip status, but continuing to dashboard");
        console.log('API failed, redirecting to dashboard anyway...');
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
        return;
      }

      const responseData = await onboardingResponse.json();
      console.log('Onboarding response data:', responseData);

      console.log('Step 2: Onboarding marked as completed, redirecting to dashboard');
      setShouldRedirect(true);
      // Force a hard redirect to ensure the layout picks up the updated onboarding status
      // Add a longer delay to ensure the database update is committed
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      // Always redirect to dashboard even on error
      console.log('Error occurred, redirecting to dashboard anyway...');
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Welcome! Let's get to know you</CardTitle>
        <p className="text-center text-gray-600">This helps us personalize your nutrition goals</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3">Gender</label>
          <div className="flex gap-4 justify-center">
            <Button
              variant={data.gender === 'male' ? 'default' : 'outline'}
              size="lg"
              onClick={() => handleGenderSelect('male')}
              className="flex flex-col items-center gap-2 p-4"
            >
              <User className="w-6 h-6" />
              <span>Male</span>
            </Button>
            <Button
              variant={data.gender === 'female' ? 'default' : 'outline'}
              size="lg"
              onClick={() => handleGenderSelect('female')}
              className="flex flex-col items-center gap-2 p-4"
            >
              <UserCheck className="w-6 h-6" />
              <span>Female</span>
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Age: {data.age} years
          </label>
          <Slider
            value={[data.age]}
            onValueChange={(value) => setData(prev => ({ ...prev, age: value[0] }))}
            max={100}
            min={10}
            step={1}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Height: {data.height} cm
          </label>
          <Slider
            value={[data.height]}
            onValueChange={(value) => setData(prev => ({ ...prev, height: value[0] }))}
            max={250}
            min={100}
            step={1}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Current Weight: {data.weight} kg
          </label>
          <Slider
            value={[data.weight]}
            onValueChange={(value) => setData(prev => ({ ...prev, weight: value[0] }))}
            max={300}
            min={10}
            step={1}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Target Weight: {data.target_weight} kg
          </label>
          <Slider
            value={[data.target_weight]}
            onValueChange={(value) => setData(prev => ({ ...prev, target_weight: value[0] }))}
            max={300}
            min={10}
            step={1}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSkip} 
            variant="outline" 
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <SkipForward className="w-4 h-4 mr-2" />
            )}
            Skip
          </Button>
          <Button 
            onClick={() => setCurrentStep(2)} 
            className="flex-1"
            disabled={!data.gender || isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            Next
          </Button>
        </div>
        
        {/* Debug button - remove in production */}
        <Button 
          onClick={async () => {
            try {
              const response = await fetch('/api/test-onboarding');
              const data = await response.json();
              console.log('Current onboarding status:', data);
              alert(`Onboarding completed: ${data.onboarding_completed}`);
            } catch (error) {
              console.error('Error checking status:', error);
            }
          }}
          variant="outline"
          size="sm"
          className="w-full mt-2"
        >
          Debug: Check Status
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Set Your Nutrition Goals</CardTitle>
        <p className="text-center text-gray-600">You can adjust these later in your profile</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3">
            Daily Calories: {data.daily_calories}
          </label>
          <Slider
            value={[data.daily_calories]}
            onValueChange={(value) => setData(prev => ({ ...prev, daily_calories: value[0] }))}
            max={5000}
            min={100}
            step={50}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Daily Protein: {data.daily_protein}g
          </label>
          <Slider
            value={[data.daily_protein]}
            onValueChange={(value) => setData(prev => ({ ...prev, daily_protein: value[0] }))}
            max={300}
            min={50}
            step={5}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Daily Carbs: {data.daily_carbs}g
          </label>
          <Slider
            value={[data.daily_carbs]}
            onValueChange={(value) => setData(prev => ({ ...prev, daily_carbs: value[0] }))}
            max={500}
            min={100}
            step={10}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Daily Fat: {data.daily_fat}g
          </label>
          <Slider
            value={[data.daily_fat]}
            onValueChange={(value) => setData(prev => ({ ...prev, daily_fat: value[0] }))}
            max={150}
            min={30}
            step={5}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setCurrentStep(1)} variant="outline" className="flex-1">
            Back
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save & Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      {isCheckingStatus ? (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Loading...</CardTitle>
            <p className="text-center text-gray-600">Checking your profile status</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          </CardContent>
        </Card>
      ) : shouldRedirect ? (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Setup Complete!</CardTitle>
            <p className="text-center text-gray-600">Redirecting to dashboard...</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <Button 
              onClick={() => window.location.href = "/dashboard"}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        currentStep === 1 ? renderStep1() : renderStep2()
      )}
    </div>
  );
} 