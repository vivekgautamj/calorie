import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard-header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <DashboardHeader user={session.user} />
            <div className="flex flex-col gap-4">
                {children}
            </div>
        </div>
    );
}
