import DashboardLayout from "@/components/DashboardLayout";
import KPICards from "@/components/KPICards";
import ChatPanel from "@/components/ChatPanel";
import RecentTickets from "@/components/RecentTickets";
import { DonutChartOverview, ResolutionGraph } from "@/components/TicketCharts";

export default function DashboardHome() {
  return (
    <DashboardLayout>
      <header className="mb-12 relative">
        <div className="absolute -left-10 top-0 bottom-0 w-1 bg-[#F4C430] opacity-20 blur-sm" />
        <h1 className="text-4xl font-heading font-black text-white tracking-tighter uppercase flex items-center gap-4 text-glow text-shadow-lg">
          Intelligence Center
        </h1>
      </header>

      <KPICards />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="flex flex-col">
          <DonutChartOverview />
        </div>
        <div className="flex flex-col">
          <ResolutionGraph />
        </div>
      </div>

      <div className="mt-10 pb-20">
        <RecentTickets />
      </div>
    </DashboardLayout>
  );
}
