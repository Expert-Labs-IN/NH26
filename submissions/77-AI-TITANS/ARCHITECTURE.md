# 🏗 Architecture Documentation

## System Overview

The Agentic Email Assistant is built as a modern web application using Next.js 14 with the App Router pattern, integrating Claude AI for intelligent email analysis and action generation.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│  ┌────────────┐  ┌───────────────┐  ┌──────────────────┐   │
│  │ EmailList  │  │ EmailDetail   │  │ AnalysisPanel    │   │
│  │ Component  │→ │ Component     │→ │ Component        │   │
│  └────────────┘  └───────────────┘  └──────────────────┘   │
│         ↓                ↓                    ↓              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Main Page (app/page.tsx)                   │   │
│  │           - State Management                         │   │
│  │           - Event Handlers                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP POST
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server (API)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /api/analyze-email (route.ts)                      │   │
│  │  - Receives email data                               │   │
│  │  - Formats context for AI                            │   │
│  │  - Calls Anthropic API                              │   │
│  │  - Parses JSON response                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Request
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Anthropic Claude API                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Claude Sonnet 4 Model                              │   │
│  │  - Analyzes email content                            │   │
│  │  - Generates summary                                 │   │
│  │  - Suggests actions                                  │   │
│  │  - Returns structured JSON                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

#### 1. Main Page (`app/page.tsx`)
**Responsibility**: Application orchestration and state management

**State**:
- `emails`: Array of email objects from mock dataset
- `selectedEmail`: Currently viewed email
- `analysis`: AI analysis results for current email
- `isAnalyzing`: Loading state during AI processing
- `executedActions`: Track of approved actions
- `notification`: Toast notification state

**Key Functions**:
- `handleAnalyzeEmail()`: Triggers AI analysis
- `handleApproveAction()`: Processes action approval
- `handleRejectAction()`: Handles action rejection

#### 2. EmailList Component (`components/EmailList.tsx`)
**Responsibility**: Display inbox with priority indicators

**Props**:
- `emails`: Email array
- `selectedEmailId`: Current selection
- `onSelectEmail`: Selection handler

**Features**:
- Priority badges (Urgent, Action Required, FYI)
- VIP indicators
- Timestamp formatting
- Attachment icons

#### 3. EmailDetail Component (`components/EmailDetail.tsx`)
**Responsibility**: Display full email content

**Props**:
- `email`: Email object
- `onAnalyze`: Callback for AI analysis
- `isAnalyzing`: Loading state

**Features**:
- Sender information with avatar
- Thread history (collapsible)
- Formatted email body
- AI analyze button

#### 4. AnalysisPanel Component (`components/AnalysisPanel.tsx`)
**Responsibility**: Display AI analysis results

**Props**:
- `analysis`: AI analysis object
- `onApproveAction`: Action approval callback
- `onRejectAction`: Action rejection callback

**Features**:
- Summary display
- Sentiment indicator
- Action cards list

#### 5. ActionCard Component (`components/ActionCard.tsx`)
**Responsibility**: Display individual suggested actions

**Props**:
- `type`: Action type (reply, calendar, task)
- `data`: Action-specific data
- `confidence`: AI confidence score
- `reasoning`: Explanation
- `onApprove/onReject`: Action handlers
- `onEdit`: Edit callback (optional)

**Features**:
- Type-specific rendering
- Edit mode with form fields
- Confidence display
- Reasoning toggle

## API Layer

### Analyze Email Endpoint

**File**: `app/api/analyze-email/route.ts`

**Flow**:
1. Receive POST request with email data
2. Validate email structure
3. Build context string from email + thread
4. Call Anthropic API with structured prompt
5. Parse JSON response from AI
6. Return analysis object

**Prompt Engineering**:
- Structured instructions for AI
- JSON response format specification
- Examples of expected output
- Action type definitions

## Data Flow

### Email Analysis Flow

```
User clicks "AI Analyze"
    ↓
handleAnalyzeEmail() called
    ↓
Set isAnalyzing = true
    ↓
POST /api/analyze-email
    ↓
API builds context from email
    ↓
Call Anthropic API with prompt
    ↓
Receive AI response (text)
    ↓
Parse JSON from response
    ↓
Return AIAnalysis object
    ↓
Update analysis state
    ↓
Set isAnalyzing = false
    ↓
AnalysisPanel renders results
    ↓
ActionCards displayed
    ↓
User approves/rejects actions
```

