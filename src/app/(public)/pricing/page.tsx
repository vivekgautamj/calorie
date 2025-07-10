import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Shield, Users, BarChart3 } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              One payment. Lifetime access. No hidden fees, no subscriptions, no surprises.
            </p>
          </div>

          {/* Main Pricing Card */}
          <div className="flex justify-center mb-16">
            <Card className="max-w-2xl w-full relative overflow-hidden">
              {/* Popular Badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-bl-lg">
                <span className="text-sm font-semibold">MOST POPULAR</span>
              </div>
              
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-3xl mb-2">Lifetime Access</CardTitle>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">$20</span>
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
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited clash creation</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited voting participation</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Advanced analytics & insights</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Device fingerprinting protection</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Custom branding options</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Priority customer support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">All future updates included</span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-6">
                  <Link href="/" className="block">
                    <Button size="lg" className="w-full h-12 text-lg font-semibold">
                      Get Lifetime Access - $20
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
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Zap className="h-8 w-8 text-blue-500" />
                </div>
                <CardTitle>No Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Pay once and use CLSH forever. No monthly fees, no hidden charges.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle>Risk-Free</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  30-day money-back guarantee. If you're not satisfied, we'll refund you.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
                <CardTitle>Best Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  At just $20, it's less than most monthly subscriptions cost.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Comparison */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Why CLSH vs Others?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-green-600">CLSH - $20 Lifetime</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      One-time payment
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      No recurring fees
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      All features included
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Future updates free
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-red-600">Other Platforms</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <span className="text-red-500 mr-2">✗</span>
                      Monthly subscriptions
                    </li>
                    <li className="flex items-center">
                      <span className="text-red-500 mr-2">✗</span>
                      Hidden fees
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
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What's included in the $20 payment?</h4>
                <p className="text-gray-600">Everything! Unlimited clash creation, voting, analytics, and all future updates. No additional costs ever.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
                <p className="text-gray-600">Yes! You can create and vote on clashes for free. The $20 payment unlocks unlimited creation and advanced features.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What if I'm not satisfied?</h4>
                <p className="text-gray-600">We offer a 30-day money-back guarantee. If you're not happy with CLSH, we'll refund your payment, no questions asked.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Do I need to pay for updates?</h4>
                <p className="text-gray-600">No! All future updates and new features are included in your lifetime access at no additional cost.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 