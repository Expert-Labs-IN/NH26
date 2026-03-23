"""
DocNerve FastAPI backend.
Provides analysis, status, sample document, and report download endpoints.
"""

from __future__ import annotations

import logging
import re
import shutil
import traceback
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from fastapi import BackgroundTasks, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from config import (
    DEBUG,
    EXPORTS_DIR,
    SAMPLE_DOCS_DIR,
    UPLOADS_DIR,
    are_models_runtime_ready,
    get_model_diagnostics,
    validate_models,
)
from pipeline.orchestrator import run_pipeline
from store import job_store

logger = logging.getLogger(__name__)

SUPPORTED_UPLOAD_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".tif"}
STORAGE_CLEANUP_MAX_AGE_HOURS = 24
IMAGE_UPLOAD_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tiff", ".tif"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("DocNerve startup")
    validate_models()
    model_checks = get_model_diagnostics(probe_runtime=True, refresh=True)
    models_ready = are_models_runtime_ready(model_checks)
    cleaned = job_store.cleanup_old()
    cleaned_storage = _cleanup_stale_storage()
    logger.info("Models ready: %s", models_ready)
    logger.info("Uploads dir: %s", UPLOADS_DIR)
    logger.info("Exports dir: %s", EXPORTS_DIR)
    if cleaned:
        logger.info("Cleaned %s stale jobs on startup", cleaned)
    if cleaned_storage:
        logger.info(
            "Cleaned stale backend artifacts on startup: uploads=%s exports=%s",
            cleaned_storage["uploads"],
            cleaned_storage["exports"],
        )
    app.state.model_checks = model_checks
    app.state.models_ready = models_ready
    yield
    logger.info("DocNerve shutdown")


app = FastAPI(
    title="DocNerve API",
    description="AI Forensic Document Auditor",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str
    models_ready: bool
    debug: bool
    checks: dict[str, dict[str, object]]


class AnalyzeResponse(BaseModel):
    job_id: str
    status: str
    file_count: int


class JobStatusResponse(BaseModel):
    status: str
    progress: int
    current_step: Optional[str] = None
    file_count: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    result: Optional[dict] = None
    error: Optional[str] = None


class SampleDocsResponse(BaseModel):
    files: list[str]
    count: int
    path: str


def _safe_filename(filename: str | None, index: int) -> str:
    raw_name = Path(filename or f"upload_{index}").name
    sanitized = re.sub(r"[^A-Za-z0-9._-]", "_", raw_name)
    return sanitized or f"upload_{index}"


def _dedupe_filename(filename: str, used_names: set[str]) -> str:
    candidate = filename
    stem = Path(filename).stem or "upload"
    suffix = Path(filename).suffix
    counter = 2
    while candidate.lower() in used_names:
        candidate = f"{stem}_{counter}{suffix}"
        counter += 1
    used_names.add(candidate.lower())
    return candidate


def _cleanup_upload_paths(file_paths: list[str]) -> None:
    cleanup_paths: set[Path] = set()
    for raw_path in file_paths:
        path = Path(raw_path)
        cleanup_paths.add(path)
        if path.suffix.lower() in IMAGE_UPLOAD_EXTENSIONS:
            cleanup_paths.add(path.with_name(f"{path.stem}_processed.png"))

    for path in cleanup_paths:
        try:
            path.unlink(missing_ok=True)
        except Exception as exc:
            logger.warning("Failed to delete upload %s: %s", path, exc)

    for parent in {path.parent for path in cleanup_paths}:
        try:
            parent.rmdir()
        except OSError:
            pass
        except Exception as exc:
            logger.warning("Failed to delete upload directory %s: %s", parent, exc)


def _resolve_report_path(raw_path: str | None) -> Path | None:
    if not raw_path:
        return None

    path = Path(raw_path)
    candidates = [path]
    if not path.is_absolute():
        candidates.append((EXPORTS_DIR / path.name))
    for candidate in candidates:
        if candidate.exists():
            return candidate.resolve()
    return None


def _cleanup_stale_storage(max_age_hours: int = STORAGE_CLEANUP_MAX_AGE_HOURS) -> dict[str, int]:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=max_age_hours)
    cleaned = {"uploads": 0, "exports": 0}

    def is_stale(path: Path) -> bool:
        try:
            modified_at = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
            return modified_at < cutoff
        except FileNotFoundError:
            return False

    for child in UPLOADS_DIR.iterdir():
        if not is_stale(child):
            continue
        try:
            if child.is_dir():
                shutil.rmtree(child, ignore_errors=True)
            else:
                child.unlink(missing_ok=True)
            cleaned["uploads"] += 1
        except Exception as exc:
            logger.warning("Failed to delete stale upload artifact %s: %s", child, exc)

    for child in EXPORTS_DIR.iterdir():
        if not child.is_file() or not is_stale(child):
            continue
        try:
            child.unlink(missing_ok=True)
            cleaned["exports"] += 1
        except Exception as exc:
            logger.warning("Failed to delete stale export artifact %s: %s", child, exc)

    return cleaned


