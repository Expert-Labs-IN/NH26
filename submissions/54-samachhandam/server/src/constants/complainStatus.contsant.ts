export const COMPLAIN_STATUS = {
    PENDING: "pending",
    ASSIGNED: "assigned",
    RESOLVED: "resolved",
    REJECTED: "rejected"
} as const;

export type ComplainStatus = (typeof COMPLAIN_STATUS)[keyof typeof COMPLAIN_STATUS];