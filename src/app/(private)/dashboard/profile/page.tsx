"use client"
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const ProfilePage = () => {
    const { data: session, update } = useSession();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        if (!["image/jpeg", "image/png", "image/webp", "image/jpg", "image/svg+xml"].includes(selected.type)) {
            setError("Only JPG, PNG, WEBP, SVG allowed");
            return;
        }
        if (selected.size > 5 * 1024 * 1024) {
            setError("Max file size is 5MB");
            return;
        }
        setError(null);
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
    };

    

    return (
        <div className="max-w-xl mx-auto py-8">
            <Button className="w-fit bg-blue-50 text-blue-600 hover:bg-blue-100" asChild>
                <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </Button>   
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-6">
                        {/* Avatar */}
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                            <Image
                                src={preview || session?.user?.image || "/avatar-placeholder.png"}
                                alt={session?.user?.name || "User avatar"}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        {/* Upload Button */}
                        <div className="flex flex-col items-center gap-2 w-full">
                            <Input
                                ref={inputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/jpg,image/svg+xml"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                            <Button
                                variant="outline"
                                onClick={() => inputRef.current?.click()}
                                disabled={uploading}
                                className="w-full"
                            >
                                {file ? "Change Image" : "Upload New Image"}
                            </Button>
                            
                            
                       </div>
                        {/* User Info */}
                        <div className="w-full space-y-2 mt-6">
                            <div>
                                <p className="text-sm font-medium">Name:</p>
                                <p className="text-muted-foreground">{session?.user?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Email:</p>
                                <p className="text-muted-foreground">{session?.user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Auth.js ID:</p>
                                <p className="text-muted-foreground font-mono text-xs">{session?.user?.id}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">User ID:</p>
                                <p className="text-muted-foreground font-mono text-xs">{(session?.user as any)?.userId || "Not available"}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfilePage;