"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ClashForm, ClashOption } from "@/components/ClashForm";
import BackButton from "@/components/back-button";

interface ClashFormValues {
  title: string;
  description: string;
  options: ClashOption[];
  showCta: boolean;
  showResults: boolean;
  ctaText: string;
  ctaUrl: string;
  expireAfter: string;
}

interface Clash {
  id: string;
  title: string;
  description: string;
  options: Array<{
    id: string;
    text?: string;
    title?: string;
    image_url?: string;
  }>;
  cta_text: string;
  cta_url: string;
  show_cta: boolean;
  show_results: boolean;
  expires_at: string;
}

const EditClashPage = () => {
  const router = useRouter();
  const { clashId } = useParams();
  const [clash, setClash] = useState<Clash | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchClash = async () => {
      setLoading(true);
      const res = await fetch(`/api/clashes/${clashId}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to fetch clash");
        router.push("/dashboard");
        return;
      }
      setClash(data);
      setLoading(false);
    };
    if (clashId) fetchClash();
  }, [clashId, router]);

  const handleUpdateClash = async (values: ClashFormValues) => {
    setSaving(true);
    try {
      // Upload all images first using signed URLs (if changed)
      const uploadedOptions = await Promise.all(values.options.map(async (option: ClashOption) => {
        if (option.image_file) {
          const signedUrlResponse = await fetch('/api/upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: option.image_file.name,
              fileType: option.image_file.type,
              fileSize: option.image_file.size,
            }),
          });
          if (!signedUrlResponse.ok) {
            const uploadError = await signedUrlResponse.json();
            throw new Error(uploadError.error || 'Failed to get upload URL');
          }
          const { signedUrl, publicUrl } = await signedUrlResponse.json();
          await fetch(signedUrl, {
            method: 'PUT',
            body: option.image_file,
            headers: { 'Content-Type': option.image_file.type },
          });
          return { ...option, image_url: publicUrl, image_file: undefined };
        }
        return option;
      }));
      // Update the clash
      const response = await fetch(`/api/clashes/${clashId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title.trim(),
          description: values.description.trim(),
          options: uploadedOptions.map(({ id, title, image_url }) => ({
            id,
            title: title.trim(),
            image_url: image_url || undefined,
          })),
          show_cta: values.showCta,
          show_results: values.showResults,
          cta_text: values.ctaText,
          cta_url: values.ctaUrl,
          expires_at: new Date(Date.now() + parseInt(values.expireAfter) * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update clash");
      }
      toast.success("Clash updated successfully");
      router.push(`/dashboard/view/${clashId}`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update clash");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-40">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading clash...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!clash) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-40">
              <div className="text-center">
                <p className="text-gray-600">Clash not found</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <BackButton href="/dashboard/clashes" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Clash</h1>
            <p className="text-gray-600">Update your A/B test settings</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <ClashForm
              mode="edit"
              initialValues={{
                title: clash.title,
                description: clash.description,
                options: clash.options.map((opt) => ({
                  ...opt,
                  title: opt.title ?? ""
                })),
                ctaText: clash.cta_text,
                ctaUrl: clash.cta_url,
                showCta: clash.show_cta,
                showResults: clash.show_results,
                expireAfter: clash.expires_at
                  ? String(Math.max(1, Math.round((new Date(clash.expires_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000))))
                  : "1",
              }}
              onSubmit={handleUpdateClash}
              isLoading={saving}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditClashPage;
