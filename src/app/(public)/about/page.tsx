import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About CLSH
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The modern platform for visual voting and A/B testing that makes decision-making fun and engaging.
            </p>
          </div>

          {/* Mission Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-3xl text-center">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-700 leading-relaxed">
                CLSH was created to solve a simple problem: making A/B testing and visual voting accessible, 
                fun, and effective. We believe that the best decisions come from real user feedback, and 
                we've built a platform that makes it easy to gather that feedback quickly and efficiently.
              </p>
            </CardContent>
          </Card>

          {/* What We Do */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">What We Do</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Create visual voting contests with custom images
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Prevent duplicate votes with device fingerprinting
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Share voting links easily with others
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Provide analytics and insights for creators
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Offer one-time payment for lifetime access
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Why Choose CLSH</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">→</span>
                    Simple and intuitive interface
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">→</span>
                    Fast results in minutes, not days
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">→</span>
                    Mobile-responsive design
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">→</span>
                    Secure and reliable voting system
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">→</span>
                    Affordable one-time payment model
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Use Cases */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-3xl text-center">Perfect For</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="text-xl font-semibold mb-2">Content Creators</h3>
                  <p className="text-gray-600">Test thumbnails, cover images, and visual content</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl mb-4">💼</div>
                  <h3 className="text-xl font-semibold mb-2">Businesses</h3>
                  <p className="text-gray-600">A/B test marketing materials and product designs</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold mb-2">Communities</h3>
                  <p className="text-gray-600">Engage your audience with fun voting contests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
                <CardDescription>
                  Join thousands of users who are already making better decisions with CLSH
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/">
                    <Button size="lg" className="w-full sm:w-auto">
                      Try CLSH Free
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      View Pricing
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-gray-500">
                  One-time payment of $20 for lifetime access
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 