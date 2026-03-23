import { Outlet } from "react-router-dom";
import UserHeader from "@/components/user/UserHeader";
import UserBottomNav from "@/components/user/UserBottomNav";
import UserSidebar from "@/components/user/UserSidebar";

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans tracking-tight">
      <UserSidebar />
      
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <UserHeader />
        
        <main className="flex-1 w-full px-4 py-8 sm:px-8 lg:px-12 animate-in fade-in duration-500 pb-32 lg:pb-12 text-zinc-900 dark:text-zinc-100 max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>

      <UserBottomNav />
    </div>
  );
}
