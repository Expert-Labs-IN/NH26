import UserDashboardLayout from "@/components/portal/UserDashboardLayout";
import UserProfileModule from "@/components/portal/UserProfileModule";

export default function ProfilePage() {
    return (
        <UserDashboardLayout>
            <UserProfileModule />
        </UserDashboardLayout>
    );
}
