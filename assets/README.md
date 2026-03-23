# Multi-Tier Expense Approval Workflow

A full-stack web application for managing expense submissions with multi-level approval workflow, fraud detection, and data visualization.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                     │
│   ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐   │
│   │  Employee   │  │   Manager    │  │       Finance           │   │
│   │  Dashboard  │  │  Dashboard   │  │      Dashboard          │   │
│   └─────────────┘  └──────────────┘  └─────────────────────────┘   │
└────────────────────────────┬──────────────────────────────────────┘
                             │ HTTP/REST API
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Express.js)                            │
│   ┌──────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│   │ Auth Routes  │  │  Expense    │  │   Fraud Detection       │  │
│   │              │  │  Routes     │  │   Engine                │  │
│   └──────────────┘  └─────────────┘  └─────────────────────────┘  │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB + Mongoose)                    │
│   ┌──────────────┐  ┌─────────────┐                                 │
│   │    Users     │  │  Expenses   │                                 │
│   │   Collection│  │  Collection │                                 │
│   └──────────────┘  └─────────────┘                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | Latest | Runtime environment |
| Express.js | ^4.18.2 | Web framework & REST API |
| MongoDB | - | Primary database |
| Mongoose | ^8.0.3 | ODM for MongoDB |
| JSON Web Token (JWT) | ^9.0.2 | Authentication |
| bcryptjs | ^2.4.3 | Password hashing |
| multer | ^1.4.5-lts.1 | File upload handling |
| cors | ^2.8.5 | Cross-origin resource sharing |
| dotenv | ^16.3.1 | Environment variable management |
| mongodb-memory-server | ^11.0.1 | In-memory MongoDB for testing |

#### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^18.2.0 | UI framework |
| Vite | ^5.0.8 | Build tool & dev server |
| React Router DOM | ^6.21.0 | Client-side routing |
| Axios | ^1.6.2 | HTTP client |
| Tailwind CSS | ^3.3.6 | Styling framework |
| Recharts | ^2.10.3 | Data visualization |
| Tesseract.js | ^7.0.0 | OCR for receipt scanning |
| react-hot-toast | ^2.6.0 | Toast notifications |
| PostCSS | ^8.4.32 | CSS processing |
| Autoprefixer | ^10.4.16 | CSS vendor prefixes |

---

## Project Structure

```
multi tier expence approvel workflow/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   └── expenseController.js # Expense CRUD & approval logic
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification middleware
│   ├── models/
│   │   ├── User.js            # User schema (Employee, Manager, Finance)
│   │   └── Expense.js        # Expense schema with approval workflow
│   ├── routes/
│   │   ├── authRoutes.js      # Auth API endpoints
│   │   └── expenseRoutes.js  # Expense API endpoints
│   ├── utils/
│   │   ├── datasetManager.js  # Data synchronization utility
│   │   ├── fraudDetection.js  # Fraud analysis engine
│   │   └── fraudConfigManager.js # Fraud detection config
│   ├── data/
│   │   └── expense_dataset.json # Sample expense data
│   ├── uploads/               # File upload storage
│   ├── server.js              # Main entry point
│   ├── .env                   # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── BudgetChart.jsx      # Budget visualization
    │   │   ├── ExpenseCard.jsx       # Expense display card
    │   │   ├── FraudBadge.jsx        # Fraud indicator
    │   │   ├── Navbar.jsx             # Navigation bar
    │   │   ├── StatusTimeline.jsx    # Approval timeline
    │   │   ├── ThemeToggle.jsx        # Dark/light mode
    │   │   └── YearExpenseChart.jsx   # Yearly expense chart
    │   ├── context/
    │   │   ├── AuthContext.jsx       # Authentication state
    │   │   └── ThemeContext.jsx       # Theme state
    │   ├── pages/
    │   │   ├── Login.jsx              # Login page
    │   │   ├── EmployeeDashboard.jsx  # Employee view
    │   │   ├── ManagerDashboard.jsx   # Manager view
    │   │   └── FinanceDashboard.jsx   # Finance team view
    │   ├── App.jsx                    # Root component
    │   ├── main.jsx                   # Entry point
    │   └── index.css                  # Global styles
    ├── public/                        # Static assets
    ├── dist/                          # Production build
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## Key Features

### 1. Multi-Tier Approval Workflow

The system implements a three-tier approval system:

| Level | Role | Approval Threshold |
|-------|------|-------------------|
| 0 (Auto) | System | Amounts < $100 |
| 1 | Manager | Amounts $100 - $1000 |
| 2 | Finance | Amounts > $1000 |

**Approval Flow:**
```
Employee Submits Expense
        │
        ▼
   Amount < $100? ──YES──► Auto-Approved
        │
       NO
        │
        ▼
  Pending Manager ──► Manager Reviews ──► Approved/Rejected
                                          │
                              Amount > $1000?
                                    │
                                   YES
                                    │
                                    ▼
                            Pending Finance ──► Finance Final Approval
