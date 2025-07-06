"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ClashForm, ClashOption } from "@/components/ClashForm";

const EditClashPage = () => {
  const router = useRouter();
  const { clashId } = useParams();
  const [clash, setClash] = useState<any>(null);
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

  const handleUpdateClash = async (values: any) => {
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
          options: uploadedOptions.map(({ id, text, image_url }) => ({
            id,
            text: text.trim(),
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
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : "Failed to update clash");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-40">Loading...</div>;
  }
  if (!clash) {
    return <div className="flex justify-center items-center h-40">Clash not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <ClashForm
        mode="edit"
        initialValues={{
          title: clash.title,
          description: clash.description,
          options: clash.options.map((opt: any) => ({
            ...opt,
            text: opt.text ?? opt.title ?? ""
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
  );
};

export default EditClashPage;
