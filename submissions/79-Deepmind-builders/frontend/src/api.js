const BASE = "/api";

export async function fetchEmails() {
  const res = await fetch(`${BASE}/emails`);
  if (!res.ok) throw new Error("Failed to fetch emails");
  return res.json();
}

export async function triageEmail(email) {
  const res = await fetch(`${BASE}/triage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Triage failed");
  return res.json();
}

export async function approveAction(emailId, actionType, action) {
  const res = await fetch(`${BASE}/triage/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailId, actionType, action }),
  });
  if (!res.ok) throw new Error("Approval failed");
  return res.json();
}
