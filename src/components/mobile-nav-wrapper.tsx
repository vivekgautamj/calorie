"use client";

import { usePathname } from "next/navigation";
import MobileBottomNav from "./mobile-bottom-nav";

export default function MobileNavWrapper() {
  const pathname = usePathname();
  
  // Hide bottom nav on detail pages
  const hideBottomNav = pathname.includes('/view/') || 
                       pathname.includes('/edit/') || 
                       pathname.includes('/create');

  if (hideBottomNav) {
    return null;
  }

  return <MobileBottomNav />;
} 