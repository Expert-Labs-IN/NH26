import DashboardLayout from "@/components/DashboardLayout";
import AnalyticsModule from "@/components/AnalyticsModule";

export default function AnalyticsPage() {
    return (
        <DashboardLayout>
            <h1 className="text-4xl font-heading font-black text-white tracking-tighter uppercase flex items-center gap-4 text-glow text-shadow-lg mb-8">
                Operations Analytics
            </h1>
            <AnalyticsModule />
        </DashboardLayout>
    );
}
