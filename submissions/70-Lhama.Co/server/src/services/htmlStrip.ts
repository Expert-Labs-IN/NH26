/**
 * Strips HTML tags from email body content.
 * Real Outlook emails often contain HTML — the AI needs clean plain text.
 */

export function stripHtml(html: string): string {
  if (!html) return '';

  let text = html;

  // Replace block-level elements with newlines BEFORE stripping tags
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<\/tr>/gi, '\n');
  text = text.replace(/<\/h[1-6]>/gi, '\n\n');
  text = text.replace(/<hr[^>]*>/gi, '\n---\n');

  // Remove <style> and <script> blocks entirely
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&#\d+;/g, ' '); // Remove remaining numeric entities

  // Clean up excessive whitespace
  text = text.replace(/\r\n/g, '\n');
  text = text.replace(/\r/g, '\n');
  text = text.replace(/[ \t]+/g, ' ');           // collapse horizontal whitespace
  text = text.replace(/\n{3,}/g, '\n\n');        // max 2 consecutive newlines
  text = text.replace(/^\s+|\s+$/g, '');         // trim start/end

  // Truncate very long emails to avoid overwhelming the AI context window
  const MAX_CHARS = 3000;
  if (text.length > MAX_CHARS) {
    text = text.slice(0, MAX_CHARS) + '\n\n[Email truncated for processing...]';
  }

  return text;
}
