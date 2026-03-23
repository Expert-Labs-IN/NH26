/**
 * Logic Engine for WorkSync AI
 * Handles autonomous triage: severity scoring, categorization, and duplicate detection.
 */

export type Severity = "Low" | "Medium" | "High" | "Critical";
export type Category = "IT" | "HR" | "Finance" | "Facilities" | "Other";

/**
 * Autonomously determines severity based on message content.
 */
export function determineSeverity(text: string): Severity {
    const t = text.toLowerCase();

    // Critical cues: safety, security, infrastructure failure
    if (t.includes("fire") || t.includes("broken") || t.includes("hacked") || t.includes("emergency") || t.includes("safety") || t.includes("shutdown")) {
        return "Critical";
    }

    // High cues: workflow blocking, payroll, compliance
    if (t.includes("urgent") || t.includes("payroll") || t.includes("salary") || t.includes("access denied") || t.includes("legal")) {
        return "High";
    }

    // Medium cues: software issues, equipment requests
    if (t.includes("license") || t.includes("mouse") || t.includes("keyboard") || t.includes("broken") || t.includes("slow")) {
        return "Medium";
    }

    return "Low";
}

/**
 * Maps input text to a core service node (Category).
 */
export function determineCategory(text: string): Category {
    const t = text.toLowerCase();

    if (t.includes("pay") || t.includes("salary") || t.includes("invoice") || t.includes("expense")) return "Finance";
    if (t.includes("leave") || t.includes("policy") || t.includes("hiring") || t.includes("benefits")) return "HR";
    if (t.includes("ac") || t.includes("desk") || t.includes("chair") || t.includes("building") || t.includes("light")) return "Facilities";
    if (t.includes("vpn") || t.includes("password") || t.includes("software") || t.includes("laptop") || t.includes("network")) return "IT";

    return "Other";
}

/**
 * Logic to detect potential duplicate tickets.
 */
export function checkDuplicate(existingTickets: any[], newTitle: string, userId: string): boolean {
    const threshold = 0.8; // Simulating fuzzy match logic
    return existingTickets.some(t =>
        t.employee_id === userId &&
        t.status !== 'Resolved' &&
        t.title.toLowerCase().includes(newTitle.toLowerCase().split(' ')[0])
    );
}
