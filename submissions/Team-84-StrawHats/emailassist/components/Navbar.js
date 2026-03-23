"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Inbox, CheckSquare, Calendar, LogOut } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="h-20 bg-[#211B34] flex items-center px-8 gap-8 sticky top-0 z-50">
      {/* Logo */}
      <Link href="/dashboard" className="group flex items-center gap-3 font-extrabold text-white text-xl tracking-tight transition-transform active:scale-95">
        <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/20 flex items-center justify-center group-hover:bg-[#7C3AED]/30 transition-colors">
          <Mail className="w-6 h-6 text-[#7C3AED]" />
        </div>
        EmailAssist
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-2 ml-4">
        {[
          { href: "/dashboard", label: "Inbox", icon: Inbox },
          { href: "/tasks", label: "Tasks", icon: CheckSquare },
          { href: "/calendar", label: "Calendar", icon: Calendar },
        ].map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-white text-[#7C3AED]"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User info + sign out */}
      {session && (
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-white/40 hidden md:block">{session.user.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="group flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
