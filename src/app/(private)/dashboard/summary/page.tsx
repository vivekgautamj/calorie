"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, Target } from "lucide-react";
import BackButton from "@/components/back-button";

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

export default function SummaryPage() {
  const { data: session } = useSession();
  const [todayTotals, setTodayTotals] = useState<NutritionTotals | null>(null);
  const [weeklyTotals, setWeeklyTotals] = useState<NutritionTotals | null>(null);
  const [monthlyTotals, setMonthlyTotals] = useState<NutritionTotals | null>(null);
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [activeTab, setActiveTab] = useState("today");
  const [loading, setLoading] = useState<string | null>(null);

  // Only load goals once when component mounts
  useEffect(() => {
    if (session?.user?.email && !goals) {
      loadGoals();
    }
  }, [session?.user?.email, goals]);

  const loadTodayNutrition = async () => {
    if (todayTotals) return; // Already loaded
    setLoading("today");
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`/api/nutrition?date=${today}&type=daily`);
      const data = await response.json();
      if (data.totals) {
        setTodayTotals(data.totals);
      }
    } catch (error) {
      console.error("Error loading today's nutrition:", error);
    } finally {
      setLoading(null);
    }
  };

  const loadWeeklyNutrition = async () => {
    if (weeklyTotals) return; // Already loaded
    setLoading("weekly");
    try {
      const response = await fetch(`/api/nutrition?type=weekly`);
      const data = await response.json();
      if (data.totals) {
        setWeeklyTotals(data.totals);
      }
    } catch (error) {
      console.error("Error loading weekly nutrition:", error);
    } finally {
      setLoading(null);
    }
  };

  const loadMonthlyNutrition = async () => {
    if (monthlyTotals) return; // Already loaded
    setLoading("monthly");
    try {
      const response = await fetch(`/api/nutrition?type=monthly`);
      const data = await response.json();
      if (data.totals) {
        setMonthlyTotals(data.totals);
      }
    } catch (error) {
      console.error("Error loading monthly nutrition:", error);
    } finally {
      setLoading(null);
    }
  };

  const loadGoals = async () => {
    try {
      const response = await fetch("/api/goals");
      const data = await response.json();
      if (data.goals) {
        setGoals(data.goals);
      }
    } catch (error) {
      console.error("Error loading goals:", error);
    }
  };

  // Load data when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "today" && !todayTotals) {
      loadTodayNutrition();
    } else if (value === "weekly" && !weeklyTotals) {
      loadWeeklyNutrition();
    } else if (value === "monthly" && !monthlyTotals) {
      loadMonthlyNutrition();
    }
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const renderNutritionCard = (totals: NutritionTotals | null, period: string, isLoading: boolean) => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            {period} Progress
            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!totals && !isLoading ? (
            <div className="text-center text-gray-500 py-8">
              Click on the tab to load {period.toLowerCase()} data
            </div>
          ) : totals ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-lg">
                <div className="text-sm font-medium text-emerald-700">Calories</div>
                <div className="text-2xl font-bold text-emerald-900">{totals.calories}</div>
                <div className="text-xs text-emerald-600">/ {goals?.daily_calories || 2000}</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-700">Protein</div>
                <div className="text-2xl font-bold text-blue-900">{totals.protein.toFixed(1)}g</div>
                <div className="text-xs text-blue-600">/ {goals?.daily_protein || 150}g</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-purple-700">Carbs</div>
                <div className="text-2xl font-bold text-purple-900">{totals.carbs.toFixed(1)}g</div>
                <div className="text-xs text-purple-600">/ {goals?.daily_carbs || 250}g</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-sm font-medium text-orange-700">Fat</div>
                <div className="text-2xl font-bold text-orange-900">{totals.fat.toFixed(1)}g</div>
                <div className="text-xs text-orange-600">/ {goals?.daily_fat || 65}g</div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your summary.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton href="/dashboard" />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Nutrition Summary</h1>
          <p className="text-gray-600 mt-2">Track your nutrition progress over time</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Today
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Monthly
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            {renderNutritionCard(todayTotals, "Today", loading === "today")}
          </TabsContent>

          <TabsContent value="weekly">
            {renderNutritionCard(weeklyTotals, "Weekly", loading === "weekly")}
          </TabsContent>

          <TabsContent value="monthly">
            {renderNutritionCard(monthlyTotals, "Monthly", loading === "monthly")}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 