"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getFullUrl } from "@/lib/config";
import { toast } from "sonner";

interface Option {
  text: string;
  image_url: string;
}

interface Clash {
  id: string;
  title: string;
  description: string;
  created_at: string;
  status: string; // "active" | "expired" | "draft"
  show_cta: boolean;
  slug?: string;
  options: Option[];
  votes?: number; // Add this if available, else mock
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  expired: "Expired",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  expired: "bg-red-100 text-red-700",
  draft: "bg-gray-200 text-gray-700",
};

const SORT_OPTIONS = [
  { label: "Most Recent", value: "recent" },
  { label: "Most Votes", value: "votes" },
];

const FILTERS = [
  { label: "Active", value: "active" },
  { label: "Expired", value: "expired" },
  
];

const ClashesPage = () => {
  const [clashes, setClashes] = useState<Clash[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [sort, setSort] = useState("recent");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/clashes")
      .then((res) => res.json())
      .then((data) => {
        // Mock votes if not present
        const withVotes = (data.clashes || []).map((c: Clash, i: number) => ({
          ...c,
          votes: c.votes ?? Math.floor(Math.random() * 1000),
        }));
        setClashes(withVotes);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        toast.error("Failed to load clashes");
      });
  }, []);

  // Filter and sort
  const filtered = clashes.filter((c) => c.status === filter);
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "votes") return (b.votes || 0) - (a.votes || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Clashes</h1>
            <p className="text-gray-600">Manage and track your A/B tests</p>
          </div>

          {/* Tabs/Filters */}
          <div className="flex gap-2 mb-6">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={`px-4 py-2 rounded-lg font-medium text-sm focus:outline-none transition-colors ${
                  filter === f.value
                    ? STATUS_COLORS[f.value]
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort By */}
          <div className="mb-6 flex items-center gap-2">
            <span className="font-medium text-gray-700 mr-3">Sort by:</span>
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.value}
                className={`px-3 py-1 rounded-md font-medium text-sm focus:outline-none transition-colors ${
                  sort === s.value
                    ? "bg-gray-200 text-gray-900"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
                onClick={() => setSort(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Clash List */}
          <div className="bg-white rounded-lg shadow-sm border">
            {loading ? (
              <div className="flex justify-center items-center py-12 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-lg font-medium mb-2">No clashes found</div>
                <p className="text-sm">Create your first clash to get started</p>
              </div>
            ) : (
              sorted.map((clash) => (
                <div
                  key={clash.id}
                  className="flex items-center justify-between p-6 border-b last:border-b-0 group cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => router.push(`/dashboard/view/${clash.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[clash.status]}`}>
                        {STATUS_LABELS[clash.status]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(clash.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-semibold text-lg mb-1 text-gray-900 group-hover:text-blue-600 transition-colors">
                      {clash.title}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">{clash.description}</div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{clash.votes}</span> votes
                    </div>
                  </div>
                  {clash.options?.[0]?.image_url && (
                    <div className="ml-6 flex-shrink-0">
                      <Image
                        src={clash.options[0].image_url}
                        alt={clash.options[0].text || "thumbnail"}
                        width={120}
                        height={90}
                        className="rounded-lg object-cover w-32 h-24 bg-gray-100 border"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClashesPage;
