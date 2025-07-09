"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getFullUrl } from "@/lib/config";
import BackButton from "@/components/back-button";

interface ClashOption {
  id: string;
  text: string;
  title: string;
  image_url: string;
}

interface Clash {
  id: string;
  title: string;
  description: string;
  status: string;
  expires_at: string | null;
  slug: string | null;
  cta_text: string;
  cta_url: string;
  options: ClashOption[];
}

interface Analytics {
  totalViews: number;
  uniqueViews: number;
  totalVotes: number;
  winningOption: number | number[];
  topReferrers: Array<{
    referrer: string;
    count: number;
  }>;
  votesTimeSeries: Array<{
    date: string;
    votes: number;
  }>;
}

const ViewClashPage = () => {
  const { clashId } = useParams();
  const router = useRouter();
  const [clash, setClash] = useState<Clash | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClashAndAnalytics = async () => {
      setLoading(true);
      const clashRes = await fetch(`/api/clashes/${clashId}`);
      const clashData = await clashRes.json();
      setClash(clashData);
      const analyticsRes = await fetch(`/api/clashes/${clashId}/analytics`);
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);
      setLoading(false);
    };
    fetchClashAndAnalytics();
  }, [clashId]);

  const handleDelete = async () => {
    setDeleting(true);
    const response = await fetch(`/api/clashes/${clashId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      toast.success("Clash deleted");
      router.push("/dashboard/clashes");
    } else {
      toast.error("Failed to delete clash");
    }
    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  if (!clash) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-sm text-muted-foreground">
          Clash not found or deleted
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton href="/dashboard/clashes" />
        <div className="hidden md:block">
          <Button
            className="w-fit bg-blue-50 text-blue-600 hover:bg-blue-100"
            asChild
          >
            <Link href="/dashboard/clashes">
              <ArrowLeft className="w-4 h-4" />
              Back to Clashes
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{clash.title}</h1>
        <p className="text-sm text-muted-foreground">{clash.description}</p>
        <div className="flex flex-row gap-2">
          <Badge variant="outline">{clash.status}</Badge>
          <Badge variant="outline">
            {clash.expires_at
              ? new Date(clash.expires_at).toLocaleString()
              : "-"}
          </Badge>
        </div>
        <div className="flex flex-row gap-2">
          <Button variant="outline">Edit</Button>
          <Button variant="destructive" onClick={() => setOpen(true)}>
            Delete
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              navigator.clipboard.writeText(
                getFullUrl(`/vote/${clash.slug || clash.id}`)
              );
              toast.success("Link copied!");
            }}
          >
            Copy Link
          </Button>
          {typeof window !== "undefined" && "share" in navigator && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.share({
                  title: clash.title,
                  text: "Vote on this clash!",
                  url: getFullUrl(`/vote/${clash.slug || clash.id}`),
                });
              }}
            >
              Share
            </Button>
          )}
        </div>
        <div className="flex flex-row gap-2">CTA Text: {clash.cta_text}</div>
        <div className="flex flex-row gap-2">CTA URL: {clash.cta_url}</div>
        <div className="flex flex-row gap-2">
          {clash.options.map((option: ClashOption, idx: number) => (
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
        {/* Poll Results */}
        {analytics && (
          <>
            {Array.isArray(analytics.winningOption) ? (
              <div>
                Draw between:{" "}
                {analytics.winningOption
                  .map((idx: number) => clash.options[idx].text)
                  .join(" & ")}
              </div>
            ) : (
              <div>Winner: {clash.options[analytics.winningOption].title}</div>
            )}
          </>
        )}
        {/* Detailed Analytics */}
        {analytics && (
          <div className="mt-6 space-y-2">
            <div>Total Views: {analytics.totalViews}</div>
            <div>Unique Views: {analytics.uniqueViews}</div>
            <div>Total Votes: {analytics.totalVotes}</div>
            <div>Top Referrers:</div>
            <ul className="list-disc ml-6">
              {analytics?.topReferrers?.map((ref) => (
                <li key={ref.referrer}>
                  {ref.referrer} ({ref.count})
                </li>
              ))}
            </ul>
            <div>Votes Over Time:</div>
            <ul className="list-disc ml-6">
              {analytics?.votesTimeSeries?.map((v) => (
                <li key={v.date}>
                  {v.date}: {v.votes} votes
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All analytics and everything related
              to this <u className=" text-destructive">clash will be deleted</u>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="text-white bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ViewClashPage;
