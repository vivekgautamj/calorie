"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  Activity, 
  Apple, 
  Dumbbell,
  BarChart3,
  Clock,
  Flame
} from "lucide-react";
import { toast } from "sonner";

interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

interface NutritionGoals {
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  daily_fiber: number;
}

interface SummaryData {
  totals: NutritionTotals;
  goals: NutritionGoals;
  entries: any[];
  exercise_entries: any[];
}

export default function SummaryPage() {
  const { data: session } = useSession();
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [activePeriod, setActivePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      loadSummaryData();
    }
  }, [session, activePeriod]);

  const loadSummaryData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/nutrition?type=${activePeriod}`);
      const data = await response.json();
      
      if (data.success) {
        setSummaryData(data);
      } else {
        toast.error('Failed to load summary data');
      }
    } catch (error) {
      console.error('Error loading summary data:', error);
      toast.error('Failed to load summary data');
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getPeriodTitle = () => {
    switch (activePeriod) {
      case 'daily':
        return 'Today';
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
      default:
        return 'Summary';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Mobile App Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">
                {getPeriodTitle()} Summary
              </h1>
              <p className="text-xs text-gray-600">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-20">
        {/* Period Selector */}
        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <Tabs value={activePeriod} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setActivePeriod(value)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="daily" className="text-xs">Today</TabsTrigger>
                <TabsTrigger value="weekly" className="text-xs">Week</TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {summaryData && (
          <>
            {/* Nutrition Overview */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Flame className="w-4 h-4 text-emerald-600" />
                  Nutrition Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Calories */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Calories</span>
                    <span className="text-emerald-600 font-semibold">
                      {summaryData.totals.calories} / {summaryData.goals.daily_calories}
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(summaryData.totals.calories, summaryData.goals.daily_calories)} 
                    className="h-1.5 bg-gray-100"
                  />
                </div>

                {/* Protein */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Protein</span>
                    <span className="text-emerald-600 font-semibold">
                      {summaryData.totals.protein.toFixed(1)}g / {summaryData.goals.daily_protein}g
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(summaryData.totals.protein, summaryData.goals.daily_protein)} 
                    className="h-1.5 bg-gray-100"
                  />
                </div>

                {/* Carbs */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Carbs</span>
                    <span className="text-emerald-600 font-semibold">
                      {summaryData.totals.carbs.toFixed(1)}g / {summaryData.goals.daily_carbs}g
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(summaryData.totals.carbs, summaryData.goals.daily_carbs)} 
                    className="h-1.5 bg-gray-100"
                  />
                </div>

                {/* Fat */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Fat</span>
                    <span className="text-emerald-600 font-semibold">
                      {summaryData.totals.fat.toFixed(1)}g / {summaryData.goals.daily_fat}g
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(summaryData.totals.fat, summaryData.goals.daily_fat)} 
                    className="h-1.5 bg-gray-100"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Apple className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-medium text-gray-700">Food Entries</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-900">
                    {summaryData.entries?.length || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-medium text-gray-700">Exercise</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-900">
                    {summaryData.exercise_entries?.length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Entries */}
            {summaryData.entries && summaryData.entries.length > 0 && (
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    Recent Entries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {summaryData.entries.slice(0, 5).map((entry: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {entry.type === 'food' ? (
                            <Apple className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Dumbbell className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="text-sm font-medium">{entry.food_name}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {entry.calories} cal
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!summaryData && (
          <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-2">No data available</p>
              <p className="text-sm text-gray-500">Start adding food and exercise to see your summary</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 