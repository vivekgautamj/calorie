"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { User, Mail, Target, Save, Activity, Scale, TrendingUp, Edit, Calendar, Ruler, Weight, Heart, Zap } from "lucide-react";
import { toast } from "sonner";

interface NutritionGoals {
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  weight_goal?: 'lose' | 'maintain' | 'gain';
  target_weight?: number;
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
}

interface UserHealthData {
  age: number;
  height: number;
  weight: number;
  gender: 'male' | 'female';
}

const ProfilePage = () => {
  const { data: session } = useSession();
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [userHealth, setUserHealth] = useState<UserHealthData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [tempHealth, setTempHealth] = useState<UserHealthData>({
    age: 25,
    height: 170,
    weight: 70,
    gender: 'male',
  });
  const [tempGoals, setTempGoals] = useState<NutritionGoals>({
    daily_calories: 2000,
    daily_protein: 150,
    daily_carbs: 250,
    daily_fat: 65,
    weight_goal: 'maintain',
    target_weight: 70,
    activity_level: 'moderately_active',
  });

  // Calculate BMI using the correct formula: weight (kg) / height (m)²
  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // Get BMI category
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal weight', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-orange-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  // Calculate BMR using Mifflin-St Jeor Equation (most accurate)
  const calculateBMR = (weight: number, height: number, age: number, gender: 'male' | 'female') => {
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = (bmr: number, activityLevel: string) => {
    const activityMultipliers = {
      sedentary: 1.2,           // Little to no exercise
      lightly_active: 1.375,     // Light exercise 1-3 days/week
      moderately_active: 1.55,   // Moderate exercise 3-5 days/week
      very_active: 1.725,        // Hard exercise 6-7 days/week
      extremely_active: 1.9      // Very hard exercise, physical job
    };
    return bmr * (activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.55);
  };

  // Calculate recommended calories for weight goal
  const calculateRecommendedCalories = (tdee: number, weightGoal: string, currentWeight: number, targetWeight: number) => {
    if (weightGoal === 'maintain' || Math.abs(currentWeight - targetWeight) < 1) {
      return tdee;
    } else if (weightGoal === 'lose') {
      // 500 calorie deficit for ~0.5kg/week weight loss
      return Math.max(tdee - 500, 1200); // Minimum 1200 calories for women, 1500 for men
    } else if (weightGoal === 'gain') {
      // 300-500 calorie surplus for healthy weight gain
      return tdee + 300;
    }
    return tdee;
  };

  // Calculate recommended protein intake
  const calculateRecommendedProtein = (weight: number, weightGoal: string, activityLevel: string) => {
    let proteinMultiplier = 1.6; // Default for moderate activity
    
    // Adjust based on activity level
    if (activityLevel === 'very_active' || activityLevel === 'extremely_active') {
      proteinMultiplier = 1.8;
    } else if (activityLevel === 'lightly_active') {
      proteinMultiplier = 1.4;
    } else if (activityLevel === 'sedentary') {
      proteinMultiplier = 1.2;
    }

    // Adjust based on weight goal
    if (weightGoal === 'lose') {
      proteinMultiplier += 0.2; // Higher protein for weight loss to preserve muscle
    } else if (weightGoal === 'gain') {
      proteinMultiplier += 0.1; // Slightly higher for muscle building
    }

    return Math.round(weight * proteinMultiplier);
  };

  // Calculate recommended fat intake
  const calculateRecommendedFat = (calories: number) => {
    // 20-35% of total calories from fat
    const fatCalories = calories * 0.25; // 25% as middle ground
    return Math.round(fatCalories / 9); // 9 calories per gram of fat
  };

  // Calculate recommended carbs intake
  const calculateRecommendedCarbs = (calories: number, protein: number, fat: number) => {
    const proteinCalories = protein * 4; // 4 calories per gram of protein
    const fatCalories = fat * 9; // 9 calories per gram of fat
    const remainingCalories = calories - proteinCalories - fatCalories;
    return Math.round(remainingCalories / 4); // 4 calories per gram of carbs
  };

  // Generate personalized nutrition advice
  const generateNutritionAdvice = () => {
    if (!userHealth || !goals) return null;

    const bmr = calculateBMR(userHealth.weight, userHealth.height, userHealth.age, userHealth.gender);
    const tdee = calculateTDEE(bmr, goals.activity_level || 'moderately_active');
    const recommendedCalories = calculateRecommendedCalories(
      tdee, 
      goals.weight_goal || 'maintain', 
      userHealth.weight, 
      goals.target_weight || userHealth.weight
    );
    const recommendedProtein = calculateRecommendedProtein(
      userHealth.weight, 
      goals.weight_goal || 'maintain', 
      goals.activity_level || 'moderately_active'
    );
    const recommendedFat = calculateRecommendedFat(recommendedCalories);
    const recommendedCarbs = calculateRecommendedCarbs(recommendedCalories, recommendedProtein, recommendedFat);

    const weightDifference = (goals.target_weight || userHealth.weight) - userHealth.weight;
    const isMaintaining = Math.abs(weightDifference) < 1;

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      recommendedCalories,
      recommendedProtein,
      recommendedFat,
      recommendedCarbs,
      weightDifference,
      isMaintaining,
      advice: generateAdviceText(weightDifference, userHealth.weight, goals.weight_goal || 'maintain')
    };
  };

  // Generate personalized advice text
  const generateAdviceText = (weightDifference: number, currentWeight: number, weightGoal: string) => {
    if (Math.abs(weightDifference) < 1) {
      return {
        title: "Maintain Your Current Weight",
        description: "Your target weight is the same as your current weight. Focus on maintaining a balanced diet and regular exercise routine.",
        tips: [
          "Eat at your maintenance calorie level",
          "Include strength training 2-3 times per week",
          "Stay active with regular cardio",
          "Monitor your weight weekly"
        ]
      };
    } else if (weightDifference > 0) {
      return {
        title: "Healthy Weight Gain Plan",
        description: `To reach your target weight of ${currentWeight + weightDifference}kg, focus on a gradual, healthy weight gain approach.`,
        tips: [
          "Eat 300-500 calories above maintenance",
          "Prioritize protein for muscle building",
          "Include strength training 3-4 times per week",
          "Eat frequent meals throughout the day"
        ]
      };
    } else {
      return {
        title: "Healthy Weight Loss Plan",
        description: `To reach your target weight of ${currentWeight + weightDifference}kg, focus on a sustainable weight loss approach.`,
        tips: [
          "Create a 500 calorie daily deficit",
          "Prioritize protein to preserve muscle",
          "Include both cardio and strength training",
          "Eat plenty of fiber-rich foods"
        ]
      };
    }
  };

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('Loading user data...');
        
        // Load nutrition goals
        const goalsResponse = await fetch('/api/goals');
        const goalsData = await goalsResponse.json();
        console.log('Goals data:', goalsData);
        if (goalsData.goals) {
          setGoals(goalsData.goals);
        }

        // Load user health data
        const healthResponse = await fetch('/api/user-health');
        const healthData = await healthResponse.json();
        console.log('Health data:', healthData);
        if (healthData.health) {
          setUserHealth(healthData.health);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (session?.user?.email) {
      loadUserData();
    }
  }, [session?.user?.email]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempGoals),
      });

      if (response.ok) {
        setGoals(tempGoals);
        setIsEditing(false);
        toast.success('Goals saved successfully!');
      } else {
        toast.error('Failed to save goals');
      }
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error('Failed to save goals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setTempGoals(goals || {
      daily_calories: 2000,
      daily_protein: 150,
      daily_carbs: 250,
      daily_fat: 65,
      weight_goal: 'maintain',
      target_weight: 70,
      activity_level: 'moderately_active',
    });
    setIsEditing(true);
  };

  const handleEditHealth = () => {
    setTempHealth(userHealth || {
      age: 25,
      height: 170,
      weight: 70,
      gender: 'male',
    });
    setIsEditingHealth(true);
  };

  const handleSaveHealth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user-health', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempHealth),
      });

      if (response.ok) {
        setUserHealth(tempHealth);
        setIsEditingHealth(false);
        toast.success('Health data saved successfully!');
      } else {
        toast.error('Failed to save health data');
      }
    } catch (error) {
      console.error('Error saving health data:', error);
      toast.error('Failed to save health data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF8C42] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const bmi = userHealth ? calculateBMI(userHealth.weight, userHealth.height) : null;
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;
  
  // Debug logging
  console.log('Profile page state:', {
    userHealth,
    goals,
    isLoadingData,
    bmi,
    bmiCategory
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      <div className="max-w-3xl mx-auto p-4 pb-24">
        {/* User Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-600">Name</Label>
              <p className="text-lg font-semibold">{session?.user?.name || "Unknown User"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <p className="text-sm text-gray-700">{session?.user?.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Health Metrics */}
        {userHealth ? (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Health Metrics
                </CardTitle>
                {!isEditingHealth && (
                  <Button
                    onClick={handleEditHealth}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingHealth ? (
                <div className="space-y-6">
                  <div>
                    <Label className="block text-sm font-medium mb-3">
                      Age: {tempHealth.age} years
                    </Label>
                    <Slider
                      value={[tempHealth.age]}
                      onValueChange={(value) => setTempHealth(prev => ({ ...prev!, age: value[0] }))}
                      max={100}
                      min={10}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-medium mb-3">
                      Height: {tempHealth.height} cm
                    </Label>
                    <Slider
                      value={[tempHealth.height]}
                      onValueChange={(value) => setTempHealth(prev => ({ ...prev!, height: value[0] }))}
                      max={250}
                      min={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-medium mb-3">
                      Weight: {tempHealth.weight} kg
                    </Label>
                    <Slider
                      value={[tempHealth.weight]}
                      onValueChange={(value) => setTempHealth(prev => ({ ...prev!, weight: value[0] }))}
                      max={300}
                      min={30}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-medium mb-3">Gender</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={tempHealth.gender === 'male' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTempHealth(prev => ({ ...prev!, gender: 'male' }))}
                      >
                        Male
                      </Button>
                      <Button
                        variant={tempHealth.gender === 'female' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTempHealth(prev => ({ ...prev!, gender: 'female' }))}
                      >
                        Female
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setIsEditingHealth(false)} 
                      variant="outline" 
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveHealth} 
                      className="flex-1 bg-[#FF8C42] hover:bg-[#FFB380]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Basic Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-[#FF8C42]" />
                        <span className="text-sm font-medium text-orange-700">Age</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-orange-900">{userHealth.age} years</span>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Ruler className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Height</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-900">{userHealth.height} cm</span>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Weight className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">Current Weight</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-purple-900">{userHealth.weight} kg</span>
                      </div>
                    </div>
                    <div className="p-4 bg-pink-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-pink-600" />
                        <span className="text-sm font-medium text-pink-700">Gender</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-pink-900 capitalize">{userHealth.gender}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Body Mass Index (BMI)</h3>
                        
                        {/* BMI Scale */}
                        <div className="relative mb-3">
                          <div className="flex h-3 rounded-full overflow-hidden">
                            <div className="flex-1 bg-blue-400"></div>
                            <div className="flex-1 bg-green-400"></div>
                            <div className="flex-1 bg-yellow-400"></div>
                            <div className="flex-1 bg-red-400"></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>Underweight</span>
                            <span>Healthy</span>
                            <span>Overweight</span>
                            <span>Obese</span>
                          </div>
                          
                          {/* BMI Indicator */}
                          {bmi && (
                            <div 
                              className="absolute top-0 transform -translate-x-1/2 w-2 h-3 bg-gray-800 rounded-full"
                              style={{ 
                                left: `${Math.min(Math.max((parseFloat(bmi) - 15) / (40 - 15) * 100, 0), 100)}%` 
                              }}
                            ></div>
                          )}
                        </div>
                        
                        {/* Your BMI */}
                        <div className="text-center mb-2">
                          <span className="text-sm text-gray-600">Your BMI: </span>
                          <span className="text-xl font-bold text-gray-900">{bmi}</span>
                        </div>
                        
                        {/* BMI Status */}
                        {bmiCategory && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                              <span className="text-sm font-medium text-green-800">
                                {bmiCategory.category === 'Normal weight' ? 'Healthy BMI: Good starting BMI to tone up and get your dream body.' : 
                                 bmiCategory.category === 'Underweight' ? 'Underweight: Consider gaining healthy weight with proper nutrition.' :
                                 bmiCategory.category === 'Overweight' ? 'Overweight: Focus on balanced nutrition and regular exercise.' :
                                 'Obese: Consult with a healthcare provider for a personalized plan.'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Weight Goals */}
                  {goals?.target_weight && (
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-medium text-indigo-700">Target Weight</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-indigo-900">{goals.target_weight} kg</span>
                      </div>
                      {goals.weight_goal && (
                        <div className="text-xs font-medium text-indigo-600 capitalize">
                          Goal: {goals.weight_goal} weight
                        </div>
                      )}
                    </div>
                  )}

                  {/* Personalized Nutrition Advice */}
                  {(() => {
                    const advice = generateNutritionAdvice();
                    if (!advice) return null;
                    
                    return (
                      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-blue-800">Personalized Nutrition Advice</h3>
                        </div>
                        
                        {/* Current vs Recommended */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-3 bg-white rounded-lg border border-blue-100">
                            <div className="text-sm font-medium text-blue-700 mb-1">Current Goals</div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>Calories: {goals?.daily_calories || 0}</div>
                              <div>Protein: {goals?.daily_protein || 0}g</div>
                              <div>Carbs: {goals?.daily_carbs || 0}g</div>
                              <div>Fat: {goals?.daily_fat || 0}g</div>
                            </div>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-green-100">
                            <div className="text-sm font-medium text-green-700 mb-1">Recommended</div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>Calories: {advice.recommendedCalories}</div>
                              <div>Protein: {advice.recommendedProtein}g</div>
                              <div>Carbs: {advice.recommendedCarbs}g</div>
                              <div>Fat: {advice.recommendedFat}g</div>
                            </div>
                          </div>
                        </div>

                        {/* Metabolism Info */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="p-2 bg-white rounded border border-gray-200 text-center">
                            <div className="text-xs text-gray-500">BMR</div>
                            <div className="text-sm font-semibold text-gray-800">{advice.bmr} cal</div>
                          </div>
                          <div className="p-2 bg-white rounded border border-gray-200 text-center">
                            <div className="text-xs text-gray-500">TDEE</div>
                            <div className="text-sm font-semibold text-gray-800">{advice.tdee} cal</div>
                          </div>
                        </div>

                        {/* Personalized Advice */}
                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                          <h4 className="font-semibold text-blue-800 mb-2">{advice.advice.title}</h4>
                          <p className="text-sm text-gray-700 mb-3">{advice.advice.description}</p>
                          
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-blue-700">Key Recommendations:</div>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {advice.advice.tips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Apply Recommendations Button */}
                        <div className="mt-4 flex justify-center">
                          <Button 
                            onClick={() => {
                              setTempGoals(prev => ({
                                ...prev!,
                                daily_calories: advice.recommendedCalories,
                                daily_protein: advice.recommendedProtein,
                                daily_carbs: advice.recommendedCarbs,
                                daily_fat: advice.recommendedFat
                              }));
                              setIsEditing(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Apply Recommended Goals
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Health Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Health Data</h3>
                <p className="text-gray-600 mb-4">Add your health metrics to get personalized nutrition advice</p>
                <Button 
                  onClick={() => {
                    setTempHealth({
                      age: 25,
                      height: 170,
                      weight: 70,
                      gender: 'male',
                    });
                    setIsEditingHealth(true);
                  }} 
                  className="bg-[#FF8C42] hover:bg-[#FFB380]"
                >
                  Add Health Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nutrition Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Nutrition Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!goals && !isEditing ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Goals Set</h3>
                <p className="text-gray-600 mb-4">Set your daily nutrition targets to track your progress</p>
                <Button onClick={handleEdit} className="bg-[#FF8C42] hover:bg-[#FFB380]">
                  Set Goals
                </Button>
              </div>
            ) : isEditing ? (
              <div className="space-y-6">
                <div>
                  <Label className="block text-sm font-medium mb-3">
                    Daily Calories: {tempGoals.daily_calories}
                  </Label>
                  <Slider
                    value={[tempGoals.daily_calories]}
                    onValueChange={(value) => setTempGoals(prev => ({ ...prev!, daily_calories: value[0] }))}
                    max={5000}
                    min={100}
                    step={50}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-3">
                    Daily Protein: {tempGoals.daily_protein}g
                  </Label>
                  <Slider
                    value={[tempGoals.daily_protein]}
                    onValueChange={(value) => setTempGoals(prev => ({ ...prev!, daily_protein: value[0] }))}
                    max={300}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-3">
                    Daily Carbs: {tempGoals.daily_carbs}g
                  </Label>
                  <Slider
                    value={[tempGoals.daily_carbs]}
                    onValueChange={(value) => setTempGoals(prev => ({ ...prev!, daily_carbs: value[0] }))}
                    max={500}
                    min={100}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-3">
                    Daily Fat: {tempGoals.daily_fat}g
                  </Label>
                  <Slider
                    value={[tempGoals.daily_fat]}
                    onValueChange={(value) => setTempGoals(prev => ({ ...prev!, daily_fat: value[0] }))}
                    max={150}
                    min={30}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-3">
                    Target Weight: {tempGoals.target_weight} kg
                  </Label>
                  <Slider
                    value={[tempGoals.target_weight || 70]}
                    onValueChange={(value) => setTempGoals(prev => ({ ...prev!, target_weight: value[0] }))}
                    max={300}
                    min={30}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-3">Weight Goal</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={tempGoals.weight_goal === 'lose' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTempGoals(prev => ({ ...prev!, weight_goal: 'lose' }))}
                    >
                      Lose Weight
                    </Button>
                    <Button
                      variant={tempGoals.weight_goal === 'maintain' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTempGoals(prev => ({ ...prev!, weight_goal: 'maintain' }))}
                    >
                      Maintain
                    </Button>
                    <Button
                      variant={tempGoals.weight_goal === 'gain' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTempGoals(prev => ({ ...prev!, weight_goal: 'gain' }))}
                    >
                      Gain Weight
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-3">Activity Level</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant={tempGoals.activity_level === 'sedentary' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTempGoals(prev => ({ ...prev!, activity_level: 'sedentary' }))}
                    >
                      Sedentary (Little to no exercise)
                    </Button>
                    <Button
                      variant={tempGoals.activity_level === 'lightly_active' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTempGoals(prev => ({ ...prev!, activity_level: 'lightly_active' }))}
                    >
                      Lightly Active (1-3 days/week)
                    </Button>
                    <Button
                      variant={tempGoals.activity_level === 'moderately_active' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTempGoals(prev => ({ ...prev!, activity_level: 'moderately_active' }))}
                    >
                      Moderately Active (3-5 days/week)
                    </Button>
                    <Button
                      variant={tempGoals.activity_level === 'very_active' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTempGoals(prev => ({ ...prev!, activity_level: 'very_active' }))}
                    >
                      Very Active (6-7 days/week)
                    </Button>
                    <Button
                      variant={tempGoals.activity_level === 'extremely_active' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTempGoals(prev => ({ ...prev!, activity_level: 'extremely_active' }))}
                    >
                      Extremely Active (Athlete)
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => setIsEditing(false)} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    className="flex-1 bg-[#FF8C42] hover:bg-[#FFB380]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Daily Calories</span>
                  <span className="text-lg font-semibold">{goals?.daily_calories}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Daily Protein</span>
                  <span className="text-lg font-semibold">{goals?.daily_protein}g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Daily Carbs</span>
                  <span className="text-lg font-semibold">{goals?.daily_carbs}g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Daily Fat</span>
                  <span className="text-lg font-semibold">{goals?.daily_fat}g</span>
                </div>
                {goals?.target_weight && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Target Weight</span>
                    <span className="text-lg font-semibold">{goals.target_weight} kg</span>
                  </div>
                )}
                {goals?.weight_goal && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Weight Goal</span>
                    <span className="text-lg font-semibold capitalize">{goals.weight_goal}</span>
                  </div>
                )}
                {goals?.activity_level && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Activity Level</span>
                    <span className="text-lg font-semibold capitalize">{goals.activity_level.replace('_', ' ')}</span>
                  </div>
                )}
                <Button 
                  onClick={handleEdit} 
                  variant="outline" 
                  className="w-full mt-4"
                >
                  Edit Goals
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
