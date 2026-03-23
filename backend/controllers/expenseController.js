const Expense = require('../models/Expense');
const User = require('../models/User');
const { analyzeFraud } = require('../utils/fraudDetection');
const datasetManager = require('../utils/datasetManager');

// @desc    Create new expense
// @route   POST /api/expenses
const createExpense = async (req, res) => {
  try {
    const { amount, category, description, department, ocrText } = req.body;

    // Run fraud detection analysis
    const fraudResult = await analyzeFraud({
      amount: Number(amount),
      category,
      description,
      ocrText,
      employeeId: req.user._id
    });

    let status = 'Pending Manager';
    let currentLevel = 1;
    let timeline = [{
      status: 'Submitted',
      actionBy: req.user.name,
      remark: `Expense submitted for $${amount}`,
      timestamp: new Date()
    }];

    // Auto-approval for amounts < $100
    if (amount < 100) {
      status = 'Fully Approved';
      currentLevel = 0;
      timeline.push({
        status: 'Auto-Approved',
        actionBy: 'System',
        remark: 'Amount less than $100 - automatically approved',
        timestamp: new Date()
      });
    }

    // Add fraud detection timeline entry if flagged
    if (fraudResult.level !== 'low') {
      timeline.push({
        status: 'Fraud Alert',
        actionBy: 'System',
        remark: `Fraud risk: ${fraudResult.level.toUpperCase()} (${fraudResult.score}% risk score) - ${fraudResult.flags.join('; ')}`,
        timestamp: new Date()
      });
    }

    const expense = await Expense.create({
      employeeId: req.user._id,
      employeeName: req.user.name,
      employeeEmail: req.user.email,
      department: req.user.department || department,
      amount,
      category,
      description,
      ocrText: ocrText || '',
      receiptImage: req.file ? `/uploads/${req.file.filename}` : null,
      status,
      currentLevel,
      timeline,
      fraudScore: fraudResult.score,
      fraudLevel: fraudResult.level,
      fraudFlags: fraudResult.flags
    });

    // Add to dataset
    datasetManager.addExpense(expense);

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employee's own expenses
// @route   GET /api/expenses/employee
const getEmployeeExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ employeeId: req.user._id }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get manager's pending requests
// @route   GET /api/expenses/manager
const getManagerExpenses = async (req, res) => {
  try {
    // Managers see pending requests from their department
    const expenses = await Expense.find({
      department: req.user.department,
      status: { $in: ['Pending Manager', 'Pending Finance', 'Fully Approved', 'Rejected'] }
    }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get finance's pending requests
// @route   GET /api/expenses/finance
const getFinanceExpenses = async (req, res) => {
  try {
    // Finance sees requests requiring final approval (amount > $1000)
    const expenses = await Expense.find({
      status: 'Pending Finance'
    }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manager approve/reject expense
// @route   PUT /api/expenses/:id/manager-action
const managerAction = async (req, res) => {
  try {
    const { action, remark } = req.body; // action: 'approve' or 'reject'
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.status !== 'Pending Manager') {
      return res.status(400).json({ message: 'Expense is not pending manager approval' });
    }

    expense.managerId = req.user._id;
    expense.managerName = req.user.name;

    if (action === 'approve') {
      // If amount > $1000, send to Finance
      if (expense.amount > 1000) {
        expense.status = 'Pending Finance';
        expense.currentLevel = 2;
      } else {
        expense.status = 'Fully Approved';
        expense.currentLevel = 1;
      }
      expense.timeline.push({
        status: 'Approved by Manager',
        actionBy: req.user.name,
        remark: remark || 'Approved',
        timestamp: new Date()
      });

      // Track approval in dataset
      datasetManager.addApproval(expense._id, {
        level: 1,
        approvedBy: req.user._id.toString(),
        approverName: req.user.name,
        approverEmail: req.user.email,
        approverRole: req.user.role,
        amount: expense.amount,
        category: expense.category,
        employeeName: expense.employeeName,
        employeeEmail: expense.employeeEmail,
        department: expense.department,
        remark: remark || 'Approved',
        previousStatus: 'Pending Manager',
        newStatus: expense.status
      });
    } else {
      expense.status = 'Rejected';
      expense.managerRemark = remark;
      expense.timeline.push({
        status: 'Rejected by Manager',
        actionBy: req.user.name,
        remark: remark || 'Rejected',
        timestamp: new Date()
      });

      // Track rejection in dataset
      datasetManager.addRejection(expense._id, {
        level: 1,
        rejectedBy: req.user._id.toString(),
        rejecterName: req.user.name,
        rejecterEmail: req.user.email,
        rejecterRole: req.user.role,
        amount: expense.amount,
        category: expense.category,
        employeeName: expense.employeeName,
        employeeEmail: expense.employeeEmail,
        department: expense.department,
        remark: remark || 'Rejected',
        previousStatus: 'Pending Manager',
        newStatus: 'Rejected'
      });
    }

    await expense.save();

    // Update expense in dataset
    datasetManager.updateExpense(expense._id.toString(), {
      status: expense.status,
      managerId: expense.managerId,
      managerName: expense.managerName,
      managerRemark: expense.managerRemark,
      timeline: expense.timeline
    });

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Finance approve/reject expense
// @route   PUT /api/expenses/:id/finance-action
const financeAction = async (req, res) => {
  try {
    const { action, remark } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.status !== 'Pending Finance') {
      return res.status(400).json({ message: 'Expense is not pending finance approval' });
    }

    expense.financeId = req.user._id;
    expense.financeName = req.user.name;

    if (action === 'approve') {
      expense.status = 'Fully Approved';
      expense.timeline.push({
        status: 'Fully Approved',
        actionBy: req.user.name,
        remark: remark || 'Final approval granted',
        timestamp: new Date()
      });

      // Track approval in dataset
      datasetManager.addApproval(expense._id, {
        level: 2,
        approvedBy: req.user._id.toString(),
        approverName: req.user.name,
        approverEmail: req.user.email,
        approverRole: req.user.role,
        amount: expense.amount,
        category: expense.category,
        employeeName: expense.employeeName,
        employeeEmail: expense.employeeEmail,
        department: expense.department,
        remark: remark || 'Final approval granted',
        previousStatus: 'Pending Finance',
        newStatus: 'Fully Approved'
      });
    } else {
      expense.status = 'Rejected';
      expense.financeRemark = remark;
      expense.timeline.push({
        status: 'Rejected by Finance',
        actionBy: req.user.name,
        remark: remark || 'Rejected',
        timestamp: new Date()
      });

      // Track rejection in dataset
      datasetManager.addRejection(expense._id, {
        level: 2,
        rejectedBy: req.user._id.toString(),
        rejecterName: req.user.name,
        rejecterEmail: req.user.email,
        rejecterRole: req.user.role,
        amount: expense.amount,
        category: expense.category,
        employeeName: expense.employeeName,
        employeeEmail: expense.employeeEmail,
        department: expense.department,
        remark: remark || 'Rejected',
        previousStatus: 'Pending Finance',
        newStatus: 'Rejected'
      });
    }

    await expense.save();

    // Update expense in dataset
    datasetManager.updateExpense(expense._id.toString(), {
      status: expense.status,
      financeId: expense.financeId,
      financeName: expense.financeName,
      financeRemark: expense.financeRemark,
      timeline: expense.timeline
    });

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get expense stats for charts
// @route   GET /api/expenses/stats
const getExpenseStats = async (req, res) => {
  try {
    const stats = await Expense.aggregate([
      { $match: { status: 'Fully Approved' } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get fraud statistics for dashboards
// @route   GET /api/expenses/fraud-stats
const getFraudStats = async (req, res) => {
  try {
    const totalFlagged = await Expense.countDocuments({ fraudLevel: { $ne: 'low' } });
    const criticalCount = await Expense.countDocuments({ fraudLevel: 'critical' });
    const highCount = await Expense.countDocuments({ fraudLevel: 'high' });
    const mediumCount = await Expense.countDocuments({ fraudLevel: 'medium' });

    const recentFlagged = await Expense.find({ fraudLevel: { $ne: 'low' } })
      .sort({ fraudScore: -1 })
      .limit(10)
      .select('employeeName amount category fraudScore fraudLevel fraudFlags status createdAt');

    const avgFraudScore = await Expense.aggregate([
      { $match: { fraudLevel: { $ne: 'low' } } },
      { $group: { _id: null, avgScore: { $avg: '$fraudScore' } } }
    ]);

    res.json({
      totalFlagged,
      criticalCount,
      highCount,
      mediumCount,
      avgScore: avgFraudScore.length > 0 ? Math.round(avgFraudScore[0].avgScore) : 0,
      recentFlagged
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all expenses (for finance export)
// @route   GET /api/expenses/all
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createExpense,
  getEmployeeExpenses,
  getManagerExpenses,
  getFinanceExpenses,
  managerAction,
  financeAction,
  getExpenseStats,
  getFraudStats,
  getExpenseById,
  getAllExpenses
};