### Action Approval Flow

```
User clicks "Approve & Execute"
    ↓
handleApproveAction(index) called
    ↓
Get action from analysis.suggestedActions[index]
    ↓
Add to executedActions array
    ↓
Show success notification
    ↓
(In production: Execute actual action)
```

## Type System

### Core Types (`types/index.ts`)

**Email**: Complete email object structure
**AIAnalysis**: AI response structure
**DraftedReply**: Email reply format
**CalendarEvent**: Calendar event format
**TaskItem**: Task format

## Styling Architecture

### Tailwind CSS Strategy

**Base Configuration**: `tailwind.config.js`
- Custom color palette
- Extended theme
- Component-specific utilities

**Global Styles**: `app/globals.css`
- Tailwind directives
- Custom animations
- Scrollbar styling
- Dark mode variables

**Component Styles**:
- Inline Tailwind classes
- Conditional styling with template literals
- Responsive breakpoints
- Dark mode variants

## State Management

**Approach**: React useState hooks at page level

**Rationale**:
- Simple application state
- No need for Redux/Context
- Easy to understand
- Sufficient for prototype

**State Flow**:
```
Page Component (app/page.tsx)
    ↓
Props drilling to child components
    ↓
Event bubbling via callbacks
```

## API Integration

### Anthropic SDK Usage

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 4096,
  temperature: 0.7,
  messages: [{ role: 'user', content: prompt }]
});
```

### Error Handling

- Try-catch blocks around API calls
- JSON parsing error handling
- User-friendly error messages
- Console logging for debugging

## Security Considerations

### Current Implementation

- API key stored in environment variables
- Server-side API calls (not exposed to client)
- No authentication (prototype)
- Mock data (no real emails)

### Production Requirements

- User authentication (NextAuth, Auth0, etc.)
- Rate limiting on API endpoints
- Input validation and sanitization
- HTTPS enforcement
- CORS configuration
- Email service OAuth integration

## Performance Optimization

### Current Optimizations

- Next.js automatic code splitting
- Image optimization (if images added)
- Client-side routing
- Lazy loading components

### Future Optimizations

- Virtual scrolling for large email lists
- Email caching
- Debounced search
- Service worker for offline support
- Optimistic UI updates

## Deployment Architecture

### Recommended Stack

**Hosting**: Vercel (optimal for Next.js)
**Database**: PostgreSQL (for real email storage)
**Cache**: Redis (for session and email cache)
**Storage**: S3 (for attachments)
**Queue**: BullMQ (for async email processing)

### Deployment Diagram

```
┌─────────────────────────────────────────┐
│         Vercel Edge Network             │
│  ┌────────────────────────────────┐    │
│  │    Next.js Application         │    │
│  │    - Static Pages              │    │
│  │    - API Routes                │    │
│  │    - Edge Functions            │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
                │
                ├→ PostgreSQL (Email storage)
                ├→ Redis (Cache)
                ├→ Anthropic API (AI)
                └→ S3 (Attachments)
```

## Scalability Considerations

### Horizontal Scaling

- Stateless API design allows multiple instances
- Next.js serverless functions scale automatically
- Database connection pooling required

### Vertical Scaling

- AI API calls are the bottleneck
- Consider batching analysis requests
- Implement queue system for heavy processing

## Testing Strategy

### Unit Tests
- Component rendering
- Type checking
- Utility functions

### Integration Tests
- API endpoint responses
- AI prompt/response validation
- Database operations

### E2E Tests
- Complete user workflows
- Email selection and analysis
- Action approval flow

## Monitoring & Observability

### Metrics to Track

- API response times
- AI analysis success rate
- Action approval rate
- Error rates
- User engagement metrics

### Tools

- Vercel Analytics
- Sentry (error tracking)
- LogRocket (session replay)
- Anthropic API usage dashboard

## Future Architecture Enhancements

1. **Microservices**: Separate email processing service
2. **Event-Driven**: Pub/sub for real-time updates
3. **ML Pipeline**: User preference learning
4. **Mobile Apps**: React Native or native Swift/Kotlin
5. **Browser Extension**: Chrome/Firefox extensions

---

**Last Updated**: March 2026
