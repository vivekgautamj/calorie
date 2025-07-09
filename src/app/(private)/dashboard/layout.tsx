import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard-header";
import MobileNavWrapper from "@/components/mobile-nav-wrapper";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="p-4 pb-20 md:pb-4">
                <div className="flex flex-col gap-4">
                    {children}
                </div>
            </div>
            <MobileNavWrapper />
        </div>
    );
}
