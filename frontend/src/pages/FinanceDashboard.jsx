import { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import BudgetChart from '../components/BudgetChart';
import YearExpenseChart from '../components/YearExpenseChart';
import StatusTimeline from '../components/StatusTimeline';
import FraudBadge from '../components/FraudBadge';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const FinanceDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [remark, setRemark] = useState('');

  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthLabel = now.toLocaleString('en-US', { month: 'short' });

    const monthApprovedExpenses = allExpenses.filter((expense) => {
      if (expense.status !== 'Fully Approved') return false;
      const expenseDate = new Date(expense.createdAt);
      if (Number.isNaN(expenseDate.getTime())) return false;
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const categoryTotals = monthApprovedExpenses.reduce((acc, expense) => {
      const category = expense.category || 'Other';
      if (!acc[category]) {
        acc[category] = { value: 0, count: 0 };
      }

      acc[category].value += Number(expense.amount) || 0;
      acc[category].count += 1;
      return acc;
    }, {});

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([name, details]) => ({
        name,
        value: details.value,
        count: details.count
      }))
      .sort((a, b) => b.value - a.value);

    return {
      monthLabel,
      year: currentYear,
      categoryBreakdown,
      totalAmount: categoryBreakdown.reduce((sum, item) => sum + item.value, 0),
      totalCount: monthApprovedExpenses.length
    };
  }, [allExpenses]);

  const yearlyStats = useMemo(() => {
    const approvedExpenses = allExpenses.filter((expense) => expense.status === 'Fully Approved');
    const validDates = approvedExpenses
      .map((expense) => new Date(expense.createdAt))
      .filter((date) => !Number.isNaN(date.getTime()));

    const availableYears = [...new Set(validDates.map((date) => date.getFullYear()))];
    const currentYear = new Date().getFullYear();
    const selectedYear = availableYears.includes(currentYear)
      ? currentYear
      : (availableYears.length > 0 ? Math.max(...availableYears) : currentYear);

    const yearApprovedExpenses = approvedExpenses.filter((expense) => {
      const expenseDate = new Date(expense.createdAt);
      return !Number.isNaN(expenseDate.getTime()) && expenseDate.getFullYear() === selectedYear;
    });

    const categories = [...new Set(yearApprovedExpenses.map((expense) => expense.category || 'Other'))].sort();
    const monthlyCategoryData = MONTH_LABELS.map((month) => {
      const baseMonth = { month, totalAmount: 0, count: 0 };
      categories.forEach((category) => {
        baseMonth[category] = 0;
      });
      return baseMonth;
    });

    yearApprovedExpenses.forEach((expense) => {
      const expenseDate = new Date(expense.createdAt);
      if (Number.isNaN(expenseDate.getTime())) return;

      const monthIndex = expenseDate.getMonth();
      const category = expense.category || 'Other';
      const amount = Number(expense.amount) || 0;

      monthlyCategoryData[monthIndex][category] += amount;
      monthlyCategoryData[monthIndex].totalAmount += amount;
      monthlyCategoryData[monthIndex].count += 1;
    });

    let cumulativeAmount = 0;
    const monthlyTotals = monthlyCategoryData.map((monthData) => {
      cumulativeAmount += monthData.totalAmount;
      return {
        month: monthData.month,
        totalAmount: monthData.totalAmount,
        cumulativeAmount,
        count: monthData.count
      };
    });

    return {
      year: selectedYear,
      categories,
      monthlyCategoryData,
      monthlyTotals,
      totalAmount: monthlyTotals.reduce((sum, month) => sum + month.totalAmount, 0),
      totalCount: yearApprovedExpenses.length
    };
  }, [allExpenses]);

  const financeMetrics = useMemo(() => {
    const pendingFinalAmount = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
    const now = new Date();
    const currentMonthRejected = allExpenses.filter((expense) => {
      if (expense.status !== 'Rejected') return false;
      const createdAt = new Date(expense.createdAt);
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
    }).length;
    const selectedYearTotal = allExpenses.filter((expense) => {
      const createdAt = new Date(expense.createdAt);
      return createdAt.getFullYear() === yearlyStats.year;
    }).length;
    const yearApprovalRate = selectedYearTotal > 0 ? Math.round((yearlyStats.totalCount / selectedYearTotal) * 100) : 0;
    const highRiskCount = allExpenses.filter((expense) => ['high', 'critical'].includes(expense.fraudLevel)).length;

    return {
      pendingFinalAmount,
      currentMonthRejected,
      selectedYearTotal,
      yearApprovalRate,
      highRiskCount
    };
  }, [expenses, allExpenses, yearlyStats.year, yearlyStats.totalCount]);

  useEffect(() => {
    if (!user || user.role !== 'finance') {
      navigate('/');
      return;
    }
    fetchExpenses();
    fetchAllExpenses();
  }, [user, navigate]);

  const fetchExpenses = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      const { data } = await axios.get('/api/expenses/finance', config);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchAllExpenses = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      const { data } = await axios.get('/api/expenses/all', config);
      setAllExpenses(data);
    } catch (error) {
      console.error('Error fetching all expenses:', error);
    }
  };

  const handleApprove = async (expenseId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      await axios.put(`/api/expenses/${expenseId}/finance-action`, { action: 'approve', remark: '' }, config);
      toast.success('Expense fully approved!');
      fetchExpenses();
      fetchAllExpenses();
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
      await axios.put(`/api/expenses/${expenseId}/finance-action`, { action: 'reject', remark }, config);
      setShowRejectModal(false);
      setRemark('');
      setSelectedExpense(null);
      toast.success('Expense rejected');
      fetchExpenses();
      fetchAllExpenses();
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

  const exportCSV = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      const response = await axios.get('/api/expenses/dataset/download?format=csv', {
        ...config,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense_dataset_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Dataset downloaded successfully!');
    } catch (error) {
      console.error('Error downloading dataset:', error);
      toast.error('Failed to download dataset');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || user.role !== 'finance') return null;

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-surface-200 dark:border-surface-700/50 sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-surface-900/80 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-3.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center shadow-soft">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-surface-900 dark:text-white tracking-tight">Finance Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={exportCSV}
                className="bg-surface-50 hover:bg-surface-100 border border-surface-200 hover:border-surface-300 px-4 py-2 rounded-xl text-surface-700 text-sm font-semibold transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Dataset (CSV)
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl">
                <div className="w-6 h-6 bg-brand-900 dark:bg-brand-500 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white uppercase">{user?.name?.charAt(0) || 'F'}</span>
                </div>
                <span className="text-sm font-medium text-surface-700 dark:text-surface-100">{user?.name}</span>
                <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{user?.role}</span>
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
        {/* Page heading */}
        <div className="mb-6 animate-fade-in">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">Overview</h2>
          <p className="text-sm text-surface-500 dark:text-surface-300 mt-0.5">Review and approve expense requests for final processing</p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6 animate-fade-in">
          <div className="rounded-2xl border border-violet-200 dark:border-violet-700 bg-violet-50/70 dark:bg-violet-900/30 p-4">
            <p className="text-[11px] font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wider">Pending Final</p>
            <p className="text-2xl font-bold text-violet-700 dark:text-violet-200 mt-1">{expenses.length}</p>
            <p className="text-xs text-violet-700/80 dark:text-violet-300 mt-1">${financeMetrics.pendingFinalAmount.toLocaleString()} awaiting review</p>
          </div>
          <div className="rounded-2xl border border-brand-200 dark:border-brand-700 bg-brand-50/70 dark:bg-brand-900/30 p-4">
            <p className="text-[11px] font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider">Current Month Approved</p>
            <p className="text-2xl font-bold text-brand-700 dark:text-brand-200 mt-1">${currentMonthStats.totalAmount.toLocaleString()}</p>
            <p className="text-xs text-brand-700/80 dark:text-brand-300 mt-1">{currentMonthStats.totalCount} approved requests</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-900/30 p-4">
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">{yearlyStats.year} Approval Rate</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-200 mt-1">{financeMetrics.yearApprovalRate}%</p>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-300 mt-1">{yearlyStats.totalCount} approved out of {financeMetrics.selectedYearTotal}</p>
          </div>
          <div className="rounded-2xl border border-rose-200 dark:border-rose-700 bg-rose-50/70 dark:bg-rose-900/30 p-4">
            <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider">Risk and Rejections</p>
            <p className="text-2xl font-bold text-rose-700 dark:text-rose-200 mt-1">{financeMetrics.highRiskCount}</p>
            <p className="text-xs text-rose-700/80 dark:text-rose-300 mt-1">{financeMetrics.currentMonthRejected} rejected this month</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white/80 dark:bg-surface-800/80 p-5 animate-slide-up">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">Finance Action Guide</h3>
              <p className="text-sm text-surface-500 dark:text-surface-300 mt-1">Use this checklist to keep final approvals consistent and audit-ready.</p>
            </div>
            <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">{yearlyStats.year} YTD: ${yearlyStats.totalAmount.toLocaleString()}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-3 mt-4">
            <div className="rounded-xl border border-surface-200 dark:border-surface-700 p-3 bg-surface-50/70 dark:bg-surface-900/40">
              <p className="text-xs font-semibold text-surface-700 dark:text-surface-100">Policy Compliance</p>
              <p className="text-xs text-surface-500 mt-1">Verify category match, amount reasonableness, and business purpose before final approval.</p>
            </div>
            <div className="rounded-xl border border-surface-200 dark:border-surface-700 p-3 bg-surface-50/70 dark:bg-surface-900/40">
              <p className="text-xs font-semibold text-surface-700 dark:text-surface-100">Fraud Signals</p>
              <p className="text-xs text-surface-500 mt-1">Pay closer attention to high and critical risk flags with larger amounts.</p>
            </div>
            <div className="rounded-xl border border-surface-200 dark:border-surface-700 p-3 bg-surface-50/70 dark:bg-surface-900/40">
              <p className="text-xs font-semibold text-surface-700 dark:text-surface-100">Decision Notes</p>
              <p className="text-xs text-surface-500 mt-1">Provide concise remarks when rejecting so employees and managers can correct quickly.</p>
            </div>
          </div>
        </div>

        {/* Budget & Yearly Expense Visuals */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6 animate-slide-up">
          <BudgetChart currentMonthStats={currentMonthStats} />
          <YearExpenseChart yearlyStats={yearlyStats} />
        </div>

        {/* Pending Approvals */}
        <div className="glass-card rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-brand-900 dark:bg-surface-900 px-6 py-4 flex items-center justify-between border-b border-brand-900 dark:border-surface-700">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-lg font-semibold text-white tracking-tight">
                Pending Final Approval
              </h2>
            </div>
            {expenses.length > 0 && (
              <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-lg">
                {expenses.length}
              </span>
            )}
          </div>
          <div className="px-6 py-3 border-b border-surface-100 dark:border-surface-700 bg-surface-50/70 dark:bg-surface-900/40">
            <p className="text-xs text-surface-500 dark:text-surface-300">
              Prioritize high amount and high-risk entries first. Final decisions and remarks are captured for audit traceability.
            </p>
          </div>

          {expenses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-violet-100">
                <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-surface-500 font-medium">No pending approvals</p>
              <p className="text-surface-400 text-sm mt-1">All caught up! Check back later.</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {expenses.map((expense, index) => (
                <div
                  key={expense._id}
                  className="glass-card p-6"
                  style={{ animationDelay: `${(index + 2) * 60}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-surface-900 dark:text-white text-lg">{expense.employeeName}</p>
                      <p className="text-sm text-surface-500 mt-0.5">{expense.employeeEmail}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="badge badge-warning">
                          {expense.status}
                        </span>
                        {expense.fraudScore > 0 && (
                          <FraudBadge score={expense.fraudScore} level={expense.fraudLevel} flags={expense.fraudFlags} compact />
                        )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-4 border border-surface-100 dark:border-surface-700">
                      <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Amount</p>
                      <p className="text-3xl font-bold text-surface-900 dark:text-white">
                        <span className="text-brand-500">$</span>{expense.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-4 border border-surface-100 dark:border-surface-700">
                      <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Category</p>
                      <p className="font-semibold text-surface-800 dark:text-white text-lg">{expense.category}</p>
                    </div>
                  </div>

                  <div className="mb-4 p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-100 dark:border-surface-700">
                    <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5">Employee Submission</p>
                    <p className="text-surface-700 dark:text-surface-300 text-sm leading-relaxed">{expense.description}</p>
                  </div>

                  <div className="mb-4 p-4 bg-brand-50/50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-800/50">
                    <p className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1.5">Manager Decision</p>
                    <p className="text-brand-700 dark:text-brand-300 text-sm">
                      Approved by <span className="font-semibold">{expense.managerName}</span>
                      {expense.managerRemark && <span className="italic text-surface-500"> — "{expense.managerRemark}"</span>}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-700 text-xs font-medium text-surface-600 dark:text-surface-200">
                      Submitted: {new Date(expense.createdAt).toLocaleDateString()}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-700 text-xs font-medium text-surface-600 dark:text-surface-200">
                      Fraud Level: {(expense.fraudLevel || 'low').toUpperCase()}
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
                        View/Download Receipt
                      </a>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-surface-100">
                    <button
                      onClick={() => handleApprove(expense._id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 hover:shadow-glow-emerald text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve Final
                    </button>
                    <button
                      onClick={() => openRejectModal(expense)}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                    <button
                      onClick={() => handleViewDetails(expense)}
                      className="bg-surface-100 hover:bg-surface-200 text-surface-700 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Timeline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
            <div className="bg-gradient-to-r from-violet-600 via-violet-500 to-brand-500 px-6 py-4 flex justify-between items-center rounded-t-2xl">
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
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-4 border border-surface-100 dark:border-surface-700">
                  <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Employee</p>
                  <p className="font-semibold text-surface-800 dark:text-white">{selectedExpense.employeeName}</p>
                </div>
                <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-4 border border-surface-100 dark:border-surface-700">
                  <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Amount</p>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white"><span className="text-brand-500">$</span>{selectedExpense.amount.toLocaleString()}</p>
                </div>
                <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-4 border border-surface-100 dark:border-surface-700">
                  <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Category</p>
                  <p className="font-semibold text-surface-800 dark:text-white">{selectedExpense.category}</p>
                </div>
                <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-4 border border-surface-100 dark:border-surface-700">
                  <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-surface-700 dark:text-surface-300 text-sm leading-relaxed">{selectedExpense.description}</p>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-2">Fraud Risk Profile</p>
                <FraudBadge
                  score={selectedExpense.fraudScore || 0}
                  level={selectedExpense.fraudLevel || 'low'}
                  flags={selectedExpense.fraudFlags || []}
                />
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

export default FinanceDashboard;
