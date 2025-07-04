"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import LogoutButton from "@/components/logout-button";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
  };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {user?.image && (
              <Image
                src={user.image}
                alt="Profile"
                width={50}
                height={50}
                className="rounded-full"
              />
            )}
            <div>
              <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
              {user?.email && (
                <p className="text-muted-foreground">{user.email}</p>
              )}
              {user?.username && (
                <p className="text-muted-foreground">@{user.username}</p>
              )}
            </div>
          </div>
          <LogoutButton />
        </div>
      </CardContent>
    </Card>
  );
} 