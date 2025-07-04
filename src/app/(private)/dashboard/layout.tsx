import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import DashboardHeader from "@/components/dashboard-header";

const Layout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <DashboardHeader user={session.user} />
            {children}
        </div>
    );
};

export default Layout;
