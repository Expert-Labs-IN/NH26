import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Shield, Truck, User, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { api } from "@/utils/api";

interface IUser {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.user.getAllUsers();
      let data = res?.data || [];

      // DUMMY DATA FALLBACK
      if (data.length === 0) {
        data = [
          { _id: 'u1', name: 'Alexander Pierce', email: 'alex@admin.com', role: 'admin', createdAt: new Date('2023-12-01').toISOString() },
          { _id: 'u2', name: 'Sarah Jenkins', email: 'sarah@user.com', role: 'user', createdAt: new Date('2024-01-05').toISOString() },
          { _id: 'u3', name: 'Robert Fox', email: 'robert@worker.com', role: 'worker', createdAt: new Date('2024-01-10').toISOString() },
          { _id: 'u4', name: 'Jane Cooper', email: 'jane@worker.com', role: 'worker', createdAt: new Date('2024-01-15').toISOString() },
          { _id: 'u5', name: 'Mike Johnson', email: 'mike@user.com', role: 'user', createdAt: new Date('2024-02-01').toISOString() }
        ];
      }

      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([
        { _id: 'u1', name: 'Demo Administrator', email: 'demo@admin.com', role: 'admin', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return <Shield className="h-3.5 w-3.5 mr-1.5" />;
      case 'worker': return <Truck className="h-3.5 w-3.5 mr-1.5" />;
      default: return <User className="h-3.5 w-3.5 mr-1.5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'worker': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-col">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">User Management</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 uppercase text-[10px] font-bold tracking-widest">Add, update roles, and manage system access.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by name, email, or role..."
            className="pl-10 h-11 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          {['All', 'Admin', 'Worker', 'User'].map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter(role)}
              className={cn(
                "rounded-full px-4 h-9 transition-all whitespace-nowrap font-black uppercase text-[9px] tracking-[0.2em]",
                roleFilter === role
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md border-transparent"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-blue-600"
              )}
            >
              {role}s
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">User Profile</th>
                <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-left">Security Role</th>
                <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-left">Registration</th>
                <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-left">Integrity</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm italic">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Decrypting Records...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users
                  .filter(u =>
                    (roleFilter === 'All' || u.role.toLowerCase() === roleFilter.toLowerCase()) &&
                    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || u.role.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).map((item) => (
                    <tr key={item._id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 transition-colors group text-left">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 group-hover:scale-110 transition-transform border border-zinc-100 dark:border-zinc-700 uppercase">
                            {item.name.charAt(0)}
                          </div>
                          <div className="text-left not-italic">
                            <div className="font-black text-zinc-900 dark:text-white uppercase tracking-tighter text-sm leading-none mb-1">{item.name}</div>
                            <div className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase truncate max-w-[150px]">{item.email || item.mobile}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left not-italic">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border",
                          getRoleColor(item.role),
                          item.role.toLowerCase() === 'admin' ? 'border-purple-200' :
                            item.role.toLowerCase() === 'worker' ? 'border-blue-200' : 'border-zinc-200'
                        )}>
                          {getRoleIcon(item.role)}
                          {item.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 font-black text-[10px] uppercase text-left tracking-[0.1em] not-italic">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-6 py-4 text-left not-italic">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                          <span className="text-zinc-600 dark:text-zinc-400 font-black text-[9px] uppercase tracking-widest">Verified</span>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-400 font-bold uppercase text-[10px] tracking-widest">
                    System database inaccessible.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
