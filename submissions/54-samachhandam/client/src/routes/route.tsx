import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import WorkerRegister from "@/pages/auth/WorkerRegister";

import AdminLayout from "@/components/layout/AdminLayout";
import Overview from "@/pages/admin/Overview";
import Complaints from "@/pages/admin/Complaints";
import UsersPage from "@/pages/admin/Users";
import UserLayout from "@/components/layout/UserLayout";
import UserDashboard from "@/pages/user/UserDashboard";
import ChatSupport from "@/pages/user/ChatSupport";
import MyTickets from "@/pages/user/MyTickets";
import Notifications from "@/pages/user/Notifications";
import Profile from "@/pages/user/Profile";

import WorkerLayout from "@/components/layout/WorkerLayout";
import WorkerDashboard from "@/pages/worker/WorkerDashboard";
import WorkerTaskList from "@/pages/worker/WorkerTaskList";
import WorkerTaskDetail from "@/pages/worker/WorkerTaskDetail";
import WorkerMapView from "@/pages/worker/WorkerMapView";
import WorkerTaskHistory from "@/pages/worker/WorkerTaskHistory";
import WorkerPendingRequests from "@/pages/worker/WorkerPendingRequests";
import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import Occupation from "@/pages/admin/occupation";
import WorkersPage from "@/pages/admin/Workers";

const routes = createBrowserRouter(
    createRoutesFromElements(
        <>
            {/* Auth routes */}
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/register/worker" element={<WorkerRegister />} />

            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Overview />} />
                    <Route path="complaints" element={<Complaints />} />
                    <Route path="occupations" element={<Occupation />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="workers" element={<WorkersPage />} />
                </Route>
            </Route>

            {/* User routes */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
                <Route element={<UserLayout />}>
                    <Route path="/dashboard" element={<UserDashboard />} />
                    <Route path="/chat" element={<ChatSupport />} />
                    <Route path="/chat/:id" element={<ChatSupport />} />
                    <Route path="/reports" element={<MyTickets />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>
            </Route>

            {/* Worker routes */}
            <Route element={<ProtectedRoute allowedRoles={['worker']} />}>
                <Route path="/worker" element={<WorkerLayout />}>
                    <Route index element={<WorkerDashboard />} />
                    <Route path="dashboard" element={<WorkerDashboard />} />
                    <Route path="tasks" element={<WorkerTaskList />} />
                    <Route path="pending" element={<WorkerPendingRequests />} />
                    <Route path="tasks/:id" element={<WorkerTaskDetail />} />
                    <Route path="map" element={<WorkerMapView />} />
                    <Route path="history" element={<WorkerTaskHistory />} />
                </Route>
            </Route>
        </>
    )
);

export default routes;
