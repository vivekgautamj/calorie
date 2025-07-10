"use client";

import { useRouter } from "next/navigation";
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

const CreatePage = () => {
  const router = useRouter();

  const handleCreateClash = async (values: ClashFormValues) => {
    try {
      // Upload all images first using signed URLs
      const uploadedOptions = await Promise.all(values.options.map(async (option: ClashOption) => {
        if (option.image_file) {
          // Step 1: Get signed URL from API
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
          // Step 2: Upload file to storage
          await fetch(signedUrl, {
            method: 'PUT',
            body: option.image_file,
            headers: { 'Content-Type': option.image_file.type },
          });
          return { ...option, image_url: publicUrl, image_file: undefined };
        }
        return option;
      }));
      // Now submit the clash with uploaded image URLs
      const response = await fetch("/api/clashes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title.trim(),
          description: values.description.trim(),
          options: uploadedOptions.map(({ id, text, image_url }) => ({
            id,
            text: text.trim(),
            image_url: image_url || undefined,
          })),
          status: "active",
          show_cta: values.showCta,
          show_results: values.showResults,
          cta_text: values.ctaText,
          cta_url: values.ctaUrl,
          expires_at: new Date(Date.now() + parseInt(values.expireAfter) * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create clash");
      }
      toast.success("Clash created successfully");
      router.push("/dashboard/clashes");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to create clash");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <BackButton href="/dashboard/clashes" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Clash</h1>
            <p className="text-gray-600">Set up your A/B test with two options</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <ClashForm mode="create" onSubmit={handleCreateClash} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
