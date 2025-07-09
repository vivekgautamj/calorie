"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Pencil, Plus, Trash, BarChart3, Eye, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { getFullUrl } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Option {
  text: string;
  image_url: string;
}

interface Clash {
  id: string;
  title: string;
  description: string;
  created_at: string;
  status: string;
  show_cta: boolean;
  slug?: string;
  options: Option[];
}

interface Analytics {
  totalClashesCreated: number;
  totalVotes: number;
  totalViews: number;
  topClash?: {
    title: string;
    votes: number;
    views: number;
  };
}

const ClashesPage = () => {
  const [clashes, setClashes] = useState<Clash[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clashToDelete, setClashToDelete] = useState<Clash | null>(null);
  const router = useRouter();

  const fetchClashes = async () => {
    fetch("/api/clashes")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setClashes(data.clashes);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
  };
  
  useEffect(() => {
    fetchClashes();
    fetchAnalytics();
  }, []);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/clashes/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setClashes(clashes.filter((clash) => clash.id !== id));
      toast.success("Clash deleted");
      fetchClashes();
    } else {
      toast.error("Failed to delete clash");
    }
    setDeleteDialogOpen(false);
    setClashToDelete(null);
  };

  const openDeleteDialog = (clash: Clash) => {
    setClashToDelete(clash);
    setDeleteDialogOpen(true);
  };

    return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-muted-foreground">My Clashes</h1>
        </div>
        <Button
          onClick={() => router.push("/dashboard/create")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Clash
        </Button>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Clashes</p>
                  <p className="text-2xl font-bold">{analytics.totalClashesCreated}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Votes</p>
                  <p className="text-2xl font-bold">{analytics.totalVotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{analytics.totalViews || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Top Clash</p>
                  <p className="text-sm font-semibold truncate">
                    {analytics.topClash?.title || "None"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Clashes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Clashes</span>
            <Badge variant="outline">{clashes.length} clashes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : clashes.length > 0 ? (
            <div className="grid gap-6">
              {clashes.map((clash) => (
                <div key={clash.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{clash.title}</h3>
                      <p className="text-muted-foreground mb-3">{clash.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Created: {new Date(clash.created_at).toLocaleDateString()}</span>
                        <Badge variant={clash.status === 'active' ? 'default' : 'secondary'}>
                          {clash.status}
                        </Badge>
                        {clash.show_cta && <Badge variant="outline">CTA Enabled</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/view/${clash.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/edit/${clash.id}`)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
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
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteDialog(clash)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Thumbnail Options */}
                  <div className="grid grid-cols-2 gap-4">
                    {clash.options.map((option, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Image
                          src={option.image_url}
                          alt={option.text}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover"
                        />
                        <span className="text-sm font-medium">{option.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No clashes yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first AB test to start getting insights
              </p>
              <Button
                onClick={() => router.push("/dashboard/create")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Clash
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Clash</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{clashToDelete?.title}"? This action cannot be undone and will permanently remove all data associated with this clash including votes, views, and analytics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clashToDelete && handleDelete(clashToDelete.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Clash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClashesPage;
