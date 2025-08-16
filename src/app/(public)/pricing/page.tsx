import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Zap, Shield, Brain } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-emerald-600">CalorieAI</h1>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              One payment. Lifetime access. No hidden fees, no subscriptions, no surprises.
            </p>
          </div>

          {/* Main Pricing Card */}
          <div className="flex justify-center mb-16">
            <Card className="max-w-2xl w-full relative overflow-hidden border-emerald-200 shadow-xl">
              {/* Popular Badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-4 py-2 rounded-bl-lg">
                <span className="text-sm font-semibold">MOST POPULAR</span>
              </div>
              
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-3xl mb-2 text-emerald-600">Lifetime Access</CardTitle>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">₹499</span>
                  <span className="text-xl text-gray-600 ml-2">one-time</span>
                </div>
                <CardDescription className="text-lg">
                  Pay once, use forever. No recurring charges.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-500 mr-3" />
                    <span className="text-gray-700">🤖 AI Nutritionist chat interface</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-500 mr-3" />
                    <span className="text-gray-700">📊 Unlimited nutrition tracking</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-500 mr-3" />
                    <span className="text-gray-700">📱 PWA ready (install as mobile app)</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-500 mr-3" />
                    <span className="text-gray-700">📈 Daily, weekly & monthly summaries</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-500 mr-3" />
                    <span className="text-gray-700">🎯 Customizable nutrition goals</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-500 mr-3" />
                    <span className="text-gray-700">🔐 Secure Google authentication</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-500 mr-3" />
                    <span className="text-gray-700">🚀 All future updates included</span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-6">
                  <Link href="/login" className="block">
                    <Button size="lg" className="w-full h-12 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700">
                      Get Lifetime Access - ₹499
                    </Button>
                  </Link>
                </div>

                {/* Guarantee */}
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    🔒 Secure payment • 30-day money-back guarantee
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Why One-Time Payment */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-emerald-100">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Zap className="h-8 w-8 text-emerald-500" />
                </div>
                <CardTitle className="text-emerald-600">No Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Pay once and use CalorieAI forever. No monthly fees, no hidden charges.
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Shield className="h-8 w-8 text-emerald-500" />
                </div>
                <CardTitle className="text-emerald-600">Risk-Free</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  30-day money-back guarantee. If you're not satisfied, we'll refund you.
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Star className="h-8 w-8 text-emerald-500" />
                </div>
                <CardTitle className="text-emerald-600">Best Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  At just ₹499, it's less than most monthly nutrition apps cost.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Comparison */}
          <Card className="mb-16 border-emerald-100">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-emerald-600">Why CalorieAI vs Others?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-emerald-600">CalorieAI - ₹499 Lifetime</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-emerald-500 mr-2" />
                      One-time payment
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-emerald-500 mr-2" />
                      AI-powered nutritionist
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-emerald-500 mr-2" />
                      PWA mobile app
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-emerald-500 mr-2" />
                      Future updates free
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-red-600">Other Nutrition Apps</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <span className="text-red-500 mr-2">✗</span>
                      Monthly subscriptions
                    </li>
                    <li className="flex items-center">
                      <span className="text-red-500 mr-2">✗</span>
                      Manual food entry
                    </li>
                    <li className="flex items-center">
                      <span className="text-red-500 mr-2">✗</span>
                      Limited features
                    </li>
                    <li className="flex items-center">
                      <span className="text-red-500 mr-2">✗</span>
                      Pay for updates
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-emerald-600">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What's included in the ₹499 payment?</h4>
                <p className="text-gray-600">Everything! AI nutritionist chat, unlimited tracking, PWA mobile app, analytics, and all future updates. No additional costs ever.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
                <p className="text-gray-600">Yes! You can try the AI nutritionist chat for free. The ₹499 payment unlocks unlimited tracking and advanced features.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What if I'm not satisfied?</h4>
                <p className="text-gray-600">We offer a 30-day money-back guarantee. If you're not happy with CalorieAI, we'll refund your payment, no questions asked.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Do I need to pay for updates?</h4>
                <p className="text-gray-600">No! All future updates and new features are included in your lifetime access at no additional cost.</p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-12">
            <Link href="/">
              <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 