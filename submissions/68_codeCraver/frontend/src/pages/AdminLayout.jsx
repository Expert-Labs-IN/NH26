import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutGrid, Users, Package, FolderOpen, Tag, ArrowLeft } from 'lucide-react'

export default function AdminLayout({ user }) {
  const navItemBase =
    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors no-underline'

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Admin Panel</h1>
          <p className="text-[13px] text-text3">Manage the catalog and platform analytics</p>
        </div>
        <NavLink
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-text2 hover:text-accent transition-colors no-underline"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </NavLink>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6 items-start">
        <aside className="bg-bg2 border border-border rounded-[var(--radius)] p-4 shadow-[var(--shadow)]">
          <nav className="flex flex-col gap-1">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `${navItemBase} ${isActive ? 'bg-accentLight text-accent' : 'text-text2 hover:bg-bg3'}`
              }
            >
              <LayoutGrid size={16} /> Dashboard
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `${navItemBase} ${isActive ? 'bg-accentLight text-accent' : 'text-text2 hover:bg-bg3'}`
              }
            >
              <Users size={16} /> Users
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `${navItemBase} ${isActive ? 'bg-accentLight text-accent' : 'text-text2 hover:bg-bg3'}`
              }
            >
              <Package size={16} /> Products
            </NavLink>
            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                `${navItemBase} ${isActive ? 'bg-accentLight text-accent' : 'text-text2 hover:bg-bg3'}`
              }
            >
              <FolderOpen size={16} /> Categories
            </NavLink>
            <NavLink
              to="/admin/tags"
              className={({ isActive }) =>
                `${navItemBase} ${isActive ? 'bg-accentLight text-accent' : 'text-text2 hover:bg-bg3'}`
              }
            >
              <Tag size={16} /> Tags
            </NavLink>
          </nav>

          {user?.role === 'admin' && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="text-[11px] uppercase tracking-wide font-bold text-text3 mb-1">Signed in as</div>
              <div className="text-sm font-extrabold">{user?.name || 'Admin'}</div>
              <div className="text-[13px] text-text3">{user?.email || '—'}</div>
            </div>
          )}
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

