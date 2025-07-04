"use client"
import { redirect } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {session.user?.image && (
                                <Image
                                    src={session.user.image}
                                    alt="Profile"
                                    width={50}
                                    height={50}
                                    className="rounded-full"
                                />
                            )}
                            <div>
                                <h2 className="text-xl font-bold text-foreground">{session.user?.name}</h2>
                                {session.user?.email && (
                                    <p className="text-muted-foreground">{session.user.email}</p>
                                )}
                                {(session.user as any)?.username && (
                                    <p className="text-muted-foreground">@{(session.user as any).username}</p>
                                )}
                            </div>
                        </div>
                        <Button 
                            onClick={() => signOut()}
                            variant="destructive"
                        >
                            Logout
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {children}
        </div>
    );
};

export default Layout;