"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  href?: string;
  className?: string;
}

export default function BackButton({ href, className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleBack}
      className={` ${className || ""} bg-blue-50 text-blue-600`}
    >
      <ArrowLeft className="w-4 h-4 " />
      Back
    </Button>
  );
} 