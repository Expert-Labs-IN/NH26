const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
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
} = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const datasetManager = require('../utils/datasetManager');
const { loadFraudConfig, updateFraudConfig } = require('../utils/fraudConfigManager');
const Expense = require('../models/Expense');
const User = require('../models/User');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/', protect, upload.single('receiptImage'), createExpense);
router.get('/employee', protect, getEmployeeExpenses);
router.get('/manager', protect, getManagerExpenses);
router.get('/finance', protect, getFinanceExpenses);
router.get('/stats', protect, getExpenseStats);
router.get('/fraud-stats', protect, getFraudStats);
router.get('/all', protect, getAllExpenses);

// Fraud configuration routes (finance admin)
router.get('/fraud-config', protect, authorize('finance'), (req, res) => {
  try {
    const config = loadFraudConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/fraud-config', protect, authorize('finance'), (req, res) => {
  try {
    const updatedConfig = updateFraudConfig(req.body || {});
    res.json({
      message: 'Fraud detection parameters updated successfully',
      config: updatedConfig
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dataset download routes
router.get('/dataset/download', protect, authorize('finance'), (req, res) => {
  try {
    const format = String(req.query.format || 'csv').toLowerCase();
    if (format !== 'csv') {
      return res.status(400).json({ message: 'JSON dataset download is no longer supported. Please use CSV.' });
    }

    const dataset = datasetManager.getDatasetForDownload('csv');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=expense_dataset_${Date.now()}.csv`);
    res.send(dataset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dataset statistics
router.get('/dataset/stats', protect, authorize('finance'), (req, res) => {
  try {
    const dataset = datasetManager.loadDataset();
    res.json(dataset.statistics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sync database to dataset
router.post('/dataset/sync', protect, authorize('finance'), async (req, res) => {
  try {
    const dataset = await datasetManager.syncFromDatabase(Expense, User);
    res.json({ message: 'Dataset synced successfully', records: dataset.metadata.totalRecords });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Full dataset view
router.get('/dataset', protect, authorize('finance'), (req, res) => {
  try {
    const dataset = datasetManager.getDataset();
    res.json(dataset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, getExpenseById);
router.put('/:id/manager-action', protect, managerAction);
router.put('/:id/finance-action', protect, financeAction);

module.exports = router;
