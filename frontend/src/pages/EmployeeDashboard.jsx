import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import StatusTimeline from '../components/StatusTimeline';
import { createWorker } from 'tesseract.js';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';

const MONEY_PATTERN = /(?:rs\.?|inr|\$)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/gi;
const TOTAL_HINT = /(grand total|total amount|amount due|balance due|net amount|final amount|total)/i;

const parseMoneyValues = (line) => {
  const matches = [...line.matchAll(MONEY_PATTERN)];
  return matches
    .map((match) => Number(match[1].replace(/,/g, '')))
    .filter((value) => Number.isFinite(value) && value >= 20 && value < 1000000);
};

const getBestAmountFromText = (text) => {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  const candidates = [];
  lines.forEach((line, index) => {
    const values = parseMoneyValues(line);
    if (values.length === 0) return;
    const priority = TOTAL_HINT.test(line) ? 2 : 1;
    values.forEach((value) => candidates.push({ value, priority, index }));
  });

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.priority - a.priority || b.value - a.value || a.index - b.index);
  return candidates[0].value;
};

const fileToImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const preprocessReceiptImage = async (file) => {
  const image = await fileToImage(file);
  const maxWidth = 1800;
  const scale = image.width > maxWidth ? maxWidth / image.width : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const ctx = canvas.getContext('2d');
  ctx.filter = 'grayscale(100%) contrast(180%) brightness(115%)';
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
};

const EmployeeDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Travel',
    department: 'Marketing',
    description: '',
    receiptImage: null,
    ocrText: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ocrWorkerRef = useRef(null);
  const ocrWorkerPromiseRef = useRef(null);

  useEffect(() => {
    if (!user || user.role !== 'employee') {
      navigate('/');
      return;
    }
    fetchExpenses();
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      if (ocrWorkerRef.current) {
        ocrWorkerRef.current.terminate();
      }
    };
  }, []);

  const getOcrWorker = async () => {
    if (ocrWorkerRef.current) return ocrWorkerRef.current;
    if (!ocrWorkerPromiseRef.current) {
      ocrWorkerPromiseRef.current = createWorker('eng', 1, {
        logger: () => {}
      });
    }
    ocrWorkerRef.current = await ocrWorkerPromiseRef.current;
    return ocrWorkerRef.current;
  };

  const fetchExpenses = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      const { data } = await axios.get('/api/expenses/employee', config);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, receiptImage: file, ocrText: '' }));

    const toastId = toast.loading('Analyzing receipt with OCR...');
    try {
      const worker = await getOcrWorker();
      const processedImage = await preprocessReceiptImage(file);

      let result = await worker.recognize(processedImage, { rotateAuto: true });
      let text = result?.data?.text || '';

      // Fallback with original image if preprocessing yields weak OCR output.
      if (!text || text.trim().length < 12) {
        result = await worker.recognize(file, { rotateAuto: true });
        text = result?.data?.text || '';
      }

      const detectedAmount = getBestAmountFromText(text);
      const existingAmount = Number(formData.amount || 0);
      const shouldAutofillAmount = !existingAmount && Number.isFinite(detectedAmount) && detectedAmount > 0;

      setFormData((prev) => ({
        ...prev,
        amount: shouldAutofillAmount ? detectedAmount.toFixed(2) : prev.amount,
        ocrText: text
      }));

      if (Number.isFinite(detectedAmount) && detectedAmount > 0) {
        if (existingAmount > 0 && Math.abs(existingAmount - detectedAmount) > 0.01) {
          toast.success(`Receipt total found: $${detectedAmount.toFixed(2)} (different from entered amount)`, { id: toastId });
        } else {
          toast.success(`Found receipt amount: $${detectedAmount.toFixed(2)}`, { id: toastId });
        }
      } else if (text && text.trim().length > 0) {
        toast.success('Receipt text extracted successfully', { id: toastId });
      } else {
        toast.error('OCR could not read text from this receipt. Try a clearer image.', { id: toastId });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Failed to analyze receipt', { id: toastId });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('ocrText', formData.ocrText || '');
      if (formData.receiptImage) {
        formDataToSend.append('receiptImage', formData.receiptImage);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      await axios.post('/api/expenses', formDataToSend, config);
      toast.success('Expense submitted successfully!');
      setFormData({ amount: '', category: 'Travel', department: 'Marketing', description: '', receiptImage: null, ocrText: '' });
      // Reset file input
      document.querySelector('input[type="file"]').value = '';
      fetchExpenses();
    } catch (error) {
      console.error('Error submitting expense:', error);
      toast.error('Failed to submit expense');
    }
    setIsSubmitting(false);
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
    if (status === 'Fully Approved' || status === 'Auto-Approved') return 'badge-success';
    if (status === 'Rejected') return 'badge-danger';
    return 'badge-warning';
  };

  const totalRequests = expenses.length;
  const pendingRequests = expenses.filter((expense) => ['Pending Manager', 'Pending Finance'].includes(expense.status)).length;
  const approvedRequests = expenses.filter((expense) => ['Fully Approved', 'Auto-Approved'].includes(expense.status)).length;
  const rejectedRequests = expenses.filter((expense) => expense.status === 'Rejected').length;
  const totalSubmittedAmount = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const approvalRate = totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0;
  const currentMonthSubmitted = expenses
    .filter((expense) => {
      const createdAt = new Date(expense.createdAt);
      const now = new Date();
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
    })
    .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);

  if (!user || user.role !== 'employee') return null;

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-surface-200 dark:border-surface-700/50 sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-surface-900/80 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-3.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-soft">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-surface-900 dark:text-white tracking-tight">AuditFlow</h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl">
                <div className="w-6 h-6 bg-brand-900 dark:bg-brand-500 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white uppercase">{user?.name?.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium text-surface-700 dark:text-surface-100">{user?.name}</span>
                <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{user?.role}</span>
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
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-surface-500 dark:text-surface-300 mt-0.5">Submit and track your expense requests</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in">
          <div className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white/90 dark:bg-surface-800/80 p-4">
            <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Total Requests</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{totalRequests}</p>
            <p className="text-xs text-surface-500 mt-1">All-time submissions</p>
          </div>
          <div className="rounded-2xl border border-amber-200 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-900/30 p-4">
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-200 mt-1">{pendingRequests}</p>
            <p className="text-xs text-amber-700/80 dark:text-amber-300 mt-1">Waiting manager or finance</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-900/30 p-4">
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Approval Rate</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-200 mt-1">{approvalRate}%</p>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-300 mt-1">{approvedRequests} approved, {rejectedRequests} rejected</p>
          </div>
          <div className="rounded-2xl border border-brand-200 dark:border-brand-700 bg-brand-50/70 dark:bg-brand-900/30 p-4">
            <p className="text-[11px] font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider">This Month</p>
            <p className="text-2xl font-bold text-brand-700 dark:text-brand-200 mt-1">${currentMonthSubmitted.toLocaleString()}</p>
            <p className="text-xs text-brand-700/80 dark:text-brand-300 mt-1">Total submitted amount</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white/80 dark:bg-surface-800/80 p-5 animate-slide-up">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">Submission Guidance</h3>
              <p className="text-sm text-surface-500 dark:text-surface-300 mt-1">Clear documentation improves approval speed and reduces back-and-forth.</p>
            </div>
            <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">Total Submitted: ${totalSubmittedAmount.toLocaleString()}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-3 mt-4">
            <div className="rounded-xl border border-surface-200 dark:border-surface-700 p-3 bg-surface-50/70 dark:bg-surface-900/40">
              <p className="text-xs font-semibold text-surface-700 dark:text-surface-100">Keep descriptions specific</p>
              <p className="text-xs text-surface-500 mt-1">Mention purpose, vendor, and business outcome in one short paragraph.</p>
            </div>
            <div className="rounded-xl border border-surface-200 dark:border-surface-700 p-3 bg-surface-50/70 dark:bg-surface-900/40">
              <p className="text-xs font-semibold text-surface-700 dark:text-surface-100">Attach legible receipts</p>
              <p className="text-xs text-surface-500 mt-1">OCR is available, but clear image quality keeps amounts accurate.</p>
            </div>
            <div className="rounded-xl border border-surface-200 dark:border-surface-700 p-3 bg-surface-50/70 dark:bg-surface-900/40">
              <p className="text-xs font-semibold text-surface-700 dark:text-surface-100">Know approval flow</p>
              <p className="text-xs text-surface-500 mt-1">Under $100 auto-approves. Over $1,000 requires finance review after manager approval.</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Submit Form Card */}
          <div className="glass-card rounded-2xl overflow-hidden animate-slide-up">
            <div className="section-header flex items-center gap-2">
              <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h2 className="text-lg font-semibold text-white tracking-tight">Submit Expense</h2>
            </div>
            <div className="px-6 pt-4 pb-1">
              <p className="text-xs text-surface-500 dark:text-surface-300">
                Fill all fields accurately to avoid delays. Include clear reason and receipt for the fastest approval path.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-100 mb-1.5">Amount ($)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="0.00"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-100 mb-1.5">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="Travel">Travel</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Software">Software</option>
                    <option value="Food">Food</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-100 mb-1.5">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="Marketing">Marketing</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-100 mb-1.5">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field resize-none"
                  placeholder="Briefly describe the expense..."
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-100 mb-1.5">Receipt</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full text-sm text-surface-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0
                             file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-600
                             hover:file:bg-brand-100 file:cursor-pointer file:transition-colors
                             border border-surface-200 rounded-xl p-1 bg-surface-50"
                />
                {formData.ocrText && (
                  <div className="mt-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50/70 dark:bg-surface-900/50 p-3">
                    <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider mb-1">OCR Receipt Preview</p>
                    <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed">
                      {formData.ocrText.substring(0, 180)}{formData.ocrText.length > 180 ? '...' : ''}
                    </p>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Submit Expense
                  </>
                )}
              </button>
            </form>
          </div>

          {/* My Requests Table */}
          <div className="glass-card rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="section-header flex items-center gap-2">
              <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-lg font-semibold text-white tracking-tight">My Requests</h2>
            </div>
            <div className="px-6 pt-4 pb-1">
              <p className="text-xs text-surface-500 dark:text-surface-300">
                Latest 5 requests are shown below. Open any request to see full decision timeline and remarks.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100">
                    <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Amount</th>
                    <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Category</th>
                    <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center">
                        <div className="w-12 h-12 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-surface-500 font-medium text-sm">No expenses submitted yet</p>
                        <p className="text-surface-400 text-xs mt-0.5">Submit your first expense to get started</p>
                      </td>
                    </tr>
                  ) : (
                    expenses.slice(0, 5).map((expense) => (
                      <tr key={expense._id} className="hover:bg-surface-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-sm text-surface-500">
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-sm font-semibold text-surface-800 dark:text-white">${expense.amount}</td>
                        <td className="py-3.5 px-4 text-sm text-surface-500 dark:text-surface-300">{expense.category}</td>
                        <td className="py-3.5 px-4">
                          <span className={`badge ${getStatusBadge(expense.status)}`}>
                            {expense.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleViewDetails(expense)}
                            className="text-brand-600 hover:text-brand-700 text-sm font-semibold transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

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
              <div className="grid grid-cols-2 gap-5 mb-6">
                <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-4 border border-surface-100 dark:border-surface-700">
                  <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Amount</p>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white"><span className="text-brand-500">$</span>{selectedExpense.amount}</p>
                </div>
                <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-4 border border-surface-100 dark:border-surface-700">
                  <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Category</p>
                  <p className="font-semibold text-surface-800 dark:text-white">{selectedExpense.category}</p>
                </div>
                <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-4 border border-surface-100 dark:border-surface-700">
                  <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Department</p>
                  <p className="font-semibold text-surface-800 dark:text-white">{selectedExpense.department}</p>
                </div>
                <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-4 border border-surface-100 dark:border-surface-700">
                  <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Status</p>
                  <span className={`badge ${getStatusBadge(selectedExpense.status)}`}>
                    {selectedExpense.status}
                  </span>
                </div>
              </div>
              <div className="mb-6 bg-surface-50 rounded-xl p-4 border border-surface-100">
                <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-surface-700 dark:text-surface-300 text-sm leading-relaxed">{selectedExpense.description}</p>
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

export default EmployeeDashboard;