```

### 2. Role-Based Access Control (RBAC)

Three user roles with distinct permissions:

- **Employee**: Submit expenses, view own submissions, upload receipts
- **Manager**: Review expenses from department, approve/reject, view department analytics
- **Finance**: Final approval for high-value expenses, comprehensive analytics

### 3. Fraud Detection System

Automated fraud analysis with configurable risk factors:

| Risk Factor | Weight | Description |
|-------------|--------|-------------|
| Duplicate Amount | High | Similar amounts in short timeframe |
| Unusual Timing | Medium | Submission outside business hours |
| Category Mismatch | Medium | Description doesn't match category |
| High Amount Pattern | High | Consistently high-value submissions |
| Weekend Submission | Low | Expenses submitted on weekends |

**Fraud Levels:**
- `low`: Score 0-25
- `medium`: Score 26-50
- `high`: Score 51-75
- `critical`: Score 76-100

### 4. OCR Receipt Scanning

Using Tesseract.js for extracting text from receipt images, enabling automatic data population.

### 5. Data Visualization

Interactive charts using Recharts:
- Yearly expense trends (bar chart)
- Budget allocation by category (pie chart)
- Monthly expense breakdown

### 6. Theme Support

Dark/Light mode toggle with persistent user preference.

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/current` | Get current user |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses (filtered by role) |
| POST | `/api/expenses` | Submit new expense |
| GET | `/api/expenses/:id` | Get expense by ID |
| PUT | `/api/expenses/:id/approve` | Approve expense |
| PUT | `/api/expenses/:id/reject` | Reject expense |
| GET | `/api/expenses/stats` | Get expense statistics |
| POST | `/api/expenses/:id/ocr` | Process receipt OCR |

---

## Database Schema

### User Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'employee' | 'manager' | 'finance',
  department: 'Marketing' | 'IT' | 'HR' | 'Sales' | 'Finance',
  createdAt: Date,
  updatedAt: Date
}
```

### Expense Collection
```javascript
{
  employeeId: ObjectId (ref: User),
  employeeName: String,
  employeeEmail: String,
  department: String,
  amount: Number,
  category: 'Travel' | 'Supplies' | 'Software' | 'Food' | 'Other',
  description: String,
  receiptImage: String,
  status: 'Auto-Approved' | 'Pending Manager' | 'Pending Finance' | 'Approved' | 'Rejected' | 'Fully Approved',
  currentLevel: Number (0=Auto, 1=Manager, 2=Finance),
  managerId: ObjectId (ref: User),
  managerName: String,
  managerRemark: String,
  financeId: ObjectId (ref: User),
  financeName: String,
  financeRemark: String,
  timeline: [{
    status: String,
    actionBy: String,
    remark: String,
    timestamp: Date
  }],
  fraudScore: Number,
  fraudLevel: 'low' | 'medium' | 'high' | 'critical',
  fraudFlags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-flow
JWT_SECRET=your-secret-key
```

---

## Running the Application

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Default Test Accounts
| Email | Password | Role |
|-------|----------|------|
| john@company.com | password123 | Employee |
| sarah.manager@company.com | password123 | Manager |
| finance@company.com | password123 | Finance |

---

## Build for Production

### Frontend Build
```bash
cd frontend
npm run build
```

The production files will be generated in `frontend/dist/`.

---

## Project Summary

This is a comprehensive expense management system with:
- **Frontend**: React 18 + Vite with Tailwind CSS
- **Backend**: Express.js REST API with MongoDB
- **Authentication**: JWT-based with bcrypt password hashing
- **Workflow**: Multi-tier approval (Auto → Manager → Finance)
- **Analytics**: Real-time data visualization with Recharts
- **Intelligence**: Fraud detection with configurable risk scoring
- **OCR**: Receipt text extraction with Tesseract.js

The application demonstrates enterprise-grade patterns including role-based access control, approval workflows, audit trails (timeline), and automated fraud detection.