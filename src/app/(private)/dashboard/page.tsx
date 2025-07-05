import { Plus, BarChart3, Users, TrendingUp, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

const DashboardPage = async () => {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session?.user) {
        redirect('/login');
    }
    
    console.log('User session:', session);
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground">Manage your thumbnail AB tests</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4" />
                    New Test
                </Button>
            </div>
           
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Button className="w-full justify-start">
                                <Plus className="w-4 h-4 mr-3" />
                                Create New Test
                            </Button>
                            <Button variant="ghost" className="w-full justify-start">
                                <BarChart3 className="w-4 h-4 mr-3" />
                                View Analytics
                            </Button>
                            <Button variant="ghost" className="w-full justify-start">
                                <Users className="w-4 h-4 mr-3" />
                                Manage Audience
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* User Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* User Avatar */}
                            {session.user.image && (
                                <div className="flex">
                                    <div className="relative w-20 h-20 rounded-full overflow-hidden">
                                        <Image
                                            src={session.user.image}
                                            alt={session.user.name || "User avatar"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm font-medium">Name:</p>
                                    <p className="text-muted-foreground">{session.user.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Email:</p>
                                    <p className="text-muted-foreground">{session.user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Auth.js ID:</p>
                                    <p className="text-muted-foreground font-mono text-xs">{session.user.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">User ID:</p>
                                    <p className="text-muted-foreground font-mono text-xs">{(session.user as any).userId || "Not available"}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;