"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Send, Plus, BarChart3, User, Calendar } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  message: string;
  is_user: boolean;
  created_at: string;
  nutrition_data?: any;
}

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

export default function DashboardPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [todayTotals, setTodayTotals] = useState<NutritionTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  });
  const [goals, setGoals] = useState<NutritionGoals>({
    daily_calories: 2000,
    daily_protein: 150,
    daily_carbs: 250,
    daily_fat: 65,
    daily_fiber: 25,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (session?.user?.email && messages.length === 0) {
      console.log('Loading dashboard data for user:', session.user.email)
      loadAllData();
    }
  }, [session?.user?.email, messages.length]); // Only run when user email changes and messages not loaded

  const loadChatHistory = async () => {
    try {
      const response = await fetch("/api/chat");
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const loadTodayNutrition = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`/api/nutrition?date=${today}&type=daily`);
      const data = await response.json();
      if (data.totals) {
        setTodayTotals(data.totals);
      }
    } catch (error) {
      console.error("Error loading today's nutrition:", error);
    }
  };

  const loadGoals = async () => {
    try {
      console.log('Loading goals...')
      const response = await fetch("/api/goals");
      const data = await response.json();
      if (data.goals) {
        console.log('Goals loaded successfully')
        setGoals(data.goals);
      }
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadAllData = async () => {
    setIsLoadingData(true);
    await Promise.all([
      loadChatHistory(),
      loadTodayNutrition(),
      loadGoals()
    ]);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      message: input,
      is_user: true,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (data.response) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          message: data.response,
          is_user: false,
          created_at: new Date().toISOString(),
          nutrition_data: data.nutritionData,
        };

        setMessages(prev => [...prev, aiMessage]);

        // Reload nutrition data if nutrition was added
        if (data.nutritionData) {
          await loadTodayNutrition();
          toast.success("Nutrition data added successfully!");
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Mobile App Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">
                Hi, {session?.user?.name?.split(" ")[0]}! 👋
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
              <div className="text-sm font-semibold text-emerald-600">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-24">
        {/* Today's Progress - Mobile Optimized */}
        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingData ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Calories</span>
                  <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                </div>
                <Progress value={0} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Protein</span>
                  <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                </div>
                <Progress value={0} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Carbs</span>
                  <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Calories</span>
                  <span className="text-sm font-medium">{todayTotals.calories} / {goals.daily_calories}</span>
                </div>
                <Progress value={getProgressPercentage(todayTotals.calories, goals.daily_calories)} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Protein</span>
                  <span className="text-sm font-medium">{todayTotals.protein.toFixed(1)}g / {goals.daily_protein}g</span>
                </div>
                <Progress value={getProgressPercentage(todayTotals.protein, goals.daily_protein)} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Carbs</span>
                  <span className="text-sm font-medium">{todayTotals.carbs.toFixed(1)}g / {goals.daily_carbs}g</span>
                </div>
                <Progress value={getProgressPercentage(todayTotals.carbs, goals.daily_carbs)} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Interface - Mobile Optimized */}
        <Card className="h-[calc(100vh-280px-100px)] flex flex-col shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4 text-emerald-600" />
              AI Nutritionist
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 space-y-3">
              {isLoadingData ? (
                <div className="text-center text-gray-500 mt-8 px-4">
                  <div className="w-10 h-10 mx-auto mb-3 text-gray-300 animate-spin" />
                  <p className="text-base font-medium mb-2">Loading your data...</p>
                  <p className="text-sm">Please wait while we fetch your nutrition and goals.</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8 px-4">
                  <User className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-base font-medium mb-2">Welcome to your AI Nutritionist! 🎉</p>
                  <p className="text-sm">I'm here to help you track your nutrition and achieve your health goals.</p>
                  <div className="mt-3 space-y-1 text-xs">
                    <p className="font-medium text-emerald-600">Try these examples:</p>
                    <p>• "I ate 2 roti and a bowl of dal"</p>
                    <p>• "I had breakfast with 2 eggs and toast"</p>
                    <p>• "I went for a 30 minute run"</p>
                    <p>• "Show me my weekly summary"</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_user ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                        message.is_user
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.message}</p>
                      {message.nutrition_data && (
                        <div className="mt-2 p-2 bg-white/10 rounded-lg text-xs">
                          <p className="font-semibold">Added to your log:</p>
                          <p>{message.nutrition_data.food_name} - {message.nutrition_data.calories} calories</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input - Mobile Optimized */}
            <div className="p-4 border-t border-gray-100 bg-white/50">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me what you ate or exercised today..."
                  className="bg-white flex-1 text-sm rounded-full border-gray-200 focus:border-emerald-500"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 rounded-full w-10 h-10 p-0"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 