export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Escalated" | "Duplicate";
export type TicketSeverity = "Low" | "Medium" | "High" | "Critical";

export interface Ticket {
    id: string;
    title: string;
    category: string;
    department: "HR" | "IT" | "Facilities" | "Finance" | "Admin";
    severity: TicketSeverity;
    status: TicketStatus;
    agent: string;
    createdAt: string;
    slaStatus: "Healthy" | "Warning" | "Breached";
    isDuplicate: boolean;
    transcript?: { role: "user" | "ai" | "agent" | "system"; message: string; time?: string }[];
    aiSummary?: string;
    entities?: string[];
    aiDecision?: string;
    draftedReply?: string;
    description?: string;
    resolvedAt?: string;
    internalNotes?: string;
    chat_history?: { role: string; content: string }[];
}
