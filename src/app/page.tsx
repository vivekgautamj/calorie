"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Apple, Smartphone, Brain, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 text-gray-900 flex flex-col justify-center items-center px-4">
      <header className="w-full max-w-6xl mx-auto flex flex-col items-center pt-16 pb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-emerald-600">CalorieAI</h1>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-4">
          Track Your <span className="text-emerald-600">Nutrition</span> with AI
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 text-center mb-8 max-w-3xl">
          Simply chat with our AI nutritionist about what you ate or exercised. Get instant nutritional analysis, track your progress, and achieve your health goals effortlessly.
        </p>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-12 w-full max-w-4xl">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-emerald-600" />
            </div>
                            <h3 className="text-xl font-semibold mb-2">AI Nutritionist</h3>
                <p className="text-gray-600">Our advanced AI nutritionist understands natural language and provides accurate nutritional breakdowns for any food or exercise.</p>
          </div>
          
         
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Insights</h3>
            <p className="text-gray-600">Get daily, weekly, and monthly summaries with progress tracking and personalized recommendations.</p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="w-full flex justify-center mb-8">
          <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-emerald-200 max-w-2xl w-full aspect-video bg-white">
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Nutritionist Chat</h3>
                <p className="text-gray-600">"I ate 2 roti and a bowl of dal"</p>
                <p className="text-sm text-emerald-600 mt-2">→ Instant nutritional analysis</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
          <Link href="/login" passHref legacyBehavior>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 text-lg shadow-lg">
              Start Tracking Now
            </Button>
          </Link>
          <Link href="/about" passHref legacyBehavior>
            <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-600 font-bold px-8 py-4 text-lg shadow-lg hover:bg-emerald-600 hover:text-white">
              Learn More
            </Button>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Apple className="w-4 h-4" />
            <span>PWA Ready</span>
          </div>
          <div className="hidden md:block">•</div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span>AI Powered</span>
          </div>
          <div className="hidden md:block">•</div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Smart Analytics</span>
          </div>
        </div>
      </header>
    </div>
  );
}
