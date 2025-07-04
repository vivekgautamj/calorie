import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import LogoutButton from "@/components/logout-button";

const Layout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth();

    if (!session?.user) {
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
                        <LogoutButton />
                    </div>
                </CardContent>
            </Card>
            {children}
        </div>
    );
};

export default Layout;
