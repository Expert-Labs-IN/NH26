# 👨‍💻 Developer Guide

Guide for developers who want to extend or customize the Agentic Email Assistant.

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Code editor (VS Code recommended)
- Git

### Initial Setup

```bash
# Clone/extract project
cd agentic-email-assistant

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY

# Start development server
npm run dev
```

## Project Structure Explained

```
agentic-email-assistant/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (serverless functions)
│   │   └── analyze-email/ # AI analysis endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main page component
├── components/            # React components
│   ├── EmailList.tsx     # Inbox list
│   ├── EmailDetail.tsx   # Email viewer
│   ├── AnalysisPanel.tsx # AI results
│   └── ActionCard.tsx    # Action display
├── data/                  # Mock data
│   └── emails.json       # Test emails
├── types/                 # TypeScript definitions
│   └── index.ts          # Type definitions
└── public/               # Static assets
```

## Common Development Tasks

### 1. Adding a New Action Type

**Step 1**: Update types (`types/index.ts`)

```typescript
export interface CustomAction {
  title: string;
  description: string;
  // your fields
}

// Add to AIAnalysis suggestedActions
```

**Step 2**: Update AI prompt (`app/api/analyze-email/route.ts`)

```typescript
const ANALYSIS_PROMPT = `
...
- **custom**: Your action type description

For custom actions use this format:
{
  "title": "Action title",
  "description": "What to do",
  ...
}
`;
```

**Step 3**: Add rendering in `ActionCard.tsx`

```typescript
const renderCustomContent = (data: CustomAction) => {
  return (
    <div>
      <h4>{data.title}</h4>
      <p>{data.description}</p>
    </div>
  );
};

// Add case in renderContent()
case 'custom':
  return renderCustomContent(data);
```

**Step 4**: Add execution logic in `app/page.tsx`

```typescript
const handleApproveAction = (actionIndex: number) => {
  const action = analysis.suggestedActions[actionIndex];
  
  switch (action.type) {
    case 'custom':
      // Your execution logic
      console.log('Executing custom action:', action.data);
      break;
    // ...
  }
};
```

### 2. Customizing AI Behavior

Edit the prompt in `app/api/analyze-email/route.ts`:

```typescript
const ANALYSIS_PROMPT = `
You are an intelligent email assistant.

Your tone should be: [professional/friendly/casual]
Your priorities: [speed/thoroughness/creativity]

Focus on:
- [Key behavior 1]
- [Key behavior 2]
...
`;
```

### 3. Adding Real Email Integration

**Gmail Integration Example**:

```typescript
// lib/gmail.ts
import { google } from 'googleapis';

export async function fetchEmails(accessToken: string) {
  const gmail = google.gmail({ version: 'v1' });
  
  const response = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 50,
    auth: oauth2Client,
  });
  
  return response.data.messages;
}
```

**Update page to use real emails**:

```typescript
// app/page.tsx
useEffect(() => {
  if (user?.accessToken) {
    fetchEmails(user.accessToken)
      .then(setEmails)
      .catch(console.error);
  }
}, [user]);
```

### 4. Adding Database Persistence

**Prisma Setup Example**:

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

```prisma
// prisma/schema.prisma
model Email {
  id        String   @id @default(uuid())
  subject   String
  body      String
  from      String
  createdAt DateTime @default(now())
  analysis  Analysis?
}

model Analysis {
  id      String @id @default(uuid())
  emailId String @unique
  email   Email  @relation(fields: [emailId], references: [id])
  summary Json
  actions Json
}
```

**Usage**:

```typescript
// app/api/emails/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
  const emails = await prisma.email.findMany({
    include: { analysis: true },
    orderBy: { createdAt: 'desc' },
  });
  return Response.json(emails);
}
```

### 5. Adding Authentication

**NextAuth Setup**:

```bash
npm install next-auth
```

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
        },
      },
    }),
  ],
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Protect routes**:

```typescript
// app/page.tsx
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return <SignIn />;
  
  // Your app
}
```

## Styling Customization

### Changing Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#your-color',
        // ... 100-900
      },
      brand: {
        light: '#...',
        DEFAULT: '#...',
        dark: '#...',
      }
    }
  }
}
```

### Adding Custom Animations

In `app/globals.css`:

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

## Testing

### Unit Testing Setup

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @types/jest
```

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

**Example test**:

```typescript
// components/__tests__/EmailList.test.tsx
import { render, screen } from '@testing-library/react';
import EmailList from '../EmailList';

describe('EmailList', () => {
  it('renders email items', () => {
    const emails = [
      { id: '1', subject: 'Test', /* ... */ }
    ];
    
    render(
      <EmailList
        emails={emails}
        selectedEmailId={null}
        onSelectEmail={() => {}}
      />
    );
    
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## API Development

### Adding New Endpoints

Create file in `app/api/your-endpoint/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Handle GET request
  return NextResponse.json({ data: 'response' });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Handle POST request
  return NextResponse.json({ result: 'success' });
}
```

### API Error Handling

```typescript
try {
  // Your logic
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    { error: 'Something went wrong', details: error.message },
    { status: 500 }
  );
}
```

## Debugging

### Client-Side Debugging

```typescript
// Use React DevTools
// Add console logs
console.log('State:', { emails, selectedEmail, analysis });

// Use debugger
debugger;
```

### Server-Side Debugging

```typescript
// API route debugging
console.log('[API] Request:', await request.json());
console.log('[API] Response:', result);

// VS Code launch.json for debugging
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    }
  ]
}
```

## Performance Optimization

### Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
});
```

### Memoization

```typescript
import { useMemo, useCallback } from 'react';

// Memoize expensive computations
const processedEmails = useMemo(() => {
  return emails.filter(e => e.priority === 'urgent');
}, [emails]);

// Memoize callbacks
const handleClick = useCallback(() => {
  console.log('Clicked');
}, []);
```

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Variables in Vercel

1. Go to project settings
2. Add environment variables:
   - `ANTHROPIC_API_KEY`
   - `DATABASE_URL` (if using database)
   - Other secrets

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t agentic-email .
docker run -p 3000:3000 agentic-email
```

## Best Practices

### Code Organization

- One component per file
- Group related files in directories
- Use barrel exports (index.ts)
- Keep components small and focused

### TypeScript

- Define all types explicitly
- Use interfaces for objects
- Avoid `any` type
- Use strict mode

### State Management

- Keep state as local as possible
- Lift state up when needed
- Consider Context for deep props
- Use reducers for complex state

### Performance

- Minimize re-renders
- Use React.memo for expensive components
- Debounce user input
- Lazy load routes and components

## Troubleshooting

### Common Issues

**TypeScript errors after adding new files**:
```bash
rm -rf .next
npm run dev
```

**Module not found**:
```bash
rm -rf node_modules package-lock.json
npm install
```

**API not working**:
- Check `.env.local` exists
- Verify API key is valid
- Check server console for errors
- Test API directly with curl/Postman

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes and commit: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/name`
4. Create pull request

## Getting Help

- Check existing issues
- Review code comments
- Consult documentation
- Ask in discussions

---

Happy coding! 🚀
