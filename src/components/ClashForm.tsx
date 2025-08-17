import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImageIcon, X, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ClashOption {
  id: string;
  text: string;
  image_url?: string;
  image_file?: File;
}

interface ClashFormValues {
  title: string;
  description: string;
  options: ClashOption[];
  ctaText: string;
  ctaUrl: string;
  showCta: boolean;
  showResults: boolean;
  expireAfter: string;
}

export interface ClashFormProps {
  initialValues?: {
    title?: string;
    description?: string;
    options?: ClashOption[];
    ctaText?: string;
    ctaUrl?: string;
    showCta?: boolean;
    showResults?: boolean;
    expireAfter?: string;
  };
  mode: "create" | "edit";
  onSubmit: (values: ClashFormValues) => Promise<void>;
  isLoading?: boolean;
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

export const ClashForm: React.FC<ClashFormProps> = ({
  initialValues = {},
  mode,
  onSubmit,
  isLoading: externalLoading = false,
}) => {
  const [title, setTitle] = useState(initialValues.title || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [options, setOptions] = useState<ClashOption[]>(
    initialValues.options && initialValues.options.length > 0
      ? initialValues.options
      : [
          { id: "option-1", text: "" },
          { id: "option-2", text: "" },
        ]
  );
  const [ctaText, setCtaText] = useState(initialValues.ctaText || "");
  const [ctaUrl, setCtaUrl] = useState(initialValues.ctaUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCta, setShowCta] = useState(initialValues.showCta || false);
  const [showResults, setShowResults] = useState(initialValues.showResults || false);
  const [expireAfter, setExpireAfter] = useState(initialValues.expireAfter || "1");

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
      if (ctaText.length === 0 || ctaUrl.length === 0) {
        setError("CTA text and url is needed , if show cta is true");
        return false;
      }
      if (!ctaUrl.startsWith("http")) {
        setError("CTA url must start with http or https");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setError("");
    try {
      await onSubmit({
        title,
        description,
        options,
        ctaText,
        ctaUrl,
        showCta,
        showResults,
        expireAfter,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "edit" ? "Edit Clash" : "Create Clash"}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Title */}
        <div className="mb-4">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading || externalLoading}
          />
        </div>
        {/* Description */}
        <div className="mb-4">
          <Label htmlFor="description">Description (optional)</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading || externalLoading}
          />
        </div>
        {/* Options */}
        <div className="mb-4">
          <Label>Options</Label>
          {options.map((option, index) => (
            <Card key={option.id} className="p-4 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Input
                  placeholder={`Enter option ${index + 1} text`}
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                  disabled={isLoading || externalLoading}
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeOption(index)}
                    disabled={isLoading || externalLoading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <OptionImageUpload
                value={option.image_url}
                file={option.image_file}
                onFileChange={(file) => handleOptionChange(index, "image_file", file)}
                disabled={isLoading || externalLoading}
              />
            </Card>
          ))}
          <Button
            type="button"
            onClick={() => setOptions([...options, { id: `option-${options.length + 1}`, text: "" }])}
            disabled={isLoading || externalLoading}
          >
            Add Option
          </Button>
        </div>
        {/* CTA */}
        <div className="mb-4 flex items-center gap-2">
          <Switch checked={showCta} onCheckedChange={setShowCta} />
          <Label>Show CTA</Label>
        </div>
        {showCta && (
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="CTA Text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              disabled={isLoading || externalLoading}
            />
            <Input
              placeholder="CTA URL"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              disabled={isLoading || externalLoading}
            />
          </div>
        )}
        {/* Show Results */}
        <div className="mb-4 flex items-center gap-2">
          <Switch checked={showResults} onCheckedChange={setShowResults} />
          <Label>Show Results</Label>
        </div>
        {/* Expiry */}
        <div className="mb-4">
          <Label>Expire After (days)</Label>
          <Select value={expireAfter} onValueChange={setExpireAfter} disabled={isLoading || externalLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="7">7</SelectItem>
              <SelectItem value="30">30</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && <div className="text-destructive mb-2">{error}</div>}
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isLoading || externalLoading}
        >
          {isLoading || externalLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === "edit" ? "Saving..." : "Creating..."}
            </>
          ) : mode === "edit" ? "Save Changes" : "Create Clash"}
        </Button>
      </CardContent>
    </Card>
  );
}; 