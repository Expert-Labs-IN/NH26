import UserDashboardLayout from "@/components/portal/UserDashboardLayout";
import MyTicketsModule from "@/components/portal/MyTicketsModule";

export default function MyTicketsPage() {
    return (
        <UserDashboardLayout>
            <MyTicketsModule />
        </UserDashboardLayout>
    );
}
