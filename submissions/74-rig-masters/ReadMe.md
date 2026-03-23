## 📌 Overview
This pull request contains our submission for NH26 under **Team 74 - Rig Masters**.

We have built an **AI-powered voice-enabled email assistant** that allows users to interact with emails using natural speech, improving accessibility and productivity.

---

## 🚀 Features

- 🎤 **Voice Interaction**
  - Users can speak commands to read, reply, and manage emails

- 🤖 **AI-Powered Processing**
  - Email summarization
  - Smart reply generation
  - Email classification

- 📧 **Email Handling**
  - Fetch and display emails
  - Generate replies automatically
  - Streamlined email workflow

- 🧠 **Speech Recognition + Processing**
  - Converts speech → text → actionable commands

---

## 🏗️ Tech Stack

### Frontend
- React (TypeScript)
- Responsive UI

### Backend
- FastAPI
- REST APIs

### Voice Service
- Speech-to-text processing
- AI integration

---

## 📂 Project Structure
backend/ → FastAPI backend services
frontend/ → React frontend application
voice_service/ → Speech processing module


---

## 🎥 Demo Video
https://www.loom.com/share/fa3b6fefc7194755bca405495fb5e8fa

---

## ⚙️ Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/Sathwik656/NH26.git
cd NH26/submissions/74-rig-masters

#### Backend Setup 
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload 

#### Frontend Setup 
cd frontend
npm install
npm run dev

##### cd voice_service 
pip install -r requirements.txt 
uvicorn app.main:app --reload 
