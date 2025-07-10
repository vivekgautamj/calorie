"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, ReactNode } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { Loader2, Copy, Share2, Home, CheckCircle } from "lucide-react";
import { TimeRemaining } from "@/components/TimeRemaining";

interface ClashOption {
  title: string;
  id: string;
  image_url: string;
}

interface Clash {
  id: string;
  title: string;
  description: string;
  cta_text: string;
  cta_url: string;
  options: ClashOption[];
  expires_at?: string | null;
  error?: string;
}

const VotePage = () => {
  const { slug } = useParams();

  const [clash, setClash] = useState<Clash | null>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState("");
  const [userAgent, setUserAgent] = useState("");

  console.log(slug);

  const fetchClash = useCallback(async () => {
    const response = await fetch(`/api/vote/${slug}`);
    const data = await response.json();
    console.log(data);
    setClash(data);
    setLoading(false);

    if (data.error) {
      toast.error(data.error);
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchClash();
    // Get user agent
    if (typeof window !== 'undefined') {
      setUserAgent(window.navigator.userAgent);
      // Get device fingerprint
      FingerprintJS.load().then(fp => {
        fp.get().then(result => {
          setDeviceFingerprint(result.visitorId);
        });
      });
    }
  }, [fetchClash]);

  // Track page view when all info is available
  useEffect(() => {
    if (clash && deviceFingerprint && userAgent) {
      fetch('/api/track_clash_view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clash_id: clash.id,
          device_fingerprint: deviceFingerprint,
          user_agent: userAgent,
          referer: document.referrer || "direct"
        }),
      });
    }
  }, [clash, deviceFingerprint, userAgent]);

  const handleVote = async (option: number) => {
    if (!clash || submitting) return;
    
    setSubmitting(true);
    setSelectedOption(option);
    
    try {
      const response = await fetch(`/api/vote/${slug}`, {
        method: "POST",
        body: JSON.stringify({
          option,
          clash_id: clash.id,
          device_fingerprint: deviceFingerprint,
          user_agent: userAgent,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data);
      
      if (data.error && data.error.includes("You have already voted")) {
        toast.error(data.error);
        setVoted(true);
      } else {
        toast.success("Voted successfully!");
        setVoted(true);
      }
    } catch (error) {
      toast.error("Failed to submit vote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium text-gray-700">Loading voting page...</p>
        </div>
      </div>
    );
  }

  if (!clash) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <p className="text-lg font-medium text-gray-700">Clash not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {clash.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            {clash.description}
          </p>
          {clash.expires_at && (
            <div className="flex justify-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                <TimeRemaining expiresAt={clash.expires_at} />
              </div>
            </div>
          )}
        </div>

        {/* Voting Options */}
        {!voted && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {clash.options.map((option: ClashOption, idx: number) => (
              <Card 
                key={idx} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                  selectedOption === idx && submitting ? 'ring-2 ring-blue-500' : ''
                } flex flex-col items-center justify-center min-h-56`}
                onClick={() => !submitting && handleVote(idx)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center h-full w-full">
                  <div className="flex flex-col items-center text-center space-y-4 w-full">
                    {/* A/B Badge */}
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg my-4 ${idx === 0 ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}
                      style={{ margin: '0 auto' }}>
                      {idx === 0 ? 'A' : 'B'}

                     

                    </div>
                    {/* Image or Text */}
                    {option.image_url && (
                      <div className="relative w-60 h-60 my-4 mx-auto">
                        <Image
                          src={option.image_url}
                          alt={option.title}
                          fill
                          className="rounded-lg object-contain"
                        />
                      </div>
                    )} 
                    
                      <div className="flex items-center justify-center w-full p-6 my-10 min-h-16 bg-gray-50 border border-dashed border-gray-200 rounded-lg mb-2">
                        {/* Empty space for text-only, keeps card height consistent */}
                        <h3 className="text-xl font-semibold text-gray-900 w-full break-words">
                      {option.title}
                    </h3>
                      </div>
                   
                    {/* Option Text */}
                   
                  </div>
                  {submitting && selectedOption === idx && (
                    <div className="flex items-center space-x-2 text-blue-600 mt-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm font-medium">Submitting vote...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* After Voting */}
        {voted && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-700">Thanks for voting!</CardTitle>
              <CardDescription className="text-lg">
                Your vote has been recorded successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* CTA Button */}
              {clash.cta_url && (
                <div className="text-center">
                  <Link href={clash.cta_url} target="_blank">
                    <Button size="lg" className="w-full md:w-auto">
                      {clash.cta_text}
                    </Button>
                  </Link>
                </div>
              )}

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Home
                  </Button>
                </Link>
              </div>

              {/* Share Section */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Share this voting link
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== "undefined" ? window.location.href : ""}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Link copied to clipboard!");
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  
                  {typeof window !== "undefined" && "share" in navigator && (
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          navigator.share({
                            title: clash.title,
                            text: "Vote on this clash!",
                            url: window.location.href,
                          });
                        }}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VotePage;
