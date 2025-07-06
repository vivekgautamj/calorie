"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImageIcon, X, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClashOption {
  id: string;
  text: string;
  image_url?: string;
  image_file?: File;
}

function OptionImageUpload({
  value,
  file,
  onFileChange,
  disabled,
}: {
  value?: string;
  file?: File;
  onFileChange: (file: File | undefined) => void;
  disabled?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
        "image/svg",
      ].includes(file.type)
    ) {
      setError("Only JPG, PNG, WEBP, SVG allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Max file size is 5MB");
      return;
    }
    setError("");
    onFileChange(file);
  };

  const previewUrl = file ? URL.createObjectURL(file) : value;

  return (
    <div className="my-4">
      <div
        className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 bg-muted/30 rounded-lg p-6 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        style={{ minHeight: 150 }}
      >
        {previewUrl ? (
          <Image src={previewUrl} alt="Preview" className="h-full w-full mb-2 rounded" width={128} height={128} />
        ) : (
          <>
            <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
            <div className="mb-1">Upload</div>
            <div className="text-xs text-muted-foreground text-center">
              Choose images or drag & drop it here.<br />
              JPG, JPEG, PNG, WEBP, SVG. Max 5 MB.
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg,image/svg"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>
      {error && <div className="text-xs text-destructive mt-2">{error}</div>}
    </div>
  );
}

const CreatePage = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<ClashOption[]>([
    { id: "option-1", text: "" },
    { id: "option-2", text: "" },
  ]);
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCta, setShowCta] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [expireAfter, setExpireAfter] = useState("1");

  const handleOptionChange = (
    index: number,
    field: "text" | "image_url" | "image_file",
    value: string | File | undefined
  ) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      setError("Minimum 2 options required");
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    setError("");
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError("Title is required");
      return false;
    }

    if (options.some((option) => !option.text.trim())) {
      setError("All options must have text");
      return false;
    }
    if (options.length < 2) {
      setError("At least 2 options are required");
      return false;
    }

    if (showCta && !(ctaText.length === 0 || ctaUrl.length === 0)) {

        if(ctaText.length === 0 || ctaUrl.length === 0){
            setError("CTA text and url is needed , if show cta is true");
            return false;
        }
        if(!ctaUrl.startsWith("http")){
            setError("CTA url must start with http or https");
            return false;
        }
    }
    setError("");
    return true;
  };

  const handleCreateClash = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setError("");
    try {
      // Upload all images first using signed URLs
      const uploadedOptions = await Promise.all(options.map(async (option) => {
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
          
          // Step 2: Upload file directly to Supabase using signed URL
          const uploadResponse = await fetch(signedUrl, {
            method: 'PUT',
            body: option.image_file,
            headers: {
              'Content-Type': option.image_file.type,
            },
          });
          
          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image to storage');
          }
          
          return {
            ...option,
            image_url: publicUrl,
          };
        }
        return option;
      }));
      // Now submit the clash with uploaded image URLs
      const response = await fetch("/api/clashes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          options: uploadedOptions.map(({ id, text, image_url }) => ({
            text: text.trim(),
            image_url: image_url || undefined,
          })),
          status: "active",
          show_cta: showCta,
          show_results: showResults,
          cta_text: ctaText,
          cta_url: ctaUrl,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create clash");
      }
      toast.success("Clash created successfully");
      router.push("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create clash");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center  inline-block">
        <Button
          variant="outline"
          className="bg-blue-50 text-blue-600"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create AB Clash</CardTitle>
          <CardDescription>
            Create , Share and Analyze your ideas fast{" "}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              value={title}
              placeholder="Enter clash title"
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              type="text"
              value={description}
              placeholder="Enter clash description"
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((option, index) => (
                <Card key={option.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Option {index + 1}</Label>
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          disabled={isLoading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      type="text"
                      placeholder={`Enter option ${index + 1} text`}
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                      disabled={isLoading}
                    />
                    <OptionImageUpload
                      value={option.image_url}
                      file={option.image_file}
                      onFileChange={(file) => handleOptionChange(index, "image_file", file as any)}
                      disabled={isLoading}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Label>Show Results after vote</Label>
            <Switch
              checked={showResults}
              onCheckedChange={setShowResults}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-between">
            <Label>Show CTA</Label>
            <Switch
              checked={showCta}
              onCheckedChange={setShowCta}
              disabled={isLoading}
            />
          </div>

          {showCta && (
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="ctaTitle">CTA title</Label>
                <Input
                  id="ctaTitle"
                  type="text"
                  value={ctaText}
                  placeholder="Enter CTA text"
                  onChange={(event) => {
                    setCtaText(event.target.value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaUrl">CTA Url</Label>
                <Input
                  id="ctaUrl"
                  type="url"
                  value={ctaUrl}
                  placeholder="Enter CTA url"
                  onChange={(event) => {
                    setCtaUrl(event.target.value);
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Label>Expire after</Label>
            <div className="flex items-center gap-2">
              <Select
                value={expireAfter}
                onValueChange={(value) => setExpireAfter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="4">4 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="6">6 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleCreateClash}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Clash"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              disabled={isLoading}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePage;
