"use client"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const ViewClashPage = () => {
    const { clashId } = useParams();
    const [clash, setClash] = useState<any>(null);

    console.log(clashId);

    useEffect(() => {
        const fetchClash = async () => {
            const response = await fetch(`/api/clashes/${clashId}`);
            const data = await response.json();
            console.log(data);
            setClash(data);
        }
        fetchClash();
    }, [clashId]);

    return (
        <div>
            <h1>View Clash</h1>
            <Button className="w-fit bg-blue-50 text-blue-600 hover:bg-blue-100" asChild>
                <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </Button>

            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">
                    {clash.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {clash.description}
                </p> 
            </div>
        </div>
    )
}

export default ViewClashPage;