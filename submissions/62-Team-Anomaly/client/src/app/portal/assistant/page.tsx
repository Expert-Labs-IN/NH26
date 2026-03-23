import UserDashboardLayout from "@/components/portal/UserDashboardLayout";
import UserChatPanel from "@/components/portal/UserChatPanel";

export default function UserAssistantPage() {
    return (
        <UserDashboardLayout>
            <div className="max-w-4xl mx-auto h-[80vh] flex flex-col">
                <header className="mb-8">
                    <h1 className="text-4xl font-heading font-black text-white tracking-tighter uppercase flex items-center gap-4 text-glow text-shadow-lg">
                        AI Support Assistant
                    </h1>
                </header>
                <UserChatPanel />
            </div>
        </UserDashboardLayout>
    );
}
