"""
DocNerve configuration.
Centralizes paths, model locations, thresholds, and runtime flags.
"""

from __future__ import annotations

import copy
import logging
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
DOCNERVE_ROOT = BASE_DIR.parent
ENV_FILE = DOCNERVE_ROOT / ".env"

load_dotenv(ENV_FILE)


def _resolve_backend_relative_path(raw_value: str | None, default: Path) -> Path:
    """Resolve configured paths relative to backend/ when not absolute."""
    if not raw_value:
        return default.resolve()

    candidate = Path(raw_value)
    if candidate.is_absolute():
        return candidate.resolve()
    return (BASE_DIR / candidate).resolve()


def _discover_model_file(model_dir: Path, preferred_names: list[str]) -> Path:
    """Prefer known filenames but gracefully fall back to the first GGUF present."""
    for preferred_name in preferred_names:
        candidate = (model_dir / preferred_name).resolve()
        if candidate.exists():
            return candidate

    discovered = sorted(model_dir.glob("*.gguf"))
    if discovered:
        return discovered[0].resolve()

    fallback_name = preferred_names[0] if preferred_names else "model.gguf"
    return (model_dir / fallback_name).resolve()


# Paths
MODELS_DIR = _resolve_backend_relative_path(os.getenv("MODELS_DIR"), DOCNERVE_ROOT / "models")
EXPORTS_DIR = (BASE_DIR / "exports").resolve()
UPLOADS_DIR = (BASE_DIR / "uploads").resolve()
SAMPLE_DOCS_DIR = (DOCNERVE_ROOT / "sample_docs").resolve()

EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


# Model files
MODEL_PATHS = {
    "phi4mini": str(
        _discover_model_file(
            MODELS_DIR / "Phi-4-mini-instruct-GGUF",
            ["Phi-4-mini-instruct-Q4_K_M.gguf"],
        )
    ),
    "nuextract": str(
        _discover_model_file(
            MODELS_DIR / "NuExtract-2.0-2B-GGUF",
            ["NuExtract-2.0-2B-Q4_K_M.gguf", "NuExtract-2.0-2B.Q4_K_M.gguf"],
        )
    ),
    "nli_deberta": str((MODELS_DIR / "nli-deberta-v3-small").resolve()),
}

_MODEL_DIAGNOSTICS_CACHE: dict[str, dict[str, Any]] | None = None


def _base_model_diagnostics() -> dict[str, dict[str, Any]]:
    return {
        name: {
            "path": raw_path,
            "artifact_exists": Path(raw_path).exists(),
            "runtime_ready": None,
            "error": None,
        }
        for name, raw_path in MODEL_PATHS.items()
    }


def _probe_llm_runtime(name: str) -> tuple[bool, str | None]:
    try:
        from models.router import router
    except Exception as exc:
        return False, f"router import failed: {exc}"

    if not router.is_available():
        return False, "llama-cpp-python runtime unavailable"

    llm = None
    try:
        llm = router.load(name)
        if llm is None:
            return False, "router.load returned None"
        return True, None
    except Exception as exc:
        return False, str(exc)
    finally:
        try:
            if llm is not None:
                router.evict()
        except Exception:
            pass


def get_model_diagnostics(
    probe_runtime: bool = False,
    refresh: bool = False,
) -> dict[str, dict[str, Any]]:
    """
    Return artifact and optional runtime readiness for backend models.

    Runtime probes are cached because loading GGUF files repeatedly is expensive.
    """
    global _MODEL_DIAGNOSTICS_CACHE

    if refresh or _MODEL_DIAGNOSTICS_CACHE is None:
        _MODEL_DIAGNOSTICS_CACHE = _base_model_diagnostics()

    diagnostics = copy.deepcopy(_MODEL_DIAGNOSTICS_CACHE)

    if probe_runtime:
        for name in ("phi4mini", "nuextract"):
            if not diagnostics[name]["artifact_exists"]:
                diagnostics[name]["runtime_ready"] = False
                diagnostics[name]["error"] = "model artifact missing"
                continue

            runtime_ready, error = _probe_llm_runtime(name)
            diagnostics[name]["runtime_ready"] = runtime_ready
            diagnostics[name]["error"] = error

        nli_exists = diagnostics["nli_deberta"]["artifact_exists"]
        diagnostics["nli_deberta"]["runtime_ready"] = nli_exists
        diagnostics["nli_deberta"]["error"] = None if nli_exists else "model artifact missing"
        _MODEL_DIAGNOSTICS_CACHE = copy.deepcopy(diagnostics)

    return diagnostics


def are_models_runtime_ready(diagnostics: dict[str, dict[str, Any]] | None = None) -> bool:
    checks = diagnostics or get_model_diagnostics(probe_runtime=False)
    for name, status in checks.items():
        if not status.get("artifact_exists"):
            return False
        runtime_ready = status.get("runtime_ready")
        if runtime_ready is False:
            return False
        if runtime_ready is None and name in {"phi4mini", "nuextract"}:
            return False
    return True


def validate_models() -> bool:
    """Warn on missing model artifacts without crashing startup."""
    missing = [
        f"{name}: {status['path']}"
        for name, status in get_model_diagnostics(probe_runtime=False).items()
        if not status["artifact_exists"]
    ]

    if missing:
        logger.warning("Missing model artifacts: %s", "; ".join(missing))
        return False
    return True


# LLM settings
LLM_N_GPU_LAYERS: int = int(os.getenv("LLM_N_GPU_LAYERS", "-1"))
LLM_N_CTX: int = int(os.getenv("LLM_N_CTX", "4096"))
LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.1"))
LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "512"))


# Contradiction engine
AMOUNT_MISMATCH_THRESHOLD: float = 0.01
AMOUNT_HIGH_SEVERITY_THRESHOLD: float = 10_000
NLI_CONTRADICTION_CONFIDENCE: float = 0.70


# Trust scoring
TRUST_CLEAN_THRESHOLD: int = 80
TRUST_SUSPICIOUS_THRESHOLD: int = 50
VENDOR_FUZZY_THRESHOLD: float = 85.0
VENDOR_SUSPICIOUS_LOW: float = 70.0
VENDOR_SUSPICIOUS_HIGH: float = 95.0


# Ghost detection
GHOST_SUSPICION_THRESHOLD: float = 0.60
GHOST_HIGH_SUSPICION: float = 0.80


# Document preprocessing
DIGITAL_PDF_MIN_CHARS: int = 100


# Misc
DEBUG: bool = os.getenv("DEBUG", "false").strip().lower() == "true"
