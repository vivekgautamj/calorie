"use client";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ExtendedUser {
  userId?: string;
}

const ProfilePage = () => {
  const { data: session } = useSession();

  return (
    <div className="max-w-xl mx-auto py-8">
      <Button
        className="w-fit bg-blue-50 text-blue-600 hover:bg-blue-100"
        asChild
      >
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
                src={session?.user?.image || "/images/avatar.png"}
                alt={session?.user?.name || "User avatar"}
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Upload Button */}

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
                <p className="text-muted-foreground font-mono text-xs">
                  {session?.user?.id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">User ID:</p>
                <p className="text-muted-foreground font-mono text-xs">
                  {(session?.user as ExtendedUser)?.userId || "Not available"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
