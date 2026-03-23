from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import init_db
from app.routers import emails, ai, actions, events, tasks


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Agentic AI Email Triage",
    description="AI-powered email triage system with automated action drafting and human-in-the-loop approval.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(emails.router)
app.include_router(ai.router)
app.include_router(actions.router)
app.include_router(events.router)
app.include_router(tasks.router)


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "Agentic AI Email Triage API is running"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
