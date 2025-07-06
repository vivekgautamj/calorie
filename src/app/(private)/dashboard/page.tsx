"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const DashboardPage =  () => {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            const res = await fetch("/api/analytics");
            const data = await res.json();
            setAnalytics(data);
            setLoading(false);
        };
        fetchAnalytics();
    }, []);
    
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
                {/* Analytics Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Analytics Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div>Loading analytics...</div>
                        ) : analytics ? (
                            <div className="space-y-2">
                                <div>Total Clashes Created: {analytics.totalClashesCreated}</div>
                                <div>Total Votes: {analytics.totalVotes}</div>
                                {analytics.topClash && (
                                    <div>
                                        <div className="font-semibold mt-2">Top Clash:</div>
                                        <div>Title: {analytics.topClash.title}</div>
                                        <div>Votes: {analytics.topClash.votes}</div>
                                        <div>Views: {analytics.topClash.views}</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>No analytics data available.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;