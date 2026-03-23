import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = ({ title }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-surface-200 sticky top-0 z-40 backdrop-blur-xl bg-white/80">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-soft">
            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-surface-900 tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-50 border border-surface-200 rounded-xl">
            <div className="w-6 h-6 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-[10px] font-bold text-white uppercase">{user?.name?.charAt(0)}</span>
            </div>
            <span className="text-sm font-medium text-surface-700">{user?.name}</span>
            <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{user?.role}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-surface-400 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50 transition-all duration-200"
            title="Logout"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;