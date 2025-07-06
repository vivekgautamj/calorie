import { Plus, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const DashboardPage = async () => {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session?.user) {
        redirect('/login');
    }
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground">Manage your thumbnail AB tests</p>
                </div>
                
            </div>
           
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Button className="w-full justify-start" asChild>
                                <Link href="/dashboard/create">
                                    <Plus className="w-4 h-4 mr-3" />
                                    Create New AB Clash
                                </Link>
                            </Button>
                            <Button className="w-full justify-start bg-blue-50 text-blue-600 hover:bg-blue-100" asChild>
                                <Link href="/dashboard/clashes">
                                <Plus className="w-4 h-4 mr-3" />
                                View all AB Clashes
                                </Link>
                            </Button>
                           
                        </div>
                    </CardContent>
                </Card>

                
            </div>
        </div>
    );
};

export default DashboardPage;