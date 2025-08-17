"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Calendar, User, Bell, Target, Zap } from "lucide-react";
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
}

interface NutritionGoals {
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
}

// Nutrition Widget Component
const NutritionWidget = ({ nutritionData }: { nutritionData: any }) => (
  <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
    <div className="flex items-center gap-2 mb-2">
      <Target className="w-4 h-4 text-orange-600" />
      <span className="text-sm font-semibold text-orange-800">Nutrition Added</span>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="text-center p-2 bg-white rounded-lg border border-orange-100">
        <div className="text-lg font-bold text-orange-600">{nutritionData.calories}</div>
        <div className="text-xs text-orange-700">calories</div>
      </div>
      <div className="text-center p-2 bg-white rounded-lg border border-orange-100">
        <div className="text-lg font-bold text-blue-600">{nutritionData.protein}g</div>
        <div className="text-xs text-blue-700">protein</div>
      </div>
      <div className="text-center p-2 bg-white rounded-lg border border-orange-100">
        <div className="text-lg font-bold text-green-600">{nutritionData.carbs}g</div>
        <div className="text-xs text-green-700">carbs</div>
      </div>
      <div className="text-center p-2 bg-white rounded-lg border border-orange-100">
        <div className="text-lg font-bold text-purple-600">{nutritionData.fat}g</div>
        <div className="text-xs text-purple-700">fat</div>
      </div>
    </div>
  </div>
);

// Reusable Components
const CalorieCard = ({ todayTotals, goals }: { todayTotals: NutritionTotals; goals: NutritionGoals }) => (
  <Card className="mb-4 overflow-hidden">
    <div className="bg-gradient-to-b from-[#FF8C42] to-[#FFB380] p-6 text-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm opacity-90">Eaten {todayTotals.calories}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {Math.max(0, goals.daily_calories - todayTotals.calories)}
            </span>
            <span className="text-lg opacity-90">
              {todayTotals.calories > goals.daily_calories ? 'kcal over' : 'kcal remaining'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm opacity-90 mb-2">Burned 651</p>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300" 
            style={{ width: '75%' }}
          ></div>
        </div>
      </div>
    </div>
    
    <CardContent className="p-4">
      <div className="grid grid-cols-3 gap-3">
        {/* Carbs */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-800 mb-1">Carbs</p>
          <p className="text-sm text-gray-600 mb-2">{todayTotals.carbs} / {goals.daily_carbs}g</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#FF8C42] to-[#FFB380] h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min((todayTotals.carbs / goals.daily_carbs) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Protein */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-800 mb-1">Protein</p>
          <p className="text-sm text-gray-600 mb-2">{todayTotals.protein} / {goals.daily_protein}g</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#FF8C42] h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min((todayTotals.protein / goals.daily_protein) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Fat */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-800 mb-1">Fat</p>
          <p className="text-sm text-gray-600 mb-2">{todayTotals.fat} / {goals.daily_fat}g</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#FF8C42] to-[#FFB380] h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min((todayTotals.fat / goals.daily_fat) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const FoodSummaryCard = ({ dailyEntries }: { dailyEntries: any[] }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-lg">Today's Food Summary</CardTitle>
    </CardHeader>
    <CardContent>
      {dailyEntries.length > 0 ? (
        <div className="space-y-3">
          {dailyEntries.map((entry, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#FF8C42] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">🍽️</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{entry.food_name}</p>
                    <p className="text-sm text-gray-600">{entry.quantity} {entry.unit}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#FF8C42]">{entry.calories} cal</p>
                <p className="text-xs text-gray-500">
                  {entry.protein}g P • {entry.carbs}g C • {entry.fat}g F
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No food entries today</p>
          <p className="text-sm">Start tracking your meals to see them here</p>
        </div>
      )}
    </CardContent>
  </Card>
);

const ChatInterface = ({ 
  messages, 
  input, 
  setInput, 
  sendMessage, 
  handleKeyPress, 
  isLoading, 
  isLoadingData 
}: {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  isLoadingData: boolean;
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Card className="h-full">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoadingData ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p>Tell me what you ate today...</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.is_user ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.is_user
                      ? 'bg-[#FF8C42] text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  {message.nutrition_data && (
                    <NutritionWidget nutritionData={message.nutrition_data} />
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 animate-pulse" />
                  <p className="text-sm">Analyzing your food...</p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me what you ate today..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="bg-[#FF8C42] hover:bg-[#FFB380]"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
  });
  const [goals, setGoals] = useState<NutritionGoals>({
    daily_calories: 2000,
    daily_protein: 150,
    daily_carbs: 250,
    daily_fat: 65,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dailyEntries, setDailyEntries] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user?.email && messages.length === 0) {
      loadAllData();
    }
  }, [session?.user?.email, messages.length]);

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
      } else {
        // Use default goals if none exist
        setGoals({
          daily_calories: 2000,
          daily_protein: 150,
          daily_carbs: 250,
          daily_fat: 65,
        });
      }
    } catch (error) {
      console.error("Error loading goals:", error);
      // Use default goals on error
      setGoals({
        daily_calories: 2000,
        daily_protein: 150,
        daily_carbs: 250,
        daily_fat: 65,
      });
    }
  };

  const loadDailyEntries = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`/api/nutrition?date=${today}&type=daily`);
      const data = await response.json();
      if (data.entries) {
        setDailyEntries(data.entries);
      }
    } catch (error) {
      console.error("Error loading daily entries:", error);
    }
  };

  const loadAllData = async () => {
    setIsLoadingData(true);
    try {
      await Promise.all([
        loadChatHistory(),
        loadTodayNutrition(),
        loadGoals(),
        loadDailyEntries(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoadingData(false);
    }
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
          await loadDailyEntries();
          toast.success("Nutrition data added!");
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

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      

      <div className="max-w-7xl mx-auto p-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex gap-6 h-[calc(100vh-200px)]">
          {/* Left Side - Summary */}
          <div className="w-1/2 space-y-6">
            <CalorieCard todayTotals={todayTotals} goals={goals} />
            <FoodSummaryCard dailyEntries={dailyEntries} />
          </div>

          {/* Right Side - Chat Interface */}
          <div className="w-1/2">
            <ChatInterface
              messages={messages}
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              handleKeyPress={handleKeyPress}
              isLoading={isLoading}
              isLoadingData={isLoadingData}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          <CalorieCard todayTotals={todayTotals} goals={goals} />
          <FoodSummaryCard dailyEntries={dailyEntries} />
          <div className="h-[calc(100vh-400px)]">
            <ChatInterface
              messages={messages}
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              handleKeyPress={handleKeyPress}
              isLoading={isLoading}
              isLoadingData={isLoadingData}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 