const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  employeeEmail: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['Travel', 'Supplies', 'Software', 'Food', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  ocrText: {
    type: String,
    default: ''
  },
  receiptImage: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Auto-Approved', 'Pending Manager', 'Pending Finance', 'Approved', 'Rejected', 'Fully Approved'],
    default: 'Pending Manager'
  },
  currentLevel: {
    type: Number,
    default: 1 // 0=Auto, 1=Manager, 2=Finance
  },
  managerRemark: {
    type: String,
    default: null
  },
  financeRemark: {
    type: String,
    default: null
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  managerName: {
    type: String,
    default: null
  },
  financeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  financeName: {
    type: String,
    default: null
  },
  timeline: [{
    status: String,
    actionBy: String,
    remark: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  fraudScore: {
    type: Number,
    default: 0
  },
  fraudLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  fraudFlags: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
