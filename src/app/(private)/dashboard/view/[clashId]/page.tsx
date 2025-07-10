"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2, BarChart3, Users, Eye, TrendingUp } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

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

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!clash) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-muted-foreground">Clash not found or deleted</p>
      </div>
    );
  }

  const getVotePercentage = (optionIndex: number) => {
    if (!analytics?.totalVotes) return 0;
    // Mock calculation - replace with real data
    const mockVotes = [65, 35]; // Example percentages
    return mockVotes[optionIndex] || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <BackButton href="/dashboard/clashes" />
              <h1 className="text-2xl font-bold text-gray-900">{clash.title}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Link href={`/dashboard/edit/${clashId}`}>Edit</Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Clash Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Clash Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-gray-900">{clash.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={clash.status === 'active' ? 'default' : 'secondary'}>
                    {clash.status}
                  </Badge>
                  {clash.expires_at && (
                    <Badge variant="outline">
                      Expires: {new Date(clash.expires_at).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(getFullUrl(`/vote/${clash.slug || clash.id}`));
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
              </div>
            </div>

            {/* Options Images */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Options</h3>
              <div className="grid grid-cols-2 gap-4">
                {clash.options.map((option, idx) => (
                  <div key={option.id} className="space-y-2">
                    <div 
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-gray-100"
                      onClick={() => handleImageClick(option.image_url)}
                    >
                      <Image
                        src={option.image_url}
                        alt={option.text}
                        width={300}
                        height={300}
                        className="object-cover w-full h-full"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `
                            <div class="flex items-center justify-center w-full h-full bg-gray-200">
                              <div class="text-center">
                                <div class="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                                  <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                </div>
                                <p class="text-xs text-gray-500">Image not available</p>
                              </div>
                            </div>
                          `;
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-end">
                        <div className="p-3 w-full bg-gradient-to-t from-black/60 to-transparent">
                          <p className="text-white text-sm font-medium truncate">{option.text}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{option.text}</p>
                      <p className="text-xs text-gray-500">{getVotePercentage(idx)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalViews}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Unique Views</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.uniqueViews}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Votes</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalVotes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Engagement Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalVotes && analytics.totalViews 
                      ? Math.round((analytics.totalVotes / analytics.totalViews) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vote Results */}
        {analytics && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Vote Results</h3>
            <div className="space-y-4">
              {clash.options.map((option, idx) => {
                const percentage = getVotePercentage(idx);
                return (
                  <div key={option.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{option.text}</span>
                      <span className="text-sm font-medium text-gray-500">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vote Trend Chart */}
        {analytics?.votesTimeSeries && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Votes Over Time</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analytics.votesTimeSeries.map((data, idx) => {
                const maxVotes = Math.max(...analytics.votesTimeSeries.map(d => d.votes));
                const height = maxVotes > 0 ? (data.votes / maxVotes) * 100 : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-600 rounded-t transition-all duration-300 hover:bg-blue-700"
                      style={{ height: `${height}%` }}
                    ></div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {new Date(data.date).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Referrers */}
        {analytics?.topReferrers && analytics.topReferrers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Referrers</h3>
            <div className="space-y-3">
              {analytics.topReferrers.map((ref, idx) => (
                <div key={ref.referrer} className="flex justify-between items-center">
                  <span className="text-sm text-gray-900">{ref.referrer}</span>
                  <span className="text-sm font-medium text-gray-500">{ref.count} visits</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={selectedImage}
                alt="Preview"
                width={600}
                height={600}
                className="object-contain w-full h-full"
                unoptimized
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All analytics and everything related
              to this <u className="text-destructive">clash will be deleted</u>.
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