import { google } from "googleapis";

// Build an authenticated Gmail client using the user's access token
function getGmailClient(accessToken) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}

// Decode base64url encoded Gmail message parts
function decodeBase64(data) {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

// Extract plain text body from Gmail message payload
function extractBody(payload) {
  if (!payload) return "";

  // Direct body
  if (payload.body?.data) {
    return decodeBase64(payload.body.data);
  }

  // Multipart — look for text/plain first, then text/html
  if (payload.parts) {
    const textPart = payload.parts.find((p) => p.mimeType === "text/plain");
    if (textPart?.body?.data) return decodeBase64(textPart.body.data);

    const htmlPart = payload.parts.find((p) => p.mimeType === "text/html");
    if (htmlPart?.body?.data) return decodeBase64(htmlPart.body.data);

    // Recurse into nested parts
    for (const part of payload.parts) {
      const body = extractBody(part);
      if (body) return body;
    }
  }

  return "";
}

// Get a header value from a Gmail message by header name
function getHeader(headers, name) {
  const header = headers?.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return header?.value || "";
}

// Parse "Name <email@example.com>" or just "email@example.com"
function parseSender(fromHeader) {
  const match = fromHeader.match(/^(.+?)\s*<(.+?)>\s*$/);
  if (match) {
    return { name: match[1].replace(/"/g, "").trim(), email: match[2].trim() };
  }
  return { name: fromHeader.trim(), email: fromHeader.trim() };
}

/**
 * Fetch recent unread emails from Gmail inbox.
 * Returns an array of structured email objects.
 * Applies label filters (skips CATEGORY_PROMOTIONS, CATEGORY_SOCIAL, SPAM).
 */
export async function fetchUnreadEmails(accessToken, maxResults = 20) {
  const gmail = getGmailClient(accessToken);

  // Get list of unread message IDs (inbox only, skip promotions/social/spam)
  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread in:inbox",
    maxResults,
  });

  const messages = listRes.data.messages || [];
  if (messages.length === 0) return [];

  // Fetch full details for each message
  const emails = await Promise.all(
    messages.map(async (msg) => {
      try {
        const res = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "full",
        });

        const { id, payload, labelIds, internalDate } = res.data;
        const headers = payload?.headers || [];

        // Skip promotions, social, spam by label
        const skipLabels = ["CATEGORY_PROMOTIONS", "CATEGORY_SOCIAL", "SPAM"];
        if (labelIds && labelIds.some((l) => skipLabels.includes(l))) {
          return null;
        }

        const fromHeader = getHeader(headers, "from");
        const { name: senderName, email: senderEmail } = parseSender(fromHeader);

        // Skip noreply/automated senders
        const noReplyPatterns = ["noreply", "no-reply", "donotreply", "notifications", "mailer-daemon"];
        if (noReplyPatterns.some((p) => senderEmail.toLowerCase().includes(p))) {
          return null;
        }

        const subject = getHeader(headers, "subject") || "(No Subject)";
        const body = extractBody(payload);
        const timestamp = internalDate
          ? new Date(parseInt(internalDate)).toISOString()
          : new Date().toISOString();

        return { emailId: id, subject, senderName, senderEmail, body, timestamp };
      } catch (err) {
        console.error(`Failed to fetch email ${msg.id}:`, err.message);
        return null;
      }
    })
  );

  // Filter out nulls (skipped emails)
  return emails.filter(Boolean);
}

/**
 * Send an email reply via Gmail API.
 * threadId links the reply to the original conversation thread.
 */
export async function sendEmailReply(accessToken, { to, subject, body, threadId }) {
  const gmail = getGmailClient(accessToken);

  // Build RFC 2822 email string
  const rawEmail = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    "",
    body,
  ].join("\n");

  // Base64url encode the email
  const encodedEmail = Buffer.from(rawEmail)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedEmail,
      threadId,
    },
  });
}
