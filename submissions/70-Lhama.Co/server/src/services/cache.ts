/**
 * Cache module — simplified.
 * Cache hit behaviour has been removed.
 * Every triage request now goes: Ollama → Groq → Mock data.
 * This file is kept only so the health endpoint can report cache status.
 */

export function getCacheSize(): number {
  return 0; // No active cache
}

