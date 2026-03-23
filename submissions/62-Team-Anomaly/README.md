# WorkSync AI

WorkSync AI is an autonomous enterprise support intelligence system designed to serve as the primary resolution layer for workplace complaints and IT service requests. By leveraging advanced neural processing and real-time data orchestration, the platform automates Level 1 support, reduces operational overhead, and ensures high-precision ticket routing.

## Project Overview

Traditional ticketing systems often suffer from manual entry bottlenecks and delayed department routing. WorkSync AI replaces these legacy workflows with a conversational intelligence layer that intercept issues at the point of origin.

Key efficiency gains:
- **Autonomous Deflection**: Handles routine queries via a local LLM-powered chat interface.
- **Neural Synthesis**: Instantly converts unresolved chat transcripts into structured operational tickets.
- **Smart Prioritization**: Classifies issue severity using reasoning models to ensure SLA compliance.

## Core Features

- **Conversational AI Interface**: A high-fidelity chat assistant for real-time problem reporting.
- **Automated Ticket Generation**: Zero-manual-entry ticket creation from neural transcripts.
- **AI Severity Classification**: Automated scoring across Low, Medium, High, and Critical tiers.
- **Departmental Routing**: Intelligent dispatching to HR, IT, Finance, or Facilities nodes.
- **Agent Intelligence Center**: A centralized dashboard for human-in-the-loop resolution and ticket claiming.
- **Resolution Drafting**: AI-generated response suggestions and 3-point issue summaries for agents.
- **Real-Time Data Streams**: WebSocket-driven updates for ticket status and activity feeds.
- **Duplicate Detection Engine**: Neural cross-referencing to prevent redundant issue logging.
- **Predictive Analytics**: Insights into department performance and resolution efficiency.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend & Infrastructure
- **Real-time Layer**: Supabase (PostgreSQL + WebSockets)
- **Authentication**: Supabase Auth (Multi-role support)
- **Database**: PostgreSQL with Row-Level Security (RLS)

### Neural Layer
- **Primary AI**: Groq Llama 3 (Ultra-low latency inference)
- **Context Engine**: Perplexity API (Deep reasoning)
- **Local Fallback**: Ollama (IBM Granite / Qwen support)

### Analytics & Logging
- **Insights**: Google BigQuery integration
- **Audit Logs**: Google Sheets API synchronization

## System Architecture

The WorkSync resolution pipeline follows a strict four-stage flow:

1. **Intake**: The user interacts with the AI Assistant. The Neural Bridge monitors the conversation for resolution indicators.
2. **Synthesis**: If the issue remains unresolved, the AI generates a structured operational ticket, extracting entities and generating a technical summary.
3. **Orchestration**: The ticket is stored in Supabase and pushed via WebSockets to the respective department's Agent Dashboard.
4. **Resolution**: A human agent claims the ticket, utilizes the AI-drafted reply, and marks the issue as resolved, triggering a real-time update to the user portal.

## Modules

- **User Portal**: Personalized view for employees to track their active nodes.
- **Intelligence Center**: Senior administrative view for global operations metrics.
- **Resolution Node**: Dedicated interface for human agents to process tickets.
- **Neural Bridge**: The server-side logic handling LLM processing and ticket synthesis.
- **Deduplication Engine**: Backend logic for maintaining data integrity across similar reports.

## Installation

### Prerequisites
- Node.js 18+
- Supabase Project
- Groq API Key

### Setup Steps
1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-repo/worksync-ai.git
   cd worksync-ai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd client && npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` in the `client` directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Database Initialization**
   Run the SQL provided in `schema_update.sql` within your Supabase SQL Editor to establish the required operational tables (tickets, action_logs).

5. **Execute Development Suite**
   ```bash
   npm run dev
   ```

## Folder Structure

```text
worksync/
├── client/                 # Next.js Application
│   ├── src/
│   │   ├── app/           # App Router Pages
│   │   ├── components/    # Atomic UI Modules (Portal, Landing, Auth)
│   │   ├── context/       # Auth & Session management
│   │   ├── lib/           # Neural Bridge & Supabase Client
│   │   └── styles/        # Global Neural Glow Tokens
├── server/                # Supplementary API logic
├── ai/                    # Local LLM (Ollama) configurations
└── supabase/              # Database migration & seed logic
```

## Future Roadmap

- **Voice AI Integration**: Full-duplex voice reporting via phone interface.
- **Predictive issue detection**: Identifying department bottlenecks before they occur.
- **Multi-language Support**: Neural translation for global enterprise deployment.
- **Enterprise Connectors**: Native integrations for Slack, Microsoft Teams, and Jira.

## Demo

- **Admin Login**: Use any email ending in `@admin.com` to access the Intelligence Center.
- **User Portal**: Standard signup provides immediate access to the AI Assistant.

---
Built during **WorkSync National Hackathon**.
Contributions are welcome via Pull Requests.

## License
MIT License
