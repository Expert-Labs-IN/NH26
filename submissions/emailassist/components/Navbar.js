"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-6 gap-6 sticky top-0 z-50">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white text-lg">
        <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </span>
        EmailAssist
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1 ml-2">
        <Link
          href="/dashboard"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/dashboard"
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          Inbox
        </Link>
        <Link
          href="/tasks"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/tasks"
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          Tasks
        </Link>
        <Link
          href="/calendar"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/calendar"
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          Calendar
        </Link>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User info + sign out */}
      {session && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 hidden sm:block">{session.user.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
