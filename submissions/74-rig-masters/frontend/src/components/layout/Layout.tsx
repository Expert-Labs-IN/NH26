import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="flex h-screen bg-[#060e20] overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full bg-[#060e20] overflow-hidden relative surface-gradient">
        <Outlet />
      </main>
    </div>
  );
}
