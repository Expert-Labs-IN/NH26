const fs = require('fs');
const path = require('path');

const DATASET_PATH = path.join(__dirname, '..', 'data', 'expense_dataset.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Initialize or load dataset
const loadDataset = () => {
  ensureDataDir();
  if (fs.existsSync(DATASET_PATH)) {
    try {
      const data = fs.readFileSync(DATASET_PATH, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return initializeDataset();
    }
  }
  return initializeDataset();
};

// Initialize empty dataset structure
const initializeDataset = () => {
  return {
    metadata: {
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      totalRecords: 0,
      version: '1.0.0'
    },
    users: [],
    expenses: [],
    approvals: [],
    rejections: [],
    statistics: {
      totalExpenses: 0,
      totalApproved: 0,
      totalRejected: 0,
      totalPending: 0,
      totalAmount: 0,
      approvedAmount: 0,
      rejectedAmount: 0,
      byCategory: {},
      byDepartment: {},
      byStatus: {}
    }
  };
};

// Save dataset to file
const saveDataset = (dataset) => {
  ensureDataDir();
  dataset.metadata.lastUpdated = new Date().toISOString();
  dataset.metadata.totalRecords = dataset.expenses.length;
  fs.writeFileSync(DATASET_PATH, JSON.stringify(dataset, null, 2));
};

// Add user to dataset
const addUser = (userData) => {
  const dataset = loadDataset();
  const existingIndex = dataset.users.findIndex(u => u.email === userData.email);

  const userRecord = {
    id: userData._id ? userData._id.toString() : `user_${Date.now()}`,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    department: userData.department,
    createdAt: userData.createdAt || new Date().toISOString(),
    isActive: true
  };

  if (existingIndex >= 0) {
    dataset.users[existingIndex] = { ...dataset.users[existingIndex], ...userRecord };
  } else {
    dataset.users.push(userRecord);
  }

  saveDataset(dataset);
  return userRecord;
};

// Add expense to dataset
const addExpense = (expenseData) => {
  const dataset = loadDataset();

  const expenseRecord = {
    expenseId: expenseData._id ? expenseData._id.toString() : `exp_${Date.now()}`,
    employeeId: expenseData.employeeId ? expenseData.employeeId.toString() : null,
    employeeName: expenseData.employeeName,
    employeeEmail: expenseData.employeeEmail,
    department: expenseData.department,
    amount: parseFloat(expenseData.amount),
    category: expenseData.category,
    description: expenseData.description,
    ocrText: expenseData.ocrText || '',
    receiptImage: expenseData.receiptImage || null,
    status: expenseData.status,
    currentLevel: expenseData.currentLevel,
    fraudScore: expenseData.fraudScore || null,
    fraudLevel: expenseData.fraudLevel || null,
    fraudFlags: expenseData.fraudFlags || [],
    createdAt: expenseData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: expenseData.timeline || []
  };

  dataset.expenses.push(expenseRecord);

  // Update statistics
  dataset.statistics.totalExpenses++;
  dataset.statistics.totalAmount += expenseRecord.amount;

  if (!dataset.statistics.byCategory[expenseRecord.category]) {
    dataset.statistics.byCategory[expenseRecord.category] = { count: 0, amount: 0 };
  }
  dataset.statistics.byCategory[expenseRecord.category].count++;
  dataset.statistics.byCategory[expenseRecord.category].amount += expenseRecord.amount;

  if (!dataset.statistics.byDepartment[expenseRecord.department]) {
    dataset.statistics.byDepartment[expenseRecord.department] = { count: 0, amount: 0 };
  }
  dataset.statistics.byDepartment[expenseRecord.department].count++;
  dataset.statistics.byDepartment[expenseRecord.department].amount += expenseRecord.amount;

  updateStatusStatistics(dataset, expenseRecord.status);

  saveDataset(dataset);
  return expenseRecord;
};

// Update expense in dataset
const updateExpense = (expenseId, updateData) => {
  const dataset = loadDataset();
  const index = dataset.expenses.findIndex(e => e.expenseId === expenseId || e._id === expenseId);

  if (index >= 0) {
    const oldStatus = dataset.expenses[index].status;

    // Update expense record
    dataset.expenses[index] = {
      ...dataset.expenses[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Update status statistics if status changed
    if (oldStatus !== updateData.status) {
      decrementStatusStat(dataset, oldStatus);
      incrementStatusStat(dataset, updateData.status);

      // Update amounts
      const amount = dataset.expenses[index].amount;
      if (updateData.status === 'Fully Approved') {
        dataset.statistics.approvedAmount += amount;
      } else if (updateData.status === 'Rejected') {
        dataset.statistics.rejectedAmount += amount;
      }
    }

    saveDataset(dataset);
    return dataset.expenses[index];
  }

  return null;
};

// Add approval record
const addApproval = (expenseId, approvalData) => {
  const dataset = loadDataset();

  const approvalRecord = {
    approvalId: `apr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    expenseId: expenseId.toString(),
    level: approvalData.level,
    approvedBy: approvalData.approvedBy,
    approverName: approvalData.approverName,
    approverEmail: approvalData.approverEmail,
    approverRole: approvalData.approverRole,
    amount: approvalData.amount,
    category: approvalData.category,
    employeeName: approvalData.employeeName,
    employeeEmail: approvalData.employeeEmail,
    department: approvalData.department,
    remark: approvalData.remark || '',
    timestamp: new Date().toISOString(),
    previousStatus: approvalData.previousStatus,
    newStatus: approvalData.newStatus
  };

  dataset.approvals.push(approvalRecord);
  dataset.statistics.totalApproved++;
  updateStatusStatistics(dataset, 'Fully Approved');

  saveDataset(dataset);
  return approvalRecord;
};

// Add rejection record
const addRejection = (expenseId, rejectionData) => {
  const dataset = loadDataset();

  const rejectionRecord = {
    rejectionId: `rej_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    expenseId: expenseId.toString(),
    level: rejectionData.level,
    rejectedBy: rejectionData.rejectedBy,
    rejecterName: rejectionData.rejecterName,
    rejecterEmail: rejectionData.rejecterEmail,
    rejecterRole: rejectionData.rejecterRole,
    amount: rejectionData.amount,
    category: rejectionData.category,
    employeeName: rejectionData.employeeName,
    employeeEmail: rejectionData.employeeEmail,
    department: rejectionData.department,
    remark: rejectionData.remark || '',
    timestamp: new Date().toISOString(),
    previousStatus: rejectionData.previousStatus,
    newStatus: 'Rejected'
  };

  dataset.rejections.push(rejectionRecord);
  dataset.statistics.totalRejected++;
  updateStatusStatistics(dataset, 'Rejected');

  saveDataset(dataset);
  return rejectionRecord;
};

// Helper functions
const updateStatusStatistics = (dataset, status) => {
  if (!dataset.statistics.byStatus[status]) {
    dataset.statistics.byStatus[status] = 0;
  }
  dataset.statistics.byStatus[status]++;
};

const incrementStatusStat = (dataset, status) => {
  if (!dataset.statistics.byStatus[status]) {
    dataset.statistics.byStatus[status] = 0;
  }
  dataset.statistics.byStatus[status]++;
};

const decrementStatusStat = (dataset, status) => {
  if (dataset.statistics.byStatus[status] > 0) {
    dataset.statistics.byStatus[status]--;
  }
};

// Get dataset for export
const getDataset = (filters = {}) => {
  const dataset = loadDataset();

  let filteredExpenses = [...dataset.expenses];

  if (filters.status) {
    filteredExpenses = filteredExpenses.filter(e => e.status === filters.status);
  }
  if (filters.category) {
    filteredExpenses = filteredExpenses.filter(e => e.category === filters.category);
  }
  if (filters.department) {
    filteredExpenses = filteredExpenses.filter(e => e.department === filters.department);
  }

  return {
    ...dataset,
    expenses: filteredExpenses,
    filters: filters
  };
};

// Sync all data from database
const syncFromDatabase = async (ExpenseModel, UserModel) => {
  const dataset = initializeDataset();

  const users = await UserModel.find();
  for (const user of users) {
    dataset.users.push({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      isActive: true
    });
  }

  const expenses = await ExpenseModel.find();
  for (const expense of expenses) {
    const expenseRecord = {
      expenseId: expense._id.toString(),
      employeeId: expense.employeeId?.toString(),
      employeeName: expense.employeeName,
      employeeEmail: expense.employeeEmail,
      department: expense.department,
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      ocrText: expense.ocrText || '',
      receiptImage: expense.receiptImage,
      status: expense.status,
      currentLevel: expense.currentLevel,
      fraudScore: expense.fraudScore,
      fraudLevel: expense.fraudLevel,
      fraudFlags: expense.fraudFlags,
      managerId: expense.managerId?.toString(),
      managerName: expense.managerName,
      financeId: expense.financeId?.toString(),
      financeName: expense.financeName,
      createdAt: expense.createdAt?.toISOString(),
      updatedAt: expense.updatedAt?.toISOString(),
      timeline: expense.timeline
    };

    dataset.expenses.push(expenseRecord);

    dataset.statistics.totalExpenses++;
    dataset.statistics.totalAmount += expense.amount;

    if (!dataset.statistics.byCategory[expense.category]) {
      dataset.statistics.byCategory[expense.category] = { count: 0, amount: 0 };
    }
    dataset.statistics.byCategory[expense.category].count++;
    dataset.statistics.byCategory[expense.category].amount += expense.amount;

    if (!dataset.statistics.byDepartment[expense.department]) {
      dataset.statistics.byDepartment[expense.department] = { count: 0, amount: 0 };
    }
    dataset.statistics.byDepartment[expense.department].count++;
    dataset.statistics.byDepartment[expense.department].amount += expense.amount;

    updateStatusStatistics(dataset, expense.status);
  }

  for (const expense of expenses) {
    if (expense.status === 'Fully Approved') {
      dataset.statistics.approvedAmount += expense.amount;
      dataset.statistics.totalApproved++;
    } else if (expense.status === 'Rejected') {
      dataset.statistics.rejectedAmount += expense.amount;
      dataset.statistics.totalRejected++;
    }
  }

  saveDataset(dataset);
  return dataset;
};

// Get dataset for download
const getDatasetForDownload = (format = 'json') => {
  const dataset = loadDataset();

  if (format === 'csv') {
    return convertToCSV(dataset.expenses);
  }

  return dataset;
};

// Convert to CSV format
const convertToCSV = (expenses) => {
  const headers = [
    'Expense ID', 'Employee Name', 'Employee Email', 'Department',
    'Amount', 'Category', 'Description', 'Status', 'Current Level',
    'Manager Name', 'Finance Name', 'Fraud Score', 'Fraud Level',
    'Created At', 'Updated At'
  ];

  const rows = expenses.map(e => [
    e.expenseId,
    e.employeeName,
    e.employeeEmail,
    e.department,
    e.amount,
    e.category,
    `"${(e.description || '').replace(/"/g, '""')}"`,
    e.status,
    e.currentLevel,
    e.managerName || '',
    e.financeName || '',
    e.fraudScore || '',
    e.fraudLevel || '',
    e.createdAt,
    e.updatedAt
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

module.exports = {
  loadDataset,
  saveDataset,
  addUser,
  addExpense,
  updateExpense,
  addApproval,
  addRejection,
  getDataset,
  syncFromDatabase,
  getDatasetForDownload
};
