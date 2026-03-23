const getStatusBadge = (status) => {
  switch (status) {
    case 'Fully Approved':
    case 'Auto-Approved':
    case 'Approved':
      return 'badge-success';
    case 'Pending Manager':
    case 'Pending Finance':
      return 'badge-warning';
    case 'Rejected':
      return 'badge-danger';
    default:
      return 'badge-info';
  }
};

const ExpenseCard = ({ expense, onViewDetails, actionButtons, showEmployee = false }) => {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-5 hover:shadow-elevated hover:border-brand-200 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-3">
        <div>
          {showEmployee && (
            <p className="font-semibold text-surface-800">{expense.employeeName}</p>
          )}
          <p className="text-sm text-surface-500 font-medium">{expense.category}</p>
        </div>
        <span className={`badge ${getStatusBadge(expense.status)}`}>
          {expense.status}
        </span>
      </div>

      <p className="text-surface-600 mb-3 line-clamp-2 text-sm leading-relaxed">{expense.description}</p>

      <div className="flex justify-between items-center mb-3">
        <p className="text-2xl font-bold text-surface-900">
          <span className="text-brand-500">$</span>{expense.amount.toLocaleString()}
        </p>
        <span className="text-xs font-medium text-surface-400 bg-surface-50 px-2.5 py-1 rounded-lg border border-surface-100">
          {expense.department}
        </span>
      </div>

      {expense.receiptImage && (
        <div className="mb-3">
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

      {expense.managerRemark && (
        <div className="mb-3 p-3 bg-brand-50/50 rounded-xl border border-brand-100 text-sm">
          <span className="font-semibold text-brand-700">Manager:</span>{' '}
          <span className="text-surface-600 italic">"{expense.managerRemark}"</span>
        </div>
      )}

      {expense.financeRemark && (
        <div className="mb-3 p-3 bg-violet-50/50 rounded-xl border border-violet-100 text-sm">
          <span className="font-semibold text-violet-700">Finance:</span>{' '}
          <span className="text-surface-600 italic">"{expense.financeRemark}"</span>
        </div>
      )}

      <div className="flex justify-between items-center pt-3 border-t border-surface-100">
        <button
          onClick={() => onViewDetails(expense)}
          className="text-brand-600 hover:text-brand-700 text-sm font-semibold transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Details
        </button>
        {actionButtons}
      </div>
    </div>
  );
};

export default ExpenseCard;