<div align="center">

# ⚡ shopScribe AI
### Gen-AI Dynamic Product Catalog & Marketing Copy Generator

**ThinkFest National Hackathon 2025 · Problem Statement P3**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![Groq](https://img.shields.io/badge/AI-Groq%20%2F%20Llama%204-F55036?style=flat-square)](https://groq.com/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)

*From raw specs to scroll-stopping copy — in seconds.*

## 🎥 Demo & Project Resources

A full working demonstration, screen-recorded walkthrough, and the detailed project overview PDF can be accessed here:

🔗 **Project Resources (Demo Video + Overview PDF)**  
<https://drive.google.com/drive/folders/1tmXRUI16E4llmp4mFXr_w6HEROJqscZd?usp=drive_link>

Contents:
- 📹 Complete working demo (screen recording)
- 📄 Project overview presentation / documentation
- 🧠 Explanation of features and workflow


</div>

---

## 📌 Problem Statement

E-commerce managers waste hours manually crafting product descriptions, SEO tags, and social media copy for hundreds of new inventory items. **CopyForge AI** solves this by transforming a single product input — a set of technical specs or a raw product image — into rich, multi-platform marketing collateral instantly.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🖊️ **Raw Spec Ingestion** | Form-based input for weight, material, color, dimensions, price, and custom fields |
| 🖼️ **Image-to-Copy** | Upload a product photo; the vision model analyzes it and incorporates visual details into all copy |
| 📝 **SEO Web Description** | 150–200 word, keyword-rich storefront description optimized for search engines |
| 📸 **Instagram Caption** | Punchy, emoji-filled caption with 8–10 trending hashtags |
| 💼 **LinkedIn Post** | Professional business-value post with a subtle CTA and up to 3 relevant tags |
| 🏷️ **Dynamic Tag Generation** | 8 auto-generated search/category tags for product database indexing |
| 📦 **Bulk CSV Upload** | Process an entire product inventory file in one go; watch results populate in real time |
| 💾 **Product Catalog** | Save generated content to MongoDB; browse and manage your full product library |
| 🤖 **AI Chat Assistant** | "CopyForge AI Assistant" — an in-app marketing expert for copy tips and brainstorming |
| 🎛️ **Tone & Style Controls** | Choose tone (professional/playful/urgent), writing style, brand voice, and output language |
| 🔐 **Auth & Admin Panel** | JWT-based login/registration; admin dashboard with charts for users, products, and tags |

---

## 🏗️ Architecture

```
CopyForge AI
├── frontend/               # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Generator.jsx       # Core copy generation UI
│   │   │   ├── BulkUpload.jsx      # CSV batch processing
│   │   │   ├── Catalog.jsx         # Saved product browser
│   │   │   ├── AdminDashboard.jsx  # Analytics & management
│   │   │   └── AuthPage.jsx        # Login / Register
│   │   └── components/
│   │       ├── SpecForm.jsx        # Product input form
│   │       ├── CopyOutput.jsx      # Rendered AI results
│   │       └── ChatWidget.jsx      # Floating AI assistant
│
└── backend/                # Node.js + Express + MongoDB
    ├── controllers/
    │   ├── generateController.js   # Groq API integration & prompt engineering
    │   ├── chatController.js       # AI assistant chat handler
    │   ├── productController.js    # CRUD for saved products
    │   ├── authController.js       # JWT authentication
    │   └── adminController.js      # Admin analytics endpoints
    ├── models/
    │   ├── Product.js              # Product schema (specs, copy, tags, image)
    │   └── User.js                 # User schema with role support
    └── routes/                     # Modular Express routers
```

---

## 🤖 AI Models Used

| Task | Model | Provider |
|---|---|---|
| Spec-to-copy generation | `llama-3.3-70b-versatile` | Groq |
| Image + spec generation | `meta-llama/llama-4-scout-17b-16e-instruct` | Groq |
| AI Chat Assistant | `llama-3.3-70b-versatile` | Groq |

The generation prompt enforces a **strict JSON schema** so the frontend can reliably parse and render all three copy variants plus tag arrays with zero post-processing.

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)
- A [Groq API key](https://console.groq.com/) (free tier available)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/thinkfest_final.git
cd thinkfest_final
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/copyforge
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_jwt_secret_here
```

Seed the admin account (optional):

```bash
node scripts/seedAdmin.js
```

Start the backend server:

```bash
npm run dev        # Development (nodemon)
npm start          # Production
```

### 3. Configure the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The app will be available at **`http://localhost:5173`**. The Vite dev server proxies `/api` requests to the backend on port `5000`.

---

## 📋 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/generate` | No | Generate copy from specs / image |
| `GET` | `/api/products` | No | List all saved products |
| `POST` | `/api/products` | No | Save a generated product |
| `DELETE` | `/api/products/:id` | No | Delete a product |
| `POST` | `/api/chat` | No | Chat with AI assistant |
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Login and receive JWT |
| `GET` | `/api/admin/stats` | Admin JWT | Dashboard analytics |
| `GET` | `/api/admin/users` | Admin JWT | Manage users |

---

## 📄 Bulk Upload CSV Format

The bulk upload feature accepts a CSV with the following columns:

```csv
name,category,price,material,color,weight,dimensions,extra
Wireless Earbuds Pro,Electronics,$79.99,Aluminium,Midnight Black,45g,3x2x1 cm,"ANC, 30hr battery, IPX5"
Organic Cotton Tee,Fashion,$34.99,Cotton,Forest Green,180g,,"Unisex, pre-shrunk, eco-dyed"
```

All columns except `name` are optional. The system processes each row sequentially and displays live progress.

---

## 🛠️ Tech Stack

**Frontend**
- React 18, React Router v7
- Vite (build tool)
- Tailwind CSS (styling)
- Framer Motion (animations)
- Recharts (admin analytics)
- Axios (HTTP client)
- Lucide React (icons)

**Backend**
- Node.js with ES Modules
- Express.js
- MongoDB + Mongoose
- Groq SDK (LLM inference)
- Multer (image uploads)
- bcryptjs + JWT (authentication)

---

## 🗂️ Project Structure at a Glance

```
thinkfest_final/
├── backend/
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth & admin guards
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express route definitions
│   ├── scripts/            # Utility scripts (seed admin)
│   ├── index.js            # App entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level page components
│   │   ├── App.jsx         # Router setup
│   │   └── main.jsx        # React entry point
│   ├── index.html
│   └── package.json
└── README.md
```

---

## 👥 Team

Built with ❤️ for **ThinkFest National Hackathon 2025**

> Problem Statement **P3** — Gen-AI Dynamic Product Catalog & Marketing Copy Generator

---

## 📃 License

This project was developed for hackathon purposes. All rights reserved by the respective team members.
