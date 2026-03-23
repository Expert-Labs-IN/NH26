import { Outlet } from "react-router-dom";
import WorkerHeader from "@/components/worker/WorkerHeader";
import WorkerSidebar from "@/components/worker/WorkerSidebar";
import WorkerBottomNav from "../worker/WorkerBottomNav";

export default function WorkerLayout() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* Desktop Sidebar */}
      <WorkerSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
        <WorkerHeader />

        <main className="flex-1 w-full max-w-lg lg:max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 animate-in fade-in duration-500 pb-24 lg:pb-12 text-zinc-900 dark:text-zinc-100">
          <Outlet />
        </main>

        <WorkerBottomNav />
      </div>
    </div>
  );
}
