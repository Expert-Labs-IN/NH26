import DashboardLayout from "@/components/DashboardLayout";
import SettingsModule from "@/components/SettingsModule";

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <h1 className="text-4xl font-heading font-black text-white tracking-tighter uppercase flex items-center gap-4 text-glow text-shadow-lg mb-8">
                System Configuration
            </h1>
            <SettingsModule />
        </DashboardLayout>
    );
}
