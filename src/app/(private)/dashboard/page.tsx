"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Send, Brain, TrendingUp, Calendar, Target } from "lucide-react";
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
  const [inputMessage, setInputMessage] = useState("");
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (session?.user) {
      loadChatHistory();
      loadTodayNutrition();
      loadGoals();
    }
  }, [session]);

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
      const response = await fetch("/api/goals");
      const data = await response.json();
      if (data.goals) {
        setGoals(data.goals);
      }
    } catch (error) {
      console.error("Error loading goals:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      is_user: true,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputMessage }),
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
        <div className="px-4 py-3">
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

      <div className="px-4 py-4 space-y-4 pb-20">
        {/* Today's Progress - Mobile Optimized */}
        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Calories */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Calories</span>
                <span className="text-emerald-600 font-semibold">{todayTotals.calories} / {goals.daily_calories}</span>
              </div>
              <Progress 
                value={getProgressPercentage(todayTotals.calories, goals.daily_calories)} 
                className="h-1.5 bg-gray-100"
              />
            </div>

            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Protein</span>
                <span className="text-emerald-600 font-semibold">{todayTotals.protein.toFixed(1)}g / {goals.daily_protein}g</span>
              </div>
              <Progress 
                value={getProgressPercentage(todayTotals.protein, goals.daily_protein)} 
                className="h-1.5 bg-gray-100"
              />
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Carbs</span>
                <span className="text-emerald-600 font-semibold">{todayTotals.carbs.toFixed(1)}g / {goals.daily_carbs}g</span>
              </div>
              <Progress 
                value={getProgressPercentage(todayTotals.carbs, goals.daily_carbs)} 
                className="h-1.5 bg-gray-100"
              />
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Fat</span>
                <span className="text-emerald-600 font-semibold">{todayTotals.fat.toFixed(1)}g / {goals.daily_fat}g</span>
              </div>
              <Progress 
                value={getProgressPercentage(todayTotals.fat, goals.daily_fat)} 
                className="h-1.5 bg-gray-100"
              />
            </div>

            {/* Fiber */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Fiber</span>
                <span className="text-emerald-600 font-semibold">{todayTotals.fiber.toFixed(1)}g / {goals.daily_fiber}g</span>
              </div>
              <Progress 
                value={getProgressPercentage(todayTotals.fiber, goals.daily_fiber)} 
                className="h-1.5 bg-gray-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Mobile Optimized */}
        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-4 h-4 text-emerald-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-start h-10 text-sm"
              onClick={() => setInputMessage("I had breakfast with 2 eggs and toast")}
            >
              🍳 Add Breakfast
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-start h-10 text-sm"
              onClick={() => setInputMessage("I went for a 30 minute run")}
            >
              🏃‍♂️ Add Exercise
            </Button>
          </CardContent>
        </Card>

        {/* Summary Actions - Mobile Optimized */}
        <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4 text-emerald-600" />
              View Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start h-10 text-sm"
              onClick={() => setInputMessage("Show me my today's summary")}
            >
              📅 Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start h-10 text-sm"
              onClick={() => setInputMessage("Show me my weekly summary")}
            >
              📊 Weekly
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start h-10 text-sm"
              onClick={() => setInputMessage("Show me my monthly summary")}
            >
              📈 Monthly
            </Button>
          </CardContent>
        </Card>

        {/* Chat Interface - Mobile Optimized */}
        <Card className="h-[calc(100vh-280px)] flex flex-col shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="w-4 h-4 text-emerald-600" />
              AI Nutritionist
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8 px-4">
                  <Brain className="w-10 h-10 mx-auto mb-3 text-gray-300" />
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
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Mobile Optimized */}
            <div className="p-4 border-t border-gray-100 bg-white/50">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me what you ate or exercised today..."
                  className="flex-1 text-sm rounded-full border-gray-200 focus:border-emerald-500"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
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