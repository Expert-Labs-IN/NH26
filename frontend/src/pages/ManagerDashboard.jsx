import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import StatusTimeline from '../components/StatusTimeline';
import FraudBadge from '../components/FraudBadge';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';

const ManagerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState('Pending Manager');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [remark, setRemark] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'manager') {
      navigate('/');
      return;
    }
    fetchExpenses();
  }, [user, navigate]);

  const fetchExpenses = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      const { data } = await axios.get('/api/expenses/manager', config);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleApprove = async (expenseId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      await axios.put(`/api/expenses/${expenseId}/manager-action`, { action: 'approve', remark: '' }, config);
      toast.success('Expense approved successfully');
      fetchExpenses();
    } catch (error) {
      console.error('Error approving expense:', error);
      toast.error('Failed to approve expense');
    }
  };

  const handleReject = () => {
    if (!selectedExpense) return;
    submitReject(selectedExpense._id);
  };

  const submitReject = async (expenseId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      await axios.put(`/api/expenses/${expenseId}/manager-action`, { action: 'reject', remark }, config);
      setShowRejectModal(false);
      setRemark('');
      setSelectedExpense(null);
      toast.success('Expense rejected');
      fetchExpenses();
    } catch (error) {
      console.error('Error rejecting expense:', error);
      toast.error('Failed to reject expense');
    }
  };

  const openRejectModal = (expense) => {
    setSelectedExpense(expense);
    setShowRejectModal(true);
  };

  const handleViewDetails = (expense) => {
    setSelectedExpense(expense);
    setShowDetailsModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (status) => {
    if (status === 'Fully Approved' || status === 'Approved') return 'badge-success';
    if (status === 'Rejected') return 'badge-danger';
    return 'badge-warning';
  };

  const filteredExpenses = expenses.filter((e) => {
    if (filter === 'Approved') return ['Fully Approved', 'Pending Finance', 'Approved'].includes(e.status);
    return e.status === filter;
  });
  const pendingCount = expenses.filter((e) => e.status === 'Pending Manager').length;
  const approvedCount = expenses.filter((e) => ['Fully Approved', 'Pending Finance', 'Approved'].includes(e.status)).length;
  const rejectedCount = expenses.filter((e) => e.status === 'Rejected').length;
  const flaggedForReview = expenses.filter((e) => ['high', 'critical'].includes(e.fraudLevel)).length;
  const pendingHighValue = expenses.filter((e) => e.status === 'Pending Manager' && Number(e.amount) > 1000).length;
  const averageTicket = expenses.length > 0
    ? Math.round(expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0) / expenses.length)
    : 0;
  const filteredTotalAmount = filteredExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);

  if (!user || user.role !== 'manager') return null;

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-surface-200 dark:border-surface-700/50 sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-surface-900/80 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-3.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-soft">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-surface-900 dark:text-white tracking-tight">Manager Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl">
                <div className="w-6 h-6 bg-brand-900 dark:bg-brand-500 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white uppercase">{user?.name?.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium text-surface-700 dark:text-surface-100">{user?.name}</span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{user?.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-surface-400 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50 transition-all duration-200"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Summary Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-in">
          <button
            onClick={() => setFilter('Pending Manager')}
            className={`rounded-2xl p-5 border transition-all duration-200 text-left group ${
              filter === 'Pending Manager'
                ? 'bg-amber-50 dark:bg-amber-900/40 border-amber-200 dark:border-amber-700 shadow-card'
                : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 hover:border-amber-200 dark:hover:border-amber-600 hover:shadow-soft'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
              filter === 'Pending Manager' ? 'bg-amber-100 dark:bg-amber-800' : 'bg-surface-100 dark:bg-surface-700 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/50'
            }`}>
              <svg className={`w-5 h-5 ${filter === 'Pending Manager' ? 'text-amber-600 dark:text-amber-400' : 'text-surface-400 group-hover:text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{pendingCount}</p>
            <p className="text-sm font-medium text-surface-500">Pending</p>
          </button>
          <button
            onClick={() => setFilter('Approved')}
            className={`rounded-2xl p-5 border transition-all duration-200 text-left group ${
              filter === 'Approved'
                ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700 shadow-card'
                : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 hover:border-emerald-200 dark:hover:border-emerald-600 hover:shadow-soft'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
              filter === 'Approved' ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-surface-100 dark:bg-surface-700 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/50'
            }`}>
              <svg className={`w-5 h-5 ${filter === 'Approved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-surface-400 group-hover:text-emerald-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{approvedCount}</p>
            <p className="text-sm font-medium text-surface-500">Approved</p>
          </button>
          <button
            onClick={() => setFilter('Rejected')}
            className={`rounded-2xl p-5 border transition-all duration-200 text-left group ${
              filter === 'Rejected'
                ? 'bg-rose-50 dark:bg-rose-900/40 border-rose-200 dark:border-rose-700 shadow-card'
                : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 hover:border-rose-200 dark:hover:border-rose-600 hover:shadow-soft'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
              filter === 'Rejected' ? 'bg-rose-100 dark:bg-rose-800' : 'bg-surface-100 dark:bg-surface-700 group-hover:bg-rose-50 dark:group-hover:bg-rose-900/50'
            }`}>
              <svg className={`w-5 h-5 ${filter === 'Rejected' ? 'text-rose-600 dark:text-rose-400' : 'text-surface-400 group-hover:text-rose-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{rejectedCount}</p>
            <p className="text-sm font-medium text-surface-500">Rejected</p>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-6 animate-slide-up">
          <div className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white/90 dark:bg-surface-800/80 p-5 lg:col-span-2">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">Manager Operations Brief</h3>
                <p className="text-sm text-surface-500 dark:text-surface-300 mt-1">Prioritize high-value and high-risk requests first for better turnaround and control.</p>
              </div>
              <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">Average Ticket: ${averageTicket.toLocaleString()}</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-900/30 p-3">
                <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Needs Attention</p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-200 mt-1">{pendingCount}</p>
                <p className="text-xs text-amber-700/80 dark:text-amber-300 mt-1">Pending manager decisions</p>
              </div>
              <div className="rounded-xl border border-rose-200 dark:border-rose-700 bg-rose-50/70 dark:bg-rose-900/30 p-3">
                <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider">Risk Alerts</p>
                <p className="text-xl font-bold text-rose-700 dark:text-rose-200 mt-1">{flaggedForReview}</p>
                <p className="text-xs text-rose-700/80 dark:text-rose-300 mt-1">High and critical fraud scores</p>
              </div>
              <div className="rounded-xl border border-brand-200 dark:border-brand-700 bg-brand-50/70 dark:bg-brand-900/30 p-3">
                <p className="text-[11px] font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider">High Value Queue</p>
                <p className="text-xl font-bold text-brand-700 dark:text-brand-200 mt-1">{pendingHighValue}</p>
                <p className="text-xs text-brand-700/80 dark:text-brand-300 mt-1">Pending over $1,000 requests</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-surface-50/70 dark:bg-surface-900/60 p-5">
            <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">Review Checklist</h3>
            <div className="space-y-3 mt-3">
              <p className="text-xs text-surface-600 dark:text-surface-300">1. Validate amount, category, and business purpose alignment.</p>
              <p className="text-xs text-surface-600 dark:text-surface-300">2. Check receipt quality and supporting description details.</p>
              <p className="text-xs text-surface-600 dark:text-surface-300">3. Escalate high-value requests with clear remarks for finance.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
              <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider">Visible Pipeline Value</p>
              <p className="text-lg font-bold text-surface-900 dark:text-white mt-1">${filteredTotalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">
            {filter === 'Pending Manager' && 'Pending Approval Requests'}
            {filter === 'Approved' && 'Approved Requests'}
            {filter === 'Rejected' && 'Rejected Requests'}
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-300 mt-1">
            Use filters above to focus your queue and keep approval decisions consistent across the team.
          </p>
        </div>

        {/* Expense Cards */}
        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-12 text-center animate-fade-in">
            <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-surface-500 font-medium">No requests found</p>
            <p className="text-surface-400 text-sm mt-1">Check back later for new submissions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense, index) => (
              <div
                key={expense._id}
                className="glass-card rounded-2xl p-6"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-surface-900 dark:text-white">{expense.employeeName}</p>
                    <p className="text-sm text-surface-500 mt-0.5">
                      <span className="font-medium">{expense.category}</span>
                      <span className="mx-1.5 text-surface-300 dark:text-surface-600">•</span>
                      <span>{expense.department}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`badge ${getStatusBadge(expense.status)}`}>
                      {expense.status}
                    </span>
                    {expense.fraudScore > 0 && (
                      <FraudBadge score={expense.fraudScore} level={expense.fraudLevel} flags={expense.fraudFlags} compact />
                    )}
                  </div>
                </div>

                <p className="text-surface-600 dark:text-surface-300 mb-4 text-sm leading-relaxed">{expense.description}</p>

                <div className="flex justify-between items-center mb-4">
                  <p className="text-3xl font-bold text-surface-900 dark:text-white">
                    <span className="text-brand-500">$</span>{expense.amount.toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-700 text-xs font-medium text-surface-600 dark:text-surface-200">
                    Submitted: {new Date(expense.createdAt).toLocaleDateString()}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-700 text-xs font-medium text-surface-600 dark:text-surface-200">
                    Approval Level: {expense.currentLevel}
                  </span>
                </div>

                {expense.receiptImage && (
                  <div className="mb-4">
                    <a
                      href={`http://localhost:5000${expense.receiptImage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      View Receipt
                    </a>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-surface-100">
                  <button
                    onClick={() => handleViewDetails(expense)}
                    className="text-surface-500 hover:text-brand-600 text-sm font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Details
                  </button>
                  {expense.status === 'Pending Manager' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(expense._id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 hover:shadow-glow-emerald"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(expense)}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-surface-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-modal max-w-md w-full animate-scale-in">
            <div className="bg-gradient-to-r from-rose-600 to-rose-500 px-6 py-4 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-white tracking-tight">Reject Expense</h2>
            </div>
            <div className="p-6">
              <p className="text-surface-600 mb-4 text-sm">Please provide a reason for rejecting this expense request.</p>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="input-field resize-none"
                placeholder="Enter rejection reason..."
                rows="3"
              />
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 bg-surface-100 hover:bg-surface-200 text-surface-700 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedExpense && (
        <div className="fixed inset-0 bg-surface-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-modal max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-scale-in">
            <div className="section-header flex justify-between items-center rounded-t-2xl">
              <h2 className="text-lg font-semibold text-white tracking-tight">Expense Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6 bg-surface-50/50 dark:bg-surface-900/50 p-4 rounded-xl border border-surface-200/50 dark:border-surface-700/50">
                {[
                  { label: 'Employee', value: selectedExpense.employeeName },
                  { label: 'Email', value: selectedExpense.employeeEmail },
                  { label: 'Amount', value: `$${selectedExpense.amount}`, highlight: true },
                  { label: 'Category', value: selectedExpense.category },
                  { label: 'Department', value: selectedExpense.department },
                  { label: 'Description', value: selectedExpense.description },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-surface-200/50 dark:border-surface-700/50 last:border-0">
                    <span className="text-[11px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider min-w-[100px] pt-0.5">{item.label}</span>
                    <span className={`text-sm ${item.highlight ? 'font-bold text-surface-900 dark:text-white' : 'text-surface-700 dark:text-surface-100'}`}>{item.value}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-2">Fraud Risk</p>
                  <FraudBadge
                    score={selectedExpense.fraudScore || 0}
                    level={selectedExpense.fraudLevel || 'low'}
                    flags={selectedExpense.fraudFlags || []}
                  />
                </div>
                {selectedExpense.receiptImage && (
                  <div className="flex items-center gap-3 py-2">
                    <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider min-w-[100px]">Receipt</span>
                    <a
                      href={`http://localhost:5000${selectedExpense.receiptImage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:text-brand-700 text-sm font-semibold transition-colors"
                    >
                      Download/View
                    </a>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-surface-800 mb-3 text-sm uppercase tracking-wider">Timeline</h3>
              <StatusTimeline timeline={selectedExpense.timeline} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
