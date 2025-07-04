"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not Authenticated</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You need to sign in to access this feature.
          </p>
          <Button onClick={() => signIn("google")}>
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authenticated User</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Name:</p>
            <p className="text-muted-foreground">{session?.user?.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Email:</p>
            <p className="text-muted-foreground">{session?.user?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium">User ID:</p>
            <p className="text-muted-foreground">{(session?.user as any)?.userId}</p>
          </div>
          {session?.user?.image && (
            <div>
              <p className="text-sm font-medium">Profile Image:</p>
              <img 
                src={session.user.image} 
                alt="Profile" 
                className="w-12 h-12 rounded-full mt-2"
              />
            </div>
          )}
          <Button 
            variant="outline" 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 