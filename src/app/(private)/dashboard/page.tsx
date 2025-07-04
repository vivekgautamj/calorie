"use client";

import { Plus, BarChart3, Users, TrendingUp, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DashboardPage = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground">Manage your thumbnail AB tests</p>
                </div>
                <Button className="flex items-center gap-2">
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
                            <Button variant="ghost" className="w-full justify-start">
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

                
            </div>
        </div>
    );
};

export default DashboardPage;