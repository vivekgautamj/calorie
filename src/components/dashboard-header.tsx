"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
  };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard/clashes") {
      return pathname === "/dashboard/clashes" || pathname === "/dashboard";
    }
    return pathname === path;
  };

  return (
    <section className=" top-0 z-20 bg-background">
      <div className="flex lg:px-40 xl:px-52 border-b border-gray-200">
        <nav aria-label="Main" data-orientation="horizontal" dir="ltr" data-slot="navigation-menu" data-viewport="true" className="group/navigation-menu relative flex max-w-max flex-1 items-center justify-center min-w-full px-4">
          <div className="flex w-full items-center justify-between gap-12 py-4">
            <Link href="/dashboard/clashes" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Clash Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-lg font-semibold tracking-tighter">calorie</span>
            </Link>
            
            <div style={{ position: "relative" }}>
              <ul data-orientation="horizontal" data-slot="navigation-menu-list" className="group flex-1 list-none items-center justify-center gap-1 hidden lg:flex" dir="ltr">
                <li data-slot="navigation-menu-item" className="relative">
                  <Button 
                    variant={isActive("/dashboard/clashes") ? "default" : "ghost"} 
                    size="sm" 
                    asChild
                    className={cn(
                      isActive("/dashboard/clashes") && "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    )}
                  >
                    <Link href="/dashboard/clashes">
                      Clashes
                    </Link>
                  </Button>
                </li>
                <Button 
                  variant={isActive("/dashboard/create") ? "default" : "ghost"} 
                  size="sm" 
                  asChild
                  className={cn(
                    isActive("/dashboard/create") && "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  )}
                >
                  <Link href="/dashboard/create">Create</Link>
                </Button>
                
              </ul>
            </div>
            
            <div className="hidden items-center gap-4 lg:flex cursor-pointer hover:bg-gray-100 p-2 rounded-lg" onClick={() => router.push("/dashboard/profile")}>
              {user?.image && (
                <Image
                  src={user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name || user?.username}</span>
                
              </div>
             
            </div>
            
          </div>
          
        </nav>
      </div>
    </section>
  );
} 