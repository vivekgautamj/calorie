"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { User, Mail, LogOut, Shield, Target, Activity, Scale, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BackButton from "@/components/back-button";
import { toast } from "sonner";

interface ExtendedUser {
  userId?: string;
}

interface UserGoals {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  weight_goal: 'lose' | 'maintain' | 'gain';
  target_weight?: number;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  daily_fiber: number;
}

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const [goals, setGoals] = useState<UserGoals>({
    weight: 70,
    height: 170,
    age: 30,
    gender: 'male',
    activity_level: 'moderately_active',
    weight_goal: 'maintain',
    target_weight: 70,
    daily_calories: 2000,
    daily_protein: 150,
    daily_carbs: 250,
    daily_fat: 65,
    daily_fiber: 25,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to get user info with fallbacks
  const getUserInfo = () => {
    const user = session?.user;
    return {
      name: user?.name || "Unknown User",
      email: user?.email || "No email available",
      image: user?.image || "/images/avatar.png",
      id: user?.id || "Not available",
      userId: (user as ExtendedUser)?.userId || "Not available",
      isVerified: !!user?.email,
      memberSince: user ? new Date().toLocaleDateString() : "Unknown",
    };
  };

  const userInfo = getUserInfo();

  // Calculate BMI
  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = (weight: number, height: number, age: number, gender: string) => {
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = (bmr: number, activityLevel: string) => {
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9,
    };
    return bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];
  };

  // Calculate nutrition goals based on weight goal
  const calculateNutritionGoals = (tdee: number, weightGoal: string) => {
    let adjustedCalories = tdee;
    
    if (weightGoal === 'lose') {
      adjustedCalories = tdee - 500; // 500 calorie deficit for weight loss
    } else if (weightGoal === 'gain') {
      adjustedCalories = tdee + 300; // 300 calorie surplus for weight gain
    }

    return {
      calories: Math.round(adjustedCalories),
      protein: Math.round(adjustedCalories * 0.3 / 4), // 30% of calories from protein
      carbs: Math.round(adjustedCalories * 0.45 / 4),  // 45% of calories from carbs
      fat: Math.round(adjustedCalories * 0.25 / 9),    // 25% of calories from fat
      fiber: 25, // Standard fiber recommendation
    };
  };

  // Load user goals
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const response = await fetch('/api/goals');
        const data = await response.json();
        if (data.goals) {
          setGoals(prev => ({ ...prev, ...data.goals }));
        }
      } catch (error) {
        console.error('Error loading goals:', error);
      }
    };

    if (session?.user) {
      loadGoals();
    }
  }, [session]);

  // Update goals when user data changes
  const updateGoals = async () => {
    setIsLoading(true);
    try {
      const bmr = calculateBMR(goals.weight, goals.height, goals.age, goals.gender);
      const tdee = calculateTDEE(bmr, goals.activity_level);
      const nutritionGoals = calculateNutritionGoals(tdee, goals.weight_goal);

      const updatedGoals = {
        ...goals,
        ...nutritionGoals,
      };

      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGoals),
      });

      if (response.ok) {
        setGoals(updatedGoals);
        setIsEditing(false);
        toast.success('Goals updated successfully!');
      } else {
        toast.error('Failed to update goals');
      }
    } catch (error) {
      console.error('Error updating goals:', error);
      toast.error('Failed to update goals');
    } finally {
      setIsLoading(false);
    }
  };

  const currentBMI = calculateBMI(goals.weight, goals.height);
  const bmr = calculateBMR(goals.weight, goals.height, goals.age, goals.gender);
  const tdee = calculateTDEE(bmr, goals.activity_level);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <BackButton href="/dashboard/clashes" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Card */}
            <Card className="bg-white shadow-sm">
              <CardContent>
                <div className="flex flex-col items-center gap-6 py-6">
                  {/* Avatar */}
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg">
                    <Image
                      src={userInfo.image}
                      alt={userInfo.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* User Info */}
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Name
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {userInfo.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Email
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {userInfo.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BMI & Health Stats */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-600" />
                  Health Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-emerald-700">BMI</span>
                      <span className="text-lg font-bold text-emerald-900">{currentBMI}</span>
                    </div>
                    <div className="text-xs text-emerald-600">
                      {parseFloat(currentBMI) < 18.5 ? 'Underweight' :
                       parseFloat(currentBMI) < 25 ? 'Normal weight' :
                       parseFloat(currentBMI) < 30 ? 'Overweight' : 'Obese'}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">BMR</span>
                      <span className="text-lg font-bold text-blue-900">{Math.round(bmr)} cal</span>
                    </div>
                    <div className="text-xs text-blue-600">Basal Metabolic Rate</div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-700">TDEE</span>
                      <span className="text-lg font-bold text-purple-900">{Math.round(tdee)} cal</span>
                    </div>
                    <div className="text-xs text-purple-600">Total Daily Energy Expenditure</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nutrition Goals Section */}
          <div className="mt-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    Nutrition Goals
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit Goals'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={goals.weight}
                          onChange={(e) => setGoals(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={goals.height}
                          onChange={(e) => setGoals(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={goals.age}
                          onChange={(e) => setGoals(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={goals.gender} onValueChange={(value: 'male' | 'female') => setGoals(prev => ({ ...prev, gender: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="activity">Activity Level</Label>
                        <Select value={goals.activity_level} onValueChange={(value: any) => setGoals(prev => ({ ...prev, activity_level: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sedentary">Sedentary</SelectItem>
                            <SelectItem value="lightly_active">Lightly Active</SelectItem>
                            <SelectItem value="moderately_active">Moderately Active</SelectItem>
                            <SelectItem value="very_active">Very Active</SelectItem>
                            <SelectItem value="extremely_active">Extremely Active</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="weightGoal">Weight Goal</Label>
                        <Select value={goals.weight_goal} onValueChange={(value: 'lose' | 'maintain' | 'gain') => setGoals(prev => ({ ...prev, weight_goal: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lose">Lose Weight</SelectItem>
                            <SelectItem value="maintain">Maintain Weight</SelectItem>
                            <SelectItem value="gain">Gain Weight</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={updateGoals} disabled={isLoading} className="flex-1">
                        {isLoading ? 'Updating...' : 'Update Goals'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <div className="text-sm font-medium text-emerald-700">Daily Calories</div>
                      <div className="text-2xl font-bold text-emerald-900">{goals.daily_calories}</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-700">Protein (g)</div>
                      <div className="text-2xl font-bold text-blue-900">{goals.daily_protein}</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-sm font-medium text-purple-700">Carbs (g)</div>
                      <div className="text-2xl font-bold text-purple-900">{goals.daily_carbs}</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="text-sm font-medium text-orange-700">Fat (g)</div>
                      <div className="text-2xl font-bold text-orange-900">{goals.daily_fat}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Stats */}
          <div className="mt-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700">
                          Subscription
                        </p>
                        <p className="text-purple-900 font-semibold">
                          Coming soon
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-purple-600 text-purple-700"
                      >
                        Free
                      </Badge>
                    </div>
                  </div>

                  {/* Logout Section */}
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-700">
                          Sign Out
                        </p>
                        <p className="text-red-600 text-xs">
                          Sign out of your account
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="border-red-600 text-red-700 hover:bg-red-100"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
