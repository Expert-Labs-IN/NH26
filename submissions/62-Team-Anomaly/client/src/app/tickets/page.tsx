import DashboardLayout from "@/components/DashboardLayout";
import TicketsModule from "@/components/TicketsModule";

export default function TicketsPage() {
    return (
        <DashboardLayout>
            <h1 className="text-4xl font-heading font-black text-white tracking-tighter uppercase flex items-center gap-4 text-glow text-shadow-lg mb-8">
                Tickets Management
            </h1>
            <TicketsModule />
        </DashboardLayout>
    );
}