def _report_media_type(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return "application/pdf"
    if suffix == ".txt":
        return "text/plain; charset=utf-8"
    return "application/octet-stream"


def _report_download_filename(job_id: str, path: Path) -> str:
    suffix = path.suffix or ".bin"
    return f"DocNerve_Report_{job_id[:8]}{suffix}"


@app.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    checks = getattr(request.app.state, "model_checks", None)
    if checks is None:
        checks = get_model_diagnostics(probe_runtime=False)
    models_ready = getattr(request.app.state, "models_ready", are_models_runtime_ready(checks))
    return HealthResponse(
        status="ok",
        models_ready=models_ready,
        debug=DEBUG,
        checks=checks,
    )


@app.get("/sample-docs", response_model=SampleDocsResponse)
async def list_sample_docs() -> SampleDocsResponse:
    if not SAMPLE_DOCS_DIR.exists():
        return SampleDocsResponse(files=[], count=0, path=str(SAMPLE_DOCS_DIR))

    files = sorted(file.name for file in SAMPLE_DOCS_DIR.glob("*.pdf"))
    return SampleDocsResponse(files=files, count=len(files), path=str(SAMPLE_DOCS_DIR))


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(...),
) -> AnalyzeResponse:
    if len(files) < 1:
        raise HTTPException(
            status_code=400,
            detail="Upload at least 1 document.",
        )

    job_store.cleanup_old()
    job_id = str(uuid.uuid4())
    job_upload_dir = UPLOADS_DIR / job_id
    job_upload_dir.mkdir(parents=True, exist_ok=True)

    saved_paths: list[str] = []
    used_names: set[str] = set()
    try:
        for index, upload in enumerate(files, start=1):
            filename = _dedupe_filename(_safe_filename(upload.filename, index), used_names)
            ext = Path(filename).suffix.lower()
            if ext not in SUPPORTED_UPLOAD_EXTENSIONS:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Unsupported file type: {ext or '[no extension]'}. "
                        f"Allowed: {sorted(SUPPORTED_UPLOAD_EXTENSIONS)}"
                    ),
                )

            save_path = job_upload_dir / filename
            with save_path.open("wb") as output_file:
                shutil.copyfileobj(upload.file, output_file)

            if save_path.stat().st_size == 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"Uploaded file '{filename}' is empty.",
                )

            saved_paths.append(str(save_path))
    except HTTPException:
        _cleanup_upload_paths(saved_paths)
        shutil.rmtree(job_upload_dir, ignore_errors=True)
        raise
    except Exception as exc:
        _cleanup_upload_paths(saved_paths)
        shutil.rmtree(job_upload_dir, ignore_errors=True)
        logger.exception("Failed to persist uploads for job %s", job_id)
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded files: {exc}") from exc
    finally:
        for upload in files:
            try:
                upload.file.close()
            except Exception:
                pass

    job_store.create(job_id, len(files))
    background_tasks.add_task(run_pipeline_task, job_id, saved_paths)

    return AnalyzeResponse(job_id=job_id, status="processing", file_count=len(files))


@app.get("/results/{job_id}", response_model=JobStatusResponse)
async def get_results(job_id: str) -> JobStatusResponse:
    job = job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobStatusResponse(**job)


@app.get("/download/{job_id}/report")
async def download_report(job_id: str):
    job = job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != "complete":
        raise HTTPException(status_code=400, detail="Analysis not complete yet")

    result = job.get("result") or {}
    report_path = _resolve_report_path(result.get("report_pdf_path")) or _resolve_report_path(
        result.get("report_download_path")
    )
    if report_path is None or not report_path.exists():
        raise HTTPException(status_code=404, detail="Report artifact not found")

    return FileResponse(
        str(report_path),
        media_type=_report_media_type(report_path),
        filename=_report_download_filename(job_id, report_path),
    )


async def run_pipeline_task(job_id: str, file_paths: list[str]) -> None:
    try:
        job_store.update_progress(job_id, 1, "initializing")

        def progress_callback(progress: int, step: str | None = None) -> None:
            job_store.update_progress(job_id, progress, step)

        result = await run_pipeline(job_id=job_id, file_paths=file_paths, progress_cb=progress_callback)
        job_store.complete(job_id, result)
    except Exception as exc:
        error_msg = f"{exc}\n{traceback.format_exc()}" if DEBUG else str(exc)
        job_store.fail(job_id, error_msg)
        logger.exception("Pipeline failed for job %s", job_id)
    finally:
        _cleanup_upload_paths(file_paths)
