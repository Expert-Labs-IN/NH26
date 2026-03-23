const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Expense = require('./models/Expense');
const datasetManager = require('./utils/datasetManager');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

// Seed sample data with 100+ expenses for the year
const seedData = async () => {
  try {
    const userCount = await User.countDocuments();

    // Create users if they don't exist
    let users;
    if (userCount === 0) {
      console.log('Seeding sample data with 100+ expenses...');

      users = await User.create([
        { name: 'John Doe', email: 'john@company.com', password: 'password123', role: 'employee', department: 'Marketing' },
        { name: 'Jane Smith', email: 'jane@company.com', password: 'password123', role: 'employee', department: 'IT' },
        { name: 'Sarah Manager', email: 'sarah.manager@company.com', password: 'password123', role: 'manager', department: 'Marketing' },
        { name: 'Mike Manager', email: 'mike.manager@company.com', password: 'password123', role: 'manager', department: 'IT' },
        { name: 'Finance Admin', email: 'finance@company.com', password: 'password123', role: 'finance', department: 'Finance' },
        { name: 'Emily Johnson', email: 'emily@company.com', password: 'password123', role: 'employee', department: 'HR' },
        { name: 'David Wilson', email: 'david@company.com', password: 'password123', role: 'employee', department: 'Sales' },
        { name: 'Lisa Anderson', email: 'lisa@company.com', password: 'password123', role: 'employee', department: 'Finance' },
        { name: 'Robert Brown', email: 'robert@company.com', password: 'password123', role: 'employee', department: 'Marketing' },
        { name: 'Jennifer Davis', email: 'jennifer@company.com', password: 'password123', role: 'employee', department: 'IT' },
        { name: 'Michael Miller', email: 'michael@company.com', password: 'password123', role: 'manager', department: 'HR' },
        { name: 'Amanda Taylor', email: 'amanda@company.com', password: 'password123', role: 'manager', department: 'Sales' },
        { name: 'Christopher White', email: 'christopher@company.com', password: 'password123', role: 'manager', department: 'Finance' }
      ]);

      // Add users to dataset
      for (const user of users) {
        datasetManager.addUser(user);
      }
    } else {
      users = await User.find();
    }

    const expenseCount = await Expense.countDocuments();

    if (expenseCount < 100) {
      console.log(`Creating ${120 - expenseCount} more expenses...`);

      // Expense data templates
      const categories = ['Food', 'Travel', 'Software', 'Supplies', 'Other'];
      const departments = ['Marketing', 'IT', 'HR', 'Sales', 'Finance'];
      const descriptions = {
        'Food': ['Team lunch meeting', 'Client dinner', 'Office catering', 'Business breakfast', 'Workshop refreshments', 'Snacks for meeting', 'Pizza party', 'Celebration dinner'],
        'Travel': ['Conference travel', 'Client meeting travel', 'Training seminar', 'Branch office visit', 'Business trip', 'Flight booking', 'Hotel stay', 'Taxi/Transport'],
        'Software': ['Software license renewal', 'New software purchase', 'Subscription renewal', 'Cloud service', 'Tool upgrade', 'Antivirus software', 'Development tools', 'Design software'],
        'Supplies': ['Office supplies', 'Stationery', 'Printer supplies', 'Break room supplies', 'Cleaning supplies', 'Whiteboard markers', 'Paper ream', 'Folders and binders'],
        'Other': ['New laptop', 'Monitor purchase', 'Keyboard and mouse', 'Headphones', 'Webcam', 'Online course', 'Certification exam', 'Marketing materials', 'Team building', 'Holiday party']
      };

      const generateExpenses = (month, year) => {
        const expenses = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Generate 35-45 expenses per month
        const count = Math.floor(Math.random() * 11) + 35;

        for (let i = 0; i < count; i++) {
          const day = Math.floor(Math.random() * daysInMonth) + 1;
          const employee = users[Math.floor(Math.random() * users.filter(u => u.role === 'employee').length)];
          const category = categories[Math.floor(Math.random() * categories.length)];
          const amount = Math.floor(Math.random() * 4500) + 50;
          const description = descriptions[category][Math.floor(Math.random() * descriptions[category].length)];

          const timestamp = new Date(year, month, day);
          const statuses = ['Fully Approved', 'Fully Approved', 'Fully Approved', 'Rejected', 'Pending Manager', 'Pending Finance'];
          const status = amount < 100 ? 'Fully Approved' : statuses[Math.floor(Math.random() * statuses.length)];

          let currentLevel = 1;
          let timeline = [{
            status: 'Submitted',
            actionBy: employee.name,
            remark: `Expense submitted for $${amount}`,
            timestamp: timestamp
          }];

          let managerId = null;
          let managerName = null;
          let managerRemark = null;
          let financeId = null;
          let financeName = null;
          let financeRemark = null;

          // Auto-approve for amounts < $100
          if (amount < 100) {
            currentLevel = 0;
            timeline.push({
              status: 'Auto-Approved',
              actionBy: 'System',
              remark: 'Amount less than $100 - automatically approved',
              timestamp: new Date(timestamp.getTime() + 3600000)
            });
          } else if (status === 'Fully Approved' || status === 'Rejected') {
            // Manager approval
            const manager = users.find(u => u.department === employee.department && u.role === 'manager');
            if (manager) {
              managerId = manager._id;
              managerName = manager.name;
            }

            if (status === 'Fully Approved') {
              managerRemark = 'Approved - valid expense';
              timeline.push({
                status: 'Approved by Manager',
                actionBy: managerName || 'Manager',
                remark: managerRemark,
                timestamp: new Date(timestamp.getTime() + 86400000)
              });

              // Finance approval for amounts > $1000
              if (amount > 1000) {
                currentLevel = 2;
                const finance = users.find(u => u.role === 'finance');
                if (finance) {
                  financeId = finance._id;
                  financeName = finance.name;
                }
                timeline.push({
                  status: 'Fully Approved',
                  actionBy: financeName || 'Finance',
                  remark: 'Final approval granted',
                  timestamp: new Date(timestamp.getTime() + 172800000)
                });
              } else {
                currentLevel = 1;
              }
            } else {
              managerRemark = 'Rejected - insufficient documentation';
              timeline.push({
                status: 'Rejected by Manager',
                actionBy: managerName || 'Manager',
                remark: managerRemark,
                timestamp: new Date(timestamp.getTime() + 86400000)
              });
            }
          } else if (status === 'Pending Finance') {
            currentLevel = 2;
            const manager = users.find(u => u.department === employee.department && u.role === 'manager');
            if (manager) {
              managerId = manager._id;
              managerName = manager.name;
            }
            managerRemark = 'Approved - exceeds approval limit';
            timeline.push({
              status: 'Approved by Manager',
              actionBy: managerName || 'Manager',
              remark: managerRemark,
              timestamp: new Date(timestamp.getTime() + 86400000)
            });
          }

          expenses.push({
            employeeId: employee._id,
            employeeName: employee.name,
            employeeEmail: employee.email,
            department: employee.department,
            amount,
            category,
            description,
            status,
            currentLevel,
            timeline,
            managerId,
            managerName,
            managerRemark,
            financeId,
            financeName,
            financeRemark,
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }

        return expenses;
      };

      // Generate expenses for January, February, March 2026
      const allExpenses = [
        ...generateExpenses(0, 2026), // January
        ...generateExpenses(1, 2026), // February
        ...generateExpenses(2, 2026)  // March (current)
      ];

      await Expense.insertMany(allExpenses);
      console.log(`Created ${allExpenses.length} expenses for 2026!`);
    }

    // Sync all data to dataset
    await datasetManager.syncFromDatabase(Expense, User);
    console.log('Dataset synchronized!');
  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
};

// Connect to database and start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  seedData();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});