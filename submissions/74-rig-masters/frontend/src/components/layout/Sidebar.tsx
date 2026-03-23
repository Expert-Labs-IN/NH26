import { NavLink } from 'react-router-dom';
import { Inbox, Calendar, Search, Star, Send, Archive, Trash2, Settings, Plus, AlertCircle, Minus, ArrowDown } from 'lucide-react';

export function Sidebar() {
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[13px] font-medium ${isActive
      ? 'bg-[#31394d] text-[#dae2fd] shadow-sm'
      : 'text-[#c7c4d7] hover:bg-[#222a3d] hover:text-[#dae2fd]'
    }`;

  return (
    <aside className="w-56 h-screen bg-[#0b1326] border-r-premium flex flex-col pt-6 flex-shrink-0 custom-scrollbar overflow-y-auto">
      <div className="px-5 mb-8 flex items-center justify-between">
        <h1 className="text-[#c0c1ff] font-bold text-[17px] tracking-tight">InferMail</h1>
        <button className="text-[#908fa0] hover:text-[#dae2fd] transition-colors ease-premium">
          <Search size={16} />
        </button>
      </div>

      <div className="px-3 mb-8">
        <button className="w-full h-10 compose-gradient rounded-lg flex items-center justify-center gap-2 text-white transition-all active:scale-[0.98] ease-premium">
          <Plus size={16} />
          <span className="text-[13px] font-semibold">Compose</span>
        </button>
      </div>

      <nav className="flex-1 px-2 space-y-2">
        <div className="mb-6">
          <div className="px-3 mb-2 label-sm">Favorites</div>
          <NavLink to="/" className={linkClasses}>
            <Inbox size={16} />
            <span>Inbox</span>
            <span className="ml-auto bg-[#8083ff]/20 text-[#8083ff] px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-[#8083ff]/10">12</span>
          </NavLink>
          <NavLink to="/calendar" className={linkClasses}>
            <Calendar size={16} />
            <span>Calendar</span>
          </NavLink>
        </div>

        <div className="mb-4">
          <div className="px-3 mb-1.5 label-sm">Folders</div>
          <NavLink to="/starred" className={linkClasses}>
            <Star size={16} />
            <span>Starred</span>
          </NavLink>
          <NavLink to="/sent" className={linkClasses}>
            <Send size={16} />
            <span>Sent</span>
          </NavLink>
          <NavLink to="/archive" className={linkClasses}>
            <Archive size={16} />
            <span>Archive</span>
          </NavLink>
          <NavLink to="/trash" className={linkClasses}>
            <Trash2 size={16} />
            <span>Trash</span>
          </NavLink>
        </div>

        <div className="mb-4">
          <div className="px-3 mb-1.5 label-sm">Priority</div>
          <NavLink to="/urgent" className={linkClasses}>
            <AlertCircle size={16} />
            <span>Urgent</span>
          </NavLink>
          <NavLink to="/neutral" className={linkClasses}>
            <Minus size={16} />
            <span>Neutral</span>
          </NavLink>
          <NavLink to="/minimal" className={linkClasses}>
            <ArrowDown size={16} />
            <span>Minimal</span>
          </NavLink>
        </div>
      </nav>

      <div className="px-3 pb-5 mt-auto pt-4 border-t-premium">
        <button className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#222a3d] rounded-lg w-full transition-colors ease-premium">
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
