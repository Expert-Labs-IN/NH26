# AI Marketing Platform TEAM CODE 60

A scalable AI-powered marketing content generation platform with OTP-based authentication.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + Nodemailer (OTP verification)
- **AI Models:** OpenAI GPT-4 + Google Gemini

## Features

- JWT-based authentication with OTP email verification
- AI-powered marketing content generation
- Support for multiple AI models (OpenAI/Gemini)
- Generate SEO descriptions, Instagram captions, LinkedIn posts, and tags
- A/B variations: Emotional, Technical, Sales
- Copy-to-clipboard functionality
- Clean, modern SaaS-style UI

## Project Structure

```
├── backend/
│   ├── config/        # Database configuration
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Auth middleware
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── services/      # AI services (OpenAI, Gemini, Email)
│   ├── .env           # Environment variables
│   └── server.js      # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── App.jsx      # Main app component
    │   └── main.jsx     # Entry point
    ├── .env             # Environment variables
    └── index.html
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB installed locally or MongoDB Atlas account
- Gmail account (for OTP emails) or other SMTP provider
- OpenAI API key
- Google Gemini API key

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `/backend`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-marketing
JWT_SECRET=your-super-secret-jwt-key

# Gmail SMTP (use App Password, not regular password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# AI API Keys
OPENAI_API_KEY=sk-your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
```

**Note:** For Gmail, enable 2FA and generate an App Password at https://myaccount.google.com/apppasswords

Start the backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in `/frontend`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

## Usage

1. Visit `http://localhost:3000`
2. Sign up with your email
3. Enter the OTP sent to your email
4. Login with your credentials
5. Fill in product details and select AI model
6. Click "Generate Campaign"
7. View content in Overview tab or switch to Variations tab
8. Copy any content with the copy button

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/verify-otp | Verify email OTP |
| POST | /api/auth/login | User login |
| POST | /api/auth/resend-otp | Resend OTP |
| POST | /api/campaign/generate | Generate campaign (protected) |

## AI Response Format

```json
{
  "seo": "SEO description...",
  "instagram": "Instagram caption...",
  "linkedin": "LinkedIn post...",
  "tags": ["tag1", "tag2", ...],
  "variations": {
    "emotional": { "seo": "...", "instagram": "...", "linkedin": "...", "tags": [...] },
    "technical": { "seo": "...", "instagram": "...", "linkedin": "...", "tags": [...] },
    "sales": { "seo": "...", "instagram": "...", "linkedin": "...", "tags": [...] }
  }
}
