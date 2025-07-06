"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const VotePage = () => {
  const { slug } = useParams();

  const [clash, setClash] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState("");
  const [userAgent, setUserAgent] = useState("");

  console.log(slug);

  const fetchClash = async () => {
    const response = await fetch(`/api/vote/${slug}`);
    const data = await response.json();
    console.log(data);
    setClash(data);
    setLoading(false);

    if (data.error) {
      toast.error(data.error);
      setLoading(false);
    }
  };

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
  }, [slug]);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleVote = async (option: number) => {
    if (!clash) return;
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
      toast.success("Voted successfully");
      setVoted(true);
    }
  };

  return (
    <div>
      <h1>Vote Page</h1>
      <div className="flex flex-row gap-2">
        <h1 className="text-2xl font-bold">{clash.title}</h1>
        <p className="text-sm text-muted-foreground">{clash.description}</p>
        {clash.options.map((option: any, idx: number) => (
          <div className="flex flex-row gap-2" key={idx}>
            <Image
              src={option.image_url}
              alt={option.text}
              width={100}
              height={100}
            />
            <p className="text-sm font-medium">{option.text}</p>
          </div>
        ))}
      </div>
      {clash.options.length > 0 && !voted && (
        <div className="flex flex-row gap-2">
          <Button onClick={() => handleVote(0)} disabled={voted}>A</Button>
          <Button onClick={() => handleVote(1)} disabled={voted}>B</Button>
        </div>
      )}
      {voted && (
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-row gap-2 items-center">
            <p className="text-sm font-medium">Thanks for voting!</p>
            {clash.cta_url && (
              <Link href={clash.cta_url} target="_blank">
                <Button>
                  {clash.cta_text}
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button>Go to home</Button>
            </Link>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-xs text-muted-foreground">Share this voting link:</span>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="border rounded px-2 py-1 w-64 text-xs"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied!");
                }}
              >
                Copy Link
              </Button>
              {typeof window !== "undefined" && "share" in navigator && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.share({
                      title: clash.title,
                      text: "Vote on this clash!",
                      url: window.location.href,
                    });
                  }}
                >
                  Share
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VotePage;
